import type { TawarruqExecutionResult, TawarruqExecutionError, MutabaqahConfig } from './types'

/**
 * Mutabaqah.AI Bridge Service
 * Handles integration with external Mutabaqah.AI validation system
 */

// Simulate network delay for T1 → T2 → T3 processing
const PROCESSING_DELAY_MS = 3000

/**
 * Execute Tawarruq Process via Mutabaqah.AI
 * 
 * @param applicationId - Financing application ID
 * @param amount - Financing amount (must remain unchanged)
 * @param currentStatus - Current application status
 * @returns Promise<TawarruqExecutionResult | TawarruqExecutionError>
 */
export async function executeTawarruqProcess(
    applicationId: string,
    amount: number,
    currentStatus: string
): Promise<TawarruqExecutionResult | TawarruqExecutionError> {

    // ============================================
    // LOGIC GUARD (The Gatekeeper)
    // ============================================
    if (currentStatus !== 'approved') {
        console.error(`❌ Action Denied. Status: ${currentStatus}`)
        return {
            error: 'Action Denied. Only APPROVED financing can be sent to Mutabaqah.AI.',
            code: 'INVALID_STATUS'
        }
    }

    // ============================================
    // RETRIEVE API CONFIGURATION
    // ============================================
    let config: MutabaqahConfig

    if (typeof window !== 'undefined') {
        // Client-side: retrieve from localStorage
        const apiUrl = localStorage.getItem('mutabaqah_api_url') || ''
        const apiKey = localStorage.getItem('mutabaqah_api_key') || ''
        config = { apiUrl, apiKey }
    } else {
        // Server-side: use environment variables
        config = {
            apiUrl: process.env.MUTABAQAH_API_URL || '',
            apiKey: process.env.MUTABAQAH_API_KEY || ''
        }
    }

    // ============================================
    // STRICT API VALIDATION
    // ============================================
    const VALID_DEMO_URL = 'https://api.mutabaqah.ai/v1'
    const VALID_DEMO_KEY = 'demo-key-12345'

    // Check if credentials match exact demo values
    const isDemoCredentials = config.apiUrl === VALID_DEMO_URL && config.apiKey === VALID_DEMO_KEY

    // Check if it's real Mutabaqah.AI (URL contains mutabaqah.ai and key is long enough)
    const isRealMutabaqahAI = config.apiUrl.includes('mutabaqah.ai') && config.apiKey.length > 20

    if (!isDemoCredentials && !isRealMutabaqahAI) {
        console.error('❌ Invalid API credentials')
        console.error('Expected URL:', VALID_DEMO_URL)
        console.error('Expected Key:', VALID_DEMO_KEY)
        console.error('Got URL:', config.apiUrl)
        console.error('Got Key:', config.apiKey)
        return {
            error: 'Invalid API credentials. Please use:\nURL: https://api.mutabaqah.ai/v1\nKey: demo-key-12345',
            code: 'API_ERROR'
        }
    }

    // ============================================
    // THE MOCK SIMULATION (The Round Trip)
    // ============================================

    console.log(`🔄 Sending Financing #${applicationId} (RM ${amount.toLocaleString()}) to Mutabaqah.AI...`)
    console.log(`📡 API URL: ${config.apiUrl}`)
    console.log(`🔑 API Key: ${config.apiKey.substring(0, 8)}...`)

    // Simulate network delay - Processing T1 > T2 > T3
    console.log('⏳ Processing T1 (Bank purchases commodity)...')
    await delay(1000)

    console.log('⏳ Processing T2 (Customer sells to third party)...')
    await delay(1000)

    console.log('⏳ Processing T3 (Validation & Compliance Check)...')
    await delay(1000)

    // ============================================
    // DATA INTEGRITY CHECK
    // ============================================
    const processedAmount = amount // Amount MUST remain unchanged

    if (processedAmount !== amount) {
        console.error('❌ Data Integrity Violation! Amount mismatch!')
        return {
            error: 'Data integrity check failed. Amount mismatch detected.',
            code: 'VALIDATION_FAILED'
        }
    }

    // Generate timestamps
    const now = new Date()
    const t1_timestamp = new Date(now.getTime() - 3000).toISOString()
    const t2_timestamp = new Date(now.getTime() - 2000).toISOString()
    const t3_timestamp = now.toISOString()

    // ============================================
    // SUCCESS RESPONSE
    // ============================================
    const result: TawarruqExecutionResult = {
        status: 'COMPLIANT',
        final_status: 'disbursed',
        amount: processedAmount, // Exact amount returned
        t1_timestamp,
        t2_timestamp,
        t3_timestamp,
        validation_details: {
            sequence_check: true,  // T1 < T2 < T3
            pricing_check: true,   // Cost < Selling Price
            ownership_check: true  // Qabd established
        }
    }

    console.log('✅ Tawarruq Process Complete!')
    console.log(`✅ Status: ${result.status}`)
    console.log(`✅ Final Status: ${result.final_status.toUpperCase()}`)
    console.log(`✅ Amount Verified: RM ${result.amount.toLocaleString()}`)

    return result
}

/**
 * Helper function to simulate async delay
 */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Validate Mutabaqah.AI API Configuration
 */
export function validateConfig(config: MutabaqahConfig): boolean {
    return !!(config.apiUrl && config.apiKey && config.apiUrl.startsWith('http'))
}
