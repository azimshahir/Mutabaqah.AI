import { simulateAudit, type SimulatedAuditResult } from './simulated';
import { generateGeminiAudit } from './gemini';
import type { Transaction, AuditEvent } from '@/types';

export type AiProvider = 'simulated' | 'gemini';

export interface AuditRequest {
  transaction: Transaction;
  events: AuditEvent[];
}

export interface AuditResult {
  summary: string;
  complianceScore: number;
  findings: Array<{
    stage: string;
    issue: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    recommendation: string;
  }>;
  recommendations: string[];
  generatedBy: AiProvider;
}

// ===========================================
// Main AI Audit Function
// ===========================================

export async function generateAuditSummary(
  request: AuditRequest,
  provider?: AiProvider
): Promise<AuditResult> {
  const selectedProvider = provider || (process.env.AI_PROVIDER as AiProvider) || 'simulated';

  try {
    if (selectedProvider === 'gemini' && process.env.GEMINI_API_KEY) {
      return await generateGeminiAudit(request);
    }
  } catch (error) {
    console.error('Gemini audit failed, falling back to simulated:', error);
  }

  // Default to simulated audit
  const simulated = simulateAudit(request);
  return convertSimulatedToResult(simulated);
}

function convertSimulatedToResult(simulated: SimulatedAuditResult): AuditResult {
  return {
    ...simulated,
    generatedBy: 'simulated',
  };
}

export { simulateAudit } from './simulated';
export { generateGeminiAudit } from './gemini';
