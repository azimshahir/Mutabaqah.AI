// Mutabaqah.AI Integration Types

export type MutabaqahConfig = {
    apiUrl: string
    apiKey: string
}

export type TawarruqExecutionResult = {
    status: 'COMPLIANT' | 'NON_COMPLIANT'
    final_status: 'disbursed'
    amount: number
    t1_timestamp: string
    t2_timestamp: string
    t3_timestamp: string
    validation_details: {
        sequence_check: boolean
        pricing_check: boolean
        ownership_check: boolean
    }
}

export type TawarruqExecutionError = {
    error: string
    code: 'INVALID_STATUS' | 'API_ERROR' | 'VALIDATION_FAILED'
}
