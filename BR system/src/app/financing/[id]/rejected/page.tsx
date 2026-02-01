import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { XCircle, FileText, Phone, Mail } from 'lucide-react'

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
    })
}

export default async function RejectedPage({ params }: PageProps) {
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
                    <h1 className="text-2xl font-bold">Application Status</h1>
                    <p className="text-muted-foreground">{application.application_number}</p>
                </div>
                <Badge className="bg-red-500 w-fit">Rejected</Badge>
            </div>

            {/* Status Card */}
            <Card className="overflow-hidden border-red-200 bg-red-50">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-red-900 text-lg">Application Not Approved</h3>
                            <p className="text-red-700 mt-1">
                                We regret to inform you that your financing application has not been approved at this time.
                            </p>
                            {application.rejection_reason && (
                                <div className="mt-4 p-3 bg-white rounded-lg border border-red-200">
                                    <p className="text-sm font-medium text-red-900">Reason:</p>
                                    <p className="text-sm text-red-700 mt-1">{application.rejection_reason}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Application Summary */}
            <Card>
                <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-3 border-b pb-4">
                        <FileText className="w-5 h-5 text-gray-500" />
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
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">Financing Details</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Requested Amount</span>
                                    <span className="font-medium">{formatCurrency(application.principal_amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Application Date</span>
                                    <span className="font-medium">{formatDate(application.created_at)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">What&apos;s Next?</h3>
                    <div className="space-y-4">
                        <p className="text-muted-foreground">
                            If you believe this decision was made in error or would like more information,
                            please contact our customer service team.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button variant="outline" className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                1-300-80-5454
                            </Button>
                            <Button variant="outline" className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                customerservice@bankrakyat.com.my
                            </Button>
                        </div>
                        <div className="pt-4 border-t">
                            <p className="text-sm text-muted-foreground mb-3">
                                You may also submit a new application with updated information.
                            </p>
                            <Button asChild className="bg-[#0e4f8b] hover:bg-[#0a3d6e]">
                                <Link href="/financing/new">Submit New Application</Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
