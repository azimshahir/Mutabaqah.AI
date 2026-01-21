/**
 * Shariah Compliance Validation Engine
 * Validates Tawarruq transactions according to Islamic finance principles
 */

import type { CommodityPurchase, CommoditySale } from '../bsas/mock-client'

export type ValidationResult = {
  rule: string
  passed: boolean
  message: string
  details?: Record<string, unknown>
}

export type ValidationReport = {
  overallResult: 'COMPLIANT' | 'NON_COMPLIANT' | 'WARNING'
  validatedAt: string
  validatorVersion: string
  results: ValidationResult[]
  summary: {
    passed: number
    failed: number
    warnings: number
  }
}

const VALIDATOR_VERSION = '1.0.0'

/**
 * Rule 1: TARTIB (Sequence Validation)
 * T1 purchase MUST happen BEFORE T2 sale
 * This is the most critical Shariah requirement
 */
export function validateSequence(
  t1: CommodityPurchase,
  t2: CommoditySale
): ValidationResult {
  const t1Time = new Date(t1.timestamp).getTime()
  const t2Time = new Date(t2.timestamp).getTime()

  const passed = t1Time < t2Time
  const timeDiffMs = t2Time - t1Time

  return {
    rule: 'TARTIB_SEQUENCE',
    passed,
    message: passed
      ? `T1 occurred ${Math.round(timeDiffMs / 1000)}s before T2 - Sequence valid`
      : 'CRITICAL: T2 occurred before T1 - Shariah Non-Compliance detected',
    details: {
      t1_timestamp: t1.timestamp,
      t2_timestamp: t2.timestamp,
      time_difference_ms: timeDiffMs,
    },
  }
}

/**
 * Rule 2: COMMODITY IDENTITY
 * Same commodity must be used in both transactions
 */
export function validateCommodityIdentity(
  t1: CommodityPurchase,
  t2: CommoditySale
): ValidationResult {
  const passed = t1.commodityId === t2.commodityId

  return {
    rule: 'COMMODITY_IDENTITY',
    passed,
    message: passed
      ? 'Same commodity used in T1 and T2 - Valid'
      : 'CRITICAL: Different commodities in T1 and T2',
    details: {
      t1_commodity: t1.commodityId,
      t2_commodity: t2.commodityId,
    },
  }
}

/**
 * Rule 3: QABD (Ownership/Possession)
 * Bank must have ownership before selling to customer
 * Customer must have ownership before selling to third party
 */
export function validateOwnership(
  t1: CommodityPurchase,
  t2: CommoditySale,
  bankName: string,
  customerName: string
): ValidationResult {
  // In T1: Bank is buyer (takes ownership)
  // In T2: Customer is seller (must have received ownership from bank)
  const bankOwned = t1.buyer === bankName
  const customerSold = t2.seller === customerName

  const passed = bankOwned && customerSold

  return {
    rule: 'QABD_OWNERSHIP',
    passed,
    message: passed
      ? 'Ownership chain valid: Platform → Bank → Customer → Third Party'
      : 'CRITICAL: Ownership chain broken',
    details: {
      t1_buyer: t1.buyer,
      t2_seller: t2.seller,
      expected_bank: bankName,
      expected_customer: customerName,
    },
  }
}

/**
 * Rule 4: QUANTITY CONSISTENCY
 * Same quantity must be traded in both transactions
 */
export function validateQuantity(
  t1: CommodityPurchase,
  t2: CommoditySale
): ValidationResult {
  const passed = t1.quantity === t2.quantity

  return {
    rule: 'QUANTITY_CONSISTENCY',
    passed,
    message: passed
      ? `Quantity consistent: ${t1.quantity} MT`
      : `CRITICAL: Quantity mismatch - T1: ${t1.quantity} MT, T2: ${t2.quantity} MT`,
    details: {
      t1_quantity: t1.quantity,
      t2_quantity: t2.quantity,
    },
  }
}

/**
 * Rule 5: PRICING VALIDITY
 * Prices must be market-based and documented
 */
export function validatePricing(
  t1: CommodityPurchase,
  t2: CommoditySale
): ValidationResult {
  // T2 price being slightly lower is normal (customer sells at market)
  const priceDiff = ((t1.unitPrice - t2.unitPrice) / t1.unitPrice) * 100
  const passed = priceDiff >= 0 && priceDiff < 5 // Within 5% variance

  return {
    rule: 'PRICING_VALIDITY',
    passed,
    message: passed
      ? `Pricing within acceptable range (${priceDiff.toFixed(2)}% variance)`
      : `WARNING: Price variance exceeds threshold (${priceDiff.toFixed(2)}%)`,
    details: {
      t1_unit_price: t1.unitPrice,
      t2_unit_price: t2.unitPrice,
      variance_percent: priceDiff,
    },
  }
}

/**
 * Rule 6: CERTIFICATE VALIDATION
 * Both transactions must have valid BSAS certificates
 */
export function validateCertificates(
  t1: CommodityPurchase,
  t2: CommoditySale
): ValidationResult {
  const t1HasCert = Boolean(t1.certificateNumber && t1.certificateNumber.startsWith('CERT-'))
  const t2HasCert = Boolean(t2.certificateNumber && t2.certificateNumber.startsWith('CERT-'))

  const passed = t1HasCert && t2HasCert

  return {
    rule: 'CERTIFICATE_VALIDITY',
    passed,
    message: passed
      ? 'Both transactions have valid BSAS certificates'
      : 'CRITICAL: Missing or invalid certificates',
    details: {
      t1_certificate: t1.certificateNumber,
      t2_certificate: t2.certificateNumber,
    },
  }
}

/**
 * Run all validations and generate comprehensive report
 */
export function runFullValidation(
  t1: CommodityPurchase,
  t2: CommoditySale,
  bankName: string = 'Agrobank',
  customerName: string
): ValidationReport {
  const results: ValidationResult[] = [
    validateSequence(t1, t2),
    validateCommodityIdentity(t1, t2),
    validateOwnership(t1, t2, bankName, customerName),
    validateQuantity(t1, t2),
    validatePricing(t1, t2),
    validateCertificates(t1, t2),
  ]

  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length

  // Determine overall result
  let overallResult: 'COMPLIANT' | 'NON_COMPLIANT' | 'WARNING' = 'COMPLIANT'

  // Critical rules that cause non-compliance
  const criticalRules = ['TARTIB_SEQUENCE', 'COMMODITY_IDENTITY', 'QABD_OWNERSHIP']
  const criticalFailure = results.some(
    r => !r.passed && criticalRules.includes(r.rule)
  )

  if (criticalFailure) {
    overallResult = 'NON_COMPLIANT'
  } else if (failed > 0) {
    overallResult = 'WARNING'
  }

  return {
    overallResult,
    validatedAt: new Date().toISOString(),
    validatorVersion: VALIDATOR_VERSION,
    results,
    summary: {
      passed,
      failed,
      warnings: 0,
    },
  }
}

/**
 * Quick validation for T1 only (before T2 exists)
 */
export function validateT1Only(t1: CommodityPurchase): ValidationResult[] {
  const results: ValidationResult[] = []

  // Check certificate
  results.push({
    rule: 'T1_CERTIFICATE',
    passed: !!t1.certificateNumber,
    message: t1.certificateNumber
      ? 'T1 certificate issued'
      : 'T1 certificate missing',
    details: { certificate: t1.certificateNumber },
  })

  // Check platform reference
  results.push({
    rule: 'T1_PLATFORM_REF',
    passed: !!t1.platformReference,
    message: t1.platformReference
      ? 'T1 has valid platform reference'
      : 'T1 platform reference missing',
    details: { reference: t1.platformReference },
  })

  // Check amount
  results.push({
    rule: 'T1_AMOUNT',
    passed: t1.totalAmount > 0,
    message: t1.totalAmount > 0
      ? `T1 amount valid: MYR ${t1.totalAmount.toLocaleString()}`
      : 'T1 amount invalid',
    details: { amount: t1.totalAmount },
  })

  return results
}
