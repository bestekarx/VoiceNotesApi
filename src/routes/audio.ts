import { Router } from 'express';
import { uploadMiddleware } from '../middleware/upload';
import { 
    uploadAudio, 
    transcribeAudio, 
    getSummary, 
    getStatus 
} from '../controllers/audioController';

const router = Router();

// POST /api/audio/upload - Upload MP3 file
router.post('/upload', uploadMiddleware, uploadAudio);

// POST /api/audio/:id/transcribe - Start transcription with AssemblyAI
router.post('/:id/transcribe', transcribeAudio);

// GET /api/audio/:id/summary - Get AI summary
router.get('/:id/summary', getSummary);

// GET /api/audio/:id/status - Check processing status
router.get('/:id/status', getStatus);

export { router as audioRoutes }; 