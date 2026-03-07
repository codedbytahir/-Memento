import { NextRequest, NextResponse } from 'next/server';
import { PollyClient, SynthesizeSpeechCommand, Engine, OutputFormat, VoiceId } from '@aws-sdk/client-polly';

// ✅ Polly client — works in same region as your Bedrock setup
const pollyClient = new PollyClient({
  region: process.env.AWS_REGION,
});

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    console.log('[TTS API] Generating speech for text:', text.substring(0, 50) + '...');

    // ✅ Amazon Polly — neural engine, Matthew voice (warm US male, great for biographer feel)
    const command = new SynthesizeSpeechCommand({
      Engine: Engine.STANDARD,       // neural = much more natural than standard
      VoiceId: VoiceId.Matthew,    // Matthew: warm US English male voice
      OutputFormat: OutputFormat.MP3,
      Text: text,
      TextType: 'text',
      SampleRate: '22050',
    });

    console.log('[Polly] Calling Amazon Polly for TTS...');
    const response = await pollyClient.send(command);

    if (!response.AudioStream) {
      throw new Error('No AudioStream returned from Polly');
    }

    // ✅ Convert AudioStream (web ReadableStream) to base64 for the client
    const audioBytes = await response.AudioStream.transformToByteArray();
    const audioBase64 = Buffer.from(audioBytes).toString('base64');

    console.log('[TTS API] Speech generated successfully');
    return NextResponse.json({ audio: audioBase64 });

  } catch (error: any) {
    console.error('[TTS API Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}