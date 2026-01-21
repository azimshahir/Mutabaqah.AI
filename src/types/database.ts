export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      financing_applications: {
        Row: {
          id: string
          application_number: string
          customer_id: string
          product_type: string
          principal_amount: number
          profit_rate: number
          tenure_months: number
          status: string
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
        Insert: {
          id?: string
          application_number: string
          customer_id: string
          product_type: string
          principal_amount: number
          profit_rate: number
          tenure_months: number
          status?: string
          applicant_name?: string
          applicant_ic?: string
          applicant_phone?: string
          applicant_email?: string
          applicant_address?: string
          applicant_occupation?: string
          applicant_employer?: string
          applicant_monthly_income?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          application_number?: string
          customer_id?: string
          product_type?: string
          principal_amount?: number
          profit_rate?: number
          tenure_months?: number
          status?: string
          applicant_name?: string
          applicant_ic?: string
          applicant_phone?: string
          applicant_email?: string
          applicant_address?: string
          applicant_occupation?: string
          applicant_employer?: string
          applicant_monthly_income?: number
          created_at?: string
          updated_at?: string
        }
      }
      tawarruq_transactions: {
        Row: {
          id: string
          financing_id: string
          transaction_type: string
          commodity_id: string
          commodity_type: string
          quantity: number
          unit_price: number
          total_amount: number
          platform_reference: string
          timestamp: string
          sequence_number: number
          blockchain_tx_hash: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          financing_id: string
          transaction_type: string
          commodity_id: string
          commodity_type: string
          quantity: number
          unit_price: number
          total_amount: number
          platform_reference: string
          timestamp: string
          sequence_number: number
          blockchain_tx_hash?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          financing_id?: string
          transaction_type?: string
          commodity_id?: string
          commodity_type?: string
          quantity?: number
          unit_price?: number
          total_amount?: number
          platform_reference?: string
          timestamp?: string
          sequence_number?: number
          blockchain_tx_hash?: string | null
          status?: string
          created_at?: string
        }
      }
      validation_results: {
        Row: {
          id: string
          financing_id: string
          validation_type: string
          result: string
          details: Json
          validated_at: string
          validator_version: string
        }
        Insert: {
          id?: string
          financing_id: string
          validation_type: string
          result: string
          details: Json
          validated_at?: string
          validator_version: string
        }
        Update: {
          id?: string
          financing_id?: string
          validation_type?: string
          result?: string
          details?: Json
          validated_at?: string
          validator_version?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          financing_id: string
          action: string
          actor_id: string
          actor_type: string
          details: Json
          blockchain_proof: string | null
          created_at: string
        }
        Insert: {
          id?: string
          financing_id: string
          action: string
          actor_id: string
          actor_type: string
          details: Json
          blockchain_proof?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          financing_id?: string
          action?: string
          actor_id?: string
          actor_type?: string
          details?: Json
          blockchain_proof?: string | null
          created_at?: string
        }
      }
      blockchain_records: {
        Row: {
          id: string
          financing_id: string
          record_type: string
          zetrix_tx_hash: string
          block_number: number
          payload_hash: string
          created_at: string
        }
        Insert: {
          id?: string
          financing_id: string
          record_type: string
          zetrix_tx_hash: string
          block_number: number
          payload_hash: string
          created_at?: string
        }
        Update: {
          id?: string
          financing_id?: string
          record_type?: string
          zetrix_tx_hash?: string
          block_number?: number
          payload_hash?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
