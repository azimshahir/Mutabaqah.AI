/**
 * Tawarruq Transaction Processor
 * Orchestrates the complete Tawarruq financing flow
 *
 * Flow: SUBMITTED → T1_PENDING → T1_VALIDATED → T2_PENDING → T2_VALIDATED → APPROVED
 */

import { createClient } from '@/lib/supabase/server'
import { purchaseCommodity, sellCommodity, type CommodityPurchase, type CommoditySale } from '../bsas/mock-client'
import { runFullValidation, validateT1Only, type ValidationReport } from '../validation/engine'

export type ProcessingResult = {
  success: boolean
  newStatus: string
  message: string
  details?: Record<string, unknown>
}

/**
 * Process T1: Bank purchases commodity from BSAS
 * Status: SUBMITTED → T1_PENDING → T1_VALIDATED
 */
export async function processT1Transaction(applicationId: string): Promise<ProcessingResult> {
  const supabase = await createClient()

  // Get application
  const { data: app, error: appError } = await supabase
    .from('financing_applications')
    .select('*')
    .eq('id', applicationId)
    .single()

  if (appError || !app) {
    return { success: false, newStatus: app?.status || 'unknown', message: 'Application not found' }
  }

  if (app.status !== 'submitted') {
    return { success: false, newStatus: app.status, message: `Cannot process T1: Application status is ${app.status}` }
  }

  // Update to T1_PENDING
  await supabase
    .from('financing_applications')
    .update({ status: 't1_pending', updated_at: new Date().toISOString() })
    .eq('id', applicationId)

  try {
    // Execute T1: Bank purchases commodity
    const purchase = await purchaseCommodity(app.principal_amount, 'Agrobank')

    // Validate T1
    const t1Validations = validateT1Only(purchase)
    const allPassed = t1Validations.every(v => v.passed)

    if (!allPassed) {
      // Block application if T1 validation fails
      await supabase
        .from('financing_applications')
        .update({
          status: 'blocked',
          blocked_reason: 'T1 validation failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)

      return {
        success: false,
        newStatus: 'blocked',
        message: 'T1 validation failed',
        details: { validations: t1Validations },
      }
    }

    // Create T1 transaction record
    const { error: txError } = await supabase
      .from('tawarruq_transactions')
      .insert({
        financing_id: applicationId,
        transaction_type: 'T1_PURCHASE',
        commodity_id: purchase.commodityId,
        commodity_type: purchase.commodityType,
        quantity: purchase.quantity,
        unit_price: purchase.unitPrice,
        total_amount: purchase.totalAmount,
        platform_reference: purchase.platformReference,
        timestamp: purchase.timestamp,
        sequence_number: 1,
        status: 'validated',
      })

    if (txError) {
      console.error('Error creating T1 transaction:', txError)
      throw new Error('Failed to create T1 transaction record')
    }

    // Store validation result
    await supabase.from('validation_results').insert({
      financing_id: applicationId,
      validation_type: 'T1_VALIDATION',
      result: 'pass',
      details: {
        purchase,
        validations: t1Validations,
      },
      validator_version: '1.0.0',
    })

    // Update to T1_VALIDATED
    await supabase
      .from('financing_applications')
      .update({ status: 't1_validated', updated_at: new Date().toISOString() })
      .eq('id', applicationId)

    return {
      success: true,
      newStatus: 't1_validated',
      message: 'T1 transaction completed and validated',
      details: {
        commodity: purchase.commodityType,
        amount: purchase.totalAmount,
        reference: purchase.platformReference,
      },
    }
  } catch (error) {
    console.error('T1 processing error:', error)

    await supabase
      .from('financing_applications')
      .update({
        status: 'blocked',
        blocked_reason: 'T1 processing error',
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId)

    return {
      success: false,
      newStatus: 'blocked',
      message: 'T1 processing failed',
    }
  }
}

/**
 * Process T2: Customer sells commodity to third party
 * Status: T1_VALIDATED → T2_PENDING → T2_VALIDATED
 */
export async function processT2Transaction(applicationId: string): Promise<ProcessingResult> {
  const supabase = await createClient()

  // Get application with applicant name
  const { data: app, error: appError } = await supabase
    .from('financing_applications')
    .select('*')
    .eq('id', applicationId)
    .single()

  if (appError || !app) {
    return { success: false, newStatus: 'unknown', message: 'Application not found' }
  }

  if (app.status !== 't1_validated' && app.status !== 't2_pending') {
    return { success: false, newStatus: app.status, message: `Cannot process T2: Application status is ${app.status}` }
  }

  // Get T1 transaction
  const { data: t1Tx, error: t1Error } = await supabase
    .from('tawarruq_transactions')
    .select('*')
    .eq('financing_id', applicationId)
    .eq('transaction_type', 'T1_PURCHASE')
    .single()

  if (t1Error || !t1Tx) {
    return { success: false, newStatus: app.status, message: 'T1 transaction not found' }
  }

  // Update to T2_PENDING
  await supabase
    .from('financing_applications')
    .update({ status: 't2_pending', updated_at: new Date().toISOString() })
    .eq('id', applicationId)

  try {
    // Reconstruct T1 purchase object
    const t1Purchase: CommodityPurchase = {
      commodityId: t1Tx.commodity_id,
      commodityType: t1Tx.commodity_type as CommodityPurchase['commodityType'],
      quantity: t1Tx.quantity,
      unitPrice: t1Tx.unit_price,
      totalAmount: t1Tx.total_amount,
      platformReference: t1Tx.platform_reference,
      timestamp: t1Tx.timestamp,
      seller: 'BSAS Trading Platform',
      buyer: 'Agrobank',
      certificateNumber: `CERT-${t1Tx.platform_reference}`,
    }

    // Execute T2: Customer sells commodity
    const customerName = app.applicant_name || 'Customer'
    const sale = await sellCommodity(t1Purchase, customerName)

    // Run full Shariah compliance validation
    const validationReport = runFullValidation(t1Purchase, sale, 'Agrobank', customerName)

    if (validationReport.overallResult === 'NON_COMPLIANT') {
      // CRITICAL: Shariah Non-Compliance detected!
      await supabase
        .from('financing_applications')
        .update({
          status: 'blocked',
          blocked_reason: `Shariah Non-Compliance: ${validationReport.results.filter(r => !r.passed).map(r => r.rule).join(', ')}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)

      // Store validation result
      await supabase.from('validation_results').insert({
        financing_id: applicationId,
        validation_type: 'FULL_SHARIAH_COMPLIANCE',
        result: 'fail',
        details: validationReport,
        validator_version: '1.0.0',
      })

      return {
        success: false,
        newStatus: 'blocked',
        message: 'SHARIAH NON-COMPLIANCE DETECTED',
        details: validationReport,
      }
    }

    // Create T2 transaction record
    const { error: txError } = await supabase
      .from('tawarruq_transactions')
      .insert({
        financing_id: applicationId,
        transaction_type: 'T2_SALE',
        commodity_id: sale.commodityId,
        commodity_type: sale.commodityType,
        quantity: sale.quantity,
        unit_price: sale.unitPrice,
        total_amount: sale.totalAmount,
        platform_reference: sale.platformReference,
        timestamp: sale.timestamp,
        sequence_number: 2,
        status: 'validated',
      })

    if (txError) {
      console.error('Error creating T2 transaction:', txError)
      throw new Error('Failed to create T2 transaction record')
    }

    // Store successful validation result
    await supabase.from('validation_results').insert({
      financing_id: applicationId,
      validation_type: 'FULL_SHARIAH_COMPLIANCE',
      result: validationReport.overallResult === 'COMPLIANT' ? 'pass' : 'warning',
      details: validationReport,
      validator_version: '1.0.0',
    })

    // Update to T2_VALIDATED
    await supabase
      .from('financing_applications')
      .update({ status: 't2_validated', updated_at: new Date().toISOString() })
      .eq('id', applicationId)

    return {
      success: true,
      newStatus: 't2_validated',
      message: 'T2 transaction completed - Shariah Compliant',
      details: {
        validationResult: validationReport.overallResult,
        saleAmount: sale.totalAmount,
        reference: sale.platformReference,
      },
    }
  } catch (error) {
    console.error('T2 processing error:', error)

    await supabase
      .from('financing_applications')
      .update({
        status: 'blocked',
        blocked_reason: 'T2 processing error',
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId)

    return {
      success: false,
      newStatus: 'blocked',
      message: 'T2 processing failed',
    }
  }
}

/**
 * Approve application after successful validation
 * Status: T2_VALIDATED → APPROVED
 */
export async function approveApplication(applicationId: string): Promise<ProcessingResult> {
  const supabase = await createClient()

  const { data: app, error: appError } = await supabase
    .from('financing_applications')
    .select('status')
    .eq('id', applicationId)
    .single()

  if (appError || !app) {
    return { success: false, newStatus: 'unknown', message: 'Application not found' }
  }

  if (app.status !== 't2_validated') {
    return { success: false, newStatus: app.status, message: `Cannot approve: Application status is ${app.status}` }
  }

  // Update to APPROVED
  const { error } = await supabase
    .from('financing_applications')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', applicationId)

  if (error) {
    return { success: false, newStatus: 't2_validated', message: 'Failed to approve application' }
  }

  return {
    success: true,
    newStatus: 'approved',
    message: 'Application approved - Ready for disbursement',
  }
}

/**
 * Process entire Tawarruq flow in one go
 * SUBMITTED → T1 → T2 → APPROVED
 */
export async function processFullTawarruqFlow(applicationId: string): Promise<ProcessingResult> {
  // Step 1: Process T1
  const t1Result = await processT1Transaction(applicationId)
  if (!t1Result.success) {
    return t1Result
  }

  // Small delay between T1 and T2 (realistic simulation)
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Step 2: Process T2
  const t2Result = await processT2Transaction(applicationId)
  if (!t2Result.success) {
    return t2Result
  }

  // Step 3: Approve
  const approveResult = await approveApplication(applicationId)
  return approveResult
}
