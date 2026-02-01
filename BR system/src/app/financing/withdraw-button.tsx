'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { withdrawApplication } from './actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function WithdrawButton({ applicationId, applicationNumber }: { applicationId: string, applicationNumber: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleWithdraw = async (e: React.MouseEvent) => {
        e.preventDefault() // Prevent navigation if inside a Link
        e.stopPropagation()

        if (!confirm(`Are you sure you want to withdraw application ${applicationNumber}? This action cannot be undone.`)) {
            return
        }

        setLoading(true)
        try {
            const result = await withdrawApplication(applicationId)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Application withdrawn successfully')
                router.refresh()
            }
        } catch (error) {
            toast.error('Failed to withdraw application')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="destructive"
            size="sm"
            className="z-10 pointer-events-auto" // Ensure it's clickable above the card link
            onClick={handleWithdraw}
            disabled={loading}
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Withdraw
                </>
            )}
        </Button>
    )
}
