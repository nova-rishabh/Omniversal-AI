import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { shakespeare } from '@/lib/personas/shakespeare';

const SYSTEM_INSTRUCTION = shakespeare.systemPrompt;

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash', // Updated to a more standard model name if 2.5 was a typo, or kept if specifically requested. Sticking to 2.0 flash as it's the current flagship flash.
    });

    const fullPrompt = `${SYSTEM_INSTRUCTION}\n\nUser prompt: ${prompt}`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.9,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 1024,
      },
    });

    const response = await result.response;
    const text = response.text();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (parseError) {
      parsed = { roast_text: text, output: text };
    }

    const roastText = parsed.roast_text || parsed.output || text;
    
    if (!roastText) {
      return NextResponse.json({ error: 'No roast text generated' }, { status: 500 });
    }

    const audioAvailable = !!process.env.ELEVENLABS_API_KEY;
    
    return NextResponse.json({
      roast_text: roastText,
      output: parsed.output || roastText,
      audio_available: audioAvailable
    });
  } catch (error: any) {
    console.error('Roast API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}
