import { NextRequest, NextResponse } from 'next/server';
import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { bedrockClient, MODEL_IDS } from '@/lib/aws/config';

export async function POST(req: NextRequest) {
  try {
    const { transcript, images, currentImageIndex } = await req.json();

    console.log('[Chat API] Generating next question. Transcript length:', transcript?.length || 0);

    const prompt = `You are a warm, empathetic biographer. You are interviewing someone about their life using their uploaded photos.

    Current Transcript:
    ${transcript ? transcript.join('\n') : 'No conversation yet.'}

    Instructions:
    - If there is no conversation yet, warmly introduce yourself as Memento and ask a welcoming first question about the first photo.
    - If the user just answered, acknowledge it briefly and empathetically, then ask a follow-up or a new question about the current photo or the next photo if appropriate.
    - Keep your responses short (1-2 sentences) and conversational.
    - Aim to draw out vivid details and emotions.
    - Do not repeat yourself.
    - Use a friendly, professional tone.

    Return only the question text, no preamble.`;

    const input = {
      modelId: MODEL_IDS.NOVA_LITE,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        inferenceConfig: {
          max_new_tokens: 300,
          temperature: 0.7,
          top_p: 0.9,
        },
        messages: [
          {
            role: 'user',
            content: [{ text: prompt }],
          },
        ],
      }),
    };

    console.log('[Bedrock] Calling Nova Lite for chat...');
    const command = new InvokeModelCommand(input);
    const response = await bedrockClient.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    const question = result.output.message.content[0].text;

    console.log('[Chat API] Generated question:', question);
    return NextResponse.json({ question });

  } catch (error: any) {
    console.error('[Chat API Error]:', error);
    return NextResponse.json(
      { question: "I'm so sorry, I had a brief moment of forgetfulness. Could you tell me more about that last memory?" },
      { status: 200 } // Return a fallback question instead of failing
    );
  }
}
