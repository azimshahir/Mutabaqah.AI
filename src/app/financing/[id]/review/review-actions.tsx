'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { submitApplication, signWakalah } from '../../actions'
import { Loader2 } from 'lucide-react'

export function ReviewActions({ applicationId }: { applicationId: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async () => {
        setLoading(true)
        try {
            // 1. Submit Application
            const submitRes = await submitApplication(applicationId)
            if (submitRes.error && submitRes.error !== 'Application already submitted') {
                throw new Error(submitRes.error)
            }

            // 2. Sign Wakalah (Start T1)
            // Note: In a real app we might want the user to explicitly 'Sign' separate from 'Submit',
            // but user asked for "Review and Submit" leading to "T1 Pending".
            // We'll call signWakalah immediately after submitting.
            const wakalahRes = await signWakalah(applicationId)
            if (wakalahRes.error) {
                throw new Error(wakalahRes.error)
            }

            // 3. Navigate to T1 Pending
            router.push(`/financing/${applicationId}/processing/t1`)
        } catch (error) {
            console.error(error)
            alert('Failed to process application. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            size="lg"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                </>
            ) : (
                'Confirm & Submit Application'
            )}
        </Button>
    )
}
