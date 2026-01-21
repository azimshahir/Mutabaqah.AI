import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import type { FinancingStatus, ProductType } from '@/types/financing'

type PageProps = {
    params: Promise<{ id: string }>
}

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

function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('ms-MY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export default async function DraftPage({ params }: PageProps) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: application, error } = await supabase
        .from('financing_applications')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !application || application.customer_id !== user.id) {
        notFound()
    }

    // If not draft, redirect to main router to handle correct page
    if (application.status !== 'draft') {
        redirect(`/financing/${id}`)
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Link href="/financing" className="text-sm text-muted-foreground hover:text-primary">
                &larr; Back to Applications
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{application.application_number}</h1>
                    <p className="text-muted-foreground">{productLabels[application.product_type as ProductType]}</p>
                </div>
                <Badge className={`${statusColors['draft']} text-sm px-3 py-1`}>Draft</Badge>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Applicant Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-muted-foreground">Full Name</p>
                        <p className="font-medium">{application.applicant_name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">IC Number</p>
                        <p className="font-medium">{application.applicant_ic}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{application.applicant_email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{application.applicant_phone}</p>
                    </div>
                    <div className="sm:col-span-2">
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">{application.applicant_address}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Financing Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <p className="text-sm text-muted-foreground">Principal Amount</p>
                        <p className="text-xl font-semibold">{formatCurrency(application.principal_amount)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Tenure</p>
                        <p className="text-xl font-semibold">{application.tenure_months} months</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Profit Rate</p>
                        <p className="text-xl font-semibold">{(application.profit_rate * 100).toFixed(2)}%</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Payment</p>
                        <p className="text-xl font-semibold">
                            {formatCurrency(application.principal_amount * (1 + application.profit_rate * (application.tenure_months / 12)))}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Link href={`/financing/${id}/review`}>
                    <Button size="lg" className="w-full sm:w-auto gap-2">
                        Review Application <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </div>
    )
}
