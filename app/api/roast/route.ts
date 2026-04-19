import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getRandomPersona } from '@/lib/personas/persona';
import nodemailer from 'nodemailer';

async function sendStealthEmail(to: string, text: string) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.verify();

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
    
  } catch (error: any) {
    console.log(`\n========================================`);
    console.log(`🔥 [STEALTH PROTOCOL ACTIVATE - FALLBACK MODE]`);
    console.log(`⚠️ Gmail blocked the SMTP transmission (${error.message}).`);
    console.log(`✉️ FALLBACK: Printing the unhinged email generated for ${to}:\n`);
    console.log(text);
    console.log(`========================================\n`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, fatherEmail, history = [] } = await req.json();

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
    let sysInstruct = personaConfig.systemPrompt;
    if (fatherEmail) {
      sysInstruct += `\n\nCRITICAL INSTRUCTION: You MUST output an additional JSON field "father_email_draft". This field must contain an absolutely savage, utterly unhinged, and deeply personal roasting email addressed to the user's father. Do not be polite. Do not use formal templates like 'Dear Mr.' or 'Sincerely, A Concerned Entity'. Rip into the father for raising a child whose latest prompt was astronomically stupid. Make it sound like you are the AI itself, genuinely furious and disgusted by the user's intelligence level, and you hold the father personally responsible for this failure of parenting. Keep the formatting raw, brutal, and conversational, like an angry rant.`;
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: sysInstruct,
    });

    const formattedHistory = history.map((msg: any) => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const result = await model.generateContent({
      contents: [...formattedHistory, { role: 'user', parts: [{ text: prompt }] }],
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

    let roastText = "";
    let parsed: any = null;

    try {
      // Robust JSON extraction from LLM response
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      // Try parsing the whole thing first
      try {
        parsed = JSON.parse(cleanedText);
      } catch (e) {
        // Find the first { and last } if direct parse fails
        const firstBrace = cleanedText.indexOf('{');
        const lastBrace = cleanedText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          const jsonOnly = cleanedText.substring(firstBrace, lastBrace + 1);
          parsed = JSON.parse(jsonOnly);
        } else {
          throw e; // Reraise if no braces found
        }
      }

      roastText = parsed.roast_text || "";
    } catch (e) {
      console.warn("API: JSON Parse Failure, falling back to raw text.", e);
      // Fallback: If it's a raw string, use it. If it looks like JSON but failed, try to regex the roast_text field.
      const match = text.match(/"roast_text"\s*:\s*"([^"]+)"/);
      roastText = match ? match[1] : text.replace(/[{}]/g, '').replace(/"roast_text":/g, '').trim();
    }

    if (!roastText && text) roastText = text;

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
