'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { liquidateAsset } from '../../../actions'
import { Loader2, DollarSign } from 'lucide-react'

export function LiquidateAction({ applicationId }: { applicationId: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLiquidate = async () => {
        setLoading(true)
        try {
            const result = await liquidateAsset(applicationId)
            if (result.error) {
                throw new Error(result.error)
            }

            // Navigate to Approved (which acts as T2 Validated)
            router.push(`/financing/${applicationId}/approved`)
        } catch (error: any) {
            console.error(error)
            alert(`Failed to liquidate asset: ${error.message || 'Unknown error'}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            size="lg"
            onClick={handleLiquidate}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg"
        >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing Liquidation...
                </>
            ) : (
                <>
                    <DollarSign className="mr-2 h-5 w-5" />
                    Liquidate for Cash
                </>
            )}
        </Button>
    )
}
