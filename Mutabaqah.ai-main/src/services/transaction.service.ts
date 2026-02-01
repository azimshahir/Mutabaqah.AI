import { prisma } from '@/lib/prisma';
import { generateTransactionId, generateCertificateNumber } from '@/lib/utils';
import type { TransactionStatus, ShariahStatus, CommodityType, AuditStage } from '@/types';

// ===========================================
// Transaction Service
// ===========================================

export interface CreateTransactionInput {
  customerName: string;
  customerId: string;
  commodityType: CommodityType;
  amount: number;
  currency?: string;
}

export interface TransactionFilters {
  status?: TransactionStatus;
  shariahStatus?: ShariahStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function createTransaction(input: CreateTransactionInput) {
  const transactionId = generateTransactionId();

  const transaction = await prisma.transaction.create({
    data: {
      transactionId,
      customerName: input.customerName,
      customerId: input.customerId,
      commodityType: input.commodityType,
      amount: input.amount,
      currency: input.currency || 'MYR',
      status: 'PENDING',
      shariahStatus: 'PENDING_REVIEW',
    },
  });

  // Create initial audit events (T0, T1, T2) with PENDING status
  await prisma.auditEvent.createMany({
    data: [
      {
        transactionId: transaction.id,
        stage: 'T0',
        stageName: 'WAKALAH_AGREEMENT',
        status: 'PENDING',
      },
      {
        transactionId: transaction.id,
        stage: 'T1',
        stageName: 'QABD',
        status: 'PENDING',
      },
      {
        transactionId: transaction.id,
        stage: 'T2',
        stageName: 'LIQUIDATE',
        status: 'PENDING',
      },
    ],
  });

  // Log the creation
  await prisma.auditLog.create({
    data: {
      transactionId: transaction.id,
      eventType: 'TRANSACTION_CREATED',
      message: `Transaction ${transactionId} created for ${input.customerName}`,
      severity: 'INFO',
      metadata: { customerId: input.customerId, amount: input.amount },
    },
  });

  return transaction;
}

export async function getTransactions(filters: TransactionFilters = {}) {
  const { status, shariahStatus, search, page = 1, pageSize = 10 } = filters;

  const where: Record<string, unknown> = {};

  if (status) {
    where.status = status;
  }

  if (shariahStatus) {
    where.shariahStatus = shariahStatus;
  }

  if (search) {
    where.OR = [
      { customerName: { contains: search, mode: 'insensitive' } },
      { customerId: { contains: search, mode: 'insensitive' } },
      { transactionId: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        auditEvents: {
          orderBy: { stage: 'asc' },
        },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getTransactionById(id: string) {
  return prisma.transaction.findUnique({
    where: { id },
    include: {
      auditEvents: {
        orderBy: { stage: 'asc' },
        include: {
          certificate: true,
        },
      },
      auditLogs: {
        orderBy: { timestamp: 'desc' },
        take: 50,
      },
      aiAuditSummary: true,
    },
  });
}

export async function getTransactionByTransactionId(transactionId: string) {
  return prisma.transaction.findUnique({
    where: { transactionId },
    include: {
      auditEvents: {
        orderBy: { stage: 'asc' },
        include: {
          certificate: true,
        },
      },
      auditLogs: {
        orderBy: { timestamp: 'desc' },
        take: 50,
      },
      aiAuditSummary: true,
    },
  });
}

export async function updateTransactionStatus(
  id: string,
  status: TransactionStatus,
  shariahStatus?: ShariahStatus
) {
  const updateData: Record<string, unknown> = { status };
  if (shariahStatus) {
    updateData.shariahStatus = shariahStatus;
  }

  const transaction = await prisma.transaction.update({
    where: { id },
    data: updateData,
  });

  await prisma.auditLog.create({
    data: {
      transactionId: id,
      eventType: 'STATUS_UPDATED',
      message: `Transaction status updated to ${status}`,
      severity: status === 'VIOLATION' ? 'ERROR' : 'INFO',
    },
  });

  return transaction;
}

export async function processAuditStage(
  transactionId: string,
  stage: AuditStage,
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
) {
  const auditEvent = await prisma.auditEvent.findFirst({
    where: { transactionId, stage },
  });

  if (!auditEvent) {
    throw new Error(`Audit event for stage ${stage} not found`);
  }

  const updateData: Record<string, unknown> = { status };

  // If completing, create certificate and set completion time
  if (status === 'COMPLETED') {
    updateData.completedAt = new Date();

    // Create certificate
    const certificateType =
      stage === 'T0'
        ? 'WAKALAH_AGREEMENT'
        : stage === 'T1'
        ? 'QABD_CONFIRMATION'
        : 'LIQUIDATION_CERTIFICATE';

    const certificate = await prisma.certificate.create({
      data: {
        certificateNumber: generateCertificateNumber(certificateType),
        type: certificateType,
        issuedBy: 'Bursa Malaysia',
        data: generateCertificateData(stage, transactionId),
      },
    });

    updateData.certificateId = certificate.id;
  }

  const updated = await prisma.auditEvent.update({
    where: { id: auditEvent.id },
    data: updateData,
    include: { certificate: true },
  });

  // Log the event
  await prisma.auditLog.create({
    data: {
      transactionId,
      eventType: `${stage}_${status}`,
      message: `Audit stage ${stage} ${status.toLowerCase()}`,
      severity: status === 'FAILED' ? 'ERROR' : 'INFO',
    },
  });

  // Check if all stages are complete
  const allEvents = await prisma.auditEvent.findMany({
    where: { transactionId },
  });

  const allCompleted = allEvents.every((e) => e.status === 'COMPLETED');
  const anyFailed = allEvents.some((e) => e.status === 'FAILED');

  if (allCompleted) {
    await updateTransactionStatus(transactionId, 'COMPLETED', 'COMPLIANT');
  } else if (anyFailed) {
    await updateTransactionStatus(transactionId, 'VIOLATION', 'NON_COMPLIANT');
  } else if (status === 'IN_PROGRESS') {
    await updateTransactionStatus(transactionId, 'PROCESSING', 'PENDING_REVIEW');
  }

  return updated;
}

function generateCertificateData(stage: AuditStage, transactionId: string) {
  const baseData = {
    transactionRef: transactionId,
    generatedAt: new Date().toISOString(),
    bursaRef: `BMD-${Date.now()}`,
  };

  switch (stage) {
    case 'T0':
      return {
        ...baseData,
        documentType: 'WAKALAH_AGREEMENT',
        principalName: 'Customer',
        agentName: 'Bursa Suq As Sila',
        wakalahPurpose: 'Purchase of CPO',
        wakalahFee: 0,
      };
    case 'T1':
      return {
        ...baseData,
        documentType: 'QABD_CONFIRMATION',
        commodityDescription: 'Crude Palm Oil (CPO)',
        quantity: Math.floor(Math.random() * 100) + 1,
        unitPrice: Math.floor(Math.random() * 1000) + 3000,
        bursaTradeRef: `CPO-${Date.now()}`,
      };
    case 'T2':
      return {
        ...baseData,
        documentType: 'LIQUIDATION_CERTIFICATE',
        saleMethod: 'Murabahah',
        buyerName: 'Third Party Buyer',
        profitMargin: 2.5,
        settlementDate: new Date().toISOString(),
      };
    default:
      return baseData;
  }
}

export async function getDashboardStats() {
  const [
    totalTransactions,
    pendingTransactions,
    completedTransactions,
    violationTransactions,
    recentTransactions,
  ] = await Promise.all([
    prisma.transaction.count(),
    prisma.transaction.count({ where: { status: 'PENDING' } }),
    prisma.transaction.count({ where: { status: 'COMPLETED' } }),
    prisma.transaction.count({ where: { status: 'VIOLATION' } }),
    prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        auditEvents: {
          orderBy: { stage: 'asc' },
        },
      },
    }),
  ]);

  return {
    totalTransactions,
    pendingTransactions,
    completedTransactions,
    violationTransactions,
    recentTransactions,
  };
}

// ===========================================
// Violation Resolution Service
// ===========================================

export interface ResolveViolationInput {
  transactionId: string;
  notes: string;
  userId: string;
}

/**
 * Validates the stage order based on completedAt timestamps.
 * Returns which stages are out of order.
 */
export async function validateStageOrder(transactionId: string) {
  const auditEvents = await prisma.auditEvent.findMany({
    where: { transactionId },
    orderBy: { stage: 'asc' },
  });

  const stageOrder: AuditStage[] = ['T0', 'T1', 'T2'];
  const outOfOrder: AuditStage[] = [];
  let lastCompletedTime: Date | null = null;

  for (const stage of stageOrder) {
    const event = auditEvents.find((e) => e.stage === stage);
    if (event?.completedAt) {
      if (lastCompletedTime && event.completedAt < lastCompletedTime) {
        outOfOrder.push(stage);
      }
      lastCompletedTime = event.completedAt;
    }
  }

  // Check if any later stage completed before an earlier stage even started
  for (let i = 0; i < stageOrder.length; i++) {
    const currentEvent = auditEvents.find((e) => e.stage === stageOrder[i]);
    for (let j = i + 1; j < stageOrder.length; j++) {
      const laterEvent = auditEvents.find((e) => e.stage === stageOrder[j]);
      if (
        laterEvent?.completedAt &&
        (!currentEvent?.completedAt || laterEvent.completedAt < currentEvent.completedAt)
      ) {
        if (!outOfOrder.includes(stageOrder[j])) {
          outOfOrder.push(stageOrder[j]);
        }
      }
    }
  }

  return {
    isValid: outOfOrder.length === 0,
    outOfOrder,
    auditEvents,
  };
}

/**
 * Resolves a violation by creating a resolution record,
 * generating AI reanalysis, and re-queuing for processing.
 */
export async function resolveViolation(input: ResolveViolationInput) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: input.transactionId },
    include: {
      auditEvents: {
        orderBy: { stage: 'asc' },
      },
    },
  });

  if (!transaction) {
    throw new Error('Transaction not found');
  }

  if (transaction.status !== 'VIOLATION') {
    throw new Error('Transaction is not in VIOLATION status');
  }

  // Find the failed stage
  const failedEvent = transaction.auditEvents.find((e) => e.status === 'FAILED');
  if (!failedEvent) {
    throw new Error('No failed stage found');
  }

  // Validate stage order
  const { isValid, outOfOrder } = await validateStageOrder(input.transactionId);

  // Generate AI reanalysis
  const aiReanalysis = {
    originalIssue: `Stage ${failedEvent.stage} failed`,
    resolutionNotes: input.notes,
    timestamp: new Date().toISOString(),
    stageOrderValid: isValid,
    outOfOrderStages: outOfOrder,
    recommendation: isValid
      ? 'Re-process from failed stage'
      : 'Reset out-of-order stages and re-process in correct sequence',
  };

  // Create violation resolution record
  const resolution = await prisma.violationResolution.create({
    data: {
      transactionId: input.transactionId,
      originalStage: failedEvent.stage,
      resolutionNotes: input.notes,
      resolvedBy: input.userId,
      aiReanalysis,
      reprocessed: false,
    },
  });

  // Increment violation count
  await prisma.transaction.update({
    where: { id: input.transactionId },
    data: {
      violationCount: { increment: 1 },
    },
  });

  // Determine which stages to reset
  const stagesToReset: AuditStage[] = [];

  if (!isValid && outOfOrder.length > 0) {
    // Reset stages that are out of order
    const stageOrder: AuditStage[] = ['T0', 'T1', 'T2'];
    const firstOutOfOrderIndex = Math.min(
      ...outOfOrder.map((s) => stageOrder.indexOf(s))
    );
    // Reset from the first out-of-order stage onwards
    for (let i = firstOutOfOrderIndex; i < stageOrder.length; i++) {
      stagesToReset.push(stageOrder[i]);
    }
  } else {
    // Reset from failed stage onwards
    const stageOrder: AuditStage[] = ['T0', 'T1', 'T2'];
    const failedIndex = stageOrder.indexOf(failedEvent.stage);
    for (let i = failedIndex; i < stageOrder.length; i++) {
      stagesToReset.push(stageOrder[i]);
    }
  }

  // Reset the stages
  for (const stage of stagesToReset) {
    await prisma.auditEvent.updateMany({
      where: {
        transactionId: input.transactionId,
        stage,
      },
      data: {
        status: 'PENDING',
        completedAt: null,
        certificateId: null,
      },
    });
  }

  // Update transaction status to PROCESSING
  await prisma.transaction.update({
    where: { id: input.transactionId },
    data: {
      status: 'PROCESSING',
      shariahStatus: 'PENDING_REVIEW',
    },
  });

  // Mark resolution as reprocessed
  await prisma.violationResolution.update({
    where: { id: resolution.id },
    data: { reprocessed: true },
  });

  // Log the resolution
  await prisma.auditLog.create({
    data: {
      transactionId: input.transactionId,
      eventType: 'VIOLATION_RESOLVED',
      message: `Violation resolved by ${input.userId}. Stages reset: ${stagesToReset.join(', ')}`,
      severity: 'INFO',
      metadata: {
        resolutionId: resolution.id,
        stagesToReset,
        notes: input.notes,
      },
    },
  });

  return {
    resolution,
    stagesToReset,
    aiReanalysis,
  };
}

/**
 * Get violation history for a transaction.
 */
export async function getViolationHistory(transactionId: string) {
  const resolutions = await prisma.violationResolution.findMany({
    where: { transactionId },
    orderBy: { resolvedAt: 'desc' },
  });

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    select: {
      violationCount: true,
      transactionId: true,
      customerName: true,
    },
  });

  return {
    transaction,
    resolutions,
    totalViolations: transaction?.violationCount || 0,
  };
}

/**
 * Get recent violations across all transactions.
 */
export async function getRecentViolations(limit: number = 5) {
  const violations = await prisma.transaction.findMany({
    where: { status: 'VIOLATION' },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    include: {
      auditEvents: {
        orderBy: { stage: 'asc' },
      },
      violationResolutions: {
        orderBy: { resolvedAt: 'desc' },
        take: 1,
      },
    },
  });

  return violations.map((txn) => {
    const failedEvent = txn.auditEvents.find((e) => e.status === 'FAILED');
    return {
      id: txn.id,
      transactionId: txn.transactionId,
      customerName: txn.customerName,
      amount: txn.amount.toString(),
      failedStage: failedEvent?.stage || 'Unknown',
      violationCount: txn.violationCount,
      lastResolution: txn.violationResolutions[0] || null,
      updatedAt: txn.updatedAt,
    };
  });
}
