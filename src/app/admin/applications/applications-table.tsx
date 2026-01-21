'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { StatusDropdown } from '@/components/admin/status-dropdown'
import { ExecuteTawarruqButtonAdmin } from './execute-tawarruq-button-admin'
import { Trash2, Loader2, Zap } from 'lucide-react'
import { deleteSelectedApplications, deleteAllApplications } from '../automated-application/actions'
import { toast } from 'sonner'
import type { FinancingStatus, FinancingApplication } from '@/types/financing'

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ms-MY', {
        style: 'currency',
        currency: 'MYR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ms-MY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

const statusColors: Record<FinancingStatus, string> = {
    pending: 'bg-yellow-500',
    rejected: 'bg-red-500',
    approved: 'bg-green-500',
    disbursed: 'bg-purple-500',
}

const statusLabels: Record<FinancingStatus, string> = {
    pending: 'Pending',
    rejected: 'Rejected',
    approved: 'Approved',
    disbursed: 'Disbursed',
}

type ApplicationsTableProps = {
    applications: FinancingApplication[]
}

export function ApplicationsTable({ applications }: ApplicationsTableProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)

    const totalPages = Math.ceil(applications.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentApplications = applications.slice(startIndex, endIndex)

    const toggleSelectAll = () => {
        if (selectedIds.length === currentApplications.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(currentApplications.map(app => app.id))
        }
    }

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return

        if (!confirm(`Delete ${selectedIds.length} selected application(s)?`)) return

        setLoading(true)
        const result = await deleteSelectedApplications(selectedIds)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(`Deleted ${result.count} application(s)`)
            setSelectedIds([])
            window.location.reload()
        }
        setLoading(false)
    }

    const handleDeleteAll = async () => {
        if (!confirm('⚠️ DELETE ALL APPLICATIONS? This cannot be undone!')) return
        if (!confirm('Are you absolutely sure? This will delete ALL applications in the database.')) return

        setLoading(true)
        const result = await deleteAllApplications()

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('All applications deleted')
            setSelectedIds([])
            window.location.reload()
        }
        setLoading(false)
    }

    const handleBulkExecute = async () => {
        // Get all approved applications
        const approvedApps = applications.filter(app => app.status === 'approved')

        if (approvedApps.length === 0) {
            toast.error('No approved applications to execute')
            return
        }

        if (!confirm(`Execute Tawarruq for ${approvedApps.length} approved application(s)?`)) return

        setLoading(true)
        let successCount = 0
        let errorCount = 0

        for (const app of approvedApps) {
            try {
                const { executeTawarruqProcess } = await import('@/lib/mutabaqah/bridge')
                const { updateApplicationStatus } = await import('@/lib/mutabaqah/actions')

                const result = await executeTawarruqProcess(app.id, app.principal_amount, app.status)

                if ('error' in result) {
                    errorCount++
                    console.error(`Failed to execute ${app.application_number}:`, result.error)
                } else {
                    await updateApplicationStatus(app.id, 'disbursed')
                    successCount++
                }
            } catch (error) {
                errorCount++
                console.error(`Error executing ${app.application_number}:`, error)
            }
        }

        setLoading(false)

        if (successCount > 0) {
            toast.success(`Successfully executed ${successCount} application(s)`)
            window.location.reload()
        }

        if (errorCount > 0) {
            toast.error(`Failed to execute ${errorCount} application(s)`)
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Applications</CardTitle>
                    <div className="flex items-center gap-2">
                        {/* Items per page selector */}
                        <Select
                            value={itemsPerPage.toString()}
                            onValueChange={(value) => {
                                setItemsPerPage(parseInt(value))
                                setCurrentPage(1)
                            }}
                        >
                            <SelectTrigger className="w-[100px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="30">30</SelectItem>
                                <SelectItem value="60">60</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Execute to Mutabaqah.AI button */}
                        <Button
                            className="bg-[#0e4f8b] hover:bg-[#0a3d6e]"
                            size="sm"
                            onClick={handleBulkExecute}
                            disabled={loading || applications.filter(app => app.status === 'approved').length === 0}
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Zap className="h-4 w-4 mr-2" />
                                    Execute to Mutabaqah.AI
                                </>
                            )}
                        </Button>

                        {/* Delete selected button */}
                        {selectedIds.length > 0 && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleDeleteSelected}
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete ({selectedIds.length})
                                    </>
                                )}
                            </Button>
                        )}

                        {/* Delete all button */}
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDeleteAll}
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete All
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {applications.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                        No applications found matching your criteria.
                    </p>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={selectedIds.length === currentApplications.length && currentApplications.length > 0}
                                                onCheckedChange={toggleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead>Application ID</TableHead>
                                        <TableHead>Customer Name</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentApplications.map((app: FinancingApplication) => (
                                        <TableRow key={app.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedIds.includes(app.id)}
                                                    onCheckedChange={() => toggleSelect(app.id)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {app.application_number}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{app.applicant_name}</p>
                                                    <p className="text-sm text-muted-foreground">{app.applicant_email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-[#0e4f8b]">
                                                {formatCurrency(app.principal_amount)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={statusColors[app.status as FinancingStatus] || 'bg-gray-500'}>
                                                    {statusLabels[app.status as FinancingStatus] || app.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {formatDate(app.created_at)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <StatusDropdown
                                                    applicationId={app.id}
                                                    currentStatus={app.status as FinancingStatus}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-muted-foreground">
                                    Showing {startIndex + 1} to {Math.min(endIndex, applications.length)} of {applications.length} applications
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
