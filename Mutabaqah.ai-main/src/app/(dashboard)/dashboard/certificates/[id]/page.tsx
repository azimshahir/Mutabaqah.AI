'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Shield, FileCheck, Calendar, Building, CheckCircle, Printer } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';

interface Certificate {
  id: string;
  certificateNumber: string;
  type: string;
  issuedBy: string;
  issuedAt: string;
  formattedType: string;
  details: string[];
  auditEvent?: {
    stage: string;
    transaction: {
      transactionId: string;
      customerName: string;
    };
  };
}

// Demo certificates for T0, T1, T2
const demoCertificates: Record<string, Certificate> = {
  'cert-1': {
    id: 'cert-1',
    certificateNumber: 'CERT-WAK-20250122-001',
    type: 'WAKALAH_AGREEMENT',
    issuedBy: 'Bursa Suq As Sila',
    issuedAt: '2025-01-22T10:35:00.000Z',
    formattedType: 'Wakalah Agreement',
    details: [
      'Principal: Ahmad bin Abdullah',
      'Agent: Bursa Suq As Sila',
      'Purpose: Purchase of CPO',
    ],
    auditEvent: {
      stage: 'T0',
      transaction: {
        transactionId: 'TXN-20250122-ABC123',
        customerName: 'Ahmad bin Abdullah',
      },
    },
  },
  'cert-2': {
    id: 'cert-2',
    certificateNumber: 'CERT-QAB-20250122-002',
    type: 'QABD_CONFIRMATION',
    issuedBy: 'Bursa Suq As Sila',
    issuedAt: '2025-01-22T10:45:00.000Z',
    formattedType: 'Qabd Confirmation',
    details: [
      'Commodity: Crude Palm Oil (CPO)',
      'Quantity: 50 metric tons',
      'Purchase Price: MYR 50,000',
      'Trade Reference: CPO-20250122-001',
    ],
    auditEvent: {
      stage: 'T1',
      transaction: {
        transactionId: 'TXN-20250122-ABC123',
        customerName: 'Ahmad bin Abdullah',
      },
    },
  },
  'cert-3': {
    id: 'cert-3',
    certificateNumber: 'CERT-LIQ-20250122-003',
    type: 'LIQUIDATION_CERTIFICATE',
    issuedBy: 'Bursa Suq As Sila',
    issuedAt: '2025-01-22T10:55:00.000Z',
    formattedType: 'Liquidation Confirmation',
    details: [
      'Sale Method: Murabahah',
      'Buyer: Third Party Buyer',
      'Sale Price: MYR 51,250',
      'Profit Margin: 2.5%',
    ],
    auditEvent: {
      stage: 'T2',
      transaction: {
        transactionId: 'TXN-20250122-ABC123',
        customerName: 'Ahmad bin Abdullah',
      },
    },
  },
  'cert-4': {
    id: 'cert-4',
    certificateNumber: 'CERT-WAK-20250122-004',
    type: 'WAKALAH_AGREEMENT',
    issuedBy: 'Bursa Suq As Sila',
    issuedAt: '2025-01-22T09:20:00.000Z',
    formattedType: 'Wakalah Agreement',
    details: [
      'Principal: Fatimah binti Hassan',
      'Agent: Bursa Suq As Sila',
      'Purpose: Purchase of CPO',
    ],
    auditEvent: {
      stage: 'T0',
      transaction: {
        transactionId: 'TXN-20250122-DEF456',
        customerName: 'Fatimah binti Hassan',
      },
    },
  },
  'cert-5': {
    id: 'cert-5',
    certificateNumber: 'CERT-WAK-20250120-005',
    type: 'WAKALAH_AGREEMENT',
    issuedBy: 'Bursa Suq As Sila',
    issuedAt: '2025-01-20T11:25:00.000Z',
    formattedType: 'Wakalah Agreement',
    details: [
      'Principal: Aminah binti Yusof',
      'Agent: Bursa Suq As Sila',
      'Purpose: Purchase of CPO',
    ],
    auditEvent: {
      stage: 'T0',
      transaction: {
        transactionId: 'TXN-20250120-JKL012',
        customerName: 'Aminah binti Yusof',
      },
    },
  },
  'cert-6': {
    id: 'cert-6',
    certificateNumber: 'CERT-WAK-20250119-006',
    type: 'WAKALAH_AGREEMENT',
    issuedBy: 'Bursa Suq As Sila',
    issuedAt: '2025-01-19T16:05:00.000Z',
    formattedType: 'Wakalah Agreement',
    details: [
      'Principal: Ibrahim Hassan',
      'Agent: Bursa Suq As Sila',
      'Purpose: Purchase of CPO',
    ],
    auditEvent: {
      stage: 'T0',
      transaction: {
        transactionId: 'TXN-20250119-MNO345',
        customerName: 'Ibrahim Hassan',
      },
    },
  },
  'cert-7': {
    id: 'cert-7',
    certificateNumber: 'CERT-QAB-20250119-007',
    type: 'QABD_CONFIRMATION',
    issuedBy: 'Bursa Suq As Sila',
    issuedAt: '2025-01-19T16:15:00.000Z',
    formattedType: 'Qabd Confirmation',
    details: [
      'Commodity: Crude Palm Oil (CPO)',
      'Quantity: 120 metric tons',
      'Purchase Price: MYR 120,000',
      'Trade Reference: CPO-20250119-002',
    ],
    auditEvent: {
      stage: 'T1',
      transaction: {
        transactionId: 'TXN-20250119-MNO345',
        customerName: 'Ibrahim Hassan',
      },
    },
  },
  'cert-8': {
    id: 'cert-8',
    certificateNumber: 'CERT-LIQ-20250119-008',
    type: 'LIQUIDATION_CERTIFICATE',
    issuedBy: 'Bursa Suq As Sila',
    issuedAt: '2025-01-19T16:25:00.000Z',
    formattedType: 'Liquidation Confirmation',
    details: [
      'Sale Method: Murabahah',
      'Buyer: Third Party Buyer',
      'Sale Price: MYR 123,000',
      'Profit Margin: 2.5%',
    ],
    auditEvent: {
      stage: 'T2',
      transaction: {
        transactionId: 'TXN-20250119-MNO345',
        customerName: 'Ibrahim Hassan',
      },
    },
  },
};

export default function CertificateViewerPage() {
  const params = useParams();
  const id = params.id as string;
  const [certificate, setCertificate] = useState<Certificate>(demoCertificates[id] || demoCertificates['cert-1']);
  const [loading, setLoading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set demo certificate based on ID
    if (demoCertificates[id]) {
      setCertificate(demoCertificates[id]);
    }
    fetchCertificate();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const fetchCertificate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/certificates/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCertificate(data);
      }
    } catch (error) {
      console.error('Failed to fetch certificate:', error);
      // Fallback to demo data
      if (demoCertificates[id]) {
        setCertificate(demoCertificates[id]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'T0':
        return 'Wakalah Agreement';
      case 'T1':
        return 'Qabd Confirmation';
      case 'T2':
        return 'Liquidation';
      default:
        return stage;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'WAKALAH_AGREEMENT':
        return 'bg-emerald-600';
      case 'QABD_CONFIRMATION':
        return 'bg-blue-600';
      case 'LIQUIDATION_CERTIFICATE':
      case 'LIQUIDATION_CONFIRMATION':
        return 'bg-violet-600';
      default:
        return 'bg-slate-600';
    }
  };

  const getBackLink = () => {
    // Map certificate ID to transaction ID
    const certToTransaction: Record<string, string> = {
      'cert-1': '1', 'cert-2': '1', 'cert-3': '1',
      'cert-4': '2',
      'cert-5': '4',
      'cert-6': '5', 'cert-7': '5', 'cert-8': '5',
    };
    const txnId = certToTransaction[id] || '1';
    return `/dashboard/transactions/${txnId}/audit`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading certificate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto print:max-w-none print:m-0 print:p-0" id="certificate-page">
      {/* Back Button */}
      <Link
        href={getBackLink()}
        className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors print:hidden"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to Audit
      </Link>

      {/* Certificate Card */}
      <Card ref={certificateRef} className="bg-white border border-slate-200 shadow-sm overflow-hidden print:shadow-none print:border print:border-slate-300 print:w-full print:max-w-[190mm] print:mx-auto" id="certificate-print">
        {/* Header */}
        <div className={`${getTypeColor(certificate.type)} p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <FileCheck className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">{certificate.formattedType}</h1>
                <p className="text-white/70 text-sm mt-0.5">Official Certificate</p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-0 hover:bg-white/30">
              Stage {certificate.auditEvent?.stage}
            </Badge>
          </div>
        </div>

        {/* Certificate Content */}
        <CardContent className="p-0">
          {/* Certificate Body */}
          <div className="p-8">
            {/* Bursa Header */}
            <div className="text-center pb-6 border-b border-slate-200">
              <div className="flex items-center justify-center mb-4">
                <Image
                  src="/bursa-suq-al-sila-logo.png"
                  alt="Bursa Suq Al-Sila"
                  width={220}
                  height={60}
                  className="object-contain"
                />
              </div>
              <p className="text-xs text-slate-400 uppercase tracking-widest">
                Certificate of {certificate.formattedType}
              </p>
            </div>

            {/* Certificate Number */}
            <div className="py-6 text-center border-b border-slate-100">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Certificate Number</p>
              <p className="font-mono text-lg font-semibold text-slate-900">{certificate.certificateNumber}</p>
            </div>

            {/* Transaction Info */}
            {certificate.auditEvent && (
              <div className="py-6 grid grid-cols-2 gap-6 border-b border-slate-100">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Transaction Reference</p>
                  <p className="font-medium text-slate-900">{certificate.auditEvent.transaction.transactionId}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Customer Name</p>
                  <p className="font-medium text-slate-900">{certificate.auditEvent.transaction.customerName}</p>
                </div>
              </div>
            )}

            {/* Certificate Details */}
            <div className="py-6 border-b border-slate-100">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-4">Certificate Details</p>
              <div className="space-y-3">
                {certificate.details.map((detail, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700">{detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Issue Info */}
            <div className="py-6 grid grid-cols-2 gap-6 border-b border-slate-100">
              <div className="flex items-start gap-3">
                <Building className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Issued By</p>
                  <p className="text-sm font-medium text-slate-900">{certificate.issuedBy}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Issue Date</p>
                  <p className="text-sm font-medium text-slate-900">{formatDateTime(certificate.issuedAt)}</p>
                </div>
              </div>
            </div>

            {/* Verification Stamp */}
            <div className="pt-8 pb-4 text-center">
              <div className="inline-flex flex-col items-center">
                <div className="w-24 h-24 border-4 border-emerald-500 border-dashed rounded-full flex items-center justify-center mb-3">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex flex-col items-center justify-center">
                    <Shield className="h-6 w-6 text-emerald-600 mb-1" />
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Verified</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Shariah Compliant Certificate</p>
                <p className="text-[10px] text-slate-400 mt-1">This certificate is digitally verified</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-center print:hidden">
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print / Save PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 15mm 10mm;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            font-size: 12pt !important;
          }

          /* Hide sidebar, header, and navigation */
          aside,
          header,
          nav,
          .lg\\:pl-72,
          [class*="sidebar"],
          [class*="fixed inset-y-0"] {
            display: none !important;
            width: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Reset main container */
          .lg\\:pl-72,
          main {
            padding-left: 0 !important;
            margin: 0 !important;
          }

          /* Certificate container */
          #certificate-page {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Certificate card - A4 optimized */
          #certificate-print {
            display: block !important;
            width: 100% !important;
            max-width: 180mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: 1px solid #94a3b8 !important;
            border-radius: 4px !important;
            page-break-inside: avoid !important;
          }

          /* Scale content for better fit */
          #certificate-print > div {
            padding: 5mm !important;
          }

          #certificate-print .p-6 {
            padding: 4mm !important;
          }

          #certificate-print .p-8 {
            padding: 5mm !important;
          }

          #certificate-print .py-6 {
            padding-top: 3mm !important;
            padding-bottom: 3mm !important;
          }

          #certificate-print .text-xl {
            font-size: 14pt !important;
          }

          #certificate-print .text-lg {
            font-size: 12pt !important;
          }

          #certificate-print .text-sm {
            font-size: 10pt !important;
          }

          #certificate-print .text-xs {
            font-size: 8pt !important;
          }

          /* Verification stamp */
          #certificate-print .w-24 {
            width: 20mm !important;
            height: 20mm !important;
          }

          #certificate-print .w-20 {
            width: 17mm !important;
            height: 17mm !important;
          }
        }
      `}</style>
    </div>
  );
}
