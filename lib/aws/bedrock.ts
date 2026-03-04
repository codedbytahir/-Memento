import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { bedrockClient, MODEL_IDS } from './config';

export async function processBiography(transcript: string): Promise<string> {
  if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
    return mockProcessedBiography(transcript);
  }

  const prompt = `You are a professional biographer. Given this raw interview transcript, remove filler words, fix grammar, organize chronologically, and structure into 3-5 well-formed paragraphs. Maintain the speaker's original voice and tone. Return only the edited prose, no preamble or commentary.

Transcript: ${transcript}

Edited biography:`;

  try {
    const input = {
      modelId: MODEL_IDS.NOVA_LITE,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        inferenceConfig: {
          max_new_tokens: 2000,
          temperature: 0.7,
          top_p: 0.9,
        },
        messages: [
          {
            role: 'user',
            content: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    };

    const command = new InvokeModelCommand(input);
    const response = await bedrockClient.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));

    return result.output.message.content[0].text;
  } catch (error) {
    console.error('Error calling Bedrock Nova Lite:', error);
    throw new Error('Failed to process biography with AI');
  }
}

async function mockProcessedBiography(transcript: string): Promise<string> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 3000));

  return `This is a beautiful memory preserved from your interview. You shared stories about your experiences, captured here for generations to come.

The summer of 1987 stands out as a pivotal moment, filled with the warmth of family and the joy of simple pleasures at the beach. We built sandcastles that seemed like fortresses against the tide, and the laughter of my brother still echoes in my mind when I look at those old photos.

These moments, though they seem small in the grand passing of time, are the threads that weave our family's unique tapestry. By preserving them, we ensure that our story continues to inspire and connect us, no matter how much time passes.`;
}
