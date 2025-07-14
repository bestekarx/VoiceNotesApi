import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { 
    AudioRecord, 
    AudioRecordStorage, 
    UploadResponse, 
    TranscriptionResponse, 
    SummaryResponse, 
    StatusResponse 
} from '../models/audioRecord';

// AssemblyAIService importunu fonksiyon içinde kullan
let assemblyAIService: any = null;
function getAssemblyAIService() {
    if (!assemblyAIService) {
        const { AssemblyAIService } = require('../services/assemblyAIService');
        assemblyAIService = new AssemblyAIService();
    }
    return assemblyAIService;
}

/**
 * Upload audio file endpoint
 * POST /api/audio/upload
 */
export const uploadAudio = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                error: 'No audio file provided',
                message: 'Please upload an audio file (mp3, wav, m4a, ogg, webm, aac)'
            });
            return;
        }

        const audioId = uuidv4();
        const audioRecord: AudioRecord = {
            id: audioId,
            originalName: req.file.originalname,
            filename: req.file.filename,
            filepath: req.file.path,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            uploadedAt: new Date(),
            processingStatus: 'uploading'
        };

        // Save to storage
        AudioRecordStorage.save(audioRecord);

        console.log(`✅ Audio uploaded: ${audioRecord.filename} (${audioRecord.fileSize} bytes)`);

        const response: UploadResponse = {
            success: true,
            audioId: audioId,
            message: 'Audio file uploaded successfully',
            filename: req.file.filename,
            fileSize: req.file.size,
            uploadedAt: audioRecord.uploadedAt.toISOString()
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Upload failed',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Start transcription with AssemblyAI
 * POST /api/audio/:id/transcribe
 */
export const transcribeAudio = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const audioRecord = AudioRecordStorage.findById(id);

        if (!audioRecord) {
            res.status(404).json({
                success: false,
                error: 'Audio not found',
                message: `Audio record with ID ${id} not found`
            });
            return;
        }

        // Update status to processing
        AudioRecordStorage.update(id, {
            processingStatus: 'processing',
            processingStarted: new Date()
        });

        // Create public URL for the audio file
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const audioUrl = `${baseUrl}/uploads/${audioRecord.filename}`;

        console.log(`🎙️ Starting transcription for: ${audioUrl}`);

        // Start AssemblyAI transcription
        const jobId = await getAssemblyAIService().startTranscription(audioUrl);

        // Update record with job ID
        AudioRecordStorage.update(id, {
            assemblyAIJobId: jobId
        });

        console.log(`🚀 AssemblyAI job started: ${jobId}`);

        const response: TranscriptionResponse = {
            success: true,
            audioId: id,
            jobId: jobId,
            status: 'processing',
            message: 'Transcription started successfully',
            estimatedTime: '1-3 minutes'
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Transcription error:', error);
        
        // Update status to error
        if (req.params.id) {
            AudioRecordStorage.update(req.params.id, {
                processingStatus: 'error',
                errorMessage: error instanceof Error ? error.message : 'Unknown error'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Transcription failed',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Get AI summary
 * GET /api/audio/:id/summary
 */
export const getSummary = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const audioRecord = AudioRecordStorage.findById(id);

        if (!audioRecord) {
            res.status(404).json({
                success: false,
                error: 'Audio not found',
                message: `Audio record with ID ${id} not found`
            });
            return;
        }

        if (!audioRecord.assemblyAIJobId) {
            res.status(400).json({
                success: false,
                error: 'Transcription not started',
                message: 'Please start transcription first by calling /transcribe endpoint'
            });
            return;
        }

        console.log(`📋 Getting summary for job: ${audioRecord.assemblyAIJobId}`);

        // Get transcription result from AssemblyAI
        const transcriptionResult = await getAssemblyAIService().getTranscriptionResult(audioRecord.assemblyAIJobId);

        if (transcriptionResult.status === 'error') {
            AudioRecordStorage.update(id, {
                processingStatus: 'error',
                errorMessage: transcriptionResult.error || 'AssemblyAI transcription failed'
            });

            res.status(500).json({
                success: false,
                error: 'Transcription failed',
                message: transcriptionResult.error || 'AssemblyAI processing error'
            });
            return;
        }

        if (transcriptionResult.status !== 'completed') {
            res.status(202).json({
                success: true,
                audioId: id,
                status: transcriptionResult.status as any,
                message: `Transcription is ${transcriptionResult.status}. Please try again in a moment.`
            });
            return;
        }

        // Generate summary
        const transcriptionText = transcriptionResult.text || '';
        const summary = getAssemblyAIService().generateSummary(transcriptionText, transcriptionResult.chapters);

        // Update record with results
        AudioRecordStorage.update(id, {
            processingStatus: 'completed',
            transcriptionText: transcriptionText,
            summaryText: summary.text,
            confidence: transcriptionResult.confidence,
            duration: transcriptionResult.audio_duration,
            processingCompleted: new Date()
        });

        console.log(`✅ Summary generated for audio: ${id}`);

        const response: SummaryResponse = {
            success: true,
            audioId: id,
            status: 'completed',
            transcription: {
                text: transcriptionText,
                confidence: transcriptionResult.confidence || 0,
                duration: transcriptionResult.audio_duration || 0
            },
            summary: {
                text: summary.text,
                keyPoints: summary.keyPoints,
                sentiment: summary.sentiment,
                chapters: summary.chapters
            },
            processingTime: audioRecord.processingStarted 
                ? `${Math.round((new Date().getTime() - audioRecord.processingStarted.getTime()) / 1000)}s`
                : undefined
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Summary error:', error);
        
        if (req.params.id) {
            AudioRecordStorage.update(req.params.id, {
                processingStatus: 'error',
                errorMessage: error instanceof Error ? error.message : 'Unknown error'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Summary generation failed',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Get processing status
 * GET /api/audio/:id/status
 */
export const getStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const audioRecord = AudioRecordStorage.findById(id);

        if (!audioRecord) {
            res.status(404).json({
                success: false,
                error: 'Audio not found',
                message: `Audio record with ID ${id} not found`
            });
            return;
        }

        let message = '';
        let estimatedTimeRemaining: string | undefined;

        switch (audioRecord.processingStatus) {
            case 'uploading':
                message = 'Audio file uploaded, ready for transcription';
                break;
            case 'processing':
                message = 'Transcription in progress...';
                estimatedTimeRemaining = '1-2 minutes';
                break;
            case 'completed':
                message = 'Processing completed successfully';
                break;
            case 'error':
                message = audioRecord.errorMessage || 'Processing failed';
                break;
        }

        const response: StatusResponse = {
            success: true,
            audioId: id,
            status: audioRecord.processingStatus,
            message: message,
            estimatedTimeRemaining: estimatedTimeRemaining,
            error: audioRecord.errorMessage
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({
            success: false,
            error: 'Status check failed',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}; 