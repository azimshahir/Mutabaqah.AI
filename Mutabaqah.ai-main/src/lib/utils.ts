import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

// ===========================================
// Tailwind CSS Utilities
// ===========================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ===========================================
// Date Formatting
// ===========================================

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd MMM yyyy');
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd MMM yyyy, HH:mm:ss');
}

export function formatTimeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatTimestamp(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'HH:mm:ss.SSS');
}

// ===========================================
// Currency Formatting
// ===========================================

export function formatCurrency(amount: number, currency: string = 'MYR'): string {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-MY').format(num);
}

// ===========================================
// ID Generation
// ===========================================

export function generateTransactionId(): string {
  const date = format(new Date(), 'yyyyMMdd');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${date}-${random}`;
}

export function generateCertificateNumber(type: string): string {
  const date = format(new Date(), 'yyyyMMdd');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const prefix = type.substring(0, 3).toUpperCase();
  return `CERT-${prefix}-${date}-${random}`;
}

// ===========================================
// Validation Helpers
// ===========================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidAmount(amount: number): boolean {
  return amount > 0 && Number.isFinite(amount);
}

// ===========================================
// String Utilities
// ===========================================

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ===========================================
// API Response Helpers
// ===========================================

export function successResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    message,
  };
}

export function errorResponse(message: string, code?: string) {
  return {
    success: false,
    error: {
      message,
      code,
    },
  };
}

// ===========================================
// Delay Utility (for simulating async operations)
// ===========================================

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ===========================================
// Stage Name Mapping
// ===========================================

export function getStageName(stage: string): string {
  const stageNames: Record<string, string> = {
    T0: 'Wakalah Agreement',
    T1: 'Qabd (Asset Purchase)',
    T2: 'Liquidate (Murabahah)',
  };
  return stageNames[stage] || stage;
}

export function getStageDescription(stage: string): string {
  const descriptions: Record<string, string> = {
    T0: 'Principal appoints agent to purchase commodity on their behalf',
    T1: 'Agent purchases commodity from Bursa Malaysia',
    T2: 'Commodity sold via Murabahah contract to complete Tawarruq',
  };
  return descriptions[stage] || '';
}
