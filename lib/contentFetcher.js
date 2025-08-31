

export async function fetchContent(file, youtubeUrl, textContent) {
  let apiResponse;
  let contentData = '';

  if (file) {
    // Handle PDF file upload
    const pdfFormData = new FormData();
    pdfFormData.append('file', file);
    
    apiResponse = await fetch('/api/pdf', {
      method: 'POST',
      body: pdfFormData
    });

    if (!apiResponse.ok) {
      throw new Error(`PDF processing failed: ${apiResponse.status}`);
    }

    const pdfResult = await apiResponse.json();
    
    if (pdfResult.text) {
      contentData = pdfResult.text;
    } else {
      throw new Error('Failed to extract text from PDF');
    }

  } else if (youtubeUrl) {
    // Handle YouTube URL
    apiResponse = await fetch('/api/youtube', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: youtubeUrl })
    });

    if (!apiResponse.ok) {
      throw new Error(`YouTube processing failed: ${apiResponse.status}`);
    }

    const youtubeResult = await apiResponse.json();
    
    if (youtubeResult.transcript) {
      contentData = youtubeResult.transcript;
    } else if (youtubeResult.text) {
      contentData = youtubeResult.text;
    } else {
      throw new Error('Failed to get YouTube transcript');
    }

  } else if (textContent) {
    // Handle direct text input
    contentData = textContent;
  } else {
    throw new Error('Please provide content (PDF, YouTube URL, or text)');
  }

  return contentData;
}

export async function generateSummary(contentData) {
  const response = await fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: contentData })
  });

  if (!response.ok) {
    throw new Error(`Summarization failed: ${response.status}`);
  }

  const result = await response.json();
  return result.summary;
}

export async function generateQuiz(contentData, numQuestions = 10) {
  // You'll need to create this API endpoint
  const response = await fetch('/api/quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      data: contentData,
      numQuestions: numQuestions
    })
  });

  if (!response.ok) {
    throw new Error(`Quiz generation failed: ${response.status}`);
  }

  const result = await response.json();
  return result.quiz;
}

export async function generateFlashcards(contentData, numCards = 15) {
  // You'll need to create this API endpoint
  const response = await fetch('/api/flashcards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      data: contentData,
      numCards: numCards
    })
  });

  if (!response.ok) {
    throw new Error(`Flashcard generation failed: ${response.status}`);
  }

  const result = await response.json();
  return result.flashcards;
}


export async function processContent(file, youtubeUrl, textContent, type, options = {}) {
  try {
    const contentData = await fetchContent(file, youtubeUrl, textContent);
    
    
    switch (type) {
      case 'summary':
        return await generateSummary(contentData);
      
      case 'quiz':
        return await generateQuiz(contentData, options.numQuestions);
      
      case 'flashcards':
        return await generateFlashcards(contentData, options.numCards);
      
      default:
        throw new Error('Invalid processing type');
    }
  } catch (error) {
    console.error('Content processing error:', error);
    throw error;
  }
}