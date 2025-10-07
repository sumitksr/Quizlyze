#!/usr/bin/env python3
"""
Standalone YouTube Transcript Fetcher
Called directly from Node.js to fetch YouTube transcripts
"""

import sys
import json
import re
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound, VideoUnavailable

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

def fetch_transcript(video_url):
    """Fetch transcript for a YouTube video"""
    try:
        # Extract video ID from URL
        video_id = extract_video_id(video_url)
        
        if not video_id:
            return {
                'success': False,
                'error': 'Invalid YouTube URL format'
            }
        
        # Fetch transcript
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        
        # Process transcript
        snippets = []
        full_text_parts = []
        
        for item in transcript_list:
            snippet = {
                'text': item['text'],
                'start': item['start'],
                'duration': item['duration']
            }
            snippets.append(snippet)
            
            # Clean and collect text
            clean_text = item['text'].strip()
            if clean_text and clean_text not in ['[Music]', '[Applause]', '[Laughter]']:
                full_text_parts.append(clean_text)
        
        # Join all text parts
        full_text = ' '.join(full_text_parts)
        
        return {
            'success': True,
            'video_id': video_id,
            'snippets': snippets,
            'transcript': full_text
        }
        
    except TranscriptsDisabled:
        return {
            'success': False,
            'error': 'Transcripts are disabled for this video'
        }
    except NoTranscriptFound:
        return {
            'success': False,
            'error': 'No transcript available for this video'
        }
    except VideoUnavailable:
        return {
            'success': False,
            'error': 'Video is unavailable or does not exist'
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'Failed to fetch transcript: {str(e)}'
        }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        error_result = {
            'success': False,
            'error': 'No YouTube URL provided'
        }
        print(json.dumps(error_result), file=sys.stderr)
        sys.exit(1)
    
    video_url = sys.argv[1]
    result = fetch_transcript(video_url)
    
    if result['success']:
        print(json.dumps(result))
        sys.exit(0)
    else:
        print(json.dumps(result), file=sys.stderr)
        sys.exit(1)
