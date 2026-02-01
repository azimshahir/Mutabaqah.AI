'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { FinancingStatus } from '@/types/financing'

type DateFilter = 'today' | 'week' | 'month' | 'all'

export async function getAdminStats(dateFilter: DateFilter = 'all') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify admin status
  const { data: customer } = await supabase
    .from('customers')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!customer?.is_admin) {
    return { error: 'Not authorized' }
  }

  // Calculate date range
  let startDate: string | null = null
  const now = new Date()

  switch (dateFilter) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString()
      break
    case 'week':
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - 7)
      startDate = weekAgo.toISOString()
      break
    case 'month':
      const monthAgo = new Date(now)
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      startDate = monthAgo.toISOString()
      break
    case 'all':
    default:
      startDate = null
  }

  // Build query
  let query = supabase.from('financing_applications').select('status, principal_amount')

  if (startDate) {
    query = query.gte('created_at', startDate)
  }

  const { data: applications, error } = await query

  if (error) {
    return { error: 'Failed to fetch statistics' }
  }

  // Calculate stats
  const stats = {
    total: applications?.length || 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    disbursed: 0,
    totalAmount: 0,
    pendingAmount: 0,
    approvedAmount: 0,
  }

  applications?.forEach((app) => {
    const amount = app.principal_amount || 0
    stats.totalAmount += amount

    switch (app.status) {
      case 'pending':
        stats.pending++
        stats.pendingAmount += amount
        break
      case 'approved':
        stats.approved++
        stats.approvedAmount += amount
        break
      case 'rejected':
        stats.rejected++
        break
      case 'disbursed':
        stats.disbursed++
        stats.approvedAmount += amount
        break
    }
  })

  return { success: true, stats }
}

export async function getApplications(
  dateFilter: DateFilter = 'all',
  statusFilter?: FinancingStatus,
  searchQuery?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify admin status
  const { data: customer } = await supabase
    .from('customers')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!customer?.is_admin) {
    return { error: 'Not authorized' }
  }

  // Calculate date range
  let startDate: string | null = null
  const now = new Date()

  switch (dateFilter) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString()
      break
    case 'week':
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - 7)
      startDate = weekAgo.toISOString()
      break
    case 'month':
      const monthAgo = new Date(now)
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      startDate = monthAgo.toISOString()
      break
  }

  // Build query
  let query = supabase
    .from('financing_applications')
    .select('*')
    .order('created_at', { ascending: false })

  if (startDate) {
    query = query.gte('created_at', startDate)
  }

  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  if (searchQuery) {
    query = query.or(`applicant_name.ilike.%${searchQuery}%,application_number.ilike.%${searchQuery}%`)
  }

  const { data: applications, error } = await query

  if (error) {
    console.error('Error fetching applications:', error)
    return { error: 'Failed to fetch applications' }
  }

  return { success: true, applications }
}

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: FinancingStatus,
  rejectionReason?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify admin status
  const { data: customer } = await supabase
    .from('customers')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!customer?.is_admin) {
    return { error: 'Not authorized' }
  }

  // Get current application with full data
  const { data: app } = await supabase
    .from('financing_applications')
    .select('*')
    .eq('id', applicationId)
    .single()

  if (!app) {
    return { error: 'Application not found' }
  }

  // Validate status transition
  const validTransitions: Record<string, string[]> = {
    pending: ['approved', 'rejected'],
    rejected: ['pending'], // Allow reopening
    approved: ['disbursed'],
    disbursed: [], // Final state
  }

  const currentStatus = app.status as string
  if (!validTransitions[currentStatus]?.includes(newStatus)) {
    return { error: `Cannot change status from ${currentStatus} to ${newStatus}` }
  }

  // Update application
  const updateData: Record<string, unknown> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  }

  if (newStatus === 'rejected' && rejectionReason) {
    updateData.rejection_reason = rejectionReason
  }

  if (newStatus === 'pending') {
    // Clear rejection reason when reopening
    updateData.rejection_reason = null
  }

  const { error } = await supabase
    .from('financing_applications')
    .update(updateData)
    .eq('id', applicationId)

  if (error) {
    console.error('Error updating status:', error)
    return { error: 'Failed to update status' }
  }

  // ============================================
  // AUTOMATIC TAWARRUQ EXECUTION ON APPROVAL
  // ============================================
  if (newStatus === 'approved') {
    console.log(`🚀 Auto-triggering Tawarruq execution for Application ${app.application_number}...`)

    try {
      // Dynamically import to avoid circular dependencies
      const { executeTawarruqProcess } = await import('@/lib/mutabaqah/bridge')

      // Execute Tawarruq process via Mutabaqah.AI
      const executionResult = await executeTawarruqProcess(
        applicationId,
        app.principal_amount,
        'approved',
        {
          id: app.id,
          application_number: app.application_number,
          customer_id: app.customer_id,
          applicant_name: app.applicant_name,
          applicant_ic: app.applicant_ic,
          applicant_phone: app.applicant_phone,
          applicant_email: app.applicant_email,
          applicant_address: app.applicant_address,
          applicant_occupation: app.applicant_occupation,
          applicant_employer: app.applicant_employer,
          applicant_monthly_income: app.applicant_monthly_income,
          product_type: app.product_type,
          principal_amount: app.principal_amount,
          profit_rate: app.profit_rate,
          tenure_months: app.tenure_months,
          status: 'approved',
        }
      )

      // Check if execution was successful
      if ('error' in executionResult) {
        console.error('❌ Tawarruq execution failed:', executionResult.error)
        return {
          success: true,
          warning: `Application approved but Tawarruq execution failed: ${executionResult.error}`
        }
      }

      // Success! Auto-update to DISBURSED
      console.log('✅ Tawarruq executed successfully, auto-updating to DISBURSED')

      const { error: disbursedError } = await supabase
        .from('financing_applications')
        .update({
          status: 'disbursed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)

      if (disbursedError) {
        console.error('❌ Failed to update to disbursed:', disbursedError)
        return {
          success: true,
          warning: 'Tawarruq executed but failed to update status to disbursed'
        }
      }

      console.log('🎉 Complete! Application auto-disbursed after Tawarruq validation')

      revalidatePath('/admin')
      revalidatePath('/admin/applications')
      return {
        success: true,
        autoDisbursed: true,
        message: 'Application approved, Tawarruq executed, and auto-disbursed successfully!'
      }

    } catch (error) {
      console.error('❌ Error during auto-execution:', error)
      return {
        success: true,
        warning: 'Application approved but auto-execution failed. Use manual Execute button.'
      }
    }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/applications')
  return { success: true }
}

