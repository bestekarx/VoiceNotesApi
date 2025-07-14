import { AssemblyAITranscriptResponse } from '../models/audioRecord';
export declare class AssemblyAIService {
    private client;
    constructor();
    startTranscription(audioUrl: string): Promise<string>;
    getTranscriptionResult(jobId: string): Promise<AssemblyAITranscriptResponse>;
    generateSummary(transcriptionText: string, chapters?: any[]): {
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
    checkJobStatus(jobId: string): Promise<'queued' | 'processing' | 'completed' | 'error'>;
}
//# sourceMappingURL=assemblyAIService.d.ts.map