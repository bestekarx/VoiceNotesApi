// Audio processing status types
export type ProcessingStatus = 'uploading' | 'processing' | 'completed' | 'error';

// Base audio record interface
export interface AudioRecord {
    id: string;
    originalName: string;
    filename: string;
    filepath: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: Date;
    processingStatus: ProcessingStatus;
    assemblyAIJobId?: string;
    transcriptionText?: string;
    summaryText?: string;
    processingStarted?: Date;
    processingCompleted?: Date;
    errorMessage?: string;
    confidence?: number;
    duration?: number; // in seconds
}

// AssemblyAI response interfaces
export interface AssemblyAITranscriptResponse {
    id: string;
    status: 'queued' | 'processing' | 'completed' | 'error';
    text?: string;
    confidence?: number;
    audio_duration?: number;
    words?: Array<{
        text: string;
        start: number;
        end: number;
        confidence: number;
    }>;
    chapters?: Array<{
        summary: string;
        headline: string;
        gist: string;
        start: number;
        end: number;
    }>;
    sentiment_analysis_results?: Array<{
        text: string;
        start: number;
        end: number;
        sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
        confidence: number;
    }>;
    error?: string;
}

// API response interfaces
export interface UploadResponse {
    success: boolean;
    audioId: string;
    message: string;
    filename: string;
    fileSize: number;
    uploadedAt: string;
}

export interface TranscriptionResponse {
    success: boolean;
    audioId: string;
    jobId: string;
    status: ProcessingStatus;
    message: string;
    estimatedTime?: string;
}

export interface SummaryResponse {
    success: boolean;
    audioId: string;
    status: ProcessingStatus;
    transcription?: {
        text: string;
        confidence: number;
        duration: number;
    };
    summary?: {
        text: string;
        keyPoints: string[];
        sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
        chapters?: Array<{
            title: string;
            summary: string;
            start: number;
            end: number;
        }>;
    };
    processingTime?: string;
    error?: string;
}

export interface StatusResponse {
    success: boolean;
    audioId: string;
    status: ProcessingStatus;
    progress?: number; // 0-100
    message: string;
    estimatedTimeRemaining?: string;
    error?: string;
}

// In-memory storage (for development - replace with database in production)
export class AudioRecordStorage {
    private static records: Map<string, AudioRecord> = new Map();

    static save(record: AudioRecord): void {
        this.records.set(record.id, record);
    }

    static findById(id: string): AudioRecord | undefined {
        return this.records.get(id);
    }

    static update(id: string, updates: Partial<AudioRecord>): AudioRecord | undefined {
        const record = this.records.get(id);
        if (record) {
            const updatedRecord = { ...record, ...updates };
            this.records.set(id, updatedRecord);
            return updatedRecord;
        }
        return undefined;
    }

    static getAll(): AudioRecord[] {
        return Array.from(this.records.values());
    }

    static delete(id: string): boolean {
        return this.records.delete(id);
    }
} 