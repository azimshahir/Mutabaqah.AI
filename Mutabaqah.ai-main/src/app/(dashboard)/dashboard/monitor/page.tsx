'use client';

import { useEffect, useState } from 'react';
import { Activity, RefreshCw, AlertTriangle, Info, XCircle, Radio, Clock, Link2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils';

interface AuditLog {
  id: string;
  transactionId: string | null;
  eventType: string;
  message: string;
  severity: string;
  timestamp: string;
  zetrixHash?: string;
  transaction?: {
    transactionId: string;
    customerName: string;
  } | null;
}

// Demo logs with static dates and Zetrix blockchain hashes
const demoLogs: AuditLog[] = [
  {
    id: '1',
    transactionId: 'txn-1',
    eventType: 'TRANSACTION_CREATED',
    message: 'New transaction TXN-20250122-ABC123 created for Ahmad bin Abdullah',
    severity: 'INFO',
    timestamp: '2025-01-22T10:30:00.000Z',
    zetrixHash: '0x7f3a8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
    transaction: { transactionId: 'TXN-20250122-ABC123', customerName: 'Ahmad bin Abdullah' },
  },
  {
    id: '2',
    transactionId: 'txn-1',
    eventType: 'T0_COMPLETED',
    message: 'Wakalah Agreement signed and certificate issued',
    severity: 'INFO',
    timestamp: '2025-01-22T10:29:00.000Z',
    zetrixHash: '0x8a4b9c3d2e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f1b2',
    transaction: { transactionId: 'TXN-20250122-ABC123', customerName: 'Ahmad bin Abdullah' },
  },
  {
    id: '3',
    transactionId: 'txn-1',
    eventType: 'T1_IN_PROGRESS',
    message: 'Qabd process initiated - commodity purchase in progress',
    severity: 'INFO',
    timestamp: '2025-01-22T10:28:00.000Z',
    zetrixHash: '0x9b5c0d4e3f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f2c3d',
    transaction: { transactionId: 'TXN-20250122-ABC123', customerName: 'Ahmad bin Abdullah' },
  },
  {
    id: '4',
    transactionId: 'txn-2',
    eventType: 'VIOLATION_DETECTED',
    message: 'Transaction TXN-20250120-JKL012 flagged - T1 failed before T0 completion',
    severity: 'ERROR',
    timestamp: '2025-01-22T10:27:00.000Z',
    zetrixHash: '0xac6d1e5f4a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f3d4e5',
    transaction: { transactionId: 'TXN-20250120-JKL012', customerName: 'Aminah binti Yusof' },
  },
  {
    id: '5',
    transactionId: 'txn-1',
    eventType: 'T1_COMPLETED',
    message: 'Qabd confirmed - CPO commodity purchased from Bursa Malaysia',
    severity: 'INFO',
    timestamp: '2025-01-22T10:26:00.000Z',
    zetrixHash: '0xbd7e2f6a5b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f4e5f6a7',
    transaction: { transactionId: 'TXN-20250122-ABC123', customerName: 'Ahmad bin Abdullah' },
  },
  {
    id: '6',
    transactionId: 'txn-3',
    eventType: 'AI_AUDIT_GENERATED',
    message: 'AI Shariah audit completed with 95% compliance score',
    severity: 'INFO',
    timestamp: '2025-01-22T10:25:00.000Z',
    zetrixHash: '0xce8f3a7b6c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f5f6a7b8c9',
    transaction: { transactionId: 'TXN-20250122-DEF456', customerName: 'Fatimah binti Hassan' },
  },
  {
    id: '7',
    transactionId: null,
    eventType: 'SYSTEM_STATUS',
    message: 'System health check completed - all services operational',
    severity: 'INFO',
    timestamp: '2025-01-22T10:24:00.000Z',
  },
  {
    id: '8',
    transactionId: 'txn-2',
    eventType: 'REVIEW_REQUIRED',
    message: 'Manual review required for transaction TXN-20250120-JKL012',
    severity: 'WARNING',
    timestamp: '2025-01-22T10:23:00.000Z',
    zetrixHash: '0xdf9a4b8c7d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f6a7b8c9d0e1',
    transaction: { transactionId: 'TXN-20250120-JKL012', customerName: 'Aminah binti Yusof' },
  },
];

export default function MonitorPage() {
  const [logs, setLogs] = useState<AuditLog[]>(demoLogs);
  const [loading, setLoading] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<string>('');

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(() => {
      simulateNewLog();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/logs?recent=true');
      if (response.ok) {
        const data = await response.json();
        if (data.logs && data.logs.length > 0) {
          setLogs(data.logs);
        }
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateZetrixHash = () => {
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  };

  const simulateNewLog = () => {
    const eventTypes = [
      { type: 'T0_COMPLETED', message: 'Wakalah Agreement signed successfully', severity: 'INFO' },
      { type: 'T1_IN_PROGRESS', message: 'Qabd process initiated', severity: 'INFO' },
      { type: 'T2_COMPLETED', message: 'Murabahah execution completed', severity: 'INFO' },
      { type: 'AI_AUDIT_GENERATED', message: 'AI audit summary generated', severity: 'INFO' },
      { type: 'SYSTEM_CHECK', message: 'Periodic system health check passed', severity: 'INFO' },
    ];

    const now = Date.now();
    const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const newLog: AuditLog = {
      id: `sim-${now}`,
      transactionId: `txn-sim-${Math.floor(Math.random() * 100)}`,
      eventType: randomEvent.type,
      message: randomEvent.message,
      severity: randomEvent.severity,
      timestamp: new Date(now).toISOString(),
      zetrixHash: generateZetrixHash(),
      transaction: {
        transactionId: `TXN-20250122-SIM${Math.floor(Math.random() * 1000)}`,
        customerName: 'System Monitor',
      },
    };

    setLogs((prev) => [newLog, ...prev].slice(0, 100));
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'INFO':
        return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500', light: 'bg-blue-50' };
      case 'WARNING':
        return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500', light: 'bg-amber-50' };
      case 'ERROR':
      case 'CRITICAL':
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500', light: 'bg-red-50' };
      default:
        return { icon: Info, color: 'text-slate-500', bg: 'bg-slate-500', light: 'bg-slate-50' };
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!severityFilter) return true;
    return log.severity === severityFilter;
  });

  const stats = {
    total: logs.length,
    info: logs.filter((l) => l.severity === 'INFO').length,
    warning: logs.filter((l) => l.severity === 'WARNING').length,
    error: logs.filter((l) => l.severity === 'ERROR' || l.severity === 'CRITICAL').length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
            <Radio className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Live Monitor</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-xs sm:text-sm text-slate-500">Streaming live events</p>
            </div>
          </div>
        </div>
        <Button
          size="sm"
          onClick={fetchLogs}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 w-full sm:w-auto"
        >
          <RefreshCw className={`mr-1.5 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-4">
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Info className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.info}</p>
              <p className="text-xs text-slate-500">Info</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-amber-600">{stats.warning}</p>
              <p className="text-xs text-slate-500">Warnings</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
              <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.error}</p>
              <p className="text-xs text-slate-500">Errors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Event Stream */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium text-slate-900">Event Stream</CardTitle>
            <select
              className="px-3 py-1.5 text-sm font-medium border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="">All Events</option>
              <option value="INFO">Info Only</option>
              <option value="WARNING">Warnings Only</option>
              <option value="ERROR">Errors Only</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto">
            {filteredLogs.map((log, index) => {
              const config = getSeverityConfig(log.severity);
              const Icon = config.icon;

              return (
                <div
                  key={log.id}
                  className={`flex gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${
                    index === 0 ? 'animate-slide-in bg-emerald-50/30' : ''
                  }`}
                >
                  {/* Severity Indicator */}
                  <div className="flex flex-col items-center pt-0.5 flex-shrink-0">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${config.light} flex items-center justify-center`}>
                      <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${config.color}`} />
                    </div>
                    {index < filteredLogs.length - 1 && (
                      <div className="w-px flex-1 bg-slate-100 mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-xs font-medium text-slate-700 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded truncate max-w-[120px] sm:max-w-none">
                        {log.eventType}
                      </span>
                      {log.transaction && (
                        <span className="text-xs text-slate-400 hidden sm:inline truncate">
                          {log.transaction.transactionId}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 line-clamp-2">{log.message}</p>
                    <div className="flex items-center gap-2 sm:gap-4 mt-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-400">{formatDateTime(log.timestamp)}</span>
                      </div>
                      {log.zetrixHash && (
                        <div className="hidden sm:flex items-center gap-1.5">
                          <Link2 className="h-3 w-3 text-violet-500" />
                          <span className="text-xs font-mono text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">
                            Zetrix: {log.zetrixHash.slice(0, 10)}...{log.zetrixHash.slice(-6)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Severity Badge */}
                  <div className="flex-shrink-0 hidden sm:block">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        log.severity === 'INFO'
                          ? 'bg-blue-50 text-blue-700'
                          : log.severity === 'WARNING'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {log.severity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
