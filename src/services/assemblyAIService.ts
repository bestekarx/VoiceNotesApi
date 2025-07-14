import { AssemblyAI } from 'assemblyai';
import { AssemblyAITranscriptResponse } from '../models/audioRecord';

export class AssemblyAIService {
    private client: AssemblyAI;

    constructor() {
        const apiKey = process.env.ASSEMBLYAI_API_KEY;
        if (!apiKey) {
            throw new Error('ASSEMBLYAI_API_KEY environment variable is required');
        }

        this.client = new AssemblyAI({
            apiKey: apiKey
        });
    }

    /**
     * Start transcription job for audio file
     * @param audioUrl URL to the audio file
     * @returns AssemblyAI job ID
     */
    async startTranscription(audioUrl: string): Promise<string> {
        try {
            const params = {
                audio: audioUrl,
                language_detection: true,
                speaker_labels: true,          // Speaker diarization
                auto_chapters: true,           // Auto chapters for summary
                sentiment_analysis: true,      // Sentiment analysis
                entity_detection: true,       // Entity detection
                punctuate: true,              // Auto punctuation
                format_text: true,            // Auto formatting
                auto_highlights: true         // Key phrases extraction
            };

            const transcript = await this.client.transcripts.transcribe(params);
            return transcript.id;
        } catch (error) {
            console.error('AssemblyAI transcription error:', error);
            throw new Error(`Failed to start transcription: ${error}`);
        }
    }

    /**
     * Get transcription result by job ID
     * @param jobId AssemblyAI job ID
     * @returns Transcription result
     */
    async getTranscriptionResult(jobId: string): Promise<AssemblyAITranscriptResponse> {
        try {
            const transcript = await this.client.transcripts.get(jobId);
            
            return {
                id: transcript.id,
                status: transcript.status as 'queued' | 'processing' | 'completed' | 'error',
                text: transcript.text || undefined,
                confidence: transcript.confidence || undefined,
                audio_duration: transcript.audio_duration || undefined,
                words: transcript.words || undefined,
                chapters: transcript.chapters || undefined,
                sentiment_analysis_results: transcript.sentiment_analysis_results || undefined,
                error: transcript.error || undefined
            };
        } catch (error) {
            console.error('AssemblyAI get result error:', error);
            throw new Error(`Failed to get transcription result: ${error}`);
        }
    }

    /**
     * Generate summary from transcription text
     * @param transcriptionText The transcription text
     * @param chapters Optional chapters from AssemblyAI
     * @returns Generated summary
     */
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
    } {
        try {
            // Use AssemblyAI's auto_chapters for summary
            let summaryText = '';
            let keyPoints: string[] = [];
            let processedChapters: Array<{
                title: string;
                summary: string;
                start: number;
                end: number;
            }> = [];

            if (chapters && chapters.length > 0) {
                // Use chapters for structured summary
                summaryText = chapters.map(chapter => chapter.summary).join(' ');
                keyPoints = chapters.map(chapter => chapter.headline || chapter.gist);
                
                processedChapters = chapters.map(chapter => ({
                    title: chapter.headline || 'Bölüm',
                    summary: chapter.summary,
                    start: chapter.start,
                    end: chapter.end
                }));
            } else {
                // Fallback: basic summary from transcription
                const sentences = transcriptionText.split(/[.!?]+/).filter(s => s.trim().length > 0);
                
                if (sentences.length <= 3) {
                    summaryText = transcriptionText;
                    keyPoints = sentences.slice(0, 3);
                } else {
                    // Take first and last sentences, and some from middle
                    const firstSentence = sentences[0];
                    const lastSentence = sentences[sentences.length - 1];
                    const middleSentences = sentences.slice(1, -1);
                    
                    summaryText = `${firstSentence}. ${middleSentences.length > 0 ? middleSentences.slice(0, 2).join('. ') + '. ' : ''}${lastSentence}.`;
                    keyPoints = [firstSentence, ...middleSentences.slice(0, 2), lastSentence].filter(Boolean);
                }
            }

            // Simple sentiment analysis (could be enhanced with AssemblyAI's sentiment data)
            const positiveWords = ['iyi', 'güzel', 'harika', 'mükemmel', 'başarılı', 'happy', 'good', 'great', 'excellent', 'amazing'];
            const negativeWords = ['kötü', 'berbat', 'başarısız', 'problem', 'sorun', 'bad', 'terrible', 'awful', 'problem', 'issue'];
            
            const text = transcriptionText.toLowerCase();
            const positiveCount = positiveWords.filter(word => text.includes(word)).length;
            const negativeCount = negativeWords.filter(word => text.includes(word)).length;
            
            let sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' = 'NEUTRAL';
            if (positiveCount > negativeCount) {
                sentiment = 'POSITIVE';
            } else if (negativeCount > positiveCount) {
                sentiment = 'NEGATIVE';
            }

            return {
                text: summaryText,
                keyPoints: keyPoints.slice(0, 5), // Limit to 5 key points
                sentiment,
                chapters: processedChapters.length > 0 ? processedChapters : undefined
            };
        } catch (error) {
            console.error('Summary generation error:', error);
            return {
                text: transcriptionText.slice(0, 200) + '...',
                keyPoints: ['Özet oluşturulamadı'],
                sentiment: 'NEUTRAL'
            };
        }
    }

    /**
     * Check if job is completed
     * @param jobId AssemblyAI job ID
     * @returns Processing status
     */
    async checkJobStatus(jobId: string): Promise<'queued' | 'processing' | 'completed' | 'error'> {
        try {
            const transcript = await this.client.transcripts.get(jobId);
            return transcript.status as 'queued' | 'processing' | 'completed' | 'error';
        } catch (error) {
            console.error('AssemblyAI status check error:', error);
            return 'error';
        }
    }
} 