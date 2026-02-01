import { prisma } from '@/lib/prisma';

// ===========================================
// Certificate Service
// ===========================================

export async function getCertificateById(id: string) {
  return prisma.certificate.findUnique({
    where: { id },
    include: {
      auditEvent: {
        include: {
          transaction: true,
        },
      },
    },
  });
}

export async function getCertificateByNumber(certificateNumber: string) {
  return prisma.certificate.findUnique({
    where: { certificateNumber },
    include: {
      auditEvent: {
        include: {
          transaction: true,
        },
      },
    },
  });
}

export async function getCertificatesForTransaction(transactionId: string) {
  const events = await prisma.auditEvent.findMany({
    where: { transactionId },
    include: {
      certificate: true,
    },
    orderBy: { stage: 'asc' },
  });

  return events
    .filter((e) => e.certificate)
    .map((e) => ({
      stage: e.stage,
      stageName: e.stageName,
      certificate: e.certificate!,
    }));
}

export async function getAllCertificates(
  options: { page?: number; pageSize?: number; type?: string } = {}
) {
  const { page = 1, pageSize = 20, type } = options;

  const where: Record<string, unknown> = {};

  if (type) {
    where.type = type;
  }

  const [certificates, total] = await Promise.all([
    prisma.certificate.findMany({
      where,
      orderBy: { issuedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        auditEvent: {
          include: {
            transaction: {
              select: {
                transactionId: true,
                customerName: true,
              },
            },
          },
        },
      },
    }),
    prisma.certificate.count({ where }),
  ]);

  return {
    certificates,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export function formatCertificateForDisplay(certificate: {
  id: string;
  certificateNumber: string;
  type: string;
  issuedBy: string;
  issuedAt: Date;
  data: unknown;
}) {
  const data = certificate.data as Record<string, unknown>;

  return {
    ...certificate,
    formattedType: formatCertificateType(certificate.type),
    details: formatCertificateDetails(certificate.type, data),
  };
}

function formatCertificateType(type: string): string {
  const typeMap: Record<string, string> = {
    WAKALAH_AGREEMENT: 'Wakalah Agreement',
    QABD_CONFIRMATION: 'Qabd Confirmation',
    LIQUIDATION_CERTIFICATE: 'Liquidation Certificate',
  };
  return typeMap[type] || type;
}

function formatCertificateDetails(type: string, data: Record<string, unknown>): string[] {
  const details: string[] = [];

  switch (type) {
    case 'WAKALAH_AGREEMENT':
      details.push(`Principal: ${data.principalName || 'N/A'}`);
      details.push(`Agent: ${data.agentName || 'N/A'}`);
      details.push(`Purpose: ${data.wakalahPurpose || 'N/A'}`);
      if (data.witnessName) details.push(`Witness: ${data.witnessName}`);
      break;

    case 'QABD_CONFIRMATION':
      details.push(`Commodity: ${data.commodityDescription || 'N/A'}`);
      details.push(`Quantity: ${data.quantity || 'N/A'} lots`);
      details.push(`Unit Price: MYR ${data.unitPrice || 'N/A'}`);
      if (data.bursaTradeRef) details.push(`Bursa Ref: ${data.bursaTradeRef}`);
      break;

    case 'LIQUIDATION_CERTIFICATE':
      details.push(`Sale Method: ${data.saleMethod || 'N/A'}`);
      details.push(`Buyer: ${data.buyerName || 'N/A'}`);
      details.push(`Profit Margin: ${data.profitMargin || 'N/A'}%`);
      if (data.settlementDate) {
        details.push(`Settlement: ${new Date(data.settlementDate as string).toLocaleDateString()}`);
      }
      break;

    default:
      Object.entries(data).forEach(([key, value]) => {
        if (value && key !== 'transactionRef' && key !== 'generatedAt') {
          details.push(`${key}: ${value}`);
        }
      });
  }

  return details;
}
