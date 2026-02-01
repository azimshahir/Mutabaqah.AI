'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle,
  Clock,
  Zap,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateTime, formatCurrency } from '@/lib/utils';

interface QueueItem {
  id: string;
  transactionId: string;
  customerName: string;
  amount: string;
  stage: string;
  status: 'pending' | 'processing' | 'completed';
  reason: string;
  startedAt?: string;
  completedAt?: string;
  progress: number;
}

// Demo queue data
const initialQueue: QueueItem[] = [
  {
    id: 'q-1',
    transactionId: 'TXN-20250128-Q001',
    customerName: 'Nurul Huda binti Kamal',
    amount: '87000',
    stage: 'T1',
    status: 'processing',
    reason: 'Qabd timing verification',
    startedAt: new Date().toISOString(),
    progress: 45,
  },
  {
    id: 'q-2',
    transactionId: 'TXN-20250128-Q002',
    customerName: 'Lim Wei Jie',
    amount: '125000',
    stage: 'T2',
    status: 'processing',
    reason: 'Liquidation sequence check',
    startedAt: new Date().toISOString(),
    progress: 72,
  },
  {
    id: 'q-3',
    transactionId: 'TXN-20250128-Q003',
    customerName: 'Krishnan Muthu',
    amount: '53000',
    stage: 'T0',
    status: 'pending',
    reason: 'Wakalah certificate validation',
    progress: 0,
  },
  {
    id: 'q-4',
    transactionId: 'TXN-20250128-Q004',
    customerName: 'Fatimah binti Osman',
    amount: '198000',
    stage: 'T1',
    status: 'pending',
    reason: 'Commodity ownership transfer',
    progress: 0,
  },
];

// Completed items
const completedItems: QueueItem[] = [
  {
    id: 'c-1',
    transactionId: 'TXN-20250128-C001',
    customerName: 'Lee Kai Wen',
    amount: '65000',
    stage: 'T1',
    status: 'completed',
    reason: 'Timeout exceeded - auto retry successful',
    completedAt: '2025-01-28T08:15:00.000Z',
    progress: 100,
  },
  {
    id: 'c-2',
    transactionId: 'TXN-20250128-C002',
    customerName: 'Siti Nurhaliza',
    amount: '42000',
    stage: 'T0',
    status: 'completed',
    reason: 'Certificate validation - auto corrected',
    completedAt: '2025-01-28T07:30:00.000Z',
    progress: 100,
  },
  {
    id: 'c-3',
    transactionId: 'TXN-20250127-C003',
    customerName: 'Mohan Krishna',
    amount: '98000',
    stage: 'T2',
    status: 'completed',
    reason: 'Sequence mismatch - auto reordered',
    completedAt: '2025-01-27T22:45:00.000Z',
    progress: 100,
  },
];

export default function AutoResolvedPage() {
  const [queue, setQueue] = useState<QueueItem[]>(initialQueue);
  const [completed, setCompleted] = useState<QueueItem[]>(completedItems);
  const [isProcessing, setIsProcessing] = useState(true);

  // Simulate live processing
  useEffect(() => {
    if (!isProcessing) return;

    const interval = setInterval(() => {
      setQueue((prev) => {
        const updated = prev.map((item) => {
          if (item.status === 'processing') {
            const newProgress = Math.min(item.progress + Math.random() * 15, 100);

            // If completed, move to completed list
            if (newProgress >= 100) {
              setTimeout(() => {
                setQueue((q) => q.filter((i) => i.id !== item.id));
                setCompleted((c) => [
                  {
                    ...item,
                    status: 'completed',
                    progress: 100,
                    completedAt: new Date().toISOString(),
                  },
                  ...c,
                ]);
              }, 500);
              return { ...item, progress: 100, status: 'completed' as const };
            }

            return { ...item, progress: newProgress };
          }
          return item;
        });

        // Start next pending item if no processing
        const hasProcessing = updated.some((i) => i.status === 'processing' && i.progress < 100);
        if (!hasProcessing) {
          const pendingIndex = updated.findIndex((i) => i.status === 'pending');
          if (pendingIndex !== -1) {
            updated[pendingIndex] = {
              ...updated[pendingIndex],
              status: 'processing',
              startedAt: new Date().toISOString(),
              progress: 5,
            };
          }
        }

        return updated;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isProcessing]);

  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      T0: 'Wakalah',
      T1: 'Qabd',
      T2: 'Liquidate',
    };
    return labels[stage] || stage;
  };

  const stats = {
    processing: queue.filter((i) => i.status === 'processing').length,
    pending: queue.filter((i) => i.status === 'pending').length,
    completed: completed.length,
    total: queue.length + completed.length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <RotateCcw className="h-8 w-8 text-purple-600" />
              Auto Resolve Queue
            </h1>
            <p className="text-slate-500 mt-1">System automatically resolving transactions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsProcessing(!isProcessing)}
            className={isProcessing ? 'border-red-300 text-red-600' : 'border-green-300 text-green-600'}
          >
            {isProcessing ? (
              <>
                <Activity className="h-4 w-4 mr-2 animate-pulse" />
                Pause Processing
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Resume Processing
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Processing</p>
                <p className="text-2xl font-bold text-blue-700">{stats.processing}</p>
              </div>
              <div className="p-2 bg-blue-500 rounded-lg">
                <RefreshCw className="h-5 w-5 text-white animate-spin" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600">In Queue</p>
                <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
              </div>
              <div className="p-2 bg-amber-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
              </div>
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Total Today</p>
                <p className="text-2xl font-bold text-purple-700">{stats.total}</p>
              </div>
              <div className="p-2 bg-purple-500 rounded-lg">
                <RotateCcw className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Processing Queue */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-violet-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {isProcessing && (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                  </span>
                )}
                Live Processing Queue
              </CardTitle>
              <CardDescription>AI compliance engine auto-resolving violations</CardDescription>
            </div>
            <Badge className="bg-purple-100 text-purple-700">
              {queue.length} items
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
              <p className="text-lg font-medium text-slate-700">Queue is empty!</p>
              <p className="text-sm text-slate-500">All items have been processed</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {queue.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-4 transition-all ${
                    item.status === 'processing'
                      ? 'bg-gradient-to-r from-purple-50/50 to-violet-50/50'
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Queue Number */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${
                        item.status === 'processing'
                          ? 'bg-gradient-to-br from-purple-500 to-violet-600'
                          : 'bg-slate-300'
                      }`}
                    >
                      {item.status === 'processing' ? (
                        <RefreshCw className="h-5 w-5 animate-spin" />
                      ) : (
                        index + 1
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-slate-900">{item.customerName}</p>
                        {item.status === 'processing' && (
                          <Badge className="bg-purple-100 text-purple-700 animate-pulse">
                            Processing
                          </Badge>
                        )}
                        {item.status === 'pending' && (
                          <Badge variant="secondary">Queued</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 font-mono">{item.transactionId}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                          Stage: {getStageLabel(item.stage)}
                        </span>
                        <span className="text-xs text-slate-400">{item.reason}</span>
                      </div>

                      {/* Progress Bar */}
                      {item.status === 'processing' && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-purple-600 font-medium">Processing...</span>
                            <span className="text-slate-500">{Math.round(item.progress)}%</span>
                          </div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all duration-300"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Amount */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-slate-900">
                        {formatCurrency(parseFloat(item.amount))}
                      </p>
                      {item.startedAt && (
                        <p className="text-xs text-slate-400 mt-1">
                          Started {formatDateTime(item.startedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Today */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Completed Today
              </CardTitle>
              <CardDescription>Successfully auto-resolved transactions</CardDescription>
            </div>
            <Badge variant="success">{completed.length} resolved</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {completed.map((item) => (
              <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Check Icon */}
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-900">{item.customerName}</p>
                      <Badge variant="success" className="text-xs">Resolved</Badge>
                    </div>
                    <p className="text-sm text-slate-500 font-mono">{item.transactionId}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                        Stage: {getStageLabel(item.stage)}
                      </span>
                      <span className="text-xs text-slate-400">{item.reason}</span>
                    </div>
                  </div>

                  {/* Amount & Time */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-green-700">
                      {formatCurrency(parseFloat(item.amount))}
                    </p>
                    {item.completedAt && (
                      <p className="text-xs text-slate-400 mt-1">
                        {formatDateTime(item.completedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
