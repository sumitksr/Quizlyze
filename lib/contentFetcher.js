// Utility to fetch raw content from different sources (PDF, YouTube, text, manual transcript)
export async function fetchContent(file, youtubeUrl, textContent, manualTranscript) {
  let apiResponse;
  let contentData = "";

  if (file) {
    // Handle PDF file upload - get raw text
    const pdfFormData = new FormData();
    pdfFormData.append("file", file);

    apiResponse = await fetch("/api/pdf", {
      method: "POST",
      body: pdfFormData,
    });

    if (!apiResponse.ok) {
      throw new Error(`PDF processing failed: ${apiResponse.status}`);
    }

    const pdfResult = await apiResponse.json();

    if (pdfResult.text) {
      contentData = pdfResult.text;
    } else {
      throw new Error("Failed to extract text from PDF");
    }
  } else if (manualTranscript) {
    // Handle manual transcript input (highest priority after file)
    contentData = manualTranscript.trim();
  } else if (youtubeUrl) {
    // Handle YouTube URL - get raw transcript
    apiResponse = await fetch("/api/youtube", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: youtubeUrl }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      throw new Error(errorData.error || `YouTube processing failed: ${apiResponse.status}`);
    }

    const youtubeResult = await apiResponse.json();

    if (youtubeResult.transcript) {
      contentData = youtubeResult.transcript;
    } else {
      throw new Error("Failed to get YouTube transcript");
    }
  } else if (textContent) {
    // Handle direct text input
    contentData = textContent;
  } else {
    throw new Error("Please provide content (PDF, YouTube URL, manual transcript, or text)");
  }

  return contentData;
}
