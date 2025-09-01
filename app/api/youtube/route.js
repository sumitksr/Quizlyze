import { NextResponse } from "next/server";
// import { spawn } from "child_process";
// import path from "path";

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "YouTube URL is required" },
        { status: 400 }
      );
    }

      // Call external Python service to fetch transcript
      const result = await callExternalService(url);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Failed to fetch YouTube transcript" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        transcript: result.transcript,
        snippets: result.snippets,
        videoId: result.video_id,
      });
    
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch YouTube transcript", details: error.message },
      { status: 500 }
    );
  }
}

async function callExternalService(url) {
  try {
    const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL;

    const response = await fetch(
      `${PYTHON_SERVICE_URL}/transcript?url=${encodeURIComponent(url)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ detail: "Unknown error" }));
      return {
        success: false,
        error: errorData.detail || `Service error: ${response.status}`,
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: `Failed to call external service: ${error.message}`,
    };
  }
}


