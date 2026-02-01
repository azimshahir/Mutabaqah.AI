'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  RefreshCw,
  Bot,
  FileCheck,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateTime, formatCurrency, getStageName, getStageDescription } from '@/lib/utils';

interface AuditEvent {
  id: string;
  stage: string;
  stageName: string;
  status: string;
  timestamp: string;
  completedAt: string | null;
  certificateId: string | null;
  certificate: {
    id: string;
    certificateNumber: string;
    type: string;
    issuedBy: string;
    issuedAt: string;
  } | null;
}

interface Transaction {
  id: string;
  transactionId: string;
  customerName: string;
  customerId: string;
  commodityType: string;
  amount: string;
  currency: string;
  status: string;
  shariahStatus: string;
  createdAt: string;
  auditEvents: AuditEvent[];
  aiAuditSummary: {
    summary: string;
    complianceScore: number;
    findings: Array<{
      stage: string;
      issue: string;
      severity: string;
      recommendation: string;
    }>;
    recommendations: string[];
    generatedBy: string;
  } | null;
}

// Demo data matching the transactions list
const demoTransactions: Record<string, Transaction> = {
  '1': {
    id: '1',
    transactionId: 'TXN-20250122-ABC123',
    customerName: 'Ahmad bin Abdullah',
    customerId: 'CUS-001',
    commodityType: 'CPO',
    amount: '50000',
    currency: 'MYR',
    status: 'COMPLETED',
    shariahStatus: 'COMPLIANT',
    createdAt: '2025-01-22T10:30:00.000Z',
    auditEvents: [
      {
        id: 'evt-1',
        stage: 'T0',
        stageName: 'WAKALAH_AGREEMENT',
        status: 'COMPLETED',
        timestamp: '2025-01-22T10:30:00.000Z',
        completedAt: '2025-01-22T10:35:00.000Z',
        certificateId: 'cert-1',
        certificate: {
          id: 'cert-1',
          certificateNumber: 'CERT-WAK-20250122-XYZ',
          type: 'WAKALAH_AGREEMENT',
          issuedBy: 'Bursa Suq As Sila',
          issuedAt: '2025-01-22T10:35:00.000Z',
        },
      },
      {
        id: 'evt-2',
        stage: 'T1',
        stageName: 'QABD',
        status: 'COMPLETED',
        timestamp: '2025-01-22T10:40:00.000Z',
        completedAt: '2025-01-22T10:45:00.000Z',
        certificateId: 'cert-2',
        certificate: {
          id: 'cert-2',
          certificateNumber: 'CERT-QAB-20250122-ABC',
          type: 'QABD_CONFIRMATION',
          issuedBy: 'Bursa Suq As Sila',
          issuedAt: '2025-01-22T10:45:00.000Z',
        },
      },
      {
        id: 'evt-3',
        stage: 'T2',
        stageName: 'LIQUIDATE',
        status: 'COMPLETED',
        timestamp: '2025-01-22T10:50:00.000Z',
        completedAt: '2025-01-22T10:55:00.000Z',
        certificateId: 'cert-3',
        certificate: {
          id: 'cert-3',
          certificateNumber: 'CERT-LIQ-20250122-DEF',
          type: 'LIQUIDATION_CONFIRMATION',
          issuedBy: 'Bursa Suq As Sila',
          issuedAt: '2025-01-22T10:55:00.000Z',
        },
      },
    ],
    aiAuditSummary: {
      summary:
        'Tawarruq transaction TXN-20250122-ABC123 for Ahmad bin Abdullah involving CPO commodity worth MYR 50,000. Transaction fully completed with all stages executed in proper sequence. Full Shariah compliance achieved.',
      complianceScore: 98,
      findings: [],
      recommendations: [
        'Transaction follows proper Tawarruq sequence',
        'All certificates verified and complete',
        'Transaction fully compliant with Shariah requirements',
      ],
      generatedBy: 'simulated',
    },
  },
  '2': {
    id: '2',
    transactionId: 'TXN-20250122-DEF456',
    customerName: 'Fatimah binti Hassan',
    customerId: 'CUS-002',
    commodityType: 'CPO',
    amount: '75000',
    currency: 'MYR',
    status: 'PROCESSING',
    shariahStatus: 'PENDING_REVIEW',
    createdAt: '2025-01-22T09:15:00.000Z',
    auditEvents: [
      {
        id: 'evt-4',
        stage: 'T0',
        stageName: 'WAKALAH_AGREEMENT',
        status: 'COMPLETED',
        timestamp: '2025-01-22T09:15:00.000Z',
        completedAt: '2025-01-22T09:20:00.000Z',
        certificateId: 'cert-4',
        certificate: {
          id: 'cert-4',
          certificateNumber: 'CERT-WAK-20250122-GHI',
          type: 'WAKALAH_AGREEMENT',
          issuedBy: 'Bursa Suq As Sila',
          issuedAt: '2025-01-22T09:20:00.000Z',
        },
      },
      {
        id: 'evt-5',
        stage: 'T1',
        stageName: 'QABD',
        status: 'IN_PROGRESS',
        timestamp: '2025-01-22T09:25:00.000Z',
        completedAt: null,
        certificateId: null,
        certificate: null,
      },
      {
        id: 'evt-6',
        stage: 'T2',
        stageName: 'LIQUIDATE',
        status: 'PENDING',
        timestamp: '2025-01-22T09:15:00.000Z',
        completedAt: null,
        certificateId: null,
        certificate: null,
      },
    ],
    aiAuditSummary: {
      summary:
        'Tawarruq transaction TXN-20250122-DEF456 for Fatimah binti Hassan involving CPO commodity worth MYR 75,000. Transaction in progress - Qabd process currently executing.',
      complianceScore: 85,
      findings: [
        {
          stage: 'T1',
          issue: 'Qabd process in progress',
          severity: 'low',
          recommendation: 'Monitor Qabd completion before proceeding to T2',
        },
      ],
      recommendations: [
        'Transaction follows proper Tawarruq sequence',
        'T0 certificate verified',
        'Awaiting T1 completion',
      ],
      generatedBy: 'simulated',
    },
  },
  '3': {
    id: '3',
    transactionId: 'TXN-20250121-GHI789',
    customerName: 'Muhammad Razak',
    customerId: 'CUS-003',
    commodityType: 'CPO',
    amount: '100000',
    currency: 'MYR',
    status: 'PENDING',
    shariahStatus: 'PENDING_REVIEW',
    createdAt: '2025-01-21T14:45:00.000Z',
    auditEvents: [
      {
        id: 'evt-7',
        stage: 'T0',
        stageName: 'WAKALAH_AGREEMENT',
        status: 'PENDING',
        timestamp: '2025-01-21T14:45:00.000Z',
        completedAt: null,
        certificateId: null,
        certificate: null,
      },
      {
        id: 'evt-8',
        stage: 'T1',
        stageName: 'QABD',
        status: 'PENDING',
        timestamp: '2025-01-21T14:45:00.000Z',
        completedAt: null,
        certificateId: null,
        certificate: null,
      },
      {
        id: 'evt-9',
        stage: 'T2',
        stageName: 'LIQUIDATE',
        status: 'PENDING',
        timestamp: '2025-01-21T14:45:00.000Z',
        completedAt: null,
        certificateId: null,
        certificate: null,
      },
    ],
    aiAuditSummary: {
      summary:
        'Tawarruq transaction TXN-20250121-GHI789 for Muhammad Razak involving CPO commodity worth MYR 100,000. Transaction pending - awaiting Wakalah agreement initiation.',
      complianceScore: 0,
      findings: [],
      recommendations: [
        'Initiate T0 Wakalah Agreement process',
        'Ensure customer documentation is complete',
        'Verify commodity availability before proceeding',
      ],
      generatedBy: 'simulated',
    },
  },
  '4': {
    id: '4',
    transactionId: 'TXN-20250120-JKL012',
    customerName: 'Aminah binti Yusof',
    customerId: 'CUS-004',
    commodityType: 'CPO',
    amount: '25000',
    currency: 'MYR',
    status: 'VIOLATION',
    shariahStatus: 'NON_COMPLIANT',
    createdAt: '2025-01-20T11:20:00.000Z',
    auditEvents: [
      {
        id: 'evt-10',
        stage: 'T0',
        stageName: 'WAKALAH_AGREEMENT',
        status: 'COMPLETED',
        timestamp: '2025-01-20T11:20:00.000Z',
        completedAt: '2025-01-20T11:25:00.000Z',
        certificateId: 'cert-5',
        certificate: {
          id: 'cert-5',
          certificateNumber: 'CERT-WAK-20250120-JKL',
          type: 'WAKALAH_AGREEMENT',
          issuedBy: 'Bursa Suq As Sila',
          issuedAt: '2025-01-20T11:25:00.000Z',
        },
      },
      {
        id: 'evt-11',
        stage: 'T1',
        stageName: 'QABD',
        status: 'FAILED',
        timestamp: '2025-01-20T11:30:00.000Z',
        completedAt: null,
        certificateId: null,
        certificate: null,
      },
      {
        id: 'evt-12',
        stage: 'T2',
        stageName: 'LIQUIDATE',
        status: 'PENDING',
        timestamp: '2025-01-20T11:20:00.000Z',
        completedAt: null,
        certificateId: null,
        certificate: null,
      },
    ],
    aiAuditSummary: {
      summary:
        'Tawarruq transaction TXN-20250120-JKL012 for Aminah binti Yusof involving CPO commodity worth MYR 25,000. VIOLATION DETECTED - T1 Qabd process failed before completion. Transaction is non-compliant.',
      complianceScore: 35,
      findings: [
        {
          stage: 'T1',
          issue: 'Qabd process failed - commodity ownership not properly transferred',
          severity: 'high',
          recommendation: 'Manual review required. Consider transaction reversal or remediation.',
        },
      ],
      recommendations: [
        'Investigate T1 failure cause',
        'Do not proceed with T2 until T1 is resolved',
        'Contact Shariah advisor for guidance',
      ],
      generatedBy: 'simulated',
    },
  },
  '5': {
    id: '5',
    transactionId: 'TXN-20250119-MNO345',
    customerName: 'Ibrahim Hassan',
    customerId: 'CUS-005',
    commodityType: 'CPO',
    amount: '120000',
    currency: 'MYR',
    status: 'COMPLETED',
    shariahStatus: 'COMPLIANT',
    createdAt: '2025-01-19T16:00:00.000Z',
    auditEvents: [
      {
        id: 'evt-13',
        stage: 'T0',
        stageName: 'WAKALAH_AGREEMENT',
        status: 'COMPLETED',
        timestamp: '2025-01-19T16:00:00.000Z',
        completedAt: '2025-01-19T16:05:00.000Z',
        certificateId: 'cert-6',
        certificate: {
          id: 'cert-6',
          certificateNumber: 'CERT-WAK-20250119-MNO',
          type: 'WAKALAH_AGREEMENT',
          issuedBy: 'Bursa Suq As Sila',
          issuedAt: '2025-01-19T16:05:00.000Z',
        },
      },
      {
        id: 'evt-14',
        stage: 'T1',
        stageName: 'QABD',
        status: 'COMPLETED',
        timestamp: '2025-01-19T16:10:00.000Z',
        completedAt: '2025-01-19T16:15:00.000Z',
        certificateId: 'cert-7',
        certificate: {
          id: 'cert-7',
          certificateNumber: 'CERT-QAB-20250119-PQR',
          type: 'QABD_CONFIRMATION',
          issuedBy: 'Bursa Suq As Sila',
          issuedAt: '2025-01-19T16:15:00.000Z',
        },
      },
      {
        id: 'evt-15',
        stage: 'T2',
        stageName: 'LIQUIDATE',
        status: 'COMPLETED',
        timestamp: '2025-01-19T16:20:00.000Z',
        completedAt: '2025-01-19T16:25:00.000Z',
        certificateId: 'cert-8',
        certificate: {
          id: 'cert-8',
          certificateNumber: 'CERT-LIQ-20250119-STU',
          type: 'LIQUIDATION_CONFIRMATION',
          issuedBy: 'Bursa Suq As Sila',
          issuedAt: '2025-01-19T16:25:00.000Z',
        },
      },
    ],
    aiAuditSummary: {
      summary:
        'Tawarruq transaction TXN-20250119-MNO345 for Ibrahim Hassan involving CPO commodity worth MYR 120,000. Transaction fully completed with all stages executed in proper sequence. Full Shariah compliance achieved.',
      complianceScore: 100,
      findings: [],
      recommendations: [
        'Transaction follows proper Tawarruq sequence',
        'All certificates verified and complete',
        'Transaction fully compliant with Shariah requirements',
      ],
      generatedBy: 'simulated',
    },
  },
};

export default function AuditTimelinePage() {
  const params = useParams();
  const id = params.id as string;
  const [transaction, setTransaction] = useState<Transaction>(demoTransactions[id] || demoTransactions['1']);
  const [loading, setLoading] = useState(false);
  const [generatingAudit, setGeneratingAudit] = useState(false);

  useEffect(() => {
    // Set the correct demo transaction based on ID
    if (demoTransactions[id]) {
      setTransaction(demoTransactions[id]);
    }
    fetchTransaction();
  }, [id]);

  const fetchTransaction = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/transactions/${id}/audit`);
      if (response.ok) {
        const data = await response.json();
        setTransaction(data);
      }
    } catch (error) {
      console.error('Failed to fetch transaction:', error);
      // Fallback to demo data
      if (demoTransactions[id]) {
        setTransaction(demoTransactions[id]);
      }
    } finally {
      setLoading(false);
    }
  };

  const processStage = async (stage: string, status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED') => {
    try {
      const response = await fetch(`/api/transactions/${id}/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, status }),
      });
      if (response.ok) {
        fetchTransaction();
      }
    } catch (error) {
      console.error('Failed to process stage:', error);
    }
  };

  const generateAiAudit = async () => {
    setGeneratingAudit(true);
    try {
      const response = await fetch(`/api/transactions/${id}/audit?regenerate=true`, {
        method: 'PUT',
      });
      if (response.ok) {
        fetchTransaction();
      }
    } catch (error) {
      console.error('Failed to generate AI audit:', error);
    } finally {
      setGeneratingAudit(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-white" />;
      case 'IN_PROGRESS':
        return <Clock className="h-5 w-5 text-white" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-white" />;
      default:
        return <Clock className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-500';
      case 'IN_PROGRESS':
        return 'bg-blue-500';
      case 'FAILED':
        return 'bg-red-500';
      default:
        return 'bg-slate-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const completedStages = transaction.auditEvents.filter((e) => e.status === 'COMPLETED').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading audit details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Button */}
      <Link
        href="/dashboard/transactions"
        className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to Transactions
      </Link>

      {/* Transaction Header Card */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-semibold text-slate-900">{transaction.transactionId}</h1>
                <Badge
                  variant={
                    transaction.status === 'COMPLETED'
                      ? 'success'
                      : transaction.status === 'VIOLATION'
                        ? 'error'
                        : 'info'
                  }
                >
                  {transaction.status}
                </Badge>
              </div>
              <p className="text-slate-500">
                {transaction.customerName} &bull; {transaction.customerId}
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <p className="text-slate-400">Commodity</p>
                <p className="font-medium text-slate-900">{transaction.commodityType}</p>
              </div>
              <div>
                <p className="text-slate-400">Amount</p>
                <p className="font-medium text-slate-900">
                  {formatCurrency(parseFloat(transaction.amount), transaction.currency)}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Progress</p>
                <p className="font-medium text-slate-900">{completedStages}/3 Stages</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-700">Tawarruq Progress</span>
          <span className="text-sm text-slate-500">{Math.round((completedStages / 3) * 100)}% Complete</span>
        </div>
        <div className="flex gap-2">
          {transaction.auditEvents.map((event, index) => (
            <div key={event.id} className="flex-1">
              <div
                className={`h-2 rounded-full transition-all ${event.status === 'COMPLETED'
                  ? 'bg-emerald-500'
                  : event.status === 'IN_PROGRESS'
                    ? 'bg-blue-500 animate-pulse'
                    : event.status === 'FAILED'
                      ? 'bg-red-500'
                      : 'bg-slate-200'
                  }`}
              />
              <p className="text-xs text-slate-500 mt-1.5 text-center">{event.stage}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Timeline */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900">Audit Timeline</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {transaction.auditEvents.map((event, index) => (
            <div
              key={event.id}
              className={`p-5 ${index !== transaction.auditEvents.length - 1 ? 'border-b border-slate-100' : ''}`}
            >
              <div className="flex gap-4">
                {/* Status Circle */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusBg(event.status)}`}>
                    {getStatusIcon(event.status)}
                  </div>
                  {index < transaction.auditEvents.length - 1 && (
                    <div className={`w-0.5 flex-1 mt-2 ${event.status === 'COMPLETED' ? 'bg-emerald-200' : 'bg-slate-200'}`} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {event.stage} - {getStageName(event.stage)}
                      </h3>
                      <p className="text-sm text-slate-500">{getStageDescription(event.stage)}</p>
                    </div>
                    <Badge
                      variant={
                        event.status === 'COMPLETED'
                          ? 'success'
                          : event.status === 'FAILED'
                            ? 'error'
                            : event.status === 'IN_PROGRESS'
                              ? 'info'
                              : 'secondary'
                      }
                    >
                      {event.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500 mb-3">
                    <span>Started: {formatDateTime(event.timestamp)}</span>
                    {event.completedAt && <span>Completed: {formatDateTime(event.completedAt)}</span>}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {event.certificate ? (
                      <Link href={`/dashboard/certificates/${event.certificate.id}`}>
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                          <FileCheck className="mr-1.5 h-3.5 w-3.5" />
                          View Certificate
                          <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    ) : event.status === 'PENDING' ? (
                      <div className="text-xs text-slate-500 italic">
                        Automated process - triggered from BR System
                      </div>
                    ) : event.status === 'IN_PROGRESS' ? (
                      <div className="flex items-center gap-2 text-xs text-blue-600">
                        <Clock className="h-3.5 w-3.5 animate-pulse" />
                        Processing automatically...
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* AI Shariah Audit */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">AI Shariah Audit</CardTitle>
                <p className="text-sm text-slate-500">
                  {transaction.aiAuditSummary?.generatedBy === 'gemini' ? 'Google Gemini' : 'Rule-based Analysis'}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={generateAiAudit} disabled={generatingAudit}>
              <RefreshCw className={`mr-1.5 h-4 w-4 ${generatingAudit ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {transaction.aiAuditSummary ? (
            <div className="space-y-6">
              {/* Summary */}
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Summary</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{transaction.aiAuditSummary.summary}</p>
              </div>

              {/* Findings */}
              {transaction.aiAuditSummary.findings.length > 0 && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Findings</h4>
                  <div className="space-y-2">
                    {transaction.aiAuditSummary.findings.map((finding, index) => (
                      <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded ${finding.severity === 'low'
                              ? 'bg-blue-100 text-blue-700'
                              : finding.severity === 'medium'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                              }`}
                          >
                            {finding.severity?.toUpperCase() || 'UNKNOWN'}
                          </span>
                          <span className="text-sm font-medium text-slate-700">{finding.stage}</span>
                        </div>
                        <p className="text-sm text-slate-600">{finding.issue}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          <span className="font-medium">Recommendation:</span> {finding.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Recommendations</h4>
                <ul className="space-y-2">
                  {transaction.aiAuditSummary.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-4">No AI audit summary available</p>
              <Button onClick={generateAiAudit} disabled={generatingAudit} className="bg-emerald-600 hover:bg-emerald-700">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate AI Audit
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
