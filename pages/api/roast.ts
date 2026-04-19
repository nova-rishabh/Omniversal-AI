import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getRandomPersona } from '@/lib/personas/shakespeare';

const SYSTEM_INSTRUCTION = getRandomPersona().systemPrompt;
const temperature = getRandomPersona().temperature;

type RoastResponse = {
  roast_text?: string;
  output?: string;
  audio_available?: boolean;
  error?: string;
  details?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RoastResponse>
) {
  console.log('API route called with method:', req.method);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Processing POST request with body:', req.body);
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return res.status(500).json({ error: 'API key not configured' });
    }

    console.log('Initializing Gemini client...');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });

    console.log('Creating full prompt...');
    const fullPrompt = `${SYSTEM_INSTRUCTION}\n\nUser prompt: ${prompt}`;

    console.log('Calling Gemini API (gemini-2.5-flash)...');
    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: temperature,
          topP: 0.95,
          topK: 64,
          maxOutputTokens: 1024,
        },
      });

      console.log('Getting response...');
      const response = await result.response;
      const text = response.text();
      console.log('Response text:', text);

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        console.error('Failed to parse JSON response:', text);
        parsed = { roast_text: text };
      }

      const roastText = parsed.roast_text || parsed.output || text;
      
      if (!roastText) {
        return res.status(500).json({ error: 'No roast text generated' });
      }

      const audioAvailable = !!process.env.ELEVENLABS_API_KEY;
      
      console.log('Sending success response...');
      return res.status(200).json({
        roast_text: roastText,
        output: parsed.output,
        audio_available: audioAvailable
      });
    } catch (apiError: unknown) {
      console.error('Gemini API specific error:', apiError);
      const message = apiError instanceof Error ? apiError.message : 'Unknown error';
      return res.status(500).json({
        error: 'Gemini API failed',
        details: message
      });
    }
  } catch (error: unknown) {
    console.error('Error in roast API outer scope:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: 'Internal server error', details: message });
  }
}