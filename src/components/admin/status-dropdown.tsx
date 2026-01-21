'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { updateApplicationStatus } from '@/app/admin/actions'
import { ChevronDown, Loader2, CheckCircle, XCircle, Wallet, RotateCcw } from 'lucide-react'
import type { FinancingStatus } from '@/types/financing'

type StatusDropdownProps = {
  applicationId: string
  currentStatus: FinancingStatus
}

export function StatusDropdown({ applicationId, currentStatus }: StatusDropdownProps) {
  const [loading, setLoading] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const router = useRouter()

  const handleStatusChange = async (newStatus: FinancingStatus, reason?: string) => {
    setLoading(true)
    try {
      const result = await updateApplicationStatus(applicationId, newStatus, reason)
      if (result.error) {
        alert(result.error)
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    } finally {
      setLoading(false)
      setShowRejectDialog(false)
      setRejectionReason('')
    }
  }

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }
    handleStatusChange('rejected', rejectionReason)
  }

  // Determine available actions based on current status
  const getAvailableActions = () => {
    switch (currentStatus) {
      case 'pending':
        return [
          {
            label: 'Approve',
            status: 'approved' as FinancingStatus,
            icon: CheckCircle,
            className: 'text-green-600',
          },
          {
            label: 'Reject',
            status: 'rejected' as FinancingStatus,
            icon: XCircle,
            className: 'text-red-600',
            requiresReason: true,
          },
        ]
      case 'approved':
        return [
          {
            label: 'Mark as Disbursed',
            status: 'disbursed' as FinancingStatus,
            icon: Wallet,
            className: 'text-purple-600',
          },
        ]
      case 'rejected':
        return [
          {
            label: 'Reopen Application',
            status: 'pending' as FinancingStatus,
            icon: RotateCcw,
            className: 'text-yellow-600',
          },
        ]
      case 'disbursed':
        return [] // No actions available
      default:
        return []
    }
  }

  const actions = getAvailableActions()

  if (actions.length === 0) {
    return (
      <span className="text-sm text-muted-foreground">
        No actions available
      </span>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Actions
                <ChevronDown className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((action, index) => (
            <div key={action.status}>
              {index > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={() => {
                  if (action.requiresReason) {
                    setShowRejectDialog(true)
                  } else {
                    handleStatusChange(action.status)
                  }
                }}
                className={action.className}
              >
                <action.icon className="mr-2 h-4 w-4" />
                {action.label}
              </DropdownMenuItem>
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application.
              This will be visible to the applicant.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Rejection Reason</Label>
            <Textarea
              id="reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter the reason for rejection..."
              className="mt-2"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Reject Application'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
