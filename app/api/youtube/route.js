import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'YouTube URL is required' },
        { status: 400 }
      );
    }

    // Call Python script to fetch transcript
    const result = await callPythonScript(url);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch YouTube transcript' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      transcript: result.transcript,
      snippets: result.snippets,
      videoId: result.video_id
    });

  } catch (error) {
    console.error('YouTube transcript error:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch YouTube transcript', details: error.message },
      { status: 500 }
    );
  }
}

function callPythonScript(url) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), 'scripts', 'youtube_fetcher.py');
    const pythonProcess = spawn('python', [scriptPath, url]);
    
    let dataString = '';
    let errorString = '';

    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorString += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        resolve({ success: false, error: `Python script failed: ${errorString}` });
        return;
      }

      try {
        const result = JSON.parse(dataString);
        resolve(result);
      } catch (parseError) {
        resolve({ success: false, error: 'Failed to parse Python script output' });
      }
    });

    pythonProcess.on('error', (error) => {
      resolve({ success: false, error: `Failed to start Python process: ${error.message}` });
    });
  });
}

