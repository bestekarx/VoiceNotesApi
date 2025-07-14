# VoiceNotes API

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)
![Express](https://img.shields.io/badge/Express-4.18+-red.svg)

## Overview

VoiceNotes API is a RESTful service built with Node.js and TypeScript that provides audio transcription and summarization capabilities powered by AssemblyAI. The API handles audio file uploads, processes them through advanced speech-to-text technology, and returns transcriptions with AI-generated summaries.

## 🔗 Related Projects

This repository contains the **Backend API** (Node.js/TypeScript). For the complete platform:

- **🚀 Backend API** (this repository): [https://github.com/bestekarx/VoiceNotesApi](https://github.com/bestekarx/VoiceNotesApi)
- **📱 Mobile App**: [https://github.com/bestekarx/VoiceNotes](https://github.com/bestekarx/VoiceNotes)

> **Note**: Both repositories work together to provide a complete voice note management solution. The mobile app provides the user interface and local storage, while this API handles AI-powered transcription and summarization.

## Features

- **Audio Upload**: Support for multiple audio formats (MP3, WAV, M4A, OGG, WebM, AAC)
- **Speech-to-Text**: High-accuracy transcription using AssemblyAI
- **AI Summarization**: Automatic content summarization and key point extraction
- **Language Detection**: Automatic language identification
- **File Management**: Secure temporary file processing with automatic cleanup
- **Type-Safe**: Full TypeScript implementation with comprehensive type definitions

## Technology Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.0+
- **Framework**: Express.js 4.18+
- **AI Service**: AssemblyAI API
- **File Upload**: Multer middleware
- **Hosting**: Render.com

## Project Structure

```
src/
├── controllers/          # API endpoint handlers
│   └── audioController.ts
├── services/            # External service integrations
│   └── assemblyAIService.ts
├── models/              # TypeScript interfaces and types
│   └── audioRecord.ts
├── routes/              # Express route definitions
│   └── audio.ts
├── middleware/          # Custom middleware
│   └── upload.ts
└── app.ts              # Application entry point
```

## Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- AssemblyAI API key ([Get one here](https://www.assemblyai.com/dashboard))

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/bestekarx/VoiceNotesApi.git
   cd VoiceNotesApi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Create .env file
   cp .env.example .env
   
   # Edit .env and add your AssemblyAI API key
   ASSEMBLYAI_API_KEY=your_api_key_here
   PORT=3000
   NODE_ENV=development
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:3000`

## API Endpoints

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-14T10:30:00.000Z",
  "uptime": 3600
}
```

### Upload Audio File

```http
POST /api/audio/upload
Content-Type: multipart/form-data
```

**Parameters:**
- `audio` (file): Audio file to upload

**Supported formats:** MP3, WAV, M4A, OGG, WebM, AAC
**Max file size:** 100MB

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "upload_123456789",
    "filename": "voice_note.mp3",
    "size": 2048576,
    "uploadedAt": "2025-01-14T10:30:00.000Z"
  }
}
```

### Start Transcription

```http
POST /api/audio/:id/transcribe
```

**Parameters:**
- `id` (path): Upload ID from the upload response

**Response:**
```json
{
  "success": true,
  "data": {
    "transcriptId": "transcript_123456789",
    "status": "processing",
    "estimatedTime": "2-5 minutes"
  }
}
```

### Get Transcription Status

```http
GET /api/audio/:id/status
```

**Response (Processing):**
```json
{
  "success": true,
  "data": {
    "status": "processing",
    "progress": 45
  }
}
```

**Response (Completed):**
```json
{
  "success": true,
  "data": {
    "status": "completed",
    "progress": 100
  }
}
```

### Get Transcription Results

```http
GET /api/audio/:id/summary
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transcriptText": "This is the transcribed text from your audio file...",
    "summary": "AI-generated summary of the content...",
    "keyPoints": [
      "First key point extracted from the audio",
      "Second important topic discussed",
      "Third main idea from the content"
    ],
    "languageCode": "en",
    "confidence": 0.95,
    "audioDuration": 120.5,
    "wordCount": 234,
    "speakerCount": 1
  }
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "Unsupported audio format. Please use MP3, WAV, M4A, OGG, WebM, or AAC.",
    "details": {
      "receivedType": "image/jpeg",
      "supportedTypes": ["audio/mpeg", "audio/wav", "audio/m4a", "audio/ogg", "audio/webm", "audio/aac"]
    }
  }
}
```

### Common Error Codes

- `INVALID_FILE_TYPE`: Unsupported audio format
- `FILE_TOO_LARGE`: File exceeds 100MB limit
- `TRANSCRIPTION_FAILED`: AssemblyAI processing error
- `UPLOAD_NOT_FOUND`: Invalid upload ID
- `API_KEY_INVALID`: AssemblyAI API key issues
- `RATE_LIMIT_EXCEEDED`: Too many requests

## Usage Examples

### JavaScript/Node.js

```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const API_BASE = 'https://voicenotesapi.onrender.com';

async function transcribeAudio(filePath) {
  try {
    // 1. Upload audio file
    const formData = new FormData();
    formData.append('audio', fs.createReadStream(filePath));
    
    const uploadResponse = await axios.post(\`\${API_BASE}/api/audio/upload\`, formData, {
      headers: formData.getHeaders()
    });
    
    const uploadId = uploadResponse.data.data.id;
    
    // 2. Start transcription
    await axios.post(\`\${API_BASE}/api/audio/\${uploadId}/transcribe\`);
    
    // 3. Poll for completion
    let status = 'processing';
    while (status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await axios.get(\`\${API_BASE}/api/audio/\${uploadId}/status\`);
      status = statusResponse.data.data.status;
    }
    
    // 4. Get results
    const resultsResponse = await axios.get(\`\${API_BASE}/api/audio/\${uploadId}/summary\`);
    return resultsResponse.data.data;
    
  } catch (error) {
    console.error('Transcription failed:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
transcribeAudio('./voice_note.mp3')
  .then(results => {
    console.log('Transcription:', results.transcriptText);
    console.log('Summary:', results.summary);
    console.log('Key Points:', results.keyPoints);
  })
  .catch(console.error);
```

### cURL Examples

```bash
# Upload audio file
curl -X POST "https://voicenotesapi.onrender.com/api/audio/upload" \\
  -F "audio=@voice_note.mp3"

# Start transcription
curl -X POST "https://voicenotesapi.onrender.com/api/audio/upload_123456789/transcribe"

# Check status
curl "https://voicenotesapi.onrender.com/api/audio/upload_123456789/status"

# Get results
curl "https://voicenotesapi.onrender.com/api/audio/upload_123456789/summary"
```

### Python Example

```python
import requests
import time

API_BASE = "https://voicenotesapi.onrender.com"

def transcribe_audio(file_path):
    # Upload file
    with open(file_path, 'rb') as audio_file:
        files = {'audio': audio_file}
        upload_response = requests.post(f"{API_BASE}/api/audio/upload", files=files)
        upload_response.raise_for_status()
        upload_id = upload_response.json()['data']['id']
    
    # Start transcription
    transcribe_response = requests.post(f"{API_BASE}/api/audio/{upload_id}/transcribe")
    transcribe_response.raise_for_status()
    
    # Poll for completion
    while True:
        status_response = requests.get(f"{API_BASE}/api/audio/{upload_id}/status")
        status_response.raise_for_status()
        
        status = status_response.json()['data']['status']
        if status == 'completed':
            break
        elif status == 'failed':
            raise Exception("Transcription failed")
        
        time.sleep(5)  # Wait 5 seconds
    
    # Get results
    results_response = requests.get(f"{API_BASE}/api/audio/{upload_id}/summary")
    results_response.raise_for_status()
    
    return results_response.json()['data']

# Usage
try:
    results = transcribe_audio("voice_note.mp3")
    print(f"Transcription: {results['transcriptText']}")
    print(f"Summary: {results['summary']}")
    print(f"Key Points: {results['keyPoints']}")
except Exception as e:
    print(f"Error: {e}")
```

## Development

### Build and Run

```bash
# Development mode with auto-reload
npm run dev

# Build TypeScript
npm run build

# Production mode
npm start

# Run tests
npm test

# Lint code
npm run lint
```

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| \`ASSEMBLYAI_API_KEY\` | Your AssemblyAI API key | Yes | - |
| \`PORT\` | Server port | No | 3000 |
| \`NODE_ENV\` | Environment mode | No | development |
| \`MAX_FILE_SIZE\` | Maximum upload size in bytes | No | 104857600 (100MB) |

## Deployment

### Render.com (Production)

1. **Connect Repository**: Link your GitHub repository to Render.com
2. **Configure Service**:
   - Build Command: \`npm install && npm run build\`
   - Start Command: \`npm start\`
3. **Environment Variables**: Set \`ASSEMBLYAI_API_KEY\` in Render dashboard
4. **Auto-Deploy**: Enable automatic deployments from main branch

### Other Platforms

The API can be deployed on any Node.js hosting platform:
- **Heroku**: Use the provided \`package.json\` scripts
- **Vercel**: Configure \`vercel.json\` for serverless deployment
- **Railway**: Connect repository and deploy automatically
- **DigitalOcean App Platform**: Use Docker or buildpacks

## AssemblyAI Integration

### Features Used

- **Universal-2 Model**: Latest high-accuracy speech recognition
- **Language Detection**: Automatic language identification
- **Speaker Diarization**: Multi-speaker audio processing
- **Summarization**: AI-powered content summarization
- **Key Phrase Extraction**: Important topic identification

### Supported Languages

The API supports 100+ languages including:
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Turkish (tr)
- And many more...

### Rate Limits

- **Concurrent Requests**: 5 simultaneous transcriptions
- **File Size**: Maximum 100MB per file
- **Audio Duration**: Up to 11 hours per file
- **Monthly Usage**: Depends on your AssemblyAI plan

## Security

- **API Key Protection**: Environment-based configuration
- **File Validation**: Strict audio format checking
- **Temporary Storage**: Files deleted after processing
- **HTTPS**: All communications encrypted
- **CORS**: Configurable cross-origin resource sharing

## Monitoring and Logs

The API includes comprehensive logging:

```bash
# View logs in development
npm run dev

# Production logs (Render.com)
# Available in Render dashboard under "Logs" tab
```

## Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit changes (\`git commit -m 'Add amazing feature'\`)
4. Push to branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: Check the API endpoints above
- **Issues**: Report bugs on GitHub Issues
- **AssemblyAI Docs**: [AssemblyAI Documentation](https://www.assemblyai.com/docs)

---

**Live API**: [https://voicenotesapi.onrender.com](https://voicenotesapi.onrender.com)
