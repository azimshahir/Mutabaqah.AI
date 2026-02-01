import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, FileText, CheckCircle } from 'lucide-react'

type PageProps = {
    params: Promise<{ id: string }>
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
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export default async function PendingPage({ params }: PageProps) {
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
            <Link href="/financing" className="text-sm text-muted-foreground hover:text-primary">
                &larr; Back to Applications
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Application Submitted</h1>
                    <p className="text-muted-foreground">{application.application_number}</p>
                </div>
                <Badge className="bg-yellow-500 w-fit">Pending Review</Badge>
            </div>

            {/* Status Card */}
            <Card className="overflow-hidden border-yellow-200 bg-yellow-50">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Clock className="w-8 h-8 text-yellow-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-yellow-900 text-lg">Waiting for Review</h3>
                            <p className="text-yellow-700">
                                Your application has been submitted and is now being reviewed by our team.
                                You will be notified once a decision has been made.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Application Summary */}
            <Card>
                <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-3 border-b pb-4">
                        <FileText className="w-5 h-5 text-[#0e4f8b]" />
                        <h3 className="font-semibold text-lg">Application Details</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">Applicant Information</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Name</span>
                                    <span className="font-medium">{application.applicant_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">IC Number</span>
                                    <span className="font-medium">{application.applicant_ic}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Email</span>
                                    <span className="font-medium">{application.applicant_email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Phone</span>
                                    <span className="font-medium">{application.applicant_phone}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">Financing Details</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Principal Amount</span>
                                    <span className="font-medium text-[#0e4f8b]">{formatCurrency(application.principal_amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Profit Rate</span>
                                    <span className="font-medium">{(application.profit_rate * 100).toFixed(2)}% p.a.</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tenure</span>
                                    <span className="font-medium">{application.tenure_months} months</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Submitted</span>
                                    <span className="font-medium">{formatDate(application.updated_at)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Application Timeline</h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium">Application Submitted</p>
                                <p className="text-sm text-muted-foreground">{formatDate(application.updated_at)}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                                <Clock className="w-4 h-4 text-yellow-600" />
                            </div>
                            <div>
                                <p className="font-medium text-yellow-700">Under Review</p>
                                <p className="text-sm text-muted-foreground">Your application is being processed</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 opacity-40">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-4 h-4 text-gray-400" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-500">Decision</p>
                                <p className="text-sm text-muted-foreground">Pending</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
