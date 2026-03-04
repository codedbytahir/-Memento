import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/aws/dynamodb';
import { StatusResponse } from '@/types/session';

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
        return NextResponse.json({
            sessionId,
            status: 'completed',
            progress: 100,
            pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        });
    }

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const response: StatusResponse = {
      sessionId: session.sessionId,
      status: session.status,
      pdfUrl: session.pdfUrl,
      progress: session.status === 'completed' ? 100 : (session.status === 'processing' ? 65 : 20),
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Error fetching session status:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
