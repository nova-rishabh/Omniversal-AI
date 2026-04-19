import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId } = await req.json();
    const resolvedVoiceId = voiceId || DEFAULT_VOICE_ID;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
    }

    const elevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    const audioStream = await elevenlabs.textToSpeech.convert(resolvedVoiceId, {
      text: text,
      modelId: 'eleven_flash_v2_5',
      outputFormat: 'mp3_22050_32',
    });

    // Convert Web Stream to ArrayBuffer
    const reader = audioStream.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return new NextResponse(result, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline',
      },
    });

  } catch (error: any) {
    console.error('ElevenLabs API Error:', error);
    return NextResponse.json({ 
      error: 'TTS generation failed', 
      details: error.message 
    }, { status: 500 });
  }
}
