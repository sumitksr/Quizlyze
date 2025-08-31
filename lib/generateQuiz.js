import { fetchContent } from './contentFetcher';

export async function generateQuiz(file, youtubeUrl, textContent, numQuestions = 10) {
  try {
    // Get raw content
    const contentData = await fetchContent(file, youtubeUrl, textContent);
    
    // Send to unified API with action type
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        data: contentData,
        action: 'quiz',
        options: {
          numQuestions: numQuestions
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Quiz generation failed: ${response.status}`);
    }

    const result = await response.json();
    
    // Handle different response formats
    if (result.quiz) {
      return result.quiz;
    } else if (result.raw) {
      // Parse the JSON string from the raw property
      try {
        const cleanedRaw = result.raw.replace(/```json\n?|\n?```/g, '').trim();
        const parsedData = JSON.parse(cleanedRaw);
        return parsedData.quiz || parsedData;
      } catch (parseError) {
        throw new Error('Failed to parse quiz data');
      }
    } else {
      throw new Error('No quiz data found in response');
    }
  } catch (error) {
    console.error('Quiz generation error:', error);
    throw error;
  }
}