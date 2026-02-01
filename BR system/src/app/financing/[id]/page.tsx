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

  // Route based on simplified 4-status system
  switch (status) {
    case 'pending':
      redirect(`/financing/${id}/pending`)
    case 'rejected':
      redirect(`/financing/${id}/rejected`)
    case 'approved':
    case 'disbursed':
      redirect(`/financing/${id}/approved`)
    default:
      // For any legacy statuses during migration, show pending
      redirect(`/financing/${id}/pending`)
  }
}
