'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function T1ProcessingPage({ params }: { params: Promise<{ id: string }> }) {
    const [status, setStatus] = useState<string>('loading')
    const router = useRouter()

    // Unwrap params
    // Note: in Next.js 15 params is a Promise, need to unwrap. 
    // But strictly in client components it might differ or need `use`. 
    // For safety, handled in useEffect.
    const [id, setId] = useState<string | null>(null)

    useEffect(() => {
        params.then(p => setId(p.id))
    }, [params])

    useEffect(() => {
        if (!id) return

        const checkStatus = async () => {
            const supabase = createClient()
            const { data } = await supabase
                .from('financing_applications')
                .select('status')
                .eq('id', id)
                .single()

            if (data) {
                if (data.status === 't1_validated' || data.status === 't2_pending' || data.status === 'approved') {
                    // Success
                    router.push(`/financing/${id}/validated/t1`)
                } else if (data.status === 'blocked') {
                    router.push(`/financing/${id}`)
                }
            }
        }

        // Initial check
        checkStatus()

        // Polling every 2s
        const interval = setInterval(checkStatus, 2000)
        return () => clearInterval(interval)
    }, [id, router])

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-emerald-700 font-bold text-xl">T1</span>
                </div>
            </div>

            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Processing T1 Transaction...</h2>
                <p className="text-muted-foreground">The Bank is purchasing the commodity on your behalf.</p>
                <p className="text-sm text-emerald-600 animate-pulse font-medium">Connecting to BSAS Platform...</p>
            </div>

            <div className="w-full max-w-md bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 animate-[progress_2s_ease-in-out_infinite]" style={{ width: '60%' }} />
            </div>
        </div>
    )
}
