import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { FinancingApplication, FinancingStatus, ProductType } from '@/types/financing'
import { WithdrawButton } from './withdraw-button'

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
        <Button asChild className="bg-[#f7941d] hover:bg-[#e8850a]">
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
            <Button asChild className="bg-[#f7941d] hover:bg-[#e8850a]">
              <Link href="/financing/new">Create Your First Application</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map((app: FinancingApplication) => (
            <div key={app.id} className="relative group">
              <Link
                href={`/financing/${app.id}`}
                className="absolute inset-0 z-0"
                aria-label={`View application ${app.application_number}`}
              />
              <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-3 relative z-10 pointer-events-none">
                      <CardTitle className="text-lg">
                        {app.application_number}
                      </CardTitle>
                      <Badge className={statusColors[app.status as FinancingStatus] || 'bg-gray-500'}>
                        {statusLabels[app.status as FinancingStatus] || app.status}
                      </Badge>
                    </div>
                    {/* Withdraw button - z-20 to be above the link */}
                    <div className="relative z-20">
                      <WithdrawButton
                        applicationId={app.id}
                        applicationNumber={app.application_number}
                      />
                    </div>
                  </div>
                  <CardDescription>
                    {productLabels[app.product_type as ProductType]}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-0 pointer-events-none">
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
