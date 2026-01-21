import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { FinancingApplication, FinancingStatus, ProductType } from '@/types/financing'

const statusColors: Record<FinancingStatus, string> = {
  draft: 'bg-gray-500',
  submitted: 'bg-blue-500',
  t1_pending: 'bg-yellow-500',
  t1_validated: 'bg-emerald-500',
  t2_pending: 'bg-yellow-500',
  t2_validated: 'bg-emerald-500',
  approved: 'bg-green-500',
  blocked: 'bg-red-500',
  disbursed: 'bg-purple-500',
}

const statusLabels: Record<FinancingStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  t1_pending: 'T1 Pending',
  t1_validated: 'T1 Validated',
  t2_pending: 'T2 Pending',
  t2_validated: 'T2 Validated',
  approved: 'Approved',
  blocked: 'Blocked',
  disbursed: 'Disbursed',
}

const productLabels: Record<ProductType, string> = {
  personal_financing_i: 'Personal Financing-i',
  home_financing_i: 'Home Financing-i',
  vehicle_financing_i: 'Vehicle Financing-i',
  business_financing_i: 'Business Financing-i',
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
  }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ms-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default async function FinancingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get customer's financing applications
  const { data: applications, error } = await supabase
    .from('financing_applications')
    .select('*')
    .eq('customer_id', user?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Applications</h1>
          <p className="text-muted-foreground">
            Manage your financing applications
          </p>
        </div>
        <Button asChild>
          <Link href="/financing/new">New Application</Link>
        </Button>
      </div>

      {/* Applications List */}
      {error ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Error loading applications. Please try again.
          </CardContent>
        </Card>
      ) : !applications || applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              You don&apos;t have any financing applications yet.
            </p>
            <Button asChild>
              <Link href="/financing/new">Create Your First Application</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map((app: FinancingApplication) => (
            <Link key={app.id} href={`/financing/${app.id}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-lg">
                      {app.application_number}
                    </CardTitle>
                    <Badge className={statusColors[app.status as FinancingStatus]}>
                      {statusLabels[app.status as FinancingStatus]}
                    </Badge>
                  </div>
                  <CardDescription>
                    {productLabels[app.product_type as ProductType]}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Principal</p>
                      <p className="font-medium">{formatCurrency(app.principal_amount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Profit Rate</p>
                      <p className="font-medium">{(app.profit_rate * 100).toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tenure</p>
                      <p className="font-medium">{app.tenure_months} months</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-medium">{formatDate(app.created_at)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
