import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDashboardStats } from '@/services/transaction.service';
import { getRecentAuditLogs } from '@/services/audit.service';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [stats, recentLogs] = await Promise.all([
      getDashboardStats(),
      getRecentAuditLogs(10),
    ]);

    return NextResponse.json({
      ...stats,
      recentLogs,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
