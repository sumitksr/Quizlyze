from fastapi import FastAPI, HTTPException
from youtube_transcript_api import YouTubeTranscriptApi
import re
from typing import Optional

app = FastAPI(title="YouTube Transcript Service", version="1.0.0")

def extract_video_id(url: str) -> Optional[str]:
    """Extract video ID from various YouTube URL formats"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
        r'youtube\.com\/watch\?.*v=([^&\n?#]+)',
        r'youtu\.be\/([^&\n?#]+)',
        r'youtube\.com\/embed\/([^&\n?#]+)',
        r'youtube\.com\/v\/([^&\n?#]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    return None

@app.get("/")
def root():
    return {"message": "YouTube Transcript Service is running"}

@app.get("/transcript")
def get_transcript(video_id: str = None, url: str = None):
    """
    Get YouTube transcript by video_id or URL
    Usage: 
    - /transcript?video_id=WS8Ihn7tFtI
    - /transcript?url=https://www.youtube.com/watch?v=WS8Ihn7tFtI
    """
    try:
        # Extract video ID from URL if provided
        if url and not video_id:
            video_id = extract_video_id(url)
        
        if not video_id:
            raise HTTPException(
                status_code=400, 
                detail={
                    "error": "Missing or invalid video_id/url parameter",
                    "usage": "Use ?video_id=VIDEO_ID or ?url=YOUTUBE_URL",
                    "examples": [
                        "/transcript?video_id=dQw4w9WgXcQ",
                        "/transcript?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    ]
                }
            )
        
        # Fetch transcript using youtube-transcript-api
        ytt_api = YouTubeTranscriptApi()
        transcript_data = ytt_api.fetch(video_id)

        print("DEBUG: type of transcript_data =", type(transcript_data))
        if isinstance(transcript_data, list) and len(transcript_data) > 0:
            print("DEBUG: type of first item =", type(transcript_data[0]))
            print("DEBUG: first item =", transcript_data[0])

        
        snippets = []
        full_text_parts = []

        for item in transcript_data:
            snippet = {
                'text': item.text,
                'start': item.start,
                'duration': item.duration
            }
            snippets.append(snippet)

            clean_text = item.text.strip()
            if clean_text and clean_text not in ['[Music]', '[Applause]', '[Laughter]']:
                full_text_parts.append(clean_text)

        
        # Join all text parts
        full_text = ' '.join(full_text_parts)
        
        return {
            'success': True,
            'transcript': full_text,
            'snippets': snippets,
            'video_id': video_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        # More detailed error handling
        error_msg = str(e)
        if "No transcript found" in error_msg:
            raise HTTPException(
                status_code=404, 
                detail=f"No transcript available for video ID: {video_id}"
            )
        elif "Video unavailable" in error_msg:
            raise HTTPException(
                status_code=404, 
                detail=f"Video not found or unavailable: {video_id}"
            )
        else:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to fetch transcript: {error_msg}"
            )

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "youtube-transcript-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)