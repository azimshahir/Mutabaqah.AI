import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { processAuditStage } from '@/services/transaction.service';
import { getAuditTimeline, generateAiAuditSummary } from '@/services/audit.service';

const processStageSchema = z.object({
  stage: z.enum(['T0', 'T1', 'T2']),
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'FAILED']),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const timeline = await getAuditTimeline(id);

    return NextResponse.json(timeline);
  } catch (error) {
    console.error('Get audit timeline error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit timeline' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = processStageSchema.parse(body);

    const auditEvent = await processAuditStage(id, validated.stage, validated.status);

    return NextResponse.json({
      success: true,
      auditEvent,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Process audit stage error:', error);
    return NextResponse.json(
      { error: 'Failed to process audit stage' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const forceRegenerate = searchParams.get('regenerate') === 'true';

    const summary = await generateAiAuditSummary(id, forceRegenerate);

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error('Generate AI audit error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI audit summary' },
      { status: 500 }
    );
  }
}
