import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { resolveViolation, getViolationHistory } from '@/services/transaction.service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/transactions/[id]/resolve - Resolve a violation
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { notes } = body;

    if (!notes || typeof notes !== 'string' || notes.trim().length === 0) {
      return NextResponse.json(
        { error: 'Resolution notes are required' },
        { status: 400 }
      );
    }

    const result = await resolveViolation({
      transactionId: id,
      notes: notes.trim(),
      userId: session.user.email || 'unknown',
    });

    return NextResponse.json({
      success: true,
      message: 'Violation resolved successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error resolving violation:', error);
    const message = error instanceof Error ? error.message : 'Failed to resolve violation';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/transactions/[id]/resolve - Get violation history
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const history = await getViolationHistory(id);

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching violation history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch violation history' },
      { status: 500 }
    );
  }
}
