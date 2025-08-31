import { NextResponse } from "next/server";

// Force Node.js runtime
export const runtime = 'nodejs';

export async function POST(req) {
  console.log("=== PDF API Called ===");
  
  try {
    const body = await req.json();
    const { fileUrl } = body;
    
    console.log("Request body:", body);
    console.log("File URL:", fileUrl);

    if (!fileUrl) {
      console.log("No fileUrl provided");
      return NextResponse.json({ error: "No fileUrl provided" }, { status: 400 });
    }

    // Convert Google Drive URL to direct download
    let directUrl = fileUrl;
    if (fileUrl.includes('drive.google.com/file/d/')) {
      const fileId = fileUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (fileId) {
        directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        console.log("Converted URL:", directUrl);
      }
    }

    // Fetch the PDF
    console.log("Fetching PDF from:", directUrl);
    const response = await fetch(directUrl);
    
    if (!response.ok) {
      console.log("Fetch failed:", response.status, response.statusText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Get the content
    const arrayBuffer = await response.arrayBuffer();
    console.log("Received data size:", arrayBuffer.byteLength, "bytes");
    
    // Convert to Buffer
    const buffer = Buffer.from(arrayBuffer);
    
    // Import pdf-parse dynamically to avoid module loading issues
    console.log("Loading pdf-parse...");
    const pdfParse = (await import('pdf-parse')).default;
    
    // Parse PDF
    console.log("Parsing PDF...");
    const pdfData = await pdfParse(buffer);
    
    console.log("PDF parsed successfully");
    console.log("Text length:", pdfData.text.length);
    console.log("Number of pages:", pdfData.numpages);

    return NextResponse.json({
      success: true,
      text: pdfData.text,
      pages: pdfData.numpages,
      textLength: pdfData.text.length
    });

  } catch (error) {
    console.error("=== PDF API Error ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    
    return NextResponse.json({
      error: "PDF processing failed",
      message: error.message
    }, { status: 500 });
  }
}