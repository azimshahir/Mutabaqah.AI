// ===========================================
// Type Definitions for Mutabaqah.ai
// ===========================================

export type UserRole = 'ADMIN' | 'OPERATOR' | 'VIEWER';

export type CommodityType = 'CPO' | 'FPOL' | 'FUPO' | 'FGLD' | 'OTHER';

export type TransactionStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'VIOLATION' | 'CANCELLED';

export type ShariahStatus = 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING_REVIEW' | 'UNDER_INVESTIGATION';

export type AuditStage = 'T0' | 'T1' | 'T2';

export type AuditEventStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export type CertificateType = 'WAKALAH_AGREEMENT' | 'QABD_CONFIRMATION' | 'LIQUIDATION_CERTIFICATE';

export type LogSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

// ===========================================
// Domain Interfaces
// ===========================================

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  transactionId: string;
  customerName: string;
  customerId: string;
  commodityType: CommodityType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  shariahStatus: ShariahStatus;
  createdAt: Date;
  updatedAt: Date;
  auditEvents?: AuditEvent[];
  aiAuditSummary?: AiAuditSummary;
}

export interface AuditEvent {
  id: string;
  transactionId: string;
  stage: AuditStage;
  stageName: string;
  status: AuditEventStatus;
  timestamp: Date;
  completedAt: Date | null;
  certificateId: string | null;
  metadata: Record<string, unknown> | null;
  certificate?: Certificate;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  type: CertificateType;
  issuedBy: string;
  issuedAt: Date;
  expiresAt: Date | null;
  data: CertificateData;
}

export interface CertificateData {
  // Wakalah Agreement
  principalName?: string;
  agentName?: string;
  wakalahPurpose?: string;
  wakalahFee?: number;

  // Qabd Confirmation
  commodityDescription?: string;
  quantity?: number;
  unitPrice?: number;
  totalValue?: number;
  bursaTradeRef?: string;

  // Liquidation
  salePrice?: number;
  buyerName?: string;
  profitMargin?: number;

  // Common
  witnessName?: string;
  witnessId?: string;
  remarks?: string;
}

export interface AuditLog {
  id: string;
  transactionId: string | null;
  eventType: string;
  message: string;
  severity: LogSeverity;
  timestamp: Date;
  metadata: Record<string, unknown> | null;
}

export interface AiAuditSummary {
  id: string;
  transactionId: string;
  summary: string;
  complianceScore: number;
  findings: AuditFinding[];
  recommendations: string[];
  generatedBy: 'simulated' | 'gemini';
  createdAt: Date;
}

export interface AuditFinding {
  stage: AuditStage;
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
}

// ===========================================
// API Request/Response Types
// ===========================================

export interface CreateTransactionRequest {
  customerName: string;
  customerId: string;
  commodityType: CommodityType;
  amount: number;
  currency?: string;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuditTimelineResponse {
  transaction: Transaction;
  events: AuditEvent[];
  aiSummary: AiAuditSummary | null;
}

// ===========================================
// UI Component Props Types
// ===========================================

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface FilterState {
  status?: TransactionStatus;
  shariahStatus?: ShariahStatus;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// ===========================================
// Audit Stage Configuration
// ===========================================

export const AUDIT_STAGE_CONFIG = {
  T0: {
    name: 'WAKALAH_AGREEMENT',
    label: 'Wakalah Agreement',
    description: 'Principal appoints agent to purchase commodity',
    certificateType: 'WAKALAH_AGREEMENT' as CertificateType,
  },
  T1: {
    name: 'QABD',
    label: 'Qabd (Asset Purchase)',
    description: 'Agent purchases commodity from Bursa',
    certificateType: 'QABD_CONFIRMATION' as CertificateType,
  },
  T2: {
    name: 'LIQUIDATE',
    label: 'Liquidate (Murabahah)',
    description: 'Commodity sold via Murabahah contract',
    certificateType: 'LIQUIDATION_CERTIFICATE' as CertificateType,
  },
} as const;

export const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  VIOLATION: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  FAILED: 'bg-red-100 text-red-800',
} as const;

export const SHARIAH_STATUS_COLORS = {
  COMPLIANT: 'bg-green-100 text-green-800',
  NON_COMPLIANT: 'bg-red-100 text-red-800',
  PENDING_REVIEW: 'bg-yellow-100 text-yellow-800',
  UNDER_INVESTIGATION: 'bg-orange-100 text-orange-800',
} as const;

export const SEVERITY_COLORS = {
  INFO: 'text-blue-600',
  WARNING: 'text-yellow-600',
  ERROR: 'text-red-600',
  CRITICAL: 'text-red-800 font-bold',
} as const;
