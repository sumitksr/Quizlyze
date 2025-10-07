// Utility to fetch raw content from different sources (PDF, YouTube, text, manual transcript)
export async function fetchContent(file, youtubeUrl, textContent, manualTranscript) {
  let contentData = "";

  if (file) {
    // Server-side parsing approach
    try {
      const form = new FormData();
      form.append("file", file);
      
      const parseResp = await fetch("/api/pdf/parse", { 
        method: "POST", 
        body: form 
      });
      
      if (!parseResp.ok) {
        let errorData = {};
        try { 
          errorData = await parseResp.json(); 
        } catch (jsonErr) {
          console.error("Failed to parse error response:", jsonErr);
        }
        
        const errorMessage = errorData?.details || errorData?.error || `PDF parsing failed with status ${parseResp.status}`;
        throw new Error(errorMessage);
      }
      
      const parsed = await parseResp.json();
      if (parsed.text && parsed.text.trim().length > 0) {
        contentData = parsed.text;
      } else {
        throw new Error("PDF was processed but no text content was extracted. The PDF might be image-based or corrupted.");
      }
    } catch (error) {
      console.error("PDF processing error:", error);
      
      // Provide user-friendly error messages
      if (error.message.includes('timeout')) {
        throw new Error("PDF processing timed out. Please try with a smaller file or try again later.");
      } else if (error.message.includes('too large')) {
        throw new Error("PDF file is too large. Please upload a file smaller than 50MB.");
      } else if (error.message.includes('Invalid file type')) {
        throw new Error("Please upload a valid PDF file.");
      } else {
        throw new Error(`Failed to process PDF: ${error.message}`);
      }
    }
  } else if (manualTranscript) {
    // Handle manual transcript input (highest priority after file)
    contentData = manualTranscript.trim();
  } else if (youtubeUrl) {
    // Handle YouTube URL - get raw transcript
    try {
      const apiResponse = await fetch("/api/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrl }),
      });

      if (!apiResponse.ok) {
        let errorData = {};
        try {
          errorData = await apiResponse.json();
        } catch (jsonErr) {
          console.error("Failed to parse YouTube error response:", jsonErr);
        }
        throw new Error(errorData.error || `YouTube processing failed with status ${apiResponse.status}`);
      }

      const youtubeResult = await apiResponse.json();

      if (youtubeResult.transcript) {
        contentData = youtubeResult.transcript;
      } else {
        throw new Error("Failed to get YouTube transcript");
      }
    } catch (error) {
      console.error("YouTube processing error:", error);
      throw new Error(`Failed to fetch YouTube transcript: ${error.message}`);
    }
  } else if (textContent) {
    // Handle direct text input
    contentData = textContent;
  } else {
    throw new Error("Please provide content (PDF, YouTube URL, manual transcript, or text)");
  }

  return contentData;
}
