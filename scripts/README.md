# YouTube Transcript Service - Vercel Deployment

This folder contains everything needed to deploy the YouTube Transcript Service to Vercel.

## Files Structure
```
scripts/
├── vercel.json          # Vercel configuration
├── api/
│   └── index.py         # FastAPI application
├── requirements.txt     # Python dependencies
├── transcript_service.py # Original service (for reference)
└── README.md           # This file
```

## Deployment Steps

1. **Create a new repository** (or use this scripts folder as root)
2. **Push to GitHub/GitLab** with these files
3. **Go to Vercel Dashboard** → Import Project
4. **Select Framework Preset**: Other
5. **Deploy**

## API Endpoints

- `GET /` - Health check
- `GET /transcript?video_id=VIDEO_ID` - Get transcript by video ID
- `GET /transcript?url=YOUTUBE_URL` - Get transcript by YouTube URL
- `GET /health` - Service health status

## Example Usage

```bash
# Get transcript by video ID
curl "https://your-app.vercel.app/transcript?video_id=dQw4w9WgXcQ"

# Get transcript by URL
curl "https://your-app.vercel.app/transcript?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ"
```

## Response Format

```json
{
  "success": true,
  "video_id": "dQw4w9WgXcQ",
  "transcript": "Full transcript text here...",
  "snippets": [
    {
      "text": "Individual text segment",
      "start": 0.0,
      "duration": 2.5
    }
  ]
}
```

## Update Frontend

After deployment, update your frontend's `.env` file:
```
PYTHON_SERVICE_URL=https://your-vercel-app-name.vercel.app
```