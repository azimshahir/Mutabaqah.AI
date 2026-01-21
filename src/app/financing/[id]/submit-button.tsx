'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { submitApplication } from '../actions'

type SubmitButtonProps = {
  applicationId: string
}

export function SubmitButton({ applicationId }: SubmitButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    const result = await submitApplication(applicationId)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.refresh()
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Application'}
      </Button>
    </div>
  )
}
