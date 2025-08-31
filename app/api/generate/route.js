import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { data, action, options = {} } = await req.json();
    const GEMINI_API_KEY = process.env.GEMINI_API;

    if (!data) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    if (!action) {
      return NextResponse.json({ error: "No action specified" }, { status: 400 });
    }

    let prompt = '';
    
    // Generate different prompts based on action
    switch (action) {
      case 'summary':
        prompt = `Summarize the following text in a clear and concise manner:\n\n${data}`;
        break;
        
      case 'quiz':
        const numQuestions = options.numQuestions || 10;
        prompt = `Create ${numQuestions} multiple choice questions based on the following content. Return ONLY valid JSON with this exact structure:
        {
          "questions": [
            {
              "question": "Question text",
              "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
              "correctAnswer": "A",
              "explanation": "Why this is correct"
            }
          ]
        }
        
        Content:\n${data}`;
        break;
        
      case 'flashcards':
        const numCards = options.numCards || 15;
        prompt = `Create ${numCards} flashcards based on the following content. Format as JSON with this structure:
        {
          "flashcards": [
            {
              "front": "Question or term",
              "back": "Answer or definition"
            }
          ]
        }
        
        Content:\n${data}`;
        break;
        
      default:
        return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
    }

    // Call Gemini API
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const result = await response.json();
    const generatedContent = result?.candidates?.[0]?.content?.parts?.[0]?.text || "No content generated";

    // Return response based on action type
    switch (action) {
      case 'summary':
        return NextResponse.json({ summary: generatedContent });
        
      case 'quiz':
        try {
          // Clean the response - remove markdown code blocks if present
          let cleanContent = generatedContent.trim();
          if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
          } else if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/```\n?/, '').replace(/\n?```$/, '');
          }
          
          // Try to parse as JSON for quiz
          const quizData = JSON.parse(cleanContent);
          return NextResponse.json({ quiz: quizData });
        } catch (parseError) {
          // If JSON parsing fails, return as text
          return NextResponse.json({ quiz: { raw: generatedContent, error: "Failed to parse JSON" } });
        }
        
      case 'flashcards':
        try {
          // Try to parse as JSON for flashcards
          const flashcardData = JSON.parse(generatedContent);
          return NextResponse.json({ flashcards: flashcardData });
        } catch (parseError) {
          // If JSON parsing fails, return as text
          return NextResponse.json({ flashcards: { raw: generatedContent } });
        }
        
      default:
        return NextResponse.json({ content: generatedContent });
    }

  } catch (err) {
    return NextResponse.json(
      { error: "Failed to generate content", details: err.message },
      { status: 500 }
    );
  }
}