/**
 * YouTube Transcript Fetcher
 * Fetches transcripts using youtubei.js library
 */

import { Innertube } from 'youtubei.js';

/**
 * Extract video ID from various YouTube URL formats
 */
export function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    /youtu\.be\/([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Fetch YouTube transcript using youtubei.js
 * @param {string} videoIdOrUrl - YouTube video ID or full URL
 * @returns {Promise<Object>} - Transcript data
 */
export async function fetchYoutubeTranscript(videoIdOrUrl) {
  try {
    // Extract video ID if URL is provided
    let videoId = videoIdOrUrl;
    if (videoIdOrUrl.includes('youtube.com') || videoIdOrUrl.includes('youtu.be')) {
      videoId = extractVideoId(videoIdOrUrl);
      if (!videoId) {
        throw new Error('Could not extract video ID from URL');
      }
    }

    // Initialize YouTube client
    const youtube = await Innertube.create({
      lang: 'en',
      location: 'US',
      retrieve_player: false,
    });

    // Get video info
    const videoInfo = await youtube.getInfo(videoId);

    // Get transcript
    const transcriptData = await videoInfo.getTranscript();
    
    if (!transcriptData || !transcriptData.transcript) {
      throw new Error('No transcript available for this video');
    }

    // Access the transcript content
    const transcript = transcriptData.transcript;
    const segments = transcript.content?.body?.initial_segments;

    if (!segments || segments.length === 0) {
      throw new Error('No transcript segments found');
    }

    // Process segments
    const snippets = [];
    const textParts = [];

    for (const segment of segments) {
      if (segment.snippet) {
        const text = segment.snippet.text || '';
        const startMs = segment.start_ms || 0;
        const endMs = segment.end_ms || 0;
        const duration = endMs - startMs;

        if (text.trim()) {
          snippets.push({
            text: text.trim(),
            start: startMs / 1000, // Convert to seconds
            duration: duration / 1000,
          });

          // Filter out music/applause markers
          const lowerText = text.toLowerCase().trim();
          const shouldInclude = !['[music]', '[applause]', '[laughter]', '♪'].some(marker => 
            lowerText.includes(marker)
          );

          if (shouldInclude) {
            textParts.push(text.trim());
          }
        }
      }
    }

    // Create full transcript text
    const fullText = textParts
      .join(' ')
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    if (!fullText) {
      throw new Error('Transcript found but no valid text content');
    }

    return {
      success: true,
      videoId,
      transcript: fullText,
      snippets,
    };
  } catch (error) {
    // Re-throw with more context
    const errorMessage = error.message || 'Unknown error';
    
    console.error('YouTube transcript fetch error:', errorMessage);
    
    if (errorMessage.includes('disabled') || errorMessage.includes('Transcript is disabled')) {
      throw new Error('Transcripts are disabled for this video');
    } else if (errorMessage.includes('No transcript') || errorMessage.includes('not available')) {
      throw new Error('No transcript available for this video. The video might not have captions.');
    } else if (errorMessage.includes('unavailable') || errorMessage.includes('Video unavailable')) {
      throw new Error('Video is unavailable or does not exist');
    } else if (errorMessage.includes('private') || errorMessage.includes('Private video')) {
      throw new Error('This video is private');
    } else {
      throw new Error(`Failed to fetch transcript: ${errorMessage}`);
    }
  }
}
