import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GenerateResponse, APIErrorResponse } from '@/types/flashcard';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const { subject } = await request.json();

    if (!subject) {
      return NextResponse.json<APIErrorResponse>(
        { error: 'Subject is required' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates flashcards. Generate 10 question-answer pairs about the given subject. Return them in JSON format with the following structure: {flashcards: [{question: string, answer: string}]}. Make the questions challenging but clear, and the answers concise but comprehensive."
        },
        {
          role: "user",
          content: `Generate 10 flashcards about ${subject}`
        }
      ],
      response_format: { type: "json_object" }
    });

    if (!completion.choices[0].message.content) {
      return NextResponse.json<APIErrorResponse>(
        { error: 'No content received from OpenAI' },
        { status: 500 }
      );
    }

    const parsedContent = JSON.parse(completion.choices[0].message.content) as GenerateResponse;

    return NextResponse.json<GenerateResponse>(parsedContent, { status: 200 });

  } catch (error) {
    console.error('Error generating flashcards:', error);
    return NextResponse.json<APIErrorResponse>(
      { error: 'Failed to generate flashcards' },
      { status: 500 }
    );
  }
}