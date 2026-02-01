'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

interface ViolationResolveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onResolve: (notes: string) => Promise<void>;
  violation: {
    id: string;
    transactionId: string;
    customerName: string;
    amount: string;
    failedStage: string;
  } | null;
}

const getStageName = (stage: string) => {
  const names: Record<string, string> = {
    T0: 'Wakalah Agreement',
    T1: 'Qabd (Purchase)',
    T2: 'Liquidation',
  };
  return names[stage] || stage;
};

export default function ViolationResolveDialog({
  isOpen,
  onClose,
  onResolve,
  violation,
}: ViolationResolveDialogProps) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !violation) return null;

  const handleResolve = async () => {
    if (!notes.trim()) {
      setError('Please provide resolution notes');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onResolve(notes);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setNotes('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve violation');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setNotes('');
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-red-50 to-rose-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Resolve Violation</h2>
              <p className="text-sm text-slate-500">{violation.transactionId}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Violation Info */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Customer</span>
              <span className="font-medium text-slate-900">{violation.customerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Amount</span>
              <span className="font-bold text-red-700">
                {formatCurrency(parseFloat(violation.amount))}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Failed Stage</span>
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-sm font-medium">
                {getStageName(violation.failedStage)}
              </span>
            </div>
          </div>

          {/* AI Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <strong>AI Re-analysis:</strong> Upon resolution, the system will automatically
              re-analyze the transaction and re-queue it for processing in the correct stage order.
            </p>
          </div>

          {/* Resolution Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Resolution Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the resolution action taken..."
              className="w-full h-32 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
              disabled={loading || success}
            />
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t bg-slate-50">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleResolve}
            disabled={loading || success || !notes.trim()}
            className={success ? 'bg-green-600 hover:bg-green-600' : 'bg-red-600 hover:bg-red-700'}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Resolving...
              </>
            ) : success ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolved!
              </>
            ) : (
              'Resolve & Re-queue'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
