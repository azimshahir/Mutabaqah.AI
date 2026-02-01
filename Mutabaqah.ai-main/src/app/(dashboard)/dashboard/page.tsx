'use client';

import { Suspense, useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus, Search, Eye, Filter, Download, RefreshCw, ChevronRight, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import ViolationResolveDialog from '@/components/violations/ViolationResolveDialog';

// Transaction interface matching database schema
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
  violationCount: number;
  createdAt: string;
  updatedAt: string;
  auditEvents: Array<{
    id: string;
    stage: string;
    stageName: string;
    status: string;
    timestamp: string;
  }>;
}

// Live activity interface
interface LiveActivity {
  customerName: string;
  eventType: string;
  message: string;
  amount: string;
}

type TabType = 'active' | 'completed';

// Loading fallback for Suspense
function TransactionsLoading() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
    </div>
  );
}

// Main component wrapped in Suspense
export default function TransactionsPage() {
  return (
    <Suspense fallback={<TransactionsLoading />}>
      <TransactionsContent />
    </Suspense>
  );
}

function TransactionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || '';

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [currentLiveIndex, setCurrentLiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>(
    initialStatus === 'COMPLETED' || initialStatus === 'CANCELLED' ? 'completed' : 'active'
  );

  // Fetch transactions from API
  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch('/api/transactions?pageSize=100');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Violation dialog
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<{
    id: string;
    transactionId: string;
    customerName: string;
    amount: string;
    failedStage: string;
  } | null>(null);
  const [resolving, setResolving] = useState(false);

  // Debounced search value
  const debouncedSearch = useDebounce(search, 300);

  // Update status filter from URL
  useEffect(() => {
    const status = searchParams.get('status');
    if (status) {
      setStatusFilter(status);
      if (status === 'COMPLETED' || status === 'CANCELLED') {
        setActiveTab('completed');
      } else {
        setActiveTab('active');
      }
    }
  }, [searchParams]);

  // Real-time live sync effect - cycles through transactions every 2 seconds
  useEffect(() => {
    if (transactions.length > 0) {
      const interval = setInterval(() => {
        setCurrentLiveIndex((prev) => (prev + 1) % Math.min(transactions.length, 8));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [transactions.length]);

  // Generate live activity from transactions
  const liveActivityLogs: LiveActivity[] = useMemo(() => {
    return transactions.slice(0, 8).map((txn) => {
      const latestEvent = txn.auditEvents?.find((e) => e.status === 'COMPLETED' || e.status === 'FAILED' || e.status === 'IN_PROGRESS');
      const eventType = latestEvent ? `${latestEvent.stage}_${latestEvent.status}` : 'PENDING';
      const messages: Record<string, string> = {
        'T0_COMPLETED': 'Wakalah agreement signed',
        'T1_COMPLETED': 'Qabd confirmed',
        'T2_COMPLETED': 'Murabahah completed',
        'T0_IN_PROGRESS': 'Processing Wakalah',
        'T1_IN_PROGRESS': 'Processing Qabd',
        'T2_IN_PROGRESS': 'Processing Liquidation',
        'T0_FAILED': 'Wakalah failed',
        'T1_FAILED': 'Qabd failed',
        'T2_FAILED': 'Liquidation failed',
      };
      return {
        customerName: txn.customerName,
        eventType,
        message: messages[eventType] || 'Processing...',
        amount: txn.amount,
      };
    });
  }, [transactions]);

  const currentLiveCustomer = liveActivityLogs[currentLiveIndex]?.customerName;

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  // Memoized filtered transactions based on debounced search
  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      const matchesSearch =
        txn.customerName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        txn.transactionId.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        txn.customerId.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesStatus = !statusFilter || txn.status === statusFilter;

      // Tab filtering
      const isActive = ['PENDING', 'PROCESSING', 'VIOLATION'].includes(txn.status);
      const isCompleted = ['COMPLETED', 'CANCELLED'].includes(txn.status);
      const matchesTab = activeTab === 'active' ? isActive : isCompleted;

      return matchesSearch && matchesStatus && matchesTab;
    });
  }, [transactions, debouncedSearch, statusFilter, activeTab]);

  // Calculate stats from real transactions
  const stats = useMemo(() => {
    const totalTransactions = transactions.length;
    const completedTransactions = transactions.filter(t => t.status === 'COMPLETED').length;
    const processingTransactions = transactions.filter(t => t.status === 'PROCESSING').length;
    const pendingTransactions = transactions.filter(t => t.status === 'PENDING').length;
    const violationTransactions = transactions.filter(t => t.status === 'VIOLATION').length;
    return {
      totalTransactions,
      completedTransactions,
      processingTransactions,
      pendingTransactions,
      violationTransactions,
    };
  }, [transactions]);

  const getStatusConfig = useCallback((status: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
      PROCESSING: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Processing' },
      PENDING: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
      VIOLATION: { bg: 'bg-red-100', text: 'text-red-700', label: 'Violation' },
      CANCELLED: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Cancelled' },
    };
    return config[status] || { bg: 'bg-slate-100', text: 'text-slate-700', label: status };
  }, []);

  const getShariahConfig = useCallback((status: string) => {
    const config: Record<string, { bg: string; text: string; dot: string; label: string }> = {
      COMPLIANT: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', label: 'Compliant' },
      PENDING_REVIEW: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Pending Review' },
      NON_COMPLIANT: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Non-Compliant' },
      UNDER_INVESTIGATION: { bg: 'bg-slate-50', text: 'text-slate-700', dot: 'bg-slate-500', label: 'Investigating' },
    };
    return config[status] || { bg: 'bg-slate-50', text: 'text-slate-700', dot: 'bg-slate-500', label: status };
  }, []);

  const getProgressIndicator = useCallback((events: Array<{ stage: string; status: string }>) => {
    return (
      <div className="flex items-center gap-1">
        {events.map((event) => {
          let bgColor = 'bg-slate-200';
          if (event.status === 'COMPLETED') {
            bgColor = 'bg-green-500';
          } else if (event.status === 'IN_PROGRESS') {
            bgColor = 'bg-blue-500';
          } else if (event.status === 'FAILED') {
            bgColor = 'bg-red-500';
          }
          return (
            <div key={event.stage} className={`w-8 h-2 rounded-full ${bgColor} ${event.status === 'IN_PROGRESS' ? 'animate-pulse' : ''}`} />
          );
        })}
      </div>
    );
  }, []);

  const handleResolveViolation = useCallback((txn: Transaction) => {
    const failedEvent = txn.auditEvents.find((e) => e.status === 'FAILED');
    setSelectedViolation({
      id: txn.id,
      transactionId: txn.transactionId,
      customerName: txn.customerName,
      amount: txn.amount,
      failedStage: failedEvent?.stage || 'Unknown',
    });
    setResolveDialogOpen(true);
  }, []);

  const handleResolve = async (notes: string) => {
    if (!selectedViolation) return;

    setResolving(true);
    // Simulate resolve delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Resolved violation:', { notes, violation: selectedViolation });
    setResolving(false);
    setResolveDialogOpen(false);
    setSelectedViolation(null);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setStatusFilter('');
    // Update URL without the status param when changing tabs
    router.push('/dashboard/transactions');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Transactions</h1>
          <p className="text-slate-500 mt-1">Manage and monitor Tawarruq commodity purchases</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRefresh} loading={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/dashboard/transactions/new">
            <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/25">
              <Plus className="h-4 w-4 mr-2" />
              New Transaction
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Total</p>
          <p className="text-2xl font-bold text-slate-900">{stats.totalTransactions}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <p className="text-sm text-green-600">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completedTransactions}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <p className="text-sm text-blue-600">Processing</p>
          <p className="text-2xl font-bold text-blue-600">{stats.processingTransactions}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <p className="text-sm text-amber-600">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{stats.pendingTransactions}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <p className="text-sm text-red-600">Violations</p>
          <p className="text-2xl font-bold text-red-600">{stats.violationTransactions}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => handleTabChange('active')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'active'
              ? 'border-green-500 text-green-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Active
          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-slate-100">
            {transactions.filter(t => ['PENDING', 'PROCESSING', 'VIOLATION'].includes(t.status)).length}
          </span>
        </button>
        <button
          onClick={() => handleTabChange('completed')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'completed'
              ? 'border-green-500 text-green-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Completed
          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-slate-100">
            {stats.completedTransactions}
          </span>
        </button>
      </div>

      {/* Filters */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by customer name, ID, or transaction ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-11 bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>
            <div className="flex gap-2">
              <select
                className="px-4 py-2 h-11 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                {activeTab === 'active' ? (
                  <>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="VIOLATION">Violation</option>
                  </>
                ) : (
                  <>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </>
                )}
              </select>
              <Button variant="outline" size="icon" className="h-11 w-11">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Activity Banner - Only show on Active tab */}
      {activeTab === 'active' && liveActivityLogs[currentLiveIndex] && (
        <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 shadow-lg overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/30">
                    {liveActivityLogs[currentLiveIndex].customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Live Activity</span>
                  </div>
                  <p className="font-semibold text-slate-900">{liveActivityLogs[currentLiveIndex].customerName}</p>
                  <p className="text-sm text-slate-600">{liveActivityLogs[currentLiveIndex].message}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 mb-1 inline-block">
                  {liveActivityLogs[currentLiveIndex].eventType}
                </span>
                <p className="text-xl font-bold text-emerald-700">{formatCurrency(parseFloat(liveActivityLogs[currentLiveIndex].amount))}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions List */}
      <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {activeTab === 'active' && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
                {activeTab === 'active' ? 'Active Transactions' : 'Completed Transactions'}
              </CardTitle>
              <CardDescription>{filteredTransactions.length} transactions found</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTransactions.length === 0 ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <p className="text-slate-500">No transactions found</p>
                <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTransactions.map((txn) => {
                const statusConfig = getStatusConfig(txn.status);
                const shariahConfig = getShariahConfig(txn.shariahStatus);
                const isLive = activeTab === 'active' && txn.customerName === currentLiveCustomer;
                const isViolation = txn.status === 'VIOLATION';

                return (
                  <div
                    key={txn.id}
                    className={`flex items-center gap-4 p-4 transition-all duration-500 group ${
                      isLive
                        ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-500 shadow-md'
                        : isViolation
                        ? 'bg-gradient-to-r from-red-50/50 to-rose-50/50 border-l-4 border-red-400'
                        : 'hover:bg-slate-50 border-l-4 border-transparent'
                    }`}
                  >
                    {/* Avatar */}
                    <Link
                      href={`/dashboard/transactions/${txn.id}/audit`}
                      className={`relative hidden sm:flex w-12 h-12 rounded-xl items-center justify-center text-white font-bold shadow-lg ${
                        isLive
                          ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-500/30'
                          : isViolation
                          ? 'bg-gradient-to-br from-red-400 to-rose-500 shadow-red-500/30'
                          : 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-green-500/20'
                      }`}
                    >
                      {txn.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      {isLive && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                      )}
                    </Link>

                    {/* Main Info */}
                    <Link href={`/dashboard/transactions/${txn.id}/audit`} className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <p className={`font-semibold transition-colors ${isLive ? 'text-emerald-700' : isViolation ? 'text-red-700' : 'text-slate-900 group-hover:text-green-600'}`}>
                          {txn.customerName}
                        </p>
                        {isLive ? (
                          <Badge variant="success" className="animate-pulse">LIVE</Badge>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                            {statusConfig.label}
                          </span>
                        )}
                        {isViolation && txn.violationCount && txn.violationCount > 1 && (
                          <Badge variant="error" className="text-xs">{txn.violationCount}x</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="font-mono">{txn.transactionId}</span>
                        <span className="hidden md:inline">•</span>
                        <span className="hidden md:inline">{txn.customerId}</span>
                        <span className="hidden lg:inline">•</span>
                        <span className="hidden lg:inline">{txn.commodityType}</span>
                      </div>
                    </Link>

                    {/* Progress */}
                    <div className="hidden md:block">
                      <p className="text-xs text-slate-400 mb-1">Progress</p>
                      {getProgressIndicator(txn.auditEvents)}
                    </div>

                    {/* Shariah Status */}
                    <div className="hidden lg:block text-center">
                      <p className="text-xs text-slate-400 mb-1">Shariah</p>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${shariahConfig.bg} ${shariahConfig.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${shariahConfig.dot}`} />
                        {shariahConfig.label}
                      </span>
                    </div>

                    {/* Amount & Date */}
                    <div className="text-right">
                      <p className={`font-bold ${isLive ? 'text-emerald-700' : isViolation ? 'text-red-700' : 'text-slate-900'}`}>{formatCurrency(parseFloat(txn.amount))}</p>
                      <p className="text-xs text-slate-400">{formatDateTime(txn.createdAt)}</p>
                    </div>

                    {/* Action */}
                    <div className="flex items-center gap-2">
                      {isViolation && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            handleResolveViolation(txn);
                          }}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Resolve
                        </Button>
                      )}
                      <Link href={`/dashboard/transactions/${txn.id}/audit`}>
                        <Button variant="ghost" size="icon" className={`h-9 w-9 ${isLive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-green-600'}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <ChevronRight className={`h-4 w-4 transition-colors ${isLive ? 'text-emerald-500' : 'text-slate-300 group-hover:text-green-500'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Violation Resolve Dialog */}
      <ViolationResolveDialog
        isOpen={resolveDialogOpen}
        onClose={() => {
          setResolveDialogOpen(false);
          setSelectedViolation(null);
        }}
        onResolve={handleResolve}
        violation={selectedViolation}
      />
    </div>
  );
}
