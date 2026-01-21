'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, Zap, CheckCircle2, AlertCircle } from 'lucide-react'
import { executeTawarruqProcess } from '@/lib/mutabaqah/bridge'
import { updateApplicationStatus } from '@/lib/mutabaqah/actions'
import { toast } from 'sonner'
import type { TawarruqExecutionResult } from '@/lib/mutabaqah/types'

type ExecuteTawarruqButtonProps = {
    applicationId: string
    applicationNumber: string
    amount: number
    currentStatus: string
}

export function ExecuteTawarruqButton({
    applicationId,
    applicationNumber,
    amount,
    currentStatus
}: ExecuteTawarruqButtonProps) {
    const [loading, setLoading] = useState(false)
    const [showSuccessDialog, setShowSuccessDialog] = useState(false)
    const [result, setResult] = useState<TawarruqExecutionResult | null>(null)

    const isApproved = currentStatus === 'approved'

    const handleExecute = async () => {
        if (!isApproved) {
            toast.error('Only APPROVED financing can be executed')
            return
        }

        setLoading(true)

        try {
            // Execute Tawarruq process via Mutabaqah.AI
            const executionResult = await executeTawarruqProcess(
                applicationId,
                amount,
                currentStatus
            )

            // Check if error
            if ('error' in executionResult) {
                toast.error(executionResult.error)
                setLoading(false)
                return
            }

            // Success - update status to disbursed
            const updateResult = await updateApplicationStatus(applicationId, 'disbursed')

            if (updateResult.error) {
                toast.error('Failed to update status')
                setLoading(false)
                return
            }

            // Show success dialog
            setResult(executionResult)
            setShowSuccessDialog(true)
            toast.success('Tawarruq execution completed successfully!')

        } catch (error) {
            console.error('Execution error:', error)
            toast.error('Failed to execute Tawarruq process')
        } finally {
            setLoading(false)
        }
    }

    const handleDialogClose = () => {
        setShowSuccessDialog(false)
        // Refresh page to show updated status
        window.location.reload()
    }

    return (
        <>
            <Button
                onClick={handleExecute}
                disabled={!isApproved || loading}
                className={`w-full gap-2 ${isApproved
                        ? 'bg-[#0e4f8b] hover:bg-[#0a3d6e]'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                size="lg"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Mutabaqah.AI is validating T1 → T2 → T3...
                    </>
                ) : (
                    <>
                        <Zap className="w-5 h-5" />
                        Execute Tawarruq via Mutabaqah.AI
                    </>
                )}
            </Button>

            {!isApproved && (
                <p className="text-sm text-red-600 text-center mt-2 flex items-center justify-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Only APPROVED applications can execute Tawarruq
                </p>
            )}

            {/* Success Dialog */}
            <Dialog open={showSuccessDialog} onOpenChange={handleDialogClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            </div>
                        </div>
                        <DialogTitle className="text-center text-2xl">
                            Tawarruq Complete!
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            Shariah-compliant financing has been successfully validated and disbursed
                        </DialogDescription>
                    </DialogHeader>

                    {result && (
                        <div className="space-y-4 mt-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="text-center">
                                    <p className="text-sm text-green-700 mb-1">Amount Disbursed</p>
                                    <p className="text-3xl font-bold text-green-900">
                                        RM {result.amount.toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-500">Application</span>
                                    <span className="font-medium">{applicationNumber}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-500">Status</span>
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">
                                        {result.final_status.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-500">Compliance</span>
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                        {result.status}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-xs text-blue-900 font-medium mb-2">✅ Validation Complete</p>
                                <div className="space-y-1 text-xs text-blue-700">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>Sequence Check: {result.validation_details.sequence_check ? 'PASS' : 'FAIL'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>Pricing Check: {result.validation_details.pricing_check ? 'PASS' : 'FAIL'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>Ownership Check: {result.validation_details.ownership_check ? 'PASS' : 'FAIL'}</span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleDialogClose}
                                className="w-full bg-[#0e4f8b] hover:bg-[#0a3d6e]"
                            >
                                Close
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
