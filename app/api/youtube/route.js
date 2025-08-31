import { NextResponse } from "next/server";

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

    //  const result = await callPythonScript(url);
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
    // Replace with your actual Render service URL
    const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'https://your-python-service.onrender.com';
    
    const response = await fetch(`${PYTHON_SERVICE_URL}/transcript?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return { success: false, error: errorData.detail || `Service error: ${response.status}` };
    }

    const data = await response.json();
    return data;

  } catch (error) {
    return { success: false, error: `Failed to call external service: ${error.message}` };
  }
}

// OLD LOCAL PYTHON METHOD (COMMENTED OUT FOR REFERENCE)

import { spawn } from "child_process";
import path from "path";

function callPythonScript(url) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(
      process.cwd(),
      "scripts",
      "youtube_fetcher.py"
    );
    const pythonProcess = spawn("python", [scriptPath, url]);

    let dataString = "";
    let errorString = "";

    pythonProcess.stdout.on("data", (data) => {
      dataString += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorString += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        resolve({
          success: false,
          error: `Python script failed: ${errorString}`,
        });
        return;
      }

      try {
        const result = JSON.parse(dataString);
        resolve(result);
      } catch (parseError) {
        resolve({
          success: false,
          error: "Failed to parse Python script output",
        });
      }
    });

    pythonProcess.on("error", (error) => {
      resolve({
        success: false,
        error: `Failed to start Python process: ${error.message}`,
      });
    });
  });
}
