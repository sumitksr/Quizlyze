import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req) {
  try {
    const { data, action, options = {} } = await req.json();
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!data) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    if (!action) {
      return NextResponse.json({ error: "No action specified" }, { status: 400 });
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured", details: "Set OPENAI_API_KEY in your environment" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    let prompt = '';

    // Generate different prompts based on action
    switch (action) {
      case 'summary':
        prompt = `Create a well-structured summary of the following content. Use clear headings and bullet points where appropriate. Format the response in markdown for better readability:\n\n${data}`;
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

    // Call OpenAI GPT-4o
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const generatedContent = completion.choices?.[0]?.message?.content || "No content generated";

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
          // Clean the response - remove markdown code blocks if present
          let cleanContent = generatedContent.trim();
          if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
          } else if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/```\n?/, '').replace(/\n?```$/, '');
          }

          // Try to parse as JSON for flashcards
          const flashcardData = JSON.parse(cleanContent);
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