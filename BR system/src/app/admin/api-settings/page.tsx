'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, Save, Key } from 'lucide-react'
import { toast } from 'sonner'

export default function ApiSettingsPage() {
    const [mounted, setMounted] = useState(false)
    const [apiUrl, setApiUrl] = useState('')
    const [apiKey, setApiKey] = useState('')
    const [loading, setLoading] = useState(false)

    // Load saved settings on mount - prevent hydration error
    useEffect(() => {
        setMounted(true)
        const savedUrl = localStorage.getItem('mutabaqah_api_url')
        const savedKey = localStorage.getItem('mutabaqah_api_key')

        if (savedUrl) setApiUrl(savedUrl)
        if (savedKey) setApiKey(savedKey)
    }, [])

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('🔧 Save button clicked!')
        console.log('API URL:', apiUrl)
        console.log('API Key:', apiKey ? '***' : 'empty')

        setLoading(true)

        try {
            // Basic validation - just check not empty (this is demo/mock)
            if (!apiUrl || apiUrl.trim() === '') {
                console.error('❌ API URL is empty')
                toast.error('API URL is required')
                setLoading(false)
                return
            }

            if (!apiKey || apiKey.trim() === '') {
                console.error('❌ API Key is empty')
                toast.error('API Key is required')
                setLoading(false)
                return
            }

            // Save to localStorage
            console.log('💾 Saving to localStorage...')
            localStorage.setItem('mutabaqah_api_url', apiUrl.trim())
            localStorage.setItem('mutabaqah_api_key', apiKey.trim())
            console.log('✅ Saved successfully!')
            console.log('📦 Stored:', {
                url: localStorage.getItem('mutabaqah_api_url'),
                key: localStorage.getItem('mutabaqah_api_key')
            })

            toast.success('API settings saved successfully!')
            alert('✅ API Settings Saved!\n\nURL: ' + apiUrl.trim() + '\nKey: ' + apiKey.trim())
        } catch (error) {
            console.error('❌ Error saving:', error)
            toast.error('Failed to save settings')
        } finally {
            setLoading(false)
        }
    }

    const handleClear = () => {
        if (confirm('Clear all API settings?')) {
            localStorage.removeItem('mutabaqah_api_url')
            localStorage.removeItem('mutabaqah_api_key')
            setApiUrl('')
            setApiKey('')
            toast.success('Settings cleared')
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Mutabaqah.AI API Settings</h1>
                <p className="text-muted-foreground">
                    Configure integration with external Mutabaqah.AI validation system
                </p>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-blue-500" />
                        API Configuration
                    </CardTitle>
                    <CardDescription>
                        Enter your Mutabaqah.AI API credentials to enable Tawarruq validation and execution
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="apiUrl">Mutabaqah API URL</Label>
                            <Input
                                id="apiUrl"
                                type="text"
                                value={apiUrl}
                                onChange={(e) => setApiUrl(e.target.value)}
                                placeholder="https://api.mutabaqah.ai/v1"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                The base URL for Mutabaqah.AI API endpoint (demo - any value works)
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="apiKey">API Key</Label>
                            <Input
                                id="apiKey"
                                type="text"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="demo-key-12345"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Your secret API key for authentication (demo - any value works)
                            </p>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                                <Key className="h-4 w-4 text-amber-600 mt-0.5" />
                                <div className="text-sm text-amber-800">
                                    <p className="font-medium">Security Notice</p>
                                    <p className="mt-1">
                                        API credentials are stored in browser localStorage for demo purposes.
                                        In production, use server-side environment variables.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-[#0e4f8b] hover:bg-[#0a3d6e]"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                Save Settings
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClear}
                                disabled={loading}
                            >
                                Clear Settings
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="max-w-2xl border-blue-200 bg-blue-50">
                <CardHeader>
                    <CardTitle className="text-blue-900">ℹ️ How It Works</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-800 space-y-2">
                    <p>
                        <strong>Tawarruq Execution Flow:</strong>
                    </p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Admin approves financing application</li>
                        <li>User clicks "Execute Tawarruq via Mutabaqah.AI"</li>
                        <li>System validates T1 → T2 → T3 sequence (3 seconds)</li>
                        <li>Mutabaqah.AI confirms Shariah compliance</li>
                        <li>Status automatically updates to DISBURSED</li>
                    </ol>
                </CardContent>
            </Card>
        </div>
    )
}
