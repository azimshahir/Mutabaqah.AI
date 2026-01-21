'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { acceptAsset } from '../../../actions'
import { Loader2, CheckCircle } from 'lucide-react'

export function AcceptAction({ applicationId }: { applicationId: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleAccept = async () => {
        setLoading(true)
        try {
            const result = await acceptAsset(applicationId)
            if (result.error) {
                throw new Error(result.error)
            }

            // Navigate to T2 Pending (Processing)
            router.push(`/financing/${applicationId}/processing/t2`)
        } catch (error) {
            console.error(error)
            alert('Failed to accept asset. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            size="lg"
            onClick={handleAccept}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg"
        >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing Acceptance...
                </>
            ) : (
                <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Accept & Buy Asset
                </>
            )}
        </Button>
    )
}
