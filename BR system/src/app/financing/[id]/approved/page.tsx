import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

type PageProps = {
    params: Promise<{ id: string }>
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ms-MY', {
        style: 'currency',
        currency: 'MYR',
    }).format(amount)
}

export default async function ApprovedPage({ params }: PageProps) {
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
        <div className="space-y-6 animate-in zoom-in duration-500">
            <div className="flex flex-col items-center justify-center text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Application Approved!</h1>
                <p className="text-gray-500 mt-2 max-w-md">
                    Your financing application has been successfully processed and approved. The Tawarruq transaction is complete.
                </p>
                <div className="flex gap-2 mt-4">
                    <Badge className="bg-green-600 text-base px-3 py-1">Tawarruq Completed</Badge>
                    <Badge variant="outline" className="text-base px-3 py-1">Shariah Compliant</Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-gray-400" />
                            Disbursement Details
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-500">Amount to Disburse</span>
                                <span className="font-bold text-green-700">{formatCurrency(application.principal_amount)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-500">Account Number</span>
                                <span className="font-medium">**** **** 8888</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-500">Bank</span>
                                <span className="font-medium">Bank Islam</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-gray-500">Status</span>
                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">Processing</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Repayment Schedule</h3>
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Monthly Installment</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(
                                        (application.principal_amount * (1 + application.profit_rate * (application.tenure_months / 12))) / application.tenure_months
                                    )}
                                </p>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">First Payment Date</span>
                                <span className="font-medium">1st March 2026</span>
                            </div>
                            <div className="text-center pt-4">
                                <Button variant="outline" className="w-full gap-2">
                                    <Download className="w-4 h-4" />
                                    Download Agreement
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-center pt-8">
                <Link href="/financing">
                    <Button variant="ghost">Return to Dashboard</Button>
                </Link>
            </div>
        </div>
    )
}
