import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Wallet,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
import type { FinancingStatus } from '@/types/financing'

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

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get all applications for stats
  const { data: applications } = await supabase
    .from('financing_applications')
    .select('*')
    .order('created_at', { ascending: false })

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
    disbursedAmount: 0,
    rejectedAmount: 0,
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
        stats.rejectedAmount += amount
        break
      case 'disbursed':
        stats.disbursed++
        stats.disbursedAmount += amount
        break
    }
  })

  // Get recent applications (last 5)
  const recentApplications = applications?.slice(0, 5) || []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of financing applications</p>
      </div>

      {/* Featured Stats Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Applications */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
          <div className="absolute top-0 right-0 p-4 opacity-50 bg-blue-50 rounded-bl-3xl">
            <Wallet className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-sm font-medium text-gray-500">Total Applications</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">{stats.total}</span>
            <span className="text-sm text-gray-400">apps</span>
          </div>
          <div className="mt-4">
            <p className="text-lg font-semibold text-blue-600">{formatCurrency(stats.totalAmount)}</p>
            <p className="text-xs text-gray-400 mt-1">Total financing value</p>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </div>

        {/* Pending Review */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
          <div className="absolute top-0 right-0 p-4 opacity-50 bg-yellow-50 rounded-bl-3xl">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <p className="text-sm font-medium text-gray-500">Pending Review</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">{stats.pending}</span>
            <span className="text-sm text-gray-400">apps</span>
          </div>
          <div className="mt-4">
            <p className="text-lg font-semibold text-yellow-600">{formatCurrency(stats.pendingAmount)}</p>
            <p className="text-xs text-gray-400 mt-1">Awaiting decision</p>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-yellow-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </div>

        {/* Approved */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
          <div className="absolute top-0 right-0 p-4 opacity-50 bg-green-50 rounded-bl-3xl">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-sm font-medium text-gray-500">Approved</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">{stats.approved}</span>
            <span className="text-sm text-gray-400">apps</span>
          </div>
          <div className="mt-4">
            <p className="text-lg font-semibold text-green-600">{formatCurrency(stats.approvedAmount)}</p>
            <p className="text-xs text-gray-400 mt-1">Ready for execution</p>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </div>

        {/* Disbursed */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
          <div className="absolute top-0 right-0 p-4 opacity-50 bg-purple-50 rounded-bl-3xl">
            <Wallet className="h-6 w-6 text-purple-600" />
          </div>
          <p className="text-sm font-medium text-gray-500">Disbursed</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">{stats.disbursed}</span>
            <span className="text-sm text-gray-400">apps</span>
          </div>
          <div className="mt-4">
            <p className="text-lg font-semibold text-purple-600">{formatCurrency(stats.disbursedAmount)}</p>
            <p className="text-xs text-gray-400 mt-1">Successfully completed</p>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </div>
      </div>

      {/* Rejection & Approval Stats Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Rejected Overview */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
          <div className="absolute top-0 right-0 p-4 opacity-50 bg-red-50 rounded-bl-3xl">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-sm font-medium text-gray-500">Rejected Applications</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">{stats.rejected}</span>
            <span className="text-sm text-gray-400">apps</span>
          </div>
          <div className="mt-4">
            <p className="text-lg font-semibold text-red-600">{formatCurrency(stats.rejectedAmount)}</p>
            <p className="text-xs text-gray-400 mt-1">Total rejected value</p>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </div>

        {/* Approval Performance */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
          <div className="absolute top-0 right-0 p-4 opacity-50 bg-green-50 rounded-bl-3xl">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-sm font-medium text-gray-500">Approval Performance</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">
              {stats.total > 0
                ? (((stats.approved + stats.disbursed) / stats.total) * 100).toFixed(1)
                : 0}%
            </span>
            <span className="text-sm text-gray-400">approval rate</span>
          </div>
          <div className="mt-4">
            <p className="text-lg font-semibold text-green-600">
              {formatCurrency(stats.approvedAmount + stats.disbursedAmount)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Total approved value
            </p>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </div>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Applications</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/applications">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentApplications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No applications found
            </p>
          ) : (
            <div className="space-y-4">
              {recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="font-medium truncate">{app.applicant_name}</p>
                      <Badge className={statusColors[app.status as FinancingStatus] || 'bg-gray-500'}>
                        {statusLabels[app.status as FinancingStatus] || app.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{app.application_number}</span>
                      <span>{formatDate(app.created_at)}</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-[#0e4f8b]">
                      {formatCurrency(app.principal_amount)}
                    </p>
                    <Link
                      href={`/admin/applications?search=${app.application_number}`}
                      className="text-sm text-[#f7941d] hover:underline"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
