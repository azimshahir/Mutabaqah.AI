import type { Transaction, AuditEvent, AuditStage } from '@/types';

interface AuditRequest {
  transaction: Transaction;
  events: AuditEvent[];
}

interface GeminiAuditResult {
  summary: string;
  complianceScore: number;
  findings: Array<{
    stage: AuditStage;
    issue: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    recommendation: string;
  }>;
  recommendations: string[];
  generatedBy: 'gemini';
}

// ===========================================
// Google Gemini API Integration
// ===========================================

export async function generateGeminiAudit(request: AuditRequest): Promise<GeminiAuditResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const prompt = buildPrompt(request);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error('No content in Gemini response');
  }

  return parseGeminiResponse(content);
}

function buildPrompt(request: AuditRequest): string {
  const { transaction, events } = request;

  return `You are an expert Islamic finance Shariah auditor. Analyze the following Tawarruq commodity trading transaction and provide a compliance audit.

TRANSACTION DETAILS:
- Transaction ID: ${transaction.transactionId}
- Customer: ${transaction.customerName} (ID: ${transaction.customerId})
- Commodity: ${transaction.commodityType}
- Amount: ${transaction.currency} ${transaction.amount}
- Status: ${transaction.status}
- Shariah Status: ${transaction.shariahStatus}

AUDIT EVENTS:
${events.map((e) => `- ${e.stage} (${e.stageName}): Status=${e.status}, Time=${e.timestamp}${e.certificateId ? ', Certificate=Yes' : ', Certificate=No'}`).join('\n')}

TAWARRUQ REQUIREMENTS:
1. T0 (Wakalah Agreement): Principal appoints agent - must be signed FIRST
2. T1 (Qabd): Agent purchases commodity - must happen AFTER T0
3. T2 (Liquidation): Murabahah sale - must happen AFTER T1, asset must be possessed

Respond in the following JSON format ONLY (no other text):
{
  "summary": "Brief summary of audit findings",
  "complianceScore": <number 0-100>,
  "findings": [
    {
      "stage": "T0|T1|T2",
      "issue": "Description of issue",
      "severity": "low|medium|high|critical",
      "recommendation": "How to resolve"
    }
  ],
  "recommendations": ["General recommendation 1", "General recommendation 2"]
}`;
}

function parseGeminiResponse(content: string): GeminiAuditResult {
  try {
    // Extract JSON from response (handle potential markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    } else {
      // Try to find raw JSON
      const startIdx = content.indexOf('{');
      const endIdx = content.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1) {
        jsonStr = content.substring(startIdx, endIdx + 1);
      }
    }

    const parsed = JSON.parse(jsonStr);

    return {
      summary: parsed.summary || 'Unable to generate summary',
      complianceScore: Math.max(0, Math.min(100, parsed.complianceScore || 50)),
      findings: (parsed.findings || []).map((f: Record<string, unknown>) => ({
        stage: f.stage as AuditStage,
        issue: String(f.issue || ''),
        severity: f.severity as 'low' | 'medium' | 'high' | 'critical',
        recommendation: String(f.recommendation || ''),
      })),
      recommendations: parsed.recommendations || [],
      generatedBy: 'gemini',
    };
  } catch (error) {
    console.error('Failed to parse Gemini response:', error);
    // Return a fallback response
    return {
      summary: 'AI analysis completed but response parsing failed. Please review manually.',
      complianceScore: 50,
      findings: [],
      recommendations: ['Manual review recommended due to AI parsing error'],
      generatedBy: 'gemini',
    };
  }
}
