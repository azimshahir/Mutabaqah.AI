import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LiquidateAction } from './liquidate-action'

type PageProps = {
    params: Promise<{ id: string }>
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ms-MY', {
        style: 'currency',
        currency: 'MYR',
    }).format(amount)
}

export default async function T2PendingPage({ params }: PageProps) {
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

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Asset Accepted</h1>
                    <p className="text-muted-foreground">The asset is now in your possession/ownership.</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline">Step 5 of 7</Badge>
                    <Badge className="bg-yellow-500">Action Required</Badge>
                </div>
            </div>

            <Card className="border-yellow-200 bg-yellow-50/50">
                <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900">Option to Liquidate</h3>
                        <p className="text-gray-600 max-w-lg">
                            You currently own the commodity. You may choose to hold onto it or sell it immediately to a third party (Liquidate) to obtain cash proceeds.
                        </p>

                        <div className="p-4 bg-white rounded-lg border shadow-sm w-full max-w-sm">
                            <p className="text-sm font-medium text-gray-500">Cash Proceeds Value</p>
                            <p className="text-3xl font-bold text-emerald-600 my-1">{formatCurrency(application.principal_amount)}</p>
                        </div>

                        <div className="w-full max-w-md pt-4">
                            <LiquidateAction applicationId={application.id} />
                            <p className="text-xs text-muted-foreground mt-4">
                                By clicking "Liquidate", you authorize the Bank to sell the commodity to a third-party broker on your behalf (T2 Transaction).
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
