# Python Service Deployment Instructions

## Files to Deploy
- `transcript_service.py` - Main FastAPI application
- `requirements.txt` - Python dependencies

## Deploy to Render

1. **Create a new Web Service on Render**
   - Connect your GitHub repository
   - Select "Python" as the environment
   - Set the following:

2. **Build Command:**
   ```bash
   pip install -r scripts/requirements.txt
   ```

3. **Start Command:**
   ```bash
   cd scripts && uvicorn transcript_service:app --host 0.0.0.0 --port $PORT
   ```

4. **Environment Variables:**
   - No special environment variables needed

## Deploy to Railway

1. **Create a new project on Railway**
2. **Connect your GitHub repository**
3. **Set the following:**
   - **Root Directory:** `scripts`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn transcript_service:app --host 0.0.0.0 --port $PORT`

## After Deployment

1. **Get your service URL** (e.g., `https://your-service.onrender.com`)

2. **Update your Next.js environment variables:**
   Add to your `.env.local` or Vercel environment variables:
   ```
   PYTHON_SERVICE_URL=https://your-service.onrender.com
   ```

3. **Test the service:**
   - Visit: `https://your-service.onrender.com/`
   - Test transcript: `https://your-service.onrender.com/transcript?video_id=WS8Ihn7tFtI`

## API Endpoints

- `GET /` - Service status
- `GET /transcript?video_id=VIDEO_ID` - Get transcript by video ID
- `GET /transcript?url=YOUTUBE_URL` - Get transcript by YouTube URL
- `GET /health` - Health check

## Example Usage

```javascript
// Test the service
const response = await fetch('https://your-service.onrender.com/transcript?url=https://www.youtube.com/watch?v=WS8Ihn7tFtI');
const data = await response.json();
console.log(data);
```