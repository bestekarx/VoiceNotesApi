export type ProcessingStatus = 'uploading' | 'processing' | 'completed' | 'error';
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
    duration?: number;
}
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
    progress?: number;
    message: string;
    estimatedTimeRemaining?: string;
    error?: string;
}
export declare class AudioRecordStorage {
    private static records;
    static save(record: AudioRecord): void;
    static findById(id: string): AudioRecord | undefined;
    static update(id: string, updates: Partial<AudioRecord>): AudioRecord | undefined;
    static getAll(): AudioRecord[];
    static delete(id: string): boolean;
}
//# sourceMappingURL=audioRecord.d.ts.map