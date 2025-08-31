// app/api/youtube/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { url } = await req.json(); // 👈 read body
    const API_KEY = process.env.YOUTUBE_API_KEY;

    if (!url) {
      return NextResponse.json({ error: "Missing YouTube URL" }, { status: 400 });
    }

    // ✅ Extract videoId
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (!match) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }
    const id = match[1];

    // 1️⃣ Fetch video details
    const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${API_KEY}`;
    const videoRes = await fetch(videoUrl);
    const videoData = await videoRes.json();

    if (!videoData.items || videoData.items.length === 0) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const snippet = videoData.items[0].snippet;

    // 2️⃣ Fetch captions metadata
    const captionsUrl = `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${id}&key=${API_KEY}`;
    const captionsRes = await fetch(captionsUrl);
    const captionsData = await captionsRes.json();

    // 3️⃣ Return response
    return NextResponse.json({
      videoId: id,
      title: snippet.title,
      description: snippet.description,
      captions: captionsData.items || [],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
