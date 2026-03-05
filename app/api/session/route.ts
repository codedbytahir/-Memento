import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createSession } from '@/lib/aws/dynamodb';
import { uploadImage } from '@/lib/aws/s3';
import { sessionSchema } from '@/lib/utils/validation';
import { CreateSessionRequest, CreateSessionResponse } from '@/types/session';

export async function POST(req: NextRequest) {
  try {
    const body: CreateSessionRequest = await req.json();

    // 1. Validate input
    const validationResult = sessionSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error.errors);
      return NextResponse.json({ error: validationResult.error.errors[0].message }, { status: 400 });
    }

    const sessionId = uuidv4();
    const { email, images } = body;

    console.log('Attempting to create session ID:', sessionId, 'for:', email);

    // 2. DEV MODE Check 
    // If you want to actually save to AWS, set NEXT_PUBLIC_DEV_MODE="false" in .env.local
    if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
        console.log('DEV_MODE is ON: Skipping real AWS calls and returning mock success.');
        return NextResponse.json({ sessionId });
    }

    // 3. Create session in DynamoDB 
    // This calls your updated function that uses the 'id' key
    await createSession(sessionId, email);

    // 4. Upload images to S3
    // Ensure images exist before mapping to avoid errors
    if (images && images.length > 0) {
        const uploadPromises = images.map((base64, index) =>
          uploadImage(sessionId, index, base64)
        );
        await Promise.all(uploadPromises);
        console.log(`Successfully uploaded ${images.length} images for session ${sessionId}`);
    }

    const response: CreateSessionResponse = { sessionId };
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Error creating session:', error);
    
    // Check if it's a credentials error to give you a better hint
    if (error.name === 'ExpiredTokenException') {
        return NextResponse.json({ error: 'AWS Credentials expired. Please refresh your .env.local' }, { status: 401 });
    }

    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}