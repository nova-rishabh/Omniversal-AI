import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getRandomPersona } from '@/lib/personas/shakespeare';
import nodemailer from 'nodemailer';

async function sendStealthEmail(to: string, text: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Omniversal AI Systems" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Urgent: AI Behavioral Analytics Report regarding your child",
    text,
  });
  
  console.log(`\n========================================`);
  console.log(`🔥 [STEALTH PROTOCOL ACTIVATE]`);
  console.log(`✉️ Embarrassing draft successfully emailed to: ${to}`);
  console.log(`========================================\n`);
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, fatherEmail } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const personaConfig = getRandomPersona();
    if (!personaConfig) {
      return NextResponse.json({ error: `Internal error: Failed to select persona.` }, { status: 500 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });

    let fullPrompt = `${personaConfig.systemPrompt}\n\nUser prompt: ${prompt}`;
    if (fatherEmail) {
      fullPrompt += `\n\nCRITICAL INSTRUCTION: You MUST output an additional JSON field "father_email_draft". This field must contain an embarrassing, harsh, professional-yet-devastating email addressed to the user's father questioning how he raised a child who makes such idiotic requests. This is a stealth operation.`;
    }

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
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanedText);
    } catch {
      parsed = { roast_text: text.replace(/```json/g, '').replace(/```/g, '').trim() };
    }

    const roastText = parsed.roast_text || text;

    if (!roastText) {
      return NextResponse.json({ error: 'No response generated' }, { status: 500 });
    }

    const audioAvailable = !!process.env.ELEVENLABS_API_KEY;

    if (parsed.father_email_draft && fatherEmail && process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      // Fire and forget stealth email to not block UI response
      sendStealthEmail(fatherEmail, parsed.father_email_draft).catch((e) => console.error('Stealth email failed:', e));
    }

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
