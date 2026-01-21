import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AcceptAction } from './accept-action'

type PageProps = {
    params: Promise<{ id: string }>
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ms-MY', {
        style: 'currency',
        currency: 'MYR',
    }).format(amount)
}

function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('ms-MY', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    })
}

export default async function T1ValidatedPage({ params }: PageProps) {
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

    // Fetch T1 transaction
    const { data: t1Tx } = await supabase
        .from('tawarruq_transactions')
        .select('*')
        .eq('financing_id', id)
        .eq('transaction_type', 'T1_PURCHASE')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    const commodity = t1Tx ? {
        id: t1Tx.commodity_id,
        type: t1Tx.commodity_type || 'Crude Palm Oil (CPO)',
        time: t1Tx.timestamp,
    } : {
        id: 'PENDING',
        type: 'Processing...',
        time: new Date().toISOString()
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Transaction T1 Validated</h1>
                    <p className="text-muted-foreground">The Bank has successfully purchased the commodity.</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline">Step 4 of 7</Badge>
                    <Badge className="bg-emerald-500">Asset Ready</Badge>
                </div>
            </div>

            <Card className="border-emerald-200 shadow-md">
                <CardHeader className="bg-emerald-50 border-b border-emerald-100">
                    <div className="flex items-center gap-2 text-emerald-800">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <CardTitle className="text-lg">Commodity Purchase Certificate</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Commodity ID</p>
                                <p className="text-xl font-mono font-bold text-gray-900">{commodity.id}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Commodity Type</p>
                                <p className="text-lg font-medium text-gray-900">{commodity.type}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Purchase Time</p>
                                <p className="text-base text-gray-900">{formatDateTime(commodity.time)}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col justify-center">
                            <p className="text-sm text-gray-500 mb-2">Purchase Value</p>
                            <p className="text-3xl font-bold text-emerald-600">{formatCurrency(application.principal_amount)}</p>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-600">
                                    The Bank now offers to sell this commodity to you (Murabahah) at the selling price of:
                                </p>
                                <p className="text-lg font-bold text-gray-900 mt-1">
                                    {formatCurrency(
                                        application.principal_amount * (1 + application.profit_rate * (application.tenure_months / 12))
                                    )}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">including profit margin</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t">
                        <AcceptAction applicationId={application.id} />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
