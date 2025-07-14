"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssemblyAIService = void 0;
const assemblyai_1 = require("assemblyai");
class AssemblyAIService {
    constructor() {
        const apiKey = process.env.ASSEMBLYAI_API_KEY;
        if (!apiKey) {
            throw new Error('ASSEMBLYAI_API_KEY environment variable is required');
        }
        this.client = new assemblyai_1.AssemblyAI({
            apiKey: apiKey
        });
    }
    async startTranscription(audioUrl) {
        try {
            const params = {
                audio: audioUrl,
                language_detection: true,
                speaker_labels: true,
                auto_chapters: true,
                sentiment_analysis: true,
                entity_detection: true,
                punctuate: true,
                format_text: true,
                auto_highlights: true
            };
            const transcript = await this.client.transcripts.transcribe(params);
            return transcript.id;
        }
        catch (error) {
            console.error('AssemblyAI transcription error:', error);
            throw new Error(`Failed to start transcription: ${error}`);
        }
    }
    async getTranscriptionResult(jobId) {
        try {
            const transcript = await this.client.transcripts.get(jobId);
            return {
                id: transcript.id,
                status: transcript.status,
                text: transcript.text || undefined,
                confidence: transcript.confidence || undefined,
                audio_duration: transcript.audio_duration || undefined,
                words: transcript.words || undefined,
                chapters: transcript.chapters || undefined,
                sentiment_analysis_results: transcript.sentiment_analysis_results || undefined,
                error: transcript.error || undefined
            };
        }
        catch (error) {
            console.error('AssemblyAI get result error:', error);
            throw new Error(`Failed to get transcription result: ${error}`);
        }
    }
    generateSummary(transcriptionText, chapters) {
        try {
            let summaryText = '';
            let keyPoints = [];
            let processedChapters = [];
            if (chapters && chapters.length > 0) {
                summaryText = chapters.map(chapter => chapter.summary).join(' ');
                keyPoints = chapters.map(chapter => chapter.headline || chapter.gist);
                processedChapters = chapters.map(chapter => ({
                    title: chapter.headline || 'Bölüm',
                    summary: chapter.summary,
                    start: chapter.start,
                    end: chapter.end
                }));
            }
            else {
                const sentences = transcriptionText.split(/[.!?]+/).filter(s => s.trim().length > 0);
                if (sentences.length <= 3) {
                    summaryText = transcriptionText;
                    keyPoints = sentences.slice(0, 3);
                }
                else {
                    const firstSentence = sentences[0];
                    const lastSentence = sentences[sentences.length - 1];
                    const middleSentences = sentences.slice(1, -1);
                    summaryText = `${firstSentence}. ${middleSentences.length > 0 ? middleSentences.slice(0, 2).join('. ') + '. ' : ''}${lastSentence}.`;
                    keyPoints = [firstSentence, ...middleSentences.slice(0, 2), lastSentence].filter(Boolean);
                }
            }
            const positiveWords = ['iyi', 'güzel', 'harika', 'mükemmel', 'başarılı', 'happy', 'good', 'great', 'excellent', 'amazing'];
            const negativeWords = ['kötü', 'berbat', 'başarısız', 'problem', 'sorun', 'bad', 'terrible', 'awful', 'problem', 'issue'];
            const text = transcriptionText.toLowerCase();
            const positiveCount = positiveWords.filter(word => text.includes(word)).length;
            const negativeCount = negativeWords.filter(word => text.includes(word)).length;
            let sentiment = 'NEUTRAL';
            if (positiveCount > negativeCount) {
                sentiment = 'POSITIVE';
            }
            else if (negativeCount > positiveCount) {
                sentiment = 'NEGATIVE';
            }
            return {
                text: summaryText,
                keyPoints: keyPoints.slice(0, 5),
                sentiment,
                chapters: processedChapters.length > 0 ? processedChapters : undefined
            };
        }
        catch (error) {
            console.error('Summary generation error:', error);
            return {
                text: transcriptionText.slice(0, 200) + '...',
                keyPoints: ['Özet oluşturulamadı'],
                sentiment: 'NEUTRAL'
            };
        }
    }
    async checkJobStatus(jobId) {
        try {
            const transcript = await this.client.transcripts.get(jobId);
            return transcript.status;
        }
        catch (error) {
            console.error('AssemblyAI status check error:', error);
            return 'error';
        }
    }
}
exports.AssemblyAIService = AssemblyAIService;
//# sourceMappingURL=assemblyAIService.js.map