// Demo data for 50 Malaysian customers
// Distribution: 65% Malay (32), 23% Chinese (12), 12% Indian (6)
// Status: 55% COMPLETED, 20% PROCESSING, 15% PENDING, 10% VIOLATION
// All dates are static to avoid hydration errors

export interface DemoTransaction {
  id: string;
  transactionId: string;
  customerName: string;
  customerId: string;
  commodityType: 'CPO' | 'FPOL' | 'FUPO' | 'FGLD';
  amount: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'VIOLATION';
  shariahStatus: 'COMPLIANT' | 'PENDING_REVIEW' | 'NON_COMPLIANT';
  violationCount: number;
  createdAt: string;
  updatedAt: string;
  auditEvents: Array<{
    stage: 'T0' | 'T1' | 'T2';
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  }>;
}

// 50 Malaysian customers with unique names
export const demoTransactions: DemoTransaction[] = [
  // COMPLETED transactions (27 - 55%)
  { id: '1', transactionId: 'TXN-20260127-001ABCD', customerName: 'Ahmad Faizal bin Razak', customerId: 'CUS-001', commodityType: 'CPO', amount: '125000', status: 'COMPLETED', shariahStatus: 'COMPLIANT', violationCount: 0, createdAt: '2026-01-27T09:15:00.000Z', updatedAt: '2026-01-27T09:45:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'COMPLETED' }] },
  { id: '2', transactionId: 'TXN-20260126-002EFGH', customerName: 'Siti Aminah binti Wahab', customerId: 'CUS-002', commodityType: 'CPO', amount: '89000', status: 'COMPLETED', shariahStatus: 'COMPLIANT', violationCount: 0, createdAt: '2026-01-26T14:30:00.000Z', updatedAt: '2026-01-26T15:00:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'COMPLETED' }] },
  { id: '3', transactionId: 'TXN-20260126-003IJKL', customerName: 'Tan Wei Ming', customerId: 'CUS-003', commodityType: 'FPOL', amount: '256000', status: 'COMPLETED', shariahStatus: 'COMPLIANT', violationCount: 0, createdAt: '2026-01-26T10:20:00.000Z', updatedAt: '2026-01-26T10:50:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'COMPLETED' }] },
  { id: '4', transactionId: 'TXN-20260125-004MNOP', customerName: 'Muhammad Izzat bin Sulaiman', customerId: 'CUS-004', commodityType: 'CPO', amount: '178000', status: 'COMPLETED', shariahStatus: 'COMPLIANT', violationCount: 0, createdAt: '2026-01-25T16:45:00.000Z', updatedAt: '2026-01-25T17:15:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'COMPLETED' }] },
  { id: '5', transactionId: 'TXN-20260125-005QRST', customerName: 'Lee Kai Wen', customerId: 'CUS-005', commodityType: 'CPO', amount: '65000', status: 'COMPLETED', shariahStatus: 'COMPLIANT', violationCount: 0, createdAt: '2026-01-25T11:30:00.000Z', updatedAt: '2026-01-25T12:00:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'COMPLETED' }] },
  { id: '6', transactionId: 'TXN-20260124-006UVWX', customerName: 'Nurul Izzati binti Mohd Nor', customerId: 'CUS-006', commodityType: 'CPO', amount: '142000', status: 'COMPLETED', shariahStatus: 'COMPLIANT', violationCount: 0, createdAt: '2026-01-24T08:00:00.000Z', updatedAt: '2026-01-24T08:30:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'COMPLETED' }] },
  { id: '7', transactionId: 'TXN-20260124-007YZAB', customerName: 'Rajesh Kumar Nair', customerId: 'CUS-007', commodityType: 'FUPO', amount: '312000', status: 'COMPLETED', shariahStatus: 'COMPLIANT', violationCount: 0, createdAt: '2026-01-24T13:15:00.000Z', updatedAt: '2026-01-24T13:45:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'COMPLETED' }] },
  { id: '8', transactionId: 'TXN-20260123-008CDEF', customerName: 'Fatimah Zahra binti Othman', customerId: 'CUS-008', commodityType: 'CPO', amount: '98000', status: 'COMPLETED', shariahStatus: 'COMPLIANT', violationCount: 0, createdAt: '2026-01-23T09:45:00.000Z', updatedAt: '2026-01-23T10:15:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'COMPLETED' }] },
  { id: '9', transactionId: 'TXN-20260123-009GHIJ', customerName: 'Wong Mei Ling', customerId: 'CUS-009', commodityType: 'CPO', amount: '187000', status: 'COMPLETED', shariahStatus: 'COMPLIANT', violationCount: 0, createdAt: '2026-01-23T15:30:00.000Z', updatedAt: '2026-01-23T16:00:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'COMPLETED' }] },
  { id: '10', transactionId: 'TXN-20260122-010KLMN', customerName: 'Mohd Hafizi bin Jaafar', customerId: 'CUS-010', commodityType: 'FGLD', amount: '425000', status: 'COMPLETED', shariahStatus: 'COMPLIANT', violationCount: 0, createdAt: '2026-01-22T10:00:00.000Z', updatedAt: '2026-01-22T10:30:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'COMPLETED' }] },
  { id: '11', transactionId: 'TXN-20260122-011OPQR', customerName: 'Priya Devi Subramaniam', customerId: 'CUS-011', commodityType: 'CPO', amount: '76000', status: 'COMPLETED', shariahStatus: 'COMPLIANT', violationCount: 0, createdAt: '2026-01-22T14:20:00.000Z', updatedAt: '2026-01-22T14:50:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'COMPLETED' }] },
  { id: '12', transactionId: 'TXN-20260121-012STUV', customerName: 'Azrul Nizam bin Kassim', customerId: 'CUS-012', commodityType: 'CPO', amount: '234000', status: 'COMPLETED', shariahStatus: 'COMPLIANT', violationCount: 0, createdAt: '2026-01-21T08:30:00.000Z', updatedAt: '2026-01-21T09:00:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'COMPLETED' }] },
  { id: '13', transactionId: 'TXN-20260121-013WXYZ', customerName: 'Lim Jun Wei', customerId: 'CUS-013', commodityType: 'CPO', amount: '156000', status: 'COMPLETED', shariahStatus: 'COMPLIANT', violationCount: 0, createdAt: '2026-01-21T11:45:00.000Z', updatedAt: '2026-01-21T12:15:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'COMPLETED' }] },
  { id: '14', transactionId: 'TXN-20260120-014ABCD', customerName: 'Aina Sofiya binti Zakaria', customerId: 'CUS-014', commodityType: 'FPOL', amount: '89000', status: 'COMPLETED', shariahStatus: 'COMPLIANT', violationCount: 0, createdAt: '2026-01-20T16:00:00.000Z', updatedAt: '2026-01-20T16:30:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'COMPLETED' }] },
  { id: '15', transactionId: 'TXN-20260120-015EFGH', customerName: 'Goh Shu Hui', customerId: 'CUS-015', commodityType: 'CPO', amount: '198000', status: 'COMPLETED', shariahStatus: 'COMPLIANT', violationCount: 0, createdAt: '2026-01-20T09:30:00.000Z', updatedAt: '2026-01-20T10:00:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'COMPLETED' }] },
  { id: '16', transactionId: 'TXN-20260119-016IJKL', customerName: 'Mohan Krishna Pillai', customerId: 'CUS-016', commodityType: 'CPO', amount: '267000', status: 'COMPLETED', shariahStatus: 'COMPLIANT', violationCount: 0, createdAt: '2026-01-19T13:00:00.000Z', updatedAt: '2026-01-19T13:30:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'COMPLETED' }] },
  { id: '17', transactionId: 'TXN-20260119-017MNOP', customerName: 'Zulkarnain bin Md Yusof', customerId: 'CUS-017', commodityType: 'CPO', amount: '134000', status: 'COMPLETED', shariahStatus: 'COMPLIANT', violationCount: 0, createdAt: '2026-01-19T10:15:00.000Z', updatedAt: '2026-01-19T10:45:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'COMPLETED' }] },
  { id: '18', transactionId: 'TXN-20260118-018QRST', customerName: 'Ng Xin Yan', customerId: 'CUS-018', commodityType: 'FUPO', amount: '345000', status: 'COMPLETED', shariahStatus: 'COMPLIANT', violationCount: 0, createdAt: '2026-01-18T15:45:00.000Z', updatedAt: '2026-01-18T16:15:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'COMPLETED' }] },
  { id: '19', transactionId: 'TXN-20260118-019UVWX', customerName: 'Farah Nabila binti Azman', customerId: 'CUS-019', commodityType: 'CPO', amount: '112000', status: 'COMPLETED', shariahStatus: 'COMPLIANT', violationCount: 0, createdAt: '2026-01-18T08:20:00.000Z', updatedAt: '2026-01-18T08:50:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'COMPLETED' }] },
  { id: '20', transactionId: 'TXN-20260117-020YZAB', customerName: 'Chan Hao Ming', customerId: 'CUS-020', commodityType: 'CPO', amount: '189000', status: 'COMPLETED', shariahStatus: 'COMPLIANT', violationCount: 0, createdAt: '2026-01-17T14:00:00.000Z', updatedAt: '2026-01-17T14:30:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'COMPLETED' }] },
  { id: '21', transactionId: 'TXN-20260117-021CDEF', customerName: 'Lakshmi Menon', customerId: 'CUS-021', commodityType: 'CPO', amount: '78000', status: 'COMPLETED', shariahStatus: 'COMPLIANT', violationCount: 0, createdAt: '2026-01-17T11:30:00.000Z', updatedAt: '2026-01-17T12:00:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'COMPLETED' }] },
  { id: '22', transactionId: 'TXN-20260116-022GHIJ', customerName: 'Hakim Irwan bin Salleh', customerId: 'CUS-022', commodityType: 'FGLD', amount: '467000', status: 'COMPLETED', shariahStatus: 'COMPLIANT', violationCount: 0, createdAt: '2026-01-16T09:00:00.000Z', updatedAt: '2026-01-16T09:30:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'COMPLETED' }] },
  { id: '23', transactionId: 'TXN-20260116-023KLMN', customerName: 'Ong Li Fang', customerId: 'CUS-023', commodityType: 'CPO', amount: '145000', status: 'COMPLETED', shariahStatus: 'COMPLIANT', violationCount: 0, createdAt: '2026-01-16T16:30:00.000Z', updatedAt: '2026-01-16T17:00:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'COMPLETED' }] },
  { id: '24', transactionId: 'TXN-20260115-024OPQR', customerName: 'Syafiq Danial bin Musa', customerId: 'CUS-024', commodityType: 'CPO', amount: '223000', status: 'COMPLETED', shariahStatus: 'COMPLIANT', violationCount: 0, createdAt: '2026-01-15T10:45:00.000Z', updatedAt: '2026-01-15T11:15:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'COMPLETED' }] },
  { id: '25', transactionId: 'TXN-20260115-025STUV', customerName: 'Koh Mei Chen', customerId: 'CUS-025', commodityType: 'CPO', amount: '167000', status: 'COMPLETED', shariahStatus: 'COMPLIANT', violationCount: 0, createdAt: '2026-01-15T13:20:00.000Z', updatedAt: '2026-01-15T13:50:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'COMPLETED' }] },
  { id: '26', transactionId: 'TXN-20260114-026WXYZ', customerName: 'Amirul Hazwan bin Bakar', customerId: 'CUS-026', commodityType: 'FPOL', amount: '278000', status: 'COMPLETED', shariahStatus: 'COMPLIANT', violationCount: 0, createdAt: '2026-01-14T08:15:00.000Z', updatedAt: '2026-01-14T08:45:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'COMPLETED' }] },
  { id: '27', transactionId: 'TXN-20260114-027ABCD', customerName: 'Vijay Rajan', customerId: 'CUS-027', commodityType: 'CPO', amount: '91000', status: 'COMPLETED', shariahStatus: 'COMPLIANT', violationCount: 0, createdAt: '2026-01-14T15:00:00.000Z', updatedAt: '2026-01-14T15:30:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'COMPLETED' }] },

  // PROCESSING transactions (10 - 20%)
  { id: '28', transactionId: 'TXN-20260128-028EFGH', customerName: 'Nur Aisyah binti Kamaruddin', customerId: 'CUS-028', commodityType: 'CPO', amount: '87000', status: 'PROCESSING', shariahStatus: 'PENDING_REVIEW', violationCount: 0, createdAt: '2026-01-28T08:00:00.000Z', updatedAt: '2026-01-28T08:15:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'IN_PROGRESS' }, { stage: 'T2', status: 'PENDING' }] },
  { id: '29', transactionId: 'TXN-20260128-029IJKL', customerName: 'Yap Jian Hao', customerId: 'CUS-029', commodityType: 'CPO', amount: '198000', status: 'PROCESSING', shariahStatus: 'PENDING_REVIEW', violationCount: 0, createdAt: '2026-01-28T09:30:00.000Z', updatedAt: '2026-01-28T09:45:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'IN_PROGRESS' }] },
  { id: '30', transactionId: 'TXN-20260127-030MNOP', customerName: 'Rashidi bin Omar', customerId: 'CUS-030', commodityType: 'FUPO', amount: '356000', status: 'PROCESSING', shariahStatus: 'PENDING_REVIEW', violationCount: 0, createdAt: '2026-01-27T14:00:00.000Z', updatedAt: '2026-01-27T14:20:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'IN_PROGRESS' }, { stage: 'T2', status: 'PENDING' }] },
  { id: '31', transactionId: 'TXN-20260127-031QRST', customerName: 'Teh Shu Fang', customerId: 'CUS-031', commodityType: 'CPO', amount: '124000', status: 'PROCESSING', shariahStatus: 'PENDING_REVIEW', violationCount: 0, createdAt: '2026-01-27T16:30:00.000Z', updatedAt: '2026-01-27T16:45:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'IN_PROGRESS' }] },
  { id: '32', transactionId: 'TXN-20260126-032UVWX', customerName: 'Ganesh Murugan', customerId: 'CUS-032', commodityType: 'CPO', amount: '213000', status: 'PROCESSING', shariahStatus: 'PENDING_REVIEW', violationCount: 0, createdAt: '2026-01-26T11:00:00.000Z', updatedAt: '2026-01-26T11:15:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'IN_PROGRESS' }, { stage: 'T2', status: 'PENDING' }] },
  { id: '33', transactionId: 'TXN-20260126-033YZAB', customerName: 'Aisyatul Husna binti Ibrahim', customerId: 'CUS-033', commodityType: 'CPO', amount: '156000', status: 'PROCESSING', shariahStatus: 'PENDING_REVIEW', violationCount: 0, createdAt: '2026-01-26T13:45:00.000Z', updatedAt: '2026-01-26T14:00:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'IN_PROGRESS' }] },
  { id: '34', transactionId: 'TXN-20260125-034CDEF', customerName: 'Low Wei Jie', customerId: 'CUS-034', commodityType: 'FGLD', amount: '489000', status: 'PROCESSING', shariahStatus: 'PENDING_REVIEW', violationCount: 0, createdAt: '2026-01-25T08:30:00.000Z', updatedAt: '2026-01-25T08:45:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'IN_PROGRESS' }, { stage: 'T2', status: 'PENDING' }] },
  { id: '35', transactionId: 'TXN-20260125-035GHIJ', customerName: 'Faisal Fikri bin Karim', customerId: 'CUS-035', commodityType: 'CPO', amount: '178000', status: 'PROCESSING', shariahStatus: 'PENDING_REVIEW', violationCount: 0, createdAt: '2026-01-25T10:00:00.000Z', updatedAt: '2026-01-25T10:15:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'IN_PROGRESS' }] },
  { id: '36', transactionId: 'TXN-20260124-036KLMN', customerName: 'Cheah Hui Ling', customerId: 'CUS-036', commodityType: 'CPO', amount: '134000', status: 'PROCESSING', shariahStatus: 'PENDING_REVIEW', violationCount: 0, createdAt: '2026-01-24T14:15:00.000Z', updatedAt: '2026-01-24T14:30:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'IN_PROGRESS' }, { stage: 'T2', status: 'PENDING' }] },
  { id: '37', transactionId: 'TXN-20260124-037OPQR', customerName: 'Khairul Anwar bin Hashim', customerId: 'CUS-037', commodityType: 'CPO', amount: '245000', status: 'PROCESSING', shariahStatus: 'PENDING_REVIEW', violationCount: 0, createdAt: '2026-01-24T16:00:00.000Z', updatedAt: '2026-01-24T16:15:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'IN_PROGRESS' }] },

  // PENDING transactions (8 - 15%)
  { id: '38', transactionId: 'TXN-20260128-038STUV', customerName: 'Nazri Imran bin Hamid', customerId: 'CUS-038', commodityType: 'CPO', amount: '67000', status: 'PENDING', shariahStatus: 'PENDING_REVIEW', violationCount: 0, createdAt: '2026-01-28T07:00:00.000Z', updatedAt: '2026-01-28T07:00:00.000Z', auditEvents: [{ stage: 'T0', status: 'PENDING' }, { stage: 'T1', status: 'PENDING' }, { stage: 'T2', status: 'PENDING' }] },
  { id: '39', transactionId: 'TXN-20260128-039WXYZ', customerName: 'Ho Yan Li', customerId: 'CUS-039', commodityType: 'FPOL', amount: '289000', status: 'PENDING', shariahStatus: 'PENDING_REVIEW', violationCount: 0, createdAt: '2026-01-28T07:30:00.000Z', updatedAt: '2026-01-28T07:30:00.000Z', auditEvents: [{ stage: 'T0', status: 'PENDING' }, { stage: 'T1', status: 'PENDING' }, { stage: 'T2', status: 'PENDING' }] },
  { id: '40', transactionId: 'TXN-20260127-040ABCD', customerName: 'Balqis Athirah binti Aziz', customerId: 'CUS-040', commodityType: 'CPO', amount: '112000', status: 'PENDING', shariahStatus: 'PENDING_REVIEW', violationCount: 0, createdAt: '2026-01-27T08:00:00.000Z', updatedAt: '2026-01-27T08:00:00.000Z', auditEvents: [{ stage: 'T0', status: 'PENDING' }, { stage: 'T1', status: 'PENDING' }, { stage: 'T2', status: 'PENDING' }] },
  { id: '41', transactionId: 'TXN-20260127-041EFGH', customerName: 'Foo Ming Hao', customerId: 'CUS-041', commodityType: 'CPO', amount: '178000', status: 'PENDING', shariahStatus: 'PENDING_REVIEW', violationCount: 0, createdAt: '2026-01-27T09:00:00.000Z', updatedAt: '2026-01-27T09:00:00.000Z', auditEvents: [{ stage: 'T0', status: 'PENDING' }, { stage: 'T1', status: 'PENDING' }, { stage: 'T2', status: 'PENDING' }] },
  { id: '42', transactionId: 'TXN-20260126-042IJKL', customerName: 'Suresh Gopal', customerId: 'CUS-042', commodityType: 'CPO', amount: '234000', status: 'PENDING', shariahStatus: 'PENDING_REVIEW', violationCount: 0, createdAt: '2026-01-26T08:30:00.000Z', updatedAt: '2026-01-26T08:30:00.000Z', auditEvents: [{ stage: 'T0', status: 'PENDING' }, { stage: 'T1', status: 'PENDING' }, { stage: 'T2', status: 'PENDING' }] },
  { id: '43', transactionId: 'TXN-20260126-043MNOP', customerName: 'Irfan Hakimi bin Hassan', customerId: 'CUS-043', commodityType: 'FUPO', amount: '367000', status: 'PENDING', shariahStatus: 'PENDING_REVIEW', violationCount: 0, createdAt: '2026-01-26T09:15:00.000Z', updatedAt: '2026-01-26T09:15:00.000Z', auditEvents: [{ stage: 'T0', status: 'PENDING' }, { stage: 'T1', status: 'PENDING' }, { stage: 'T2', status: 'PENDING' }] },
  { id: '44', transactionId: 'TXN-20260125-044QRST', customerName: 'Yeoh Xin Hui', customerId: 'CUS-044', commodityType: 'CPO', amount: '145000', status: 'PENDING', shariahStatus: 'PENDING_REVIEW', violationCount: 0, createdAt: '2026-01-25T07:45:00.000Z', updatedAt: '2026-01-25T07:45:00.000Z', auditEvents: [{ stage: 'T0', status: 'PENDING' }, { stage: 'T1', status: 'PENDING' }, { stage: 'T2', status: 'PENDING' }] },
  { id: '45', transactionId: 'TXN-20260125-045UVWX', customerName: 'Maisarah Nadia binti Latif', customerId: 'CUS-045', commodityType: 'CPO', amount: '98000', status: 'PENDING', shariahStatus: 'PENDING_REVIEW', violationCount: 0, createdAt: '2026-01-25T08:15:00.000Z', updatedAt: '2026-01-25T08:15:00.000Z', auditEvents: [{ stage: 'T0', status: 'PENDING' }, { stage: 'T1', status: 'PENDING' }, { stage: 'T2', status: 'PENDING' }] },

  // VIOLATION transactions (5 - 10%)
  { id: '46', transactionId: 'TXN-20260127-046YZAB', customerName: 'Nur Hidayah binti Yusof', customerId: 'CUS-046', commodityType: 'CPO', amount: '25000', status: 'VIOLATION', shariahStatus: 'NON_COMPLIANT', violationCount: 1, createdAt: '2026-01-27T10:00:00.000Z', updatedAt: '2026-01-27T10:30:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'FAILED' }, { stage: 'T2', status: 'PENDING' }] },
  { id: '47', transactionId: 'TXN-20260126-047CDEF', customerName: 'Tan Kai Ming', customerId: 'CUS-047', commodityType: 'FPOL', amount: '180000', status: 'VIOLATION', shariahStatus: 'NON_COMPLIANT', violationCount: 2, createdAt: '2026-01-26T15:00:00.000Z', updatedAt: '2026-01-26T15:45:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'FAILED' }] },
  { id: '48', transactionId: 'TXN-20260125-048GHIJ', customerName: 'Prakash Balan', customerId: 'CUS-048', commodityType: 'CPO', amount: '75000', status: 'VIOLATION', shariahStatus: 'NON_COMPLIANT', violationCount: 1, createdAt: '2026-01-25T12:00:00.000Z', updatedAt: '2026-01-25T12:30:00.000Z', auditEvents: [{ stage: 'T0', status: 'FAILED' }, { stage: 'T1', status: 'PENDING' }, { stage: 'T2', status: 'PENDING' }] },
  { id: '49', transactionId: 'TXN-20260124-049KLMN', customerName: 'Haziq Syahmi bin Rahman', customerId: 'CUS-049', commodityType: 'CPO', amount: '312000', status: 'VIOLATION', shariahStatus: 'NON_COMPLIANT', violationCount: 1, createdAt: '2026-01-24T11:00:00.000Z', updatedAt: '2026-01-24T11:45:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'FAILED' }, { stage: 'T2', status: 'PENDING' }] },
  { id: '50', transactionId: 'TXN-20260123-050OPQR', customerName: 'Lim Shu Chen', customerId: 'CUS-050', commodityType: 'FUPO', amount: '456000', status: 'VIOLATION', shariahStatus: 'NON_COMPLIANT', violationCount: 3, createdAt: '2026-01-23T14:00:00.000Z', updatedAt: '2026-01-23T15:00:00.000Z', auditEvents: [{ stage: 'T0', status: 'COMPLETED' }, { stage: 'T1', status: 'COMPLETED' }, { stage: 'T2', status: 'FAILED' }] },
];

// Helper function to get stats
export const getDemoStats = () => {
  const completed = demoTransactions.filter(t => t.status === 'COMPLETED').length;
  const processing = demoTransactions.filter(t => t.status === 'PROCESSING').length;
  const pending = demoTransactions.filter(t => t.status === 'PENDING').length;
  const violations = demoTransactions.filter(t => t.status === 'VIOLATION').length;

  return {
    totalTransactions: demoTransactions.length,
    completedTransactions: completed,
    pendingTransactions: pending + processing,
    violationTransactions: violations,
    processingTransactions: processing,
  };
};

// Get recent transactions for dashboard (sorted by date, newest first)
export const getRecentTransactions = (limit: number = 8) => {
  return [...demoTransactions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};

// Get violations
export const getViolations = () => {
  return demoTransactions.filter(t => t.status === 'VIOLATION');
};

// Get active transactions (not completed)
export const getActiveTransactions = () => {
  return demoTransactions.filter(t => ['PENDING', 'PROCESSING', 'VIOLATION'].includes(t.status));
};

// Get completed transactions
export const getCompletedTransactions = () => {
  return demoTransactions.filter(t => t.status === 'COMPLETED');
};

// Generate live activity logs from transactions (static data)
export const generateLiveActivityLogs = () => {
  const recentTxns = getRecentTransactions(10);

  const getEventDetails = (txn: DemoTransaction) => {
    const latestEvent = txn.auditEvents.find(e =>
      e.status === 'COMPLETED' || e.status === 'IN_PROGRESS' || e.status === 'FAILED'
    );

    const eventType = latestEvent
      ? `${latestEvent.stage}_${latestEvent.status}`
      : 'SYSTEM_UPDATE';

    const messages: Record<string, string> = {
      'T0_COMPLETED': 'Wakalah agreement signed',
      'T1_COMPLETED': 'Qabd confirmed',
      'T2_COMPLETED': 'Murabahah completed',
      'T0_IN_PROGRESS': 'Processing Wakalah',
      'T1_IN_PROGRESS': 'Processing Qabd',
      'T2_IN_PROGRESS': 'Processing Liquidation',
      'T0_FAILED': 'Wakalah verification failed',
      'T1_FAILED': 'Qabd verification failed',
      'T2_FAILED': 'Liquidation verification failed',
      'T0_PENDING': 'Awaiting Wakalah',
      'T1_PENDING': 'Awaiting Qabd',
      'T2_PENDING': 'Awaiting Liquidation',
    };

    return {
      eventType,
      message: messages[eventType] || 'Transaction processing',
      severity: latestEvent?.status === 'FAILED' ? 'ERROR' : 'INFO',
    };
  };

  return recentTxns.map(txn => {
    const { eventType, message, severity } = getEventDetails(txn);
    return {
      id: `log-${txn.id}`,
      eventType,
      message,
      severity,
      timestamp: txn.updatedAt,
      customerName: txn.customerName,
      amount: txn.amount,
    };
  });
};
