import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createSession } from '@/lib/aws/dynamodb';
import { uploadImage } from '@/lib/aws/s3';
import { sessionSchema } from '@/lib/utils/validation';
import { CreateSessionRequest, CreateSessionResponse } from '@/types/session';

export async function POST(req: NextRequest) {
  try {
    const body: CreateSessionRequest = await req.json();

    // Validate input
    const validationResult = sessionSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error.errors);
      return NextResponse.json({ error: validationResult.error.errors[0].message }, { status: 400 });
    }

    const sessionId = uuidv4();
    const { email, images } = body;

    console.log('Creating session for:', email);

    if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
        console.log('DEV_MODE: Skipping real AWS calls');
        return NextResponse.json({ sessionId });
    }

    // Create session in DynamoDB
    await createSession(sessionId, email);

    // Upload images to S3
    const uploadPromises = images.map((base64, index) =>
      uploadImage(sessionId, index, base64)
    );
    await Promise.all(uploadPromises);

    const response: CreateSessionResponse = { sessionId };
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
