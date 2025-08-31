import { fetchContent } from './contentFetcher';

export async function generateSummary(file, youtubeUrl, textContent) {
  try {
    // Get raw content
    const contentData = await fetchContent(file, youtubeUrl, textContent);
    
    // Send to unified API with action type
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        data: contentData,
        action: 'summary'
      })
    });

    if (!response.ok) {
      throw new Error(`Summary generation failed: ${response.status}`);
    }

    const result = await response.json();
    return result.summary;
  } catch (error) {
    console.error('Summary generation error:', error);
    throw error;
  }
}