import { NextResponse } from "next/server";
import { fetchYoutubeTranscript } from "../../../lib/youtubeTranscriptFetcher";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "YouTube URL is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (!youtubeRegex.test(url)) {
      return NextResponse.json(
        { error: "Invalid YouTube URL format" },
        { status: 400 }
      );
    }

    // Fetch transcript using the utility function
    const result = await fetchYoutubeTranscript(url);

    return NextResponse.json(result);
    
  } catch (error) {
    console.error('YouTube API error:', error);
    
    // Determine appropriate status code
    const errorMessage = error.message || 'Unknown error';
    let statusCode = 500;
    
    if (errorMessage.includes('disabled') || 
        errorMessage.includes('No transcript available') || 
        errorMessage.includes('unavailable')) {
      statusCode = 404;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
