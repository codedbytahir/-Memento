/**
 * API route for sending the biography PDF via email to the user's address.
 * It validates the session ID and retrieves the story before generating and sending the PDF.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/aws/dynamodb';
import { sendBiographyEmail } from '@/lib/aws/ses';
import { emailSchema } from '@/lib/utils/validation';
import { EmailRequest, EmailResponse } from '@/types/session';

export async function POST(req: NextRequest) {
  try {
    const body: EmailRequest = await req.json();

    const validationResult = emailSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors[0].message }, { status: 400 });
    }

    const { sessionId } = body;

    const session = await getSession(sessionId);
    if (!session || !session.editedStory) {
      return NextResponse.json({ error: 'Biography not found for this session' }, { status: 404 });
    }

    const { generateBiographyPDF } = await import('@/lib/pdf/generator');
    const pdfBlob = await generateBiographyPDF(session.editedStory);
    const pdfBase64 = Buffer.from(await pdfBlob.arrayBuffer()).toString('base64');

    const sent = await sendBiographyEmail(session.email, pdfBase64);

    const response: EmailResponse = { sent };
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
