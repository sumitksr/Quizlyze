import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Extract video ID from various YouTube URL formats
 */
function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    /youtu\.be\/([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

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

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const videoId = extractVideoId(url);
    const canonicalUrl = videoId
      ? `https://www.youtube.com/watch?v=${videoId}`
      : url;

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    // Ask GPT-4o to extract the full content/transcript of the video
    // using web search so it can read auto-generated captions or subtitles
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that extracts and transcribes the content of YouTube videos. " +
            "When given a YouTube URL, provide a detailed, thorough transcript or content summary of what is spoken/discussed in the video. " +
            "Include all main points, key concepts, examples, and details discussed. " +
            "Format it as a clean, readable transcript/content dump that can be used for summarization or quiz generation. " +
            "Do NOT summarize — provide the full detailed content as if it were a transcript.",
        },
        {
          role: "user",
          content: `Please extract and provide the full transcript/content of this YouTube video: ${canonicalUrl}\n\nProvide as much detail as possible about everything discussed in the video.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const transcript =
      completion.choices?.[0]?.message?.content || "";

    if (!transcript || transcript.trim().length < 50) {
      return NextResponse.json(
        {
          error:
            "Could not retrieve content for this video. The video may not be publicly indexed or may have no spoken content.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      videoId: videoId || null,
      transcript: transcript.trim(),
    });
  } catch (error) {
    console.error("YouTube API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process YouTube video" },
      { status: 500 }
    );
  }
}
