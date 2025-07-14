"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.audioRoutes = void 0;
const express_1 = require("express");
const upload_1 = require("../middleware/upload");
const audioController_1 = require("../controllers/audioController");
const router = (0, express_1.Router)();
exports.audioRoutes = router;
router.post('/upload', upload_1.uploadMiddleware, audioController_1.uploadAudio);
router.post('/:id/transcribe', audioController_1.transcribeAudio);
router.get('/:id/summary', audioController_1.getSummary);
router.get('/:id/status', audioController_1.getStatus);
//# sourceMappingURL=audio.js.map