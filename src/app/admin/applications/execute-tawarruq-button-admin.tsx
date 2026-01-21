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
import { Loader2, Zap, CheckCircle2 } from 'lucide-react'
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

export function ExecuteTawarruqButtonAdmin({
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

    if (!isApproved) {
        return null // Don't show button for non-approved applications
    }

    return (
        <>
            <Button
                onClick={handleExecute}
                disabled={loading}
                className="bg-[#0e4f8b] hover:bg-[#0a3d6e]"
                size="sm"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Executing...
                    </>
                ) : (
                    <>
                        <Zap className="w-4 h-4 mr-2" />
                        Execute Tawarruq
                    </>
                )}
            </Button>

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
                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                                        DISBURSED
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
                                        <span>Sequence Check: PASS</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>Pricing Check: PASS</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>Ownership Check: PASS</span>
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
