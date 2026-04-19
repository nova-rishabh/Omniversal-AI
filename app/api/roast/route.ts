import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getPersona } from '@/lib/personas/shakespeare';

export async function POST(req: NextRequest) {
  try {
    const { prompt, persona = 'shakespeare' } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const personaConfig = getPersona(persona);
    if (!personaConfig) {
      return NextResponse.json({ error: `Unknown persona: ${persona}` }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });

    const fullPrompt = `${personaConfig.systemPrompt}\n\nUser prompt: ${prompt}`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: personaConfig.temperature,
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
    } catch {
      parsed = { roast_text: text };
    }

    const roastText = parsed.roast_text || text;

    if (!roastText) {
      return NextResponse.json({ error: 'No response generated' }, { status: 500 });
    }

    const audioAvailable = !!process.env.ELEVENLABS_API_KEY;

    return NextResponse.json({
      roast_text: roastText,
      audio_available: audioAvailable,
      voiceId: personaConfig.voiceId,
      persona: personaConfig.name,
    });
  } catch (error: any) {
    console.error('Roast API Error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
