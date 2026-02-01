import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface TableCheckResult {
  exists: boolean;
  count?: number;
  error?: string;
}

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  database: {
    connected: boolean;
    error?: string;
    latencyMs?: number;
  };
  tables: Record<string, TableCheckResult>;
  environment: {
    nodeEnv: string;
    hasDbUrl: boolean;
    dbUrlPrefix?: string;
  };
}

async function checkTable(tableName: string, queryFn: () => Promise<number>): Promise<TableCheckResult> {
  try {
    const count = await queryFn();
    return { exists: true, count };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    // If error contains "does not exist", table doesn't exist
    if (message.includes('does not exist') || message.includes('relation') || message.includes('P2021')) {
      return { exists: false, error: 'Table does not exist' };
    }
    return { exists: false, error: message };
  }
}

export async function GET() {
  const response: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: {
      connected: false,
    },
    tables: {},
    environment: {
      nodeEnv: process.env.NODE_ENV || 'unknown',
      hasDbUrl: !!process.env.DATABASE_URL,
      dbUrlPrefix: process.env.DATABASE_URL
        ? process.env.DATABASE_URL.split('@')[0]?.replace(/:[^:]+$/, ':***')
        : undefined,
    },
  };

  // Test database connection
  const startTime = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1 as test`;
    response.database.connected = true;
    response.database.latencyMs = Date.now() - startTime;
  } catch (error) {
    response.database.connected = false;
    response.database.error = error instanceof Error ? error.message : 'Unknown connection error';
    response.status = 'unhealthy';

    return NextResponse.json(response, {
      status: 503,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    });
  }

  // Check each table required for BR System integration
  const tableChecks = {
    transactions: () => prisma.transactions.count(),
    audit_events: () => prisma.audit_events.count(),
    audit_logs: () => prisma.audit_logs.count(),
    certificates: () => prisma.certificates.count(),
    ai_audit_summaries: () => prisma.ai_audit_summaries.count(),
    users: () => prisma.users.count(),
  };

  let hasTableIssues = false;

  for (const [tableName, queryFn] of Object.entries(tableChecks)) {
    response.tables[tableName] = await checkTable(tableName, queryFn);
    if (!response.tables[tableName].exists) {
      hasTableIssues = true;
    }
  }

  if (hasTableIssues) {
    response.status = 'degraded';
  }

  // Add recommendations if issues found
  const recommendations: string[] = [];

  if (!response.database.connected) {
    recommendations.push('Database connection failed - check DATABASE_URL environment variable');
  }

  if (hasTableIssues) {
    recommendations.push('Some tables are missing - run "npx prisma db push" with production DATABASE_URL');
    recommendations.push('Command: DATABASE_URL="your-prod-url" npx prisma db push');
  }

  return NextResponse.json({
    ...response,
    recommendations: recommendations.length > 0 ? recommendations : undefined,
  }, {
    status: response.status === 'healthy' ? 200 : response.status === 'degraded' ? 200 : 503,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    },
  });
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
