import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ReviewActions } from './review-actions'

type PageProps = {
    params: Promise<{ id: string }>
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ms-MY', {
        style: 'currency',
        currency: 'MYR',
    }).format(amount)
}

export default async function ReviewPage({ params }: PageProps) {
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
        <div className="space-y-6 animate-in fade-in duration-500">
            <Link href={`/financing/${id}/draft`} className="text-sm text-muted-foreground hover:text-primary">
                &larr; Back to Draft
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Review & Submit</h1>
                    <p className="text-muted-foreground">Please review the Wakalah (Agency) appointment.</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline">Step 2 of 5</Badge>
                    <Badge className="bg-blue-500">Ready to Submit</Badge>
                </div>
            </div>

            <Card className="overflow-hidden border-emerald-100">
                <div className="bg-emerald-50 p-4 border-b border-emerald-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center border border-emerald-200">
                            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-emerald-900">Wakalah (Agency) Appointment</h3>
                            <p className="text-sm text-emerald-700">Contract Agreement</p>
                        </div>
                    </div>
                </div>
                <CardContent className="p-6 space-y-4">
                    <div className="prose prose-sm max-w-none text-gray-700">
                        <p>
                            I, <span className="font-bold text-gray-900">{application.applicant_name}</span>, hereby appoint the Bank as my agent
                            to purchase Shariah-compliant commodities on my behalf with a value of:
                        </p>
                        <div className="text-2xl font-bold text-gray-900 my-4 text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                            {formatCurrency(application.principal_amount)}
                        </div>
                        <p>
                            By clicking "Confirm & Submit", I agree to the terms of the Wakalah contract and authorize the Bank to execute the purchase transaction (T1).
                        </p>
                    </div>

                    <div className="mt-6 pt-6 border-t">
                        <ReviewActions applicationId={application.id} />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
