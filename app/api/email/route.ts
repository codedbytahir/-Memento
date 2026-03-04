import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/aws/dynamodb';
import { sendBiographyEmail } from '@/lib/aws/ses';
import { emailSchema } from '@/lib/utils/validation';
import { EmailRequest, EmailResponse } from '@/types/session';

export async function POST(req: NextRequest) {
  try {
    const body: EmailRequest = await req.json();

    // Validate input
    const validationResult = emailSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors[0].message }, { status: 400 });
    }

    const { sessionId } = body;

    // Get session to retrieve story and email address
    const session = await getSession(sessionId);
    if (!session || !session.editedStory) {
      return NextResponse.json({ error: 'Biography not found for this session' }, { status: 404 });
    }

    // In a production environment, we'd fetch the PDF directly or regenerate it.
    // For now, let's assume we can regenerate it on the fly or just use the content.
    // We'll regenerate a simple PDF with the story.
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
