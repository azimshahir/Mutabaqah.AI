export type FinancingStatus =
  | 'draft'
  | 'submitted'
  | 't1_pending'
  | 't1_validated'
  | 't2_pending'
  | 't2_validated'
  | 'approved'
  | 'blocked'
  | 'disbursed'

export type ProductType =
  | 'personal_financing_i'
  | 'home_financing_i'
  | 'vehicle_financing_i'
  | 'business_financing_i'

export type FinancingApplication = {
  id: string
  application_number: string
  customer_id: string
  product_type: ProductType
  principal_amount: number
  profit_rate: number
  tenure_months: number
  status: FinancingStatus
  // Applicant info (captured at time of application)
  applicant_name: string | null
  applicant_ic: string | null
  applicant_phone: string | null
  applicant_email: string | null
  applicant_address: string | null
  applicant_occupation: string | null
  applicant_employer: string | null
  applicant_monthly_income: number | null
  created_at: string
  updated_at: string
}

export type TransactionType = 'T1_PURCHASE' | 'T2_SALE'

export type TransactionStatus = 'pending' | 'validated' | 'rejected'

export type TawarruqTransaction = {
  id: string
  financing_id: string
  transaction_type: TransactionType
  commodity_id: string
  commodity_type: string
  quantity: number
  unit_price: number
  total_amount: number
  platform_reference: string
  timestamp: string
  sequence_number: number
  blockchain_tx_hash: string | null
  status: TransactionStatus
  created_at: string
}

export type ValidationResult = {
  id: string
  financing_id: string
  validation_type: 'sequence' | 'pricing' | 'ownership' | 'certificate'
  result: 'pass' | 'fail' | 'warning'
  details: Record<string, unknown>
  validated_at: string
  validator_version: string
}

export type AuditLog = {
  id: string
  financing_id: string
  action: string
  actor_id: string
  actor_type: 'system' | 'user' | 'api'
  details: Record<string, unknown>
  blockchain_proof: string | null
  created_at: string
}
