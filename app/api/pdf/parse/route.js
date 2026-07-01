import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
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

    // Parse PDF directly using pdf-parse (no child process)
    const data = await pdfParse(buffer);

    const cleanedText = (data.text || '')
      .replace(/ +/g, ' ')
      .replace(/\r\n|\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return NextResponse.json({
      text: cleanedText,
      metadata: {
        pages: data.numpages,
        info: data.info,
      },
    });
  } catch (error) {
    console.error('PDF direct upload parse error:', error);
    return NextResponse.json(
      { error: 'Failed to parse uploaded PDF', details: error.message },
      { status: 500 }
    );
  }
}
