import { NextResponse } from "next/server";

export async function POST(req) {
  console.log("=== Simple PDF API Called ===");
  
  try {
    const body = await req.json();
    const { fileUrl } = body;
    
    console.log("File URL:", fileUrl);

    if (!fileUrl) {
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
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log("Received data size:", arrayBuffer.byteLength, "bytes");
    
    // For now, let's just return that we successfully downloaded the PDF
    // and suggest using an external service for text extraction
    return NextResponse.json({
      success: true,
      message: "PDF downloaded successfully",
      size: arrayBuffer.byteLength,
      suggestion: "PDF parsing libraries are having compatibility issues. Consider using an external PDF-to-text service or uploading the PDF directly to your summarization service."
    });

  } catch (error) {
    console.error("Error:", error.message);
    return NextResponse.json({
      error: "PDF processing failed",
      message: error.message
    }, { status: 500 });
  }
}