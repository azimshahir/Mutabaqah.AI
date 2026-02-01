import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ===========================================
// Malaysian Name Generators
// ===========================================

// Malay names (65% of population)
const malayMaleFirstNames = [
  'Ahmad', 'Muhammad', 'Mohd', 'Ibrahim', 'Hafiz', 'Azlan', 'Farid', 'Rizal',
  'Ismail', 'Yusof', 'Aziz', 'Rahman', 'Zulkifli', 'Kamal', 'Rashid', 'Amir',
  'Faisal', 'Nazri', 'Hakim', 'Syafiq', 'Amin', 'Farhan', 'Irfan', 'Haziq',
];
const malayFemaleFirstNames = [
  'Fatimah', 'Siti', 'Nurul', 'Aminah', 'Zainab', 'Aishah', 'Mariam', 'Khadijah',
  'Nur', 'Farah', 'Aisyah', 'Nadia', 'Hana', 'Yasmin', 'Safiah', 'Raihana',
  'Amalina', 'Irdina', 'Syahira', 'Balqis', 'Hanis', 'Puteri', 'Sofea', 'Maisarah',
];
const malayLastNames = [
  'Abdullah', 'Hassan', 'Rahman', 'Ismail', 'Omar', 'Yusof', 'Ahmad', 'Aziz',
  'Ibrahim', 'Osman', 'Hamid', 'Salleh', 'Zainal', 'Bakar', 'Latif', 'Karim',
];

// Chinese names (23% of population)
const chineseFirstNames = [
  'Wei', 'Kai', 'Jun', 'Ming', 'Jian', 'Hao', 'Yu', 'Chen',
  'Mei', 'Ling', 'Xin', 'Hui', 'Yan', 'Li', 'Shu', 'Fang',
];
const chineseLastNames = [
  'Tan', 'Lee', 'Lim', 'Wong', 'Ng', 'Chan', 'Ong', 'Goh',
  'Koh', 'Yap', 'Teh', 'Low', 'Foo', 'Cheah', 'Ho', 'Yeoh',
];

// Indian names (12% of population)
const indianMaleFirstNames = [
  'Rajesh', 'Kumar', 'Ravi', 'Suresh', 'Ganesh', 'Vijay', 'Prakash', 'Mohan',
  'Ashok', 'Sanjay', 'Ramesh', 'Venkat', 'Arun', 'Dinesh', 'Muthu', 'Krishna',
];
const indianFemaleFirstNames = [
  'Priya', 'Lakshmi', 'Devi', 'Saroja', 'Vimala', 'Anitha', 'Malathi', 'Kamala',
  'Seetha', 'Radha', 'Uma', 'Geetha', 'Revathi', 'Kavitha', 'Nirmala', 'Sangeetha',
];
const indianLastNames = [
  'Krishnan', 'Nair', 'Pillai', 'Menon', 'Rajan', 'Subramaniam', 'Naidu', 'Rao',
  'Reddy', 'Sharma', 'Murugan', 'Selvam', 'Gopal', 'Balan', 'Suppiah', 'Maniam',
];

function generateMalayName(): string {
  const isMale = Math.random() > 0.5;
  const firstName = isMale
    ? malayMaleFirstNames[Math.floor(Math.random() * malayMaleFirstNames.length)]
    : malayFemaleFirstNames[Math.floor(Math.random() * malayFemaleFirstNames.length)];
  const lastName = malayLastNames[Math.floor(Math.random() * malayLastNames.length)];
  const connector = isMale ? 'bin' : 'binti';
  return `${firstName} ${connector} ${lastName}`;
}

function generateChineseName(): string {
  const lastName = chineseLastNames[Math.floor(Math.random() * chineseLastNames.length)];
  const firstName1 = chineseFirstNames[Math.floor(Math.random() * chineseFirstNames.length)];
  const firstName2 = chineseFirstNames[Math.floor(Math.random() * chineseFirstNames.length)];
  return `${lastName} ${firstName1} ${firstName2}`;
}

function generateIndianName(): string {
  const isMale = Math.random() > 0.5;
  const firstName = isMale
    ? indianMaleFirstNames[Math.floor(Math.random() * indianMaleFirstNames.length)]
    : indianFemaleFirstNames[Math.floor(Math.random() * indianFemaleFirstNames.length)];
  const lastName = indianLastNames[Math.floor(Math.random() * indianLastNames.length)];
  return `${firstName} ${lastName}`;
}

function generateMalaysianName(): string {
  const random = Math.random();
  if (random < 0.65) {
    return generateMalayName();
  } else if (random < 0.88) {
    return generateChineseName();
  } else {
    return generateIndianName();
  }
}

// ===========================================
// Random Data Generators
// ===========================================

function generateRandomAmount(): number {
  // MYR 10,000 - MYR 500,000
  return Math.floor(Math.random() * 490000) + 10000;
}

function generateRandomDate(daysBack: number = 30): Date {
  const now = new Date();
  const pastDate = new Date(now.getTime() - Math.random() * daysBack * 24 * 60 * 60 * 1000);
  return pastDate;
}

function generateTransactionId(index: number, date: Date): string {
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = String(index).padStart(3, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TXN-${dateStr}-${suffix}${random}`;
}

function getRandomStatus(): 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'VIOLATION' {
  const random = Math.random();
  // 55% COMPLETED, 20% PROCESSING, 15% PENDING, 10% VIOLATION
  if (random < 0.55) return 'COMPLETED';
  if (random < 0.75) return 'PROCESSING';
  if (random < 0.90) return 'PENDING';
  return 'VIOLATION';
}

function getShariahStatus(transactionStatus: string): 'COMPLIANT' | 'PENDING_REVIEW' | 'NON_COMPLIANT' {
  if (transactionStatus === 'COMPLETED') return 'COMPLIANT';
  if (transactionStatus === 'VIOLATION') return 'NON_COMPLIANT';
  return 'PENDING_REVIEW';
}

function getCommodityType(): 'CPO' | 'FPOL' | 'FUPO' | 'FGLD' {
  const types: Array<'CPO' | 'FPOL' | 'FUPO' | 'FGLD'> = ['CPO', 'FPOL', 'FUPO', 'FGLD'];
  // CPO is most common (70%)
  const random = Math.random();
  if (random < 0.70) return 'CPO';
  return types[Math.floor(Math.random() * types.length)];
}

// ===========================================
// Main Seed Function
// ===========================================

async function main() {
  console.log('Seeding database with 50 Malaysian customers...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mutabaqah.ai' },
    update: {},
    create: {
      email: 'admin@mutabaqah.ai',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('Created admin user:', admin.email);

  // Create demo user
  const userPassword = await bcrypt.hash('demo123', 12);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@mutabaqah.ai' },
    update: {},
    create: {
      email: 'demo@mutabaqah.ai',
      name: 'Demo User',
      password: userPassword,
      role: 'OPERATOR',
    },
  });
  console.log('Created demo user:', demoUser.email);

  // Generate 50 transactions
  const transactionCount = 50;
  const usedNames = new Set<string>();

  for (let i = 1; i <= transactionCount; i++) {
    // Generate unique customer name
    let customerName = generateMalaysianName();
    while (usedNames.has(customerName)) {
      customerName = generateMalaysianName();
    }
    usedNames.add(customerName);

    const status = getRandomStatus();
    const shariahStatus = getShariahStatus(status);
    const createdAt = generateRandomDate(30);
    const transactionId = generateTransactionId(i, createdAt);
    const customerId = `CUS-${String(i).padStart(3, '0')}`;
    const amount = generateRandomAmount();
    const commodityType = getCommodityType();

    // Check if transaction already exists
    const existing = await prisma.transaction.findUnique({
      where: { transactionId },
    });

    if (!existing) {
      const transaction = await prisma.transaction.create({
        data: {
          transactionId,
          customerName,
          customerId,
          commodityType,
          amount,
          status,
          shariahStatus,
          violationCount: status === 'VIOLATION' ? 1 : 0,
          createdAt,
        },
      });

      // Create audit events based on status
      const stages = getAuditStages(status);

      for (const stage of stages) {
        const event = await prisma.auditEvent.create({
          data: {
            transactionId: transaction.id,
            stage: stage.stage,
            stageName: stage.name,
            status: stage.status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED',
            completedAt: stage.status === 'COMPLETED' ? new Date(createdAt.getTime() + Math.random() * 3600000) : null,
          },
        });

        // Create certificate for completed stages
        if (stage.status === 'COMPLETED') {
          const certType = stage.stage === 'T0' ? 'WAKALAH_AGREEMENT' : stage.stage === 'T1' ? 'QABD_CONFIRMATION' : 'LIQUIDATION_CERTIFICATE';
          const cert = await prisma.certificate.create({
            data: {
              certificateNumber: `CERT-${certType.substring(0, 3)}-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
              type: certType,
              issuedBy: 'Bursa Suq As Sila',
              data: {
                transactionRef: transaction.transactionId,
                generatedAt: new Date().toISOString(),
                documentType: certType,
              },
            },
          });

          await prisma.auditEvent.update({
            where: { id: event.id },
            data: { certificateId: cert.id },
          });
        }
      }

      // Create AI audit summary for completed transactions
      if (status === 'COMPLETED') {
        await prisma.aiAuditSummary.create({
          data: {
            transactionId: transaction.id,
            summary: `Tawarruq transaction ${transactionId} for ${customerName} involving ${commodityType} worth MYR ${amount.toLocaleString()}. The transaction demonstrates excellent Shariah compliance with all stages properly executed.`,
            complianceScore: Math.floor(Math.random() * 10) + 90, // 90-100
            findings: [],
            recommendations: [
              'Transaction follows proper Tawarruq sequence',
              'All certificates are in order',
              'Continue monitoring for any anomalies',
            ],
            generatedBy: 'simulated',
          },
        });
      }

      // Create violation resolution for violation transactions (some of them)
      if (status === 'VIOLATION' && Math.random() > 0.5) {
        const failedStage = stages.find(s => s.status === 'FAILED');
        if (failedStage) {
          await prisma.violationResolution.create({
            data: {
              transactionId: transaction.id,
              originalStage: failedStage.stage,
              resolutionNotes: 'Initial violation detected - pending manual review',
              resolvedBy: 'system',
              aiReanalysis: {
                originalIssue: `Stage ${failedStage.stage} failed verification`,
                recommendation: 'Manual review required',
                stageOrderValid: false,
                outOfOrderStages: [],
              },
              reprocessed: false,
            },
          });
        }
      }

      console.log(`Created transaction ${i}/${transactionCount}: ${transactionId} - ${customerName} (${status})`);
    }
  }

  // Create sample audit logs
  const logs = [
    { eventType: 'SYSTEM_STARTUP', message: 'Mutabaqah.ai system initialized', severity: 'INFO' as const },
    { eventType: 'USER_LOGIN', message: 'Admin user logged in', severity: 'INFO' as const },
    { eventType: 'BATCH_PROCESSING', message: '40 transactions processed', severity: 'INFO' as const },
    { eventType: 'COMPLIANCE_CHECK', message: 'Daily compliance check completed', severity: 'INFO' as const },
  ];

  for (const log of logs) {
    await prisma.auditLog.create({
      data: log,
    });
  }

  console.log('');
  console.log('===========================================');
  console.log('Database seeding completed!');
  console.log('===========================================');
  console.log('');
  console.log('Summary:');
  console.log(`- Total transactions: ${transactionCount}`);
  const completedCount = await prisma.transaction.count({ where: { status: 'COMPLETED' } });
  const processingCount = await prisma.transaction.count({ where: { status: 'PROCESSING' } });
  const pendingCount = await prisma.transaction.count({ where: { status: 'PENDING' } });
  const violationCount = await prisma.transaction.count({ where: { status: 'VIOLATION' } });
  console.log(`- COMPLETED: ${completedCount}`);
  console.log(`- PROCESSING: ${processingCount}`);
  console.log(`- PENDING: ${pendingCount}`);
  console.log(`- VIOLATION: ${violationCount}`);
}

function getAuditStages(status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'VIOLATION') {
  switch (status) {
    case 'COMPLETED':
      return [
        { stage: 'T0' as const, name: 'WAKALAH_AGREEMENT', status: 'COMPLETED' },
        { stage: 'T1' as const, name: 'QABD', status: 'COMPLETED' },
        { stage: 'T2' as const, name: 'LIQUIDATE', status: 'COMPLETED' },
      ];
    case 'PROCESSING':
      // Randomly at different stages
      const processingStage = Math.random();
      if (processingStage < 0.5) {
        return [
          { stage: 'T0' as const, name: 'WAKALAH_AGREEMENT', status: 'COMPLETED' },
          { stage: 'T1' as const, name: 'QABD', status: 'IN_PROGRESS' },
          { stage: 'T2' as const, name: 'LIQUIDATE', status: 'PENDING' },
        ];
      } else {
        return [
          { stage: 'T0' as const, name: 'WAKALAH_AGREEMENT', status: 'COMPLETED' },
          { stage: 'T1' as const, name: 'QABD', status: 'COMPLETED' },
          { stage: 'T2' as const, name: 'LIQUIDATE', status: 'IN_PROGRESS' },
        ];
      }
    case 'PENDING':
      return [
        { stage: 'T0' as const, name: 'WAKALAH_AGREEMENT', status: 'PENDING' },
        { stage: 'T1' as const, name: 'QABD', status: 'PENDING' },
        { stage: 'T2' as const, name: 'LIQUIDATE', status: 'PENDING' },
      ];
    case 'VIOLATION':
      // Random stage failed
      const failedStage = Math.random();
      if (failedStage < 0.3) {
        return [
          { stage: 'T0' as const, name: 'WAKALAH_AGREEMENT', status: 'FAILED' },
          { stage: 'T1' as const, name: 'QABD', status: 'PENDING' },
          { stage: 'T2' as const, name: 'LIQUIDATE', status: 'PENDING' },
        ];
      } else if (failedStage < 0.7) {
        return [
          { stage: 'T0' as const, name: 'WAKALAH_AGREEMENT', status: 'COMPLETED' },
          { stage: 'T1' as const, name: 'QABD', status: 'FAILED' },
          { stage: 'T2' as const, name: 'LIQUIDATE', status: 'PENDING' },
        ];
      } else {
        return [
          { stage: 'T0' as const, name: 'WAKALAH_AGREEMENT', status: 'COMPLETED' },
          { stage: 'T1' as const, name: 'QABD', status: 'COMPLETED' },
          { stage: 'T2' as const, name: 'LIQUIDATE', status: 'FAILED' },
        ];
      }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
