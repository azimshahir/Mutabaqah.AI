import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import type { FinancingStatus } from '@/types/financing'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get application status
  const { data: application, error } = await supabase
    .from('financing_applications')
    .select('status, customer_id')
    .eq('id', id)
    .single()

  if (error || !application) {
    notFound()
  }

  if (application.customer_id !== user.id) {
    notFound()
  }

  const status = application.status as FinancingStatus

  // Route based on status
  switch (status) {
    case 'draft':
      redirect(`/financing/${id}/draft`)
    case 'submitted':
      // Submitted means ready to sign Wakalah (Review step)
      redirect(`/financing/${id}/review`)
    case 't1_pending':
      redirect(`/financing/${id}/processing/t1`)
    case 't1_validated':
      redirect(`/financing/${id}/validated/t1`)
    case 't2_pending':
      // Asset accepted, ready to liquidate
      redirect(`/financing/${id}/processing/t2`)
    case 't2_validated':
      // Should result in approved usually, but if exists:
      redirect(`/financing/${id}/validated/t2`)
    case 'approved':
    case 'disbursed':
      redirect(`/financing/${id}/approved`)
    case 'blocked':
      redirect(`/financing/${id}/draft`) // Or a specific error page
    default:
      redirect(`/financing/${id}/draft`)
  }
}
