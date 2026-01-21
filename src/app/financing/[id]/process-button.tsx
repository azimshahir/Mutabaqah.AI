'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { processFullFlow } from '../actions'

type Props = {
  applicationId: string
  status: string
}

export function ProcessButton({ applicationId, status }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // Only show for submitted status
  if (status !== 'submitted') {
    return null
  }

  async function handleProcess() {
    setLoading(true)
    setResult(null)

    try {
      const res = await processFullFlow(applicationId)

      if (res.error) {
        setResult({ type: 'error', message: res.error })
      } else {
        setResult({ type: 'success', message: res.message || 'Processing complete!' })
        // Refresh the page to show updated status
        router.refresh()
      }
    } catch {
      setResult({ type: 'error', message: 'Processing failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-medium">Ready for Tawarruq Processing</p>
          <p className="text-sm text-muted-foreground">
            Click to process T1 (Bank Purchase) → T2 (Customer Sale) → Approval
          </p>
        </div>
        <Button onClick={handleProcess} disabled={loading} className="min-w-[140px]">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span>
              Processing...
            </span>
          ) : (
            'Process Now'
          )}
        </Button>
      </div>

      {result && (
        <div
          className={`p-3 rounded-md text-sm ${
            result.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {result.message}
        </div>
      )}
    </div>
  )
}
