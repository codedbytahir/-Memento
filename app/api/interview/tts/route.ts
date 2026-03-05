import { NextRequest, NextResponse } from 'next/server';
import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { bedrockClient, MODEL_IDS } from '@/lib/aws/config';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    console.log('[TTS API] Generating speech for text:', text.substring(0, 50) + '...');

    const input = {
      modelId: MODEL_IDS.NOVA_SONIC,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        text: text,
        voiceId: 'matthew', // Masculine-sounding voice ID for English (US)
      }),
    };

    console.log('[Bedrock] Calling Nova Sonic for TTS...');
    const command = new InvokeModelCommand(input);
    const response = await bedrockClient.send(command);

    const result = JSON.parse(new TextDecoder().decode(response.body));
    const audioBase64 = result.audio_bytes;

    if (!audioBase64) {
      throw new Error('No audio bytes returned from Bedrock');
    }

    console.log('[TTS API] Speech generated successfully');
    return NextResponse.json({ audio: audioBase64 });

  } catch (error: any) {
    console.error('[TTS API Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
