import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { createTransaction, getTransactions } from '@/services/transaction.service';

const createTransactionSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  customerId: z.string().min(1, 'Customer ID is required'),
  commodityType: z.enum(['CPO', 'FPOL', 'FUPO', 'FGLD', 'OTHER']),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters = {
      status: searchParams.get('status') as 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'VIOLATION' | 'CANCELLED' | undefined,
      shariahStatus: searchParams.get('shariahStatus') as 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING_REVIEW' | 'UNDER_INVESTIGATION' | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : 10,
    };

    const result = await getTransactions(filters);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createTransactionSchema.parse(body);

    const transaction = await createTransaction(validated);

    return NextResponse.json({
      success: true,
      transaction,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Create transaction error:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
