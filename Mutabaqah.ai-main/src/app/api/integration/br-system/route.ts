import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Map BR System product types to Mutabaqah commodity types
const PRODUCT_TO_COMMODITY: Record<string, 'CPO' | 'FPOL' | 'FUPO' | 'FGLD' | 'OTHER'> = {
  personal_financing_i: 'CPO',
  home_financing_i: 'FPOL',
  vehicle_financing_i: 'FUPO',
  business_financing_i: 'FGLD',
};

// Generate unique transaction ID
function generateTransactionId(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${dateStr}-${random}`;
}

// Generate certificate number
function generateCertificateNumber(type: string): string {
  const prefix = type === 'WAKALAH' ? 'WAK' : type === 'QABD' ? 'QBD' : 'LIQ';
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${date}-${random}`;
}

// Delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Auto-process all Tawarruq stages
async function autoProcessTawarruq(transactionId: string, auditEvents: Array<{ id: string; stage: string }>) {
  try {
    const t0Event = auditEvents.find(e => e.stage === 'T0');
    const t1Event = auditEvents.find(e => e.stage === 'T1');
    const t2Event = auditEvents.find(e => e.stage === 'T2');

    // ========== STAGE T0: Wakalah Agreement ==========
    if (t0Event) {
      // Start T0
      await prisma.audit_events.update({
        where: { id: t0Event.id },
        data: { status: 'IN_PROGRESS', timestamp: new Date() },
      });

      await delay(800); // Simulate processing

      // Create Wakalah Certificate
      const wakalahCert = await prisma.certificates.create({
        data: {
          id: crypto.randomUUID(),
          certificateNumber: generateCertificateNumber('WAKALAH'),
          type: 'WAKALAH_AGREEMENT',
          issuedBy: 'Bursa Suq As Sila',
          data: {
            stage: 'T0',
            description: 'Wakalah Agreement - Principal appoints Bank as agent',
            timestamp: new Date().toISOString(),
          },
        },
      });

      // Complete T0
      await prisma.audit_events.update({
        where: { id: t0Event.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          certificateId: wakalahCert.id,
        },
      });

      await prisma.audit_logs.create({
        data: {
          id: crypto.randomUUID(),
          transactionId,
          eventType: 'T0_COMPLETED',
          message: 'Wakalah Agreement signed and verified',
          severity: 'INFO',
          metadata: { certificateNumber: wakalahCert.certificateNumber },
        },
      });
    }

    await delay(500);

    // ========== STAGE T1: Qabd (Asset Purchase) ==========
    if (t1Event) {
      // Start T1
      await prisma.audit_events.update({
        where: { id: t1Event.id },
        data: { status: 'IN_PROGRESS', timestamp: new Date() },
      });

      // Update transaction status
      await prisma.transactions.update({
        where: { id: transactionId },
        data: { status: 'PROCESSING' },
      });

      await delay(800); // Simulate commodity purchase

      // Create Qabd Certificate
      const qabdCert = await prisma.certificates.create({
        data: {
          id: crypto.randomUUID(),
          certificateNumber: generateCertificateNumber('QABD'),
          type: 'QABD_CONFIRMATION',
          issuedBy: 'Bursa Suq As Sila',
          data: {
            stage: 'T1',
            description: 'Qabd Confirmation - Commodity purchased from Bursa Malaysia',
            timestamp: new Date().toISOString(),
          },
        },
      });

      // Complete T1
      await prisma.audit_events.update({
        where: { id: t1Event.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          certificateId: qabdCert.id,
        },
      });

      await prisma.audit_logs.create({
        data: {
          id: crypto.randomUUID(),
          transactionId,
          eventType: 'T1_COMPLETED',
          message: 'Qabd confirmed - Commodity ownership transferred',
          severity: 'INFO',
          metadata: { certificateNumber: qabdCert.certificateNumber },
        },
      });
    }

    await delay(500);

    // ========== STAGE T2: Liquidation (Murabahah) ==========
    if (t2Event) {
      // Start T2
      await prisma.audit_events.update({
        where: { id: t2Event.id },
        data: { status: 'IN_PROGRESS', timestamp: new Date() },
      });

      await delay(800); // Simulate liquidation

      // Create Liquidation Certificate
      const liqCert = await prisma.certificates.create({
        data: {
          id: crypto.randomUUID(),
          certificateNumber: generateCertificateNumber('LIQ'),
          type: 'LIQUIDATION_CERTIFICATE',
          issuedBy: 'Bursa Suq As Sila',
          data: {
            stage: 'T2',
            description: 'Liquidation Certificate - Commodity sold via Murabahah',
            timestamp: new Date().toISOString(),
          },
        },
      });

      // Complete T2
      await prisma.audit_events.update({
        where: { id: t2Event.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          certificateId: liqCert.id,
        },
      });

      // Complete transaction
      await prisma.transactions.update({
        where: { id: transactionId },
        data: {
          status: 'COMPLETED',
          shariahStatus: 'COMPLIANT',
        },
      });

      await prisma.audit_logs.create({
        data: {
          id: crypto.randomUUID(),
          transactionId,
          eventType: 'T2_COMPLETED',
          message: 'Tawarruq completed - All stages passed Shariah compliance',
          severity: 'INFO',
          metadata: { certificateNumber: liqCert.certificateNumber },
        },
      });

      // Create AI Audit Summary
      await prisma.ai_audit_summaries.create({
        data: {
          id: crypto.randomUUID(),
          transactionId,
          summary: 'All Tawarruq stages completed successfully. Transaction is fully Shariah compliant.',
          complianceScore: 100,
          findings: [
            'Wakalah agreement properly executed',
            'Commodity ownership transfer verified (Qabd)',
            'Murabahah sale completed with proper sequence',
          ],
          recommendations: [],
          generatedBy: 'Mutabaqah.AI Auto-Processor',
        },
      });
    }

    console.log(`[AUTO-PROCESS] Tawarruq completed for transaction ${transactionId}`);
  } catch (error) {
    console.error('[AUTO-PROCESS] Error:', error);
    // Mark transaction as violation if error occurs
    await prisma.transactions.update({
      where: { id: transactionId },
      data: {
        status: 'VIOLATION',
        shariahStatus: 'NON_COMPLIANT',
        violationCount: 1,
      },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      application_number,
      customer_id,
      applicant_name,
      principal_amount,
      product_type,
      profit_rate,
      tenure_months,
      applicant_ic,
      applicant_phone,
      applicant_email,
      applicant_address,
      applicant_occupation,
      applicant_employer,
      applicant_monthly_income,
    } = body;

    // Validate required fields
    if (!customer_id || !applicant_name || !principal_amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: customer_id, applicant_name, principal_amount' },
        { status: 400 }
      );
    }

    // Map product type to commodity
    const commodityType = PRODUCT_TO_COMMODITY[product_type] || 'OTHER';

    // Generate transaction ID
    const transactionId = generateTransactionId();

    // Generate unique IDs
    const txnId = crypto.randomUUID();
    const t0Id = crypto.randomUUID();
    const t1Id = crypto.randomUUID();
    const t2Id = crypto.randomUUID();

    // Create transaction with audit events
    const transaction = await prisma.transactions.create({
      data: {
        id: txnId,
        transactionId,
        customerName: applicant_name,
        customerId: customer_id,
        commodityType,
        amount: principal_amount,
        currency: 'MYR',
        status: 'PENDING',
        shariahStatus: 'PENDING_REVIEW',
        violationCount: 0,
        updatedAt: new Date(),
        // Create the 3 audit stages (T0, T1, T2)
        audit_events: {
          create: [
            {
              id: t0Id,
              stage: 'T0',
              stageName: 'WAKALAH_AGREEMENT',
              status: 'PENDING',
              metadata: {
                sourceSystem: 'BR_SYSTEM',
                applicationNumber: application_number,
                profitRate: profit_rate,
                tenureMonths: tenure_months,
                applicant: {
                  ic: applicant_ic,
                  phone: applicant_phone,
                  email: applicant_email,
                  address: applicant_address,
                  occupation: applicant_occupation,
                  employer: applicant_employer,
                  monthlyIncome: applicant_monthly_income,
                },
              },
            },
            {
              id: t1Id,
              stage: 'T1',
              stageName: 'QABD',
              status: 'PENDING',
              metadata: {},
            },
            {
              id: t2Id,
              stage: 'T2',
              stageName: 'LIQUIDATE',
              status: 'PENDING',
              metadata: {},
            },
          ],
        },
      },
      include: {
        audit_events: true,
      },
    });

    // Create audit log
    await prisma.audit_logs.create({
      data: {
        id: crypto.randomUUID(),
        transactionId: transaction.id,
        eventType: 'TRANSACTION_CREATED',
        message: `Transaction ${transactionId} created from BR System application ${application_number}`,
        severity: 'INFO',
        metadata: {
          source: 'BR_SYSTEM_INTEGRATION',
          applicationNumber: application_number,
        },
      },
    });

    // Auto-process all Tawarruq stages (T0 → T1 → T2) in background
    // Don't await - let it run asynchronously
    autoProcessTawarruq(transaction.id, transaction.audit_events).catch(err => {
      console.error('[AUTO-PROCESS] Background error:', err);
    });

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        transactionId: transaction.transactionId,
        customerName: transaction.customerName,
        amount: transaction.amount,
        status: transaction.status,
        shariahStatus: transaction.shariahStatus,
        createdAt: transaction.createdAt,
      },
      message: 'Transaction created successfully. Tawarruq auto-processing started.',
    });
  } catch (error) {
    console.error('BR System Integration Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create transaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
