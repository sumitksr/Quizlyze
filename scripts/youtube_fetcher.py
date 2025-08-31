#!/usr/bin/env python3
import sys
import json
import re
from youtube_transcript_api import YouTubeTranscriptApi

def extract_video_id(url):
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

def fetch_transcript(video_id):
    """Fetch transcript for a YouTube video"""
    try:
        # Use the correct API method
        ytt_api = YouTubeTranscriptApi()
        transcript_data = ytt_api.fetch(video_id)
        
        snippets = []
        full_text_parts = []
        
        for item in transcript_data:
            snippet = {
                'text': item.text,
                'start': item.start,
                'duration': item.duration
            }
            snippets.append(snippet)
            
            # Clean up text for full transcript
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
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'video_id': video_id
        }

def main():
    if len(sys.argv) != 2:
        print(json.dumps({'success': False, 'error': 'YouTube URL required'}))
        sys.exit(1)
    
    url = sys.argv[1]
    video_id = extract_video_id(url)
    
    if not video_id:
        print(json.dumps({'success': False, 'error': 'Invalid YouTube URL'}))
        sys.exit(1)
    
    result = fetch_transcript(video_id)
    print(json.dumps(result))

if __name__ == '__main__':
    main()