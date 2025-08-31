import { fetchContent } from './contentFetcher';

export async function generateFlashcards(file, youtubeUrl, textContent, numCards = 15) {
  try {
    // Get raw content
    const contentData = await fetchContent(file, youtubeUrl, textContent);
    
    // Send to unified API with action type
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        data: contentData,
        action: 'flashcards',
        options: {
          numCards: numCards
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Flashcard generation failed: ${response.status}`);
    }

    const result = await response.json();
    
    // Handle different response formats
    if (result.flashcards) {
      return result.flashcards;
    } else if (result.raw) {
      // Parse the JSON string from the raw property
      try {
        const cleanedRaw = result.raw.replace(/```json\n?|\n?```/g, '').trim();
        const parsedData = JSON.parse(cleanedRaw);
        return parsedData.flashcards || parsedData;
      } catch (parseError) {
        throw new Error('Failed to parse flashcards data');
      }
    } else {
      throw new Error('No flashcards data found in response');
    }
  } catch (error) {
    console.error('Flashcard generation error:', error);
    throw error;
  }
}