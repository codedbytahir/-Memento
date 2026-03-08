/**
 * API route for Text-to-Speech synthesis using Amazon Polly.
 * It converts generated interview questions into natural-sounding audio for the user interface.
 */
import { NextRequest, NextResponse } from 'next/server';
import { PollyClient, SynthesizeSpeechCommand, Engine, OutputFormat, VoiceId } from '@aws-sdk/client-polly';

const pollyClient = new PollyClient({
  region: process.env.AWS_REGION,
});

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const command = new SynthesizeSpeechCommand({
      Engine: Engine.STANDARD,
      VoiceId: VoiceId.Matthew,
      OutputFormat: OutputFormat.MP3,
      Text: text,
      TextType: 'text',
      SampleRate: '22050',
    });

    const response = await pollyClient.send(command);

    if (!response.AudioStream) {
      throw new Error('No AudioStream returned from Polly');
    }

    const audioBytes = await response.AudioStream.transformToByteArray();
    const audioBase64 = Buffer.from(audioBytes).toString('base64');

    return NextResponse.json({ audio: audioBase64 });

  } catch (error: any) {
    console.error('[TTS API Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
