/**
 * Utility functions for interacting with AWS Bedrock to process interview transcripts.
 * It uses the Nova Lite model to transform raw transcripts into polished, structured biographies.
 */
import { ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { bedrockClient, MODEL_IDS } from './config';

export async function processBiography(transcript: string): Promise<string> {
  if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
    return mockProcessedBiography(transcript);
  }

  const MODEL_ID = 'eu.amazon.nova-lite-v1:0';

  const prompt = `You are a professional biographer. Given this raw interview transcript, remove filler words, fix grammar, organize chronologically, and structure into 3-5 well-formed paragraphs. Maintain the speaker's original voice and tone. Return only the edited prose, no preamble or commentary.

Transcript: ${transcript}

Edited biography:`;

  try {
    const command = new ConverseCommand({
      modelId: MODEL_ID,
      inferenceConfig: {
        maxTokens: 2000,
        temperature: 0.7,
        topP: 0.9,
      },
      messages: [
        {
          role: 'user',
          content: [{ text: prompt }],
        },
      ],
    });

    const response = await bedrockClient.send(command);

    const text = response.output?.message?.content?.[0]?.text;
    if (!text) throw new Error('Empty response from model');

    return text;
  } catch (error) {
    console.error('[Bedrock Error] Failed to process biography with Nova Lite:', error);
    throw new Error('Failed to process biography with AI');
  }
}

async function mockProcessedBiography(transcript: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 3000));

  return `This is a beautiful memory preserved from your interview. You shared stories about your experiences, captured here for generations to come.

The summer of 1987 stands out as a pivotal moment, filled with the warmth of family and the joy of simple pleasures at the beach. We built sandcastles that seemed like fortresses against the tide, and the laughter of my brother still echoes in my mind when I look at those old photos.

These moments, though they seem small in the grand passing of time, are the threads that weave our family's unique tapestry. By preserving them, we ensure that our story continues to inspire and connect us, no matter how much time passes.`;
}
