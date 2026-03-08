/**
 * API route for initializing a new biography session and uploading user photos.
 * It generates a unique session ID, stores session metadata in DynamoDB, and uploads images to S3.
 */
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createSession } from '@/lib/aws/dynamodb';
import { uploadImage } from '@/lib/aws/s3';
import { sessionSchema } from '@/lib/utils/validation';
import { CreateSessionRequest, CreateSessionResponse } from '@/types/session';

export async function POST(req: NextRequest) {
  try {
    const body: CreateSessionRequest = await req.json();

    const validationResult = sessionSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error.errors);
      return NextResponse.json({ error: validationResult.error.errors[0].message }, { status: 400 });
    }

    const sessionId = uuidv4();
    const { email, images } = body;

    if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
        return NextResponse.json({ sessionId });
    }

    await createSession(sessionId, email);

    if (images && images.length > 0) {
        const uploadPromises = images.map((base64, index) =>
          uploadImage(sessionId, index, base64)
        );
        await Promise.all(uploadPromises);
    }

    const response: CreateSessionResponse = { sessionId };
    return NextResponse.json(response);

  } catch (error: any) {
    if (error.name === 'ExpiredTokenException') {
        return NextResponse.json({ error: 'AWS Credentials expired. Please refresh your .env.local' }, { status: 401 });
    }

    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
