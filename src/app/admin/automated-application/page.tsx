'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { generateAutomatedApplications } from './actions'
import { Loader2, Zap } from 'lucide-react'
import { toast } from 'sonner'

export default function AutomatedApplicationPage() {
    const [loading, setLoading] = useState(false)
    const [amount, setAmount] = useState('10')
    const [status, setStatus] = useState('pending')

    async function handleGenerate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData()
        formData.set('amount', amount)
        formData.set('status', status)

        const result = await generateAutomatedApplications(formData)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(`Successfully generated ${result.count} applications!`)
            setAmount('10')
        }

        setLoading(false)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Automated Application Generator</h1>
                <p className="text-muted-foreground">
                    Generate test applications with random data for testing purposes
                </p>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        Generate Test Applications
                    </CardTitle>
                    <CardDescription>
                        Create multiple applications with randomly generated customer data, amounts, and details.
                        Perfect for testing pagination, filtering, and bulk operations.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleGenerate} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Number of Applications</Label>
                            <Input
                                id="amount"
                                type="number"
                                min="1"
                                max="1000"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="e.g. 100"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Maximum: 1000 applications per generation
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Application Status</Label>
                            <Select value={status} onValueChange={setStatus} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="disbursed">Disbursed</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                All generated applications will have this status
                            </p>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-sm text-blue-900 mb-2">What will be generated:</h4>
                            <ul className="text-xs text-blue-700 space-y-1">
                                <li>• Random Malaysian names (e.g., Ahmad bin Abdullah)</li>
                                <li>• Random IC numbers in valid format</li>
                                <li>• Random phone numbers (012/013/014/etc.)</li>
                                <li>• Random email addresses</li>
                                <li>• Random financing amounts (RM 10,000 - RM 210,000)</li>
                                <li>• Random product types (Personal, Home, Vehicle, Business)</li>
                                <li>• Random tenure periods (12-120 months)</li>
                                <li>• Random occupations and employers</li>
                            </ul>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#f7941d] hover:bg-[#e8850a]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating {amount} {parseInt(amount) === 1 ? 'application' : 'applications'}...
                                </>
                            ) : (
                                <>
                                    <Zap className="mr-2 h-4 w-4" />
                                    Generate {amount} {parseInt(amount) === 1 ? 'Application' : 'Applications'}
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="max-w-2xl border-amber-200 bg-amber-50">
                <CardHeader>
                    <CardTitle className="text-amber-900">⚠️ Testing Tool</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-amber-800">
                    <p>
                        This tool is for <strong>testing purposes only</strong>. Generated applications will use
                        random data and will be associated with your admin account. Use the bulk delete features
                        in the Applications page to clean up test data.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
