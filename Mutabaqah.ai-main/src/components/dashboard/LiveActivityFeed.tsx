'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, Info, AlertTriangle, XCircle, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDateTime, formatCurrency } from '@/lib/utils';

interface ActivityLog {
  id: string;
  eventType: string;
  message: string;
  severity: string;
  timestamp: string;
  customerName?: string;
  amount?: string;
}

interface LiveActivityFeedProps {
  logs: ActivityLog[];
  currentIndex: number;
}

const getSeverityConfig = (severity: string, eventType: string) => {
  if (severity === 'ERROR' || eventType.includes('FAILED')) {
    return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500', light: 'bg-red-50' };
  }
  if (severity === 'WARNING') {
    return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500', light: 'bg-amber-50' };
  }
  return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500', light: 'bg-blue-50' };
};

const LiveActivityFeed = memo(function LiveActivityFeed({ logs, currentIndex }: LiveActivityFeedProps) {
  const currentLog = logs[currentIndex];

  return (
    <Card className="lg:col-span-2 bg-white border border-slate-200 shadow-sm flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live Activity
          </CardTitle>
          <CardDescription>Real-time system events</CardDescription>
        </div>
        <Link href="/dashboard/monitor">
          <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50">
            Monitor
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {/* Current Event Highlight */}
        {currentLog && (
          <div className="mb-3 p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 transition-all duration-500">
            <div className="flex items-center justify-between mb-2 gap-2">
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                  {currentLog.eventType}
                </span>
              </div>
              <span className="text-xs text-emerald-600 flex-shrink-0">
                {formatDateTime(currentLog.timestamp).split(',')[1]?.trim()}
              </span>
            </div>
            <p className="font-semibold text-slate-900 text-sm truncate">
              {currentLog.customerName}
            </p>
            <p className="text-lg font-bold text-emerald-700">
              {formatCurrency(parseFloat(currentLog.amount || '0'))}
            </p>
            <p className="text-xs text-slate-600 mt-1">{currentLog.message}</p>
          </div>
        )}

        {/* Event Stream */}
        <div className="space-y-1.5">
          {logs.map((log, index) => {
            const config = getSeverityConfig(log.severity, log.eventType);
            const Icon = config.icon;
            const isActive = index === currentIndex;
            const isNew = index === 0;

            return (
              <div
                key={log.id}
                className={`flex gap-2.5 p-2 rounded-lg transition-all duration-500 ${
                  isActive
                    ? 'bg-emerald-50/70 border border-emerald-200'
                    : isNew
                    ? 'bg-blue-50/70 border border-blue-200 animate-pulse'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                {/* Severity Indicator */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`w-6 h-6 rounded-full ${isNew ? 'bg-blue-100' : config.light} flex items-center justify-center`}>
                    {isNew ? (
                      <Zap className="h-3 w-3 text-blue-600" />
                    ) : (
                      <Icon className={`h-3 w-3 ${config.color}`} />
                    )}
                  </div>
                  {index < logs.length - 1 && <div className="w-px h-full bg-slate-200 my-1" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className={`text-xs font-mono px-1.5 py-0.5 rounded truncate ${
                      isNew ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {log.eventType}
                    </span>
                    {log.amount && (
                      <span className={`text-xs font-bold flex-shrink-0 ${
                        isActive ? 'text-emerald-600' : isNew ? 'text-blue-600' : 'text-slate-700'
                      }`}>
                        {formatCurrency(parseFloat(log.amount))}
                      </span>
                    )}
                  </div>
                  {log.customerName && (
                    <p className={`text-xs font-medium truncate ${
                      isActive ? 'text-emerald-800' : isNew ? 'text-blue-800' : 'text-slate-800'
                    }`}>
                      {log.customerName}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="h-2.5 w-2.5 text-slate-400 flex-shrink-0" />
                    <span className="text-xs text-slate-400 truncate">
                      {formatDateTime(log.timestamp).split(',')[1]?.trim()}
                    </span>
                    {isNew && (
                      <span className="text-xs font-medium text-blue-600 ml-auto">NEW</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});

export default LiveActivityFeed;
