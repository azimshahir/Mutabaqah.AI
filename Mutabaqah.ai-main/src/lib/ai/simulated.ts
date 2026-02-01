import type { Transaction, AuditEvent, AuditStage } from '@/types';

export interface SimulatedAuditResult {
  summary: string;
  complianceScore: number;
  findings: Array<{
    stage: AuditStage;
    issue: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    recommendation: string;
  }>;
  recommendations: string[];
}

interface AuditRequest {
  transaction: Transaction;
  events: AuditEvent[];
}

// ===========================================
// Rule-Based Shariah Audit Simulation
// ===========================================

export function simulateAudit(request: AuditRequest): SimulatedAuditResult {
  const { transaction, events } = request;
  const findings: SimulatedAuditResult['findings'] = [];
  const recommendations: string[] = [];
  let baseScore = 100;

  // Check T0 - Wakalah Agreement
  const t0Event = events.find((e) => e.stage === 'T0');
  if (!t0Event) {
    findings.push({
      stage: 'T0',
      issue: 'Wakalah Agreement not found',
      severity: 'critical',
      recommendation: 'Ensure Wakalah agreement is executed before commodity purchase',
    });
    baseScore -= 30;
  } else if (t0Event.status === 'FAILED') {
    findings.push({
      stage: 'T0',
      issue: 'Wakalah Agreement execution failed',
      severity: 'high',
      recommendation: 'Review and re-execute Wakalah agreement',
    });
    baseScore -= 20;
  } else if (t0Event.status === 'COMPLETED' && t0Event.certificate) {
    // Valid T0
  } else if (t0Event.status === 'PENDING' || t0Event.status === 'IN_PROGRESS') {
    findings.push({
      stage: 'T0',
      issue: 'Wakalah Agreement pending completion',
      severity: 'medium',
      recommendation: 'Complete Wakalah agreement before proceeding',
    });
    baseScore -= 10;
  }

  // Check T1 - Qabd (Asset Purchase)
  const t1Event = events.find((e) => e.stage === 'T1');
  if (!t1Event) {
    findings.push({
      stage: 'T1',
      issue: 'Qabd confirmation not found',
      severity: 'critical',
      recommendation: 'Ensure commodity is purchased and Qabd is established',
    });
    baseScore -= 30;
  } else if (t1Event.status === 'FAILED') {
    findings.push({
      stage: 'T1',
      issue: 'Asset purchase failed',
      severity: 'high',
      recommendation: 'Verify commodity availability and retry purchase',
    });
    baseScore -= 20;
  } else if (t1Event.status === 'COMPLETED') {
    // Check timing - T1 should happen after T0
    if (t0Event && new Date(t1Event.timestamp) < new Date(t0Event.completedAt || t0Event.timestamp)) {
      findings.push({
        stage: 'T1',
        issue: 'Asset purchased before Wakalah was signed',
        severity: 'high',
        recommendation: 'Ensure proper sequence: Wakalah must precede asset purchase',
      });
      baseScore -= 15;
    }
  }

  // Check T2 - Liquidation (Murabahah)
  const t2Event = events.find((e) => e.stage === 'T2');
  if (!t2Event) {
    if (t1Event?.status === 'COMPLETED') {
      findings.push({
        stage: 'T2',
        issue: 'Liquidation pending - asset held',
        severity: 'low',
        recommendation: 'Proceed with Murabahah execution when ready',
      });
      baseScore -= 5;
    }
  } else if (t2Event.status === 'FAILED') {
    findings.push({
      stage: 'T2',
      issue: 'Murabahah execution failed',
      severity: 'high',
      recommendation: 'Review sale terms and retry liquidation',
    });
    baseScore -= 20;
  } else if (t2Event.status === 'COMPLETED') {
    // Check timing - T2 should happen after T1
    if (t1Event && new Date(t2Event.timestamp) < new Date(t1Event.completedAt || t1Event.timestamp)) {
      findings.push({
        stage: 'T2',
        issue: 'Liquidation occurred before Qabd was established',
        severity: 'critical',
        recommendation: 'This violates Shariah principle - asset must be possessed before sale',
      });
      baseScore -= 25;
    }
  }

  // Generate recommendations based on transaction status
  if (transaction.status === 'VIOLATION') {
    recommendations.push('Transaction flagged for violation - immediate review required');
    recommendations.push('Engage Shariah committee for resolution');
  }

  if (findings.length === 0) {
    recommendations.push('Transaction follows proper Tawarruq sequence');
    recommendations.push('All certificates are in order');
    recommendations.push('Continue monitoring for any anomalies');
  } else {
    recommendations.push('Address identified issues before proceeding');
    if (findings.some((f) => f.severity === 'critical')) {
      recommendations.push('Critical issues detected - escalate to Shariah board');
    }
  }

  // Generate summary
  const summary = generateSummary(transaction, events, findings, baseScore);

  return {
    summary,
    complianceScore: Math.max(0, Math.min(100, baseScore)),
    findings,
    recommendations,
  };
}

function generateSummary(
  transaction: Transaction,
  events: AuditEvent[],
  findings: SimulatedAuditResult['findings'],
  score: number
): string {
  const completedStages = events.filter((e) => e.status === 'COMPLETED').length;
  const totalStages = 3;

  let summary = `Tawarruq transaction ${transaction.transactionId} for ${transaction.customerName} `;
  summary += `involving ${transaction.commodityType} commodity worth ${transaction.currency} ${transaction.amount}. `;

  if (score >= 90) {
    summary += 'The transaction demonstrates excellent Shariah compliance with all stages properly executed. ';
  } else if (score >= 70) {
    summary += 'The transaction shows good compliance with minor issues to address. ';
  } else if (score >= 50) {
    summary += 'The transaction has moderate compliance concerns that require attention. ';
  } else {
    summary += 'The transaction has significant compliance issues that must be resolved immediately. ';
  }

  summary += `Progress: ${completedStages}/${totalStages} stages completed. `;

  if (findings.length > 0) {
    const criticalCount = findings.filter((f) => f.severity === 'critical').length;
    const highCount = findings.filter((f) => f.severity === 'high').length;
    if (criticalCount > 0) {
      summary += `${criticalCount} critical issue(s) detected. `;
    }
    if (highCount > 0) {
      summary += `${highCount} high-priority issue(s) found. `;
    }
  }

  return summary;
}
