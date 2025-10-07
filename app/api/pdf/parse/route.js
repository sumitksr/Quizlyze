import { NextResponse } from "next/server";
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { spawn } from 'child_process';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  let tempFilePath = null;
  
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type || !file.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF file.' },
        { status: 400 }
      );
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Please upload a PDF smaller than 50MB.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save to temporary file
    tempFilePath = join(tmpdir(), `pdf-${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`);
    await writeFile(tempFilePath, buffer);

    // Use Node.js script to parse PDF (avoids Next.js webpack issues)
    const scriptPath = join(process.cwd(), 'scripts', 'pdf-parser.js');
    
    const result = await new Promise((resolve, reject) => {
      const nodeProcess = spawn('node', [scriptPath, tempFilePath], {
        timeout: 30000,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });

      let stdout = '';
      let stderr = '';

      nodeProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      nodeProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      nodeProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const parsed = JSON.parse(stdout);
            resolve(parsed);
          } catch (e) {
            reject(new Error(`Failed to parse output: ${e.message}`));
          }
        } else {
          try {
            const errorData = JSON.parse(stderr);
            reject(new Error(errorData.details || errorData.error || 'PDF parsing failed'));
          } catch {
            reject(new Error(stderr || `Process exited with code ${code}`));
          }
        }
      });

      nodeProcess.on('error', (error) => {
        reject(new Error(`Failed to spawn process: ${error.message}`));
      });
    });

    if (result.error) {
      throw new Error(result.error);
    }

    const cleanedText = (result.text || '')
      .replace(/ +/g, ' ')
      .replace(/\r\n|\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return NextResponse.json({
      text: cleanedText,
      metadata: {
        pages: result.numPages,
        info: result.info,
      },
    });
  } catch (error) {
    console.error('PDF direct upload parse error:', error);
    return NextResponse.json(
      { error: 'Failed to parse uploaded PDF', details: error.message },
      { status: 500 }
    );
  } finally {
    // Clean up temporary file
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch (e) {
        console.error('Failed to delete temp file:', e);
      }
    }
  }
}
