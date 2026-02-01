'use client';

import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, AlertTriangle, History, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';

interface ViolationResolution {
  id: string;
  originalStage: string;
  resolutionNotes: string;
  resolvedBy: string;
  resolvedAt: string;
  reprocessed: boolean;
  aiReanalysis?: {
    originalIssue: string;
    recommendation: string;
    stageOrderValid: boolean;
    outOfOrderStages: string[];
  };
}

interface ViolationHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  customerName: string;
}

const getStageName = (stage: string) => {
  const names: Record<string, string> = {
    T0: 'Wakalah Agreement',
    T1: 'Qabd (Purchase)',
    T2: 'Liquidation',
  };
  return names[stage] || stage;
};

export default function ViolationHistoryPanel({
  isOpen,
  onClose,
  transactionId,
  customerName,
}: ViolationHistoryPanelProps) {
  const [resolutions, setResolutions] = useState<ViolationResolution[]>([]);
  const [totalViolations, setTotalViolations] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && transactionId) {
      fetchHistory();
    }
  }, [isOpen, transactionId]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/transactions/${transactionId}/resolve`);
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      const data = await response.json();
      setResolutions(data.resolutions || []);
      setTotalViolations(data.totalViolations || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <History className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Violation History</h2>
              <p className="text-sm text-slate-500">{customerName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {totalViolations > 0 && (
              <Badge variant="warning">{totalViolations} Total Violations</Badge>
            )}
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="h-8 w-8 text-slate-400 animate-spin" />
                <p className="text-sm text-slate-500">Loading history...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600">{error}</p>
                <Button variant="outline" size="sm" onClick={fetchHistory} className="mt-3">
                  Retry
                </Button>
              </div>
            </div>
          ) : resolutions.length === 0 ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-slate-600">No violation history found</p>
                <p className="text-sm text-slate-400 mt-1">
                  This transaction has not had any resolved violations
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {resolutions.map((resolution, index) => (
                <div
                  key={resolution.id}
                  className="relative pl-6 pb-4 border-l-2 border-slate-200 last:border-l-transparent"
                >
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-2 top-0 w-4 h-4 rounded-full ${
                      resolution.reprocessed ? 'bg-green-500' : 'bg-amber-500'
                    }`}
                  />

                  {/* Resolution Card */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={resolution.reprocessed ? 'success' : 'warning'}>
                          {resolution.reprocessed ? 'Reprocessed' : 'Resolved'}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          Resolution #{resolutions.length - index}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        {formatDateTime(resolution.resolvedAt)}
                      </div>
                    </div>

                    {/* Failed Stage */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-slate-500">Failed Stage:</span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-sm font-medium">
                        {getStageName(resolution.originalStage)}
                      </span>
                    </div>

                    {/* Notes */}
                    <div className="mb-3">
                      <p className="text-sm font-medium text-slate-700 mb-1">Resolution Notes:</p>
                      <p className="text-sm text-slate-600 bg-white rounded p-2 border border-slate-200">
                        {resolution.resolutionNotes}
                      </p>
                    </div>

                    {/* AI Reanalysis */}
                    {resolution.aiReanalysis && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-blue-700 mb-1">AI Reanalysis:</p>
                        <p className="text-sm text-blue-600">{resolution.aiReanalysis.recommendation}</p>
                        {resolution.aiReanalysis.outOfOrderStages?.length > 0 && (
                          <p className="text-xs text-blue-500 mt-1">
                            Out-of-order stages: {resolution.aiReanalysis.outOfOrderStages.join(', ')}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Resolved By */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
                      <span className="text-xs text-slate-500">Resolved by: {resolution.resolvedBy}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t bg-slate-50">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
