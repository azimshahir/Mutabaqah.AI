import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'
import type { FinancingStatus } from '@/types/financing'
import { ApplicationsTable } from './applications-table'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ms-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const statusColors: Record<FinancingStatus, string> = {
  pending: 'bg-yellow-500',
  rejected: 'bg-red-500',
  approved: 'bg-green-500',
  disbursed: 'bg-purple-500',
}

const statusLabels: Record<FinancingStatus, string> = {
  pending: 'Pending',
  rejected: 'Rejected',
  approved: 'Approved',
  disbursed: 'Disbursed',
}

type SearchParams = Promise<{
  status?: FinancingStatus
  search?: string
  date?: 'today' | 'week' | 'month' | 'all'
}>

type PageProps = {
  searchParams: SearchParams
}

export default async function ApplicationsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Build query with filters
  let query = supabase
    .from('financing_applications')
    .select('*')
    .order('created_at', { ascending: false })

  // Apply status filter
  if (params.status) {
    query = query.eq('status', params.status)
  }

  // Apply search filter
  if (params.search) {
    query = query.or(
      `applicant_name.ilike.%${params.search}%,application_number.ilike.%${params.search}%`
    )
  }

  // Apply date filter
  if (params.date && params.date !== 'all') {
    const now = new Date()
    let startDate: Date

    switch (params.date) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0))
        break
      case 'week':
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 7)
        break
      case 'month':
        startDate = new Date(now)
        startDate.setMonth(startDate.getMonth() - 1)
        break
      default:
        startDate = new Date(0)
    }

    query = query.gte('created_at', startDate.toISOString())
  }

  const { data: applications, error } = await query

  // Calculate summary stats for filtered data
  const summary = {
    total: applications?.length || 0,
    totalAmount: 0,
  }

  applications?.forEach((app) => {
    summary.totalAmount += app.principal_amount || 0
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">All Applications</h1>
        <p className="text-muted-foreground">
          Manage and review financing applications
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <form className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Search by name or application number..."
                defaultValue={params.search || ''}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select name="status" defaultValue={params.status || 'all'}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="disbursed">Disbursed</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Select name="date" defaultValue={params.date || 'all'}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>

            <button
              type="submit"
              className="px-4 py-2 bg-[#0e4f8b] text-white rounded-md hover:bg-[#0a3d6e] transition-colors"
            >
              Apply Filters
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
          <span className="font-medium">{summary.total}</span> applications
        </div>
        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg">
          Total Value: <span className="font-medium">{formatCurrency(summary.totalAmount)}</span>
        </div>
      </div>

      {/* Applications Table */}
      <ApplicationsTable applications={applications || []} />
    </div>
  )
}
