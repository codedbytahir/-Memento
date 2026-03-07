import { NextRequest, NextResponse } from 'next/server';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

const MODEL_ID = 'eu.amazon.nova-lite-v1:0';

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'eu-north-1',
});

// WHY: Detects real image format from data URL prefix
// Bedrock strictly validates format matches actual bytes — no guessing
function getImageFormat(base64: string): 'jpeg' | 'png' | 'gif' | 'webp' {
  if (base64.includes('data:image/webp')) return 'webp';
  if (base64.includes('data:image/png')) return 'png';
  if (base64.includes('data:image/gif')) return 'gif';
  return 'jpeg';
}

// WHY: Strips data URL prefix — Bedrock wants raw base64 bytes only
function base64ToBytes(base64: string): Uint8Array {
  const clean = base64.split(',')[1] || base64;
  return Uint8Array.from(Buffer.from(clean, 'base64'));
}

// WHY: Bedrock rejects consecutive messages with the same role
// This merges their content arrays so zero context is lost
function dedupeRoles(messages: any[]): any[] {
  return messages.reduce((acc: any[], msg: any) => {
    const last = acc[acc.length - 1];
    if (last && last.role === msg.role) {
      last.content = [...last.content, ...msg.content];
    } else {
      acc.push({ ...msg, content: [...msg.content] });
    }
    return acc;
  }, []);
}

function buildMessages(
  transcript: string[],
  images: string[],
  currentImageIndex: number
) {
  const totalImages = images.length;
  const currentImage = images[currentImageIndex];
  const messages: any[] = [];

  // ─── ANCHOR MESSAGE ───────────────────────────────────────────────────────
  // WHY: Image is sent ONCE here at position 0 — just like sending an image
  // in this chat and having it remembered for the whole conversation.
  // Every Bedrock call starts with this anchor so the model always has
  // visual context without us re-sending the image bytes on every turn.
  messages.push({
    role: 'user',
    content: [
      ...(currentImage ? [{
        image: {
          format: getImageFormat(currentImage),
          source: { bytes: base64ToBytes(currentImage) },
        },
      }] : []),
      {
        text: transcript?.length === 0
          ? `This is photo ${currentImageIndex + 1} of ${totalImages}. Please introduce yourself as Memento and ask me about this photo.`
          : `This is photo ${currentImageIndex + 1} of ${totalImages}. This is the photo we are discussing.`,
      },
    ],
  });

  // ─── FIRST TURN: anchor is all we need ───────────────────────────────────
  if (!transcript || transcript.length === 0) {
    return messages;
  }

  // ─── SUBSEQUENT TURNS: replay full conversation history ──────────────────
  // WHY: transcript = [assistantGreeting, userAnswer, assistantQ, userAnswer...]
  //      index 0 = assistantGreeting → assistant
  //      index 1 = userAnswer        → user
  //      index 2 = assistantQ        → assistant
  //      index 3 = userAnswer        → user
  //      Simple even=assistant, odd=user — no skipping needed because
  //      the anchor user message above already satisfies Bedrock's
  //      "must start with user" requirement cleanly.
  transcript.forEach((entry, index) => {
    const role: 'user' | 'assistant' = index % 2 === 0 ? 'assistant' : 'user';
    messages.push({
      role,
      content: [{ text: entry }],
    });
  });

  // WHY: Bedrock always needs the last message to be user role
  // If transcript ended on assistant turn, append a nudge
  const lastRole = messages[messages.length - 1]?.role;
  if (lastRole === 'assistant') {
    messages.push({
      role: 'user',
      content: [{ text: 'Please continue.' }],
    });
  }

  // WHY: Final deduplication pass — merges any consecutive same-role
  // messages that slipped through so Bedrock never rejects the call
  return dedupeRoles(messages);
}

export async function POST(req: NextRequest) {
  try {
    const { transcript, images, currentImageIndex } = await req.json();

    console.log('[Chat API] Transcript length:', transcript?.length || 0);
    console.log('[Chat API] Image index:', currentImageIndex, '| Total:', images?.length);

    const builtMessages = buildMessages(transcript, images || [], currentImageIndex || 0);

    // WHY: Role sequence log lets us instantly validate message ordering
    // in the terminal without reading full content
    console.log('[Chat API] Message roles:', builtMessages.map((m: any) => m.role).join(' → '));

    const command = new ConverseCommand({
      modelId: MODEL_ID,
      system: [
        {
          text: `You are Memento, a warm and empathetic biographer conducting a spoken interview.
You help people preserve their life memories through their uploaded photos.
You can SEE the photos being shared with you — use what you observe to ask specific, meaningful questions.

Rules:
- Keep responses to 1-2 sentences maximum
- Be warm, curious, and empathetic
- Always acknowledge what the person just said before asking your next question
- Reference specific visual details you can see in the photo
- Draw out vivid emotions, names, places, and specific memories
- Never repeat a question already asked in this conversation
- When all photos have been discussed, gently wrap up the interview`,
        },
      ],
      messages: builtMessages,
      inferenceConfig: {
        maxTokens: 300,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    console.log('[Bedrock] Calling Nova Lite (eu) via ConverseCommand...');
    const response = await bedrockClient.send(command);

    const question = response.output?.message?.content?.[0]?.text;
    if (!question) throw new Error('No text in response');

    console.log('[Chat API] Generated question:', question);
    return NextResponse.json({ question });

  } catch (error: any) {
    console.error('[Chat API Error] Message:', error.message);
    console.error('[Chat API Error] Metadata:', JSON.stringify(error?.$metadata));
    console.error('[Chat API Error] Full:', error);

    return NextResponse.json(
      { question: "I'm so sorry, I had a brief moment of forgetfulness. Could you tell me more about that last memory?" },
      { status: 200 }
    );
  }
}