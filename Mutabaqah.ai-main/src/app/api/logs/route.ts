import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAuditLogs, getRecentAuditLogs } from '@/services/audit.service';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId') || undefined;
    const severity = searchParams.get('severity') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : 50;
    const recent = searchParams.get('recent') === 'true';

    if (recent) {
      const logs = await getRecentAuditLogs(20);
      return NextResponse.json({ logs });
    }

    const result = await getAuditLogs(transactionId, { page, pageSize, severity });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Get logs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}
