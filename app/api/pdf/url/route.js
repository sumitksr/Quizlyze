import { NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // First attempt: plain fetch with timeout
    let remoteRes;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      remoteRes = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/pdf,application/octet-stream,*/*;q=0.8',
        }
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout', details: 'The PDF download took too long' },
          { status: 408 }
        );
      }
      throw fetchError;
    }

    if (!remoteRes.ok) {
      // Retry with browser-like headers for sites blocking default Node fetch
      if (remoteRes.status === 401 || remoteRes.status === 403) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000);

          remoteRes = await fetch(url, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0 Safari/537.36',
              'Accept': 'application/pdf,application/octet-stream,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
              'Referer': new URL(url).origin,
            },
          });
          clearTimeout(timeoutId);
        } catch (retryError) {
          if (retryError.name === 'AbortError') {
            return NextResponse.json(
              { error: 'Request timeout on retry', details: 'The PDF download took too long' },
              { status: 408 }
            );
          }
          throw retryError;
        }
      }

      if (!remoteRes.ok) {
        return NextResponse.json(
          { error: 'Failed to download PDF from URL', details: `${remoteRes.status} ${remoteRes.statusText}` },
          { status: 502 }
        );
      }
    }

    // Check content type
    const contentType = remoteRes.headers.get('content-type');
    if (contentType && !contentType.includes('pdf') && !contentType.includes('octet-stream')) {
      return NextResponse.json(
        { error: 'URL does not point to a PDF file', details: `Content-Type: ${contentType}` },
        { status: 400 }
      );
    }

    const arrayBuffer = await remoteRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Dynamically import pdf-parse to avoid build-time test-file errors
    const { default: pdfParse } = await import('pdf-parse');
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
        originUrl: url,
      },
    });
  } catch (error) {
    console.error('PDF-from-URL processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF from URL', details: error.message },
      { status: 500 }
    );
  }
}
