'use client';

import React from 'react';
import { AlertTriangle, Clock, User, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatTimeAgo } from '@/lib/utils';

interface ViolationCardProps {
  id: string;
  transactionId: string;
  customerName: string;
  amount: string;
  failedStage: string;
  violationCount: number;
  updatedAt: string | Date;
  onResolve: (id: string) => void;
  onClick?: (id: string) => void;
}

const getStageName = (stage: string) => {
  const names: Record<string, string> = {
    T0: 'Wakalah Agreement',
    T1: 'Qabd (Purchase)',
    T2: 'Liquidation',
  };
  return names[stage] || stage;
};

export default function ViolationCard({
  id,
  transactionId,
  customerName,
  amount,
  failedStage,
  violationCount,
  updatedAt,
  onResolve,
  onClick,
}: ViolationCardProps) {
  return (
    <Card
      className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 hover:border-red-300 transition-all cursor-pointer group"
      onClick={() => onClick?.(id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            {/* Warning Icon */}
            <div className="p-2 rounded-lg bg-red-100 text-red-600 flex-shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>

            {/* Main Info */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-slate-900 truncate">{customerName}</p>
                {violationCount > 1 && (
                  <Badge variant="error" className="text-xs">
                    {violationCount}x
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-500 font-mono truncate">{transactionId}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(updatedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <p className="font-bold text-red-700">{formatCurrency(parseFloat(amount))}</p>
            <Badge variant="error" className="text-xs">
              {getStageName(failedStage)} Failed
            </Badge>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-red-200">
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onResolve(id);
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            Resolve
          </Button>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-red-500 transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
}
