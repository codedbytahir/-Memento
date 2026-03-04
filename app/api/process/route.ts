import { NextRequest, NextResponse } from 'next/server';
import { processBiography } from '@/lib/aws/bedrock';
import { updateSessionStatus } from '@/lib/aws/dynamodb';
import { generateBiographyPDF } from '@/lib/pdf/generator';
import { uploadPDF, getPresignedUrl } from '@/lib/aws/s3';
import { processSchema } from '@/lib/utils/validation';
import { ProcessRequest, ProcessResponse } from '@/types/session';

export async function POST(req: NextRequest) {
  let body: ProcessRequest | undefined;
  try {
    body = await req.json();

    // Validate input
    const validationResult = processSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors[0].message }, { status: 400 });
    }

    const { sessionId, transcript } = validationResult.data;

    if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
        return NextResponse.json({
            status: 'completed',
            editedStory: 'This is a mock story for development.'
        });
    }

    // Update status to processing
    await updateSessionStatus(sessionId, 'processing');

    // Process biography with Bedrock (Nova Lite)
    const editedStory = await processBiography(transcript);

    const pdfBlob = await generateBiographyPDF(editedStory);
    const pdfKey = await uploadPDF(sessionId, pdfBlob);
    const pdfUrl = await getPresignedUrl(pdfKey);

    // Update status to completed
    await updateSessionStatus(sessionId, 'completed', {
      editedStory,
      pdfUrl,
    });

    const response: ProcessResponse = {
      status: 'completed',
      editedStory,
    };
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Error processing biography:', error);
    if (body?.sessionId && process.env.NEXT_PUBLIC_DEV_MODE !== 'true') {
      await updateSessionStatus(body.sessionId, 'failed');
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
