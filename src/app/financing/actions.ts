'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ProductType } from '@/types/financing'
import {
  processT1Transaction,
  processT2Transaction,
  approveApplication,
  processFullTawarruqFlow,
} from '@/lib/processing/tawarruq-processor'

// Fixed profit rate for all Tawarruq financing
const FIXED_PROFIT_RATE = 0.05 // 5% p.a.

function generateApplicationNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `MUT-${timestamp}-${random}`
}

export async function createFinancingApplication(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Applicant info
  const applicantName = formData.get('applicant_name') as string
  const applicantIc = formData.get('applicant_ic') as string
  const applicantPhone = formData.get('applicant_phone') as string
  const applicantEmail = formData.get('applicant_email') as string
  const applicantAddress = formData.get('applicant_address') as string
  const applicantOccupation = formData.get('applicant_occupation') as string
  const applicantEmployer = formData.get('applicant_employer') as string
  const applicantMonthlyIncome = parseFloat(formData.get('applicant_monthly_income') as string)

  // Financing details
  const productType = formData.get('product_type') as ProductType
  const principalAmount = parseFloat(formData.get('principal_amount') as string)
  const tenureMonths = parseInt(formData.get('tenure_months') as string)

  // Validation - Personal Info
  if (!applicantName || applicantName.trim().length < 3) {
    return { error: 'Full name is required (minimum 3 characters)' }
  }
  if (!applicantIc || applicantIc.trim().length < 12) {
    return { error: 'Valid IC number is required' }
  }
  if (!applicantPhone || applicantPhone.trim().length < 10) {
    return { error: 'Valid phone number is required' }
  }
  if (!applicantEmail || !applicantEmail.includes('@')) {
    return { error: 'Valid email address is required' }
  }
  if (!applicantAddress || applicantAddress.trim().length < 10) {
    return { error: 'Address is required (minimum 10 characters)' }
  }

  // Validation - Employment Info
  if (!applicantOccupation || applicantOccupation.trim().length < 2) {
    return { error: 'Occupation is required' }
  }
  if (!applicantEmployer || applicantEmployer.trim().length < 2) {
    return { error: 'Employer name is required' }
  }
  if (isNaN(applicantMonthlyIncome) || applicantMonthlyIncome <= 0) {
    return { error: 'Valid monthly income is required' }
  }

  // Validation - Financing Details
  if (!productType) {
    return { error: 'Product type is required' }
  }
  if (isNaN(principalAmount) || principalAmount < 1000) {
    return { error: 'Principal amount must be at least RM 1,000' }
  }
  if (isNaN(tenureMonths) || tenureMonths <= 0) {
    return { error: 'Valid tenure is required' }
  }

  const applicationNumber = generateApplicationNumber()

  const { data, error } = await supabase
    .from('financing_applications')
    .insert({
      application_number: applicationNumber,
      customer_id: user.id,
      product_type: productType,
      principal_amount: principalAmount,
      profit_rate: FIXED_PROFIT_RATE,
      tenure_months: tenureMonths,
      status: 'draft',
      // Applicant info
      applicant_name: applicantName.trim(),
      applicant_ic: applicantIc.trim(),
      applicant_phone: applicantPhone.trim(),
      applicant_email: applicantEmail.trim(),
      applicant_address: applicantAddress.trim(),
      applicant_occupation: applicantOccupation.trim(),
      applicant_employer: applicantEmployer.trim(),
      applicant_monthly_income: applicantMonthlyIncome,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating application:', error)
    return { error: 'Failed to create application' }
  }

  revalidatePath('/financing')
  return { success: true, applicationId: data.id }
}

export async function submitApplication(applicationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify ownership
  const { data: app } = await supabase
    .from('financing_applications')
    .select('customer_id, status')
    .eq('id', applicationId)
    .single()

  if (!app || app.customer_id !== user.id) {
    return { error: 'Application not found' }
  }

  if (app.status !== 'draft') {
    return { error: 'Application already submitted' }
  }

  const { error } = await supabase
    .from('financing_applications')
    .update({ status: 'submitted', updated_at: new Date().toISOString() })
    .eq('id', applicationId)

  if (error) {
    console.error('Error submitting application:', error)
    return { error: 'Failed to submit application' }
  }

  revalidatePath('/financing')
  revalidatePath(`/financing/${applicationId}`)
  return { success: true }
}

/**
 * Process T1 Transaction (Bank purchases commodity)
 */
export async function processT1(applicationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify ownership
  const { data: app } = await supabase
    .from('financing_applications')
    .select('customer_id')
    .eq('id', applicationId)
    .single()

  if (!app || app.customer_id !== user.id) {
    return { error: 'Application not found' }
  }

  const result = await processT1Transaction(applicationId)

  revalidatePath('/financing')
  revalidatePath(`/financing/${applicationId}`)

  if (!result.success) {
    return { error: result.message }
  }

  return { success: true, message: result.message, details: result.details }
}

/**
 * Process T2 Transaction (Customer sells commodity)
 */
export async function processT2(applicationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify ownership
  const { data: app } = await supabase
    .from('financing_applications')
    .select('customer_id')
    .eq('id', applicationId)
    .single()

  if (!app || app.customer_id !== user.id) {
    return { error: 'Application not found' }
  }

  const result = await processT2Transaction(applicationId)

  revalidatePath('/financing')
  revalidatePath(`/financing/${applicationId}`)

  if (!result.success) {
    return { error: result.message, details: result.details }
  }

  return { success: true, message: result.message, details: result.details }
}

/**
 * Approve application after T2 validation
 */
export async function approveApp(applicationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify ownership
  const { data: app } = await supabase
    .from('financing_applications')
    .select('customer_id')
    .eq('id', applicationId)
    .single()

  if (!app || app.customer_id !== user.id) {
    return { error: 'Application not found' }
  }

  const result = await approveApplication(applicationId)

  revalidatePath('/financing')
  revalidatePath(`/financing/${applicationId}`)

  if (!result.success) {
    return { error: result.message }
  }

  return { success: true, message: result.message }
}

/**
 * Process full Tawarruq flow in one action
 * SUBMITTED → T1 → T2 → APPROVED
 */
export async function processFullFlow(applicationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify ownership
  const { data: app } = await supabase
    .from('financing_applications')
    .select('customer_id')
    .eq('id', applicationId)
    .single()

  if (!app || app.customer_id !== user.id) {
    return { error: 'Application not found' }
  }

  const result = await processFullTawarruqFlow(applicationId)

  revalidatePath('/financing')
  revalidatePath(`/financing/${applicationId}`)

  if (!result.success) {
    return { error: result.message, details: result.details }
  }

  return { success: true, message: result.message, details: result.details }
}

/**
 * Step 1: Sign Wakalah (Agency Contract)
 * Customer appoints bank as agent to purchase commodity
 */
export async function signWakalah(applicationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify ownership and status
  const { data: app } = await supabase
    .from('financing_applications')
    .select('customer_id, status, principal_amount')
    .eq('id', applicationId)
    .single()

  if (!app || app.customer_id !== user.id) {
    return { error: 'Application not found' }
  }

  if (app.status !== 'submitted') {
    return { error: 'Invalid application status for Wakalah signing' }
  }

  // Process T1 (Bank purchases commodity on behalf of customer)
  const result = await processT1Transaction(applicationId)

  revalidatePath('/financing')
  revalidatePath(`/financing/${applicationId}`)

  if (!result.success) {
    return { error: result.message }
  }

  return {
    success: true,
    message: 'Wakalah signed and T1 processed',
    details: result.details,
  }
}

/**
 * Step 2: Accept Asset (Murabahah)
 * Customer accepts the commodity from bank
 */
export async function acceptAsset(applicationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify ownership and status
  const { data: app } = await supabase
    .from('financing_applications')
    .select('customer_id, status')
    .eq('id', applicationId)
    .single()

  if (!app || app.customer_id !== user.id) {
    return { error: 'Application not found' }
  }

  if (app.status !== 't1_validated') {
    return { error: 'T1 must be validated before accepting asset' }
  }

  // Update status to indicate customer has accepted the asset
  // This is an intermediate step before T2
  const { error } = await supabase
    .from('financing_applications')
    .update({
      status: 't2_pending',
      updated_at: new Date().toISOString(),
    })
    .eq('id', applicationId)

  if (error) {
    return { error: 'Failed to accept asset' }
  }

  revalidatePath('/financing')
  revalidatePath(`/financing/${applicationId}`)

  return {
    success: true,
    message: 'Asset accepted - ready for liquidation',
  }
}

/**
 * Step 3: Liquidate Asset
 * Customer sells commodity to third party for cash
 */
export async function liquidateAsset(applicationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify ownership and status
  const { data: app } = await supabase
    .from('financing_applications')
    .select('customer_id, status')
    .eq('id', applicationId)
    .single()

  if (!app || app.customer_id !== user.id) {
    return { error: 'Application not found' }
  }

  if (app.status !== 't2_pending') {
    return { error: 'Asset must be accepted before liquidation' }
  }

  // Process T2 (Customer sells to third party)
  const t2Result = await processT2Transaction(applicationId)

  if (!t2Result.success) {
    return { error: t2Result.message, details: t2Result.details }
  }

  // Auto-approve after successful T2
  const approveResult = await approveApplication(applicationId)

  revalidatePath('/financing')
  revalidatePath(`/financing/${applicationId}`)

  if (!approveResult.success) {
    return { error: approveResult.message }
  }

  return {
    success: true,
    message: 'Asset liquidated - Tawarruq complete!',
    details: t2Result.details,
  }
}
