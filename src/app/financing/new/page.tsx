'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createFinancingApplication } from '../actions'
import { Loader2, Save, Trash2 } from 'lucide-react'

const productTypes = [
  { value: 'personal_financing_i', label: 'Personal Financing-i' },
  { value: 'home_financing_i', label: 'Home Financing-i' },
  { value: 'vehicle_financing_i', label: 'Vehicle Financing-i' },
  { value: 'business_financing_i', label: 'Business Financing-i' },
]

const tenureOptions = [
  { value: '12', label: '12 months (1 year)' },
  { value: '24', label: '24 months (2 years)' },
  { value: '36', label: '36 months (3 years)' },
  { value: '48', label: '48 months (4 years)' },
  { value: '60', label: '60 months (5 years)' },
  { value: '84', label: '84 months (7 years)' },
  { value: '120', label: '120 months (10 years)' },
]

const STORAGE_KEY = 'financing_application_draft'

export default function NewApplicationPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [productType, setProductType] = useState('')
  const [tenure, setTenure] = useState('')
  const [agreedToWakalah, setAgreedToWakalah] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Form fields state for auto-save
  const [formData, setFormData] = useState({
    applicant_name: '',
    applicant_ic: '',
    applicant_phone: '',
    applicant_email: '',
    applicant_address: '',
    applicant_occupation: '',
    applicant_employer: '',
    applicant_monthly_income: '',
    principal_amount: '',
  })

  // Load saved draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY)
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft)
        setFormData(draft.formData || {})
        setProductType(draft.productType || '')
        setTenure(draft.tenure || '')
        setAgreedToWakalah(draft.agreedToWakalah || false)
        setLastSaved(draft.lastSaved ? new Date(draft.lastSaved) : null)
      } catch (e) {
        console.error('Failed to load draft:', e)
      }
    }
  }, [])

  // Auto-save whenever form data changes
  useEffect(() => {
    const draft = {
      formData,
      productType,
      tenure,
      agreedToWakalah,
      lastSaved: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
    setLastSaved(new Date())
  }, [formData, productType, tenure, agreedToWakalah])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const clearDraft = () => {
    if (confirm('Are you sure you want to clear the saved draft?')) {
      localStorage.removeItem(STORAGE_KEY)
      setFormData({
        applicant_name: '',
        applicant_ic: '',
        applicant_phone: '',
        applicant_email: '',
        applicant_address: '',
        applicant_occupation: '',
        applicant_employer: '',
        applicant_monthly_income: '',
        principal_amount: '',
      })
      setProductType('')
      setTenure('')
      setAgreedToWakalah(false)
      setLastSaved(null)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!agreedToWakalah) {
      setError('You must agree to the Wakalah (Agency) Agreement to proceed.')
      return
    }

    setError(null)
    setLoading(true)

    // Build FormData from state
    const formDataToSubmit = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSubmit.set(key, value)
    })
    formDataToSubmit.set('product_type', productType)
    formDataToSubmit.set('tenure_months', tenure)

    const result = await createFinancingApplication(formDataToSubmit)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    // Clear draft after successful submission
    localStorage.removeItem(STORAGE_KEY)

    // Redirect to pending page
    router.push(`/financing/${result.applicationId}/pending`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/financing"
          className="text-sm text-muted-foreground hover:text-primary"
        >
          &larr; Back to Applications
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>New Financing Application</CardTitle>
              <CardDescription>
                Fill in your details below to apply for Shariah-compliant Tawarruq financing.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {lastSaved && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Save className="h-3 w-3" />
                  <span>Draft saved</span>
                </div>
              )}
              {lastSaved && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearDraft}
                  className="h-8 text-xs"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
                {error}
              </div>
            )}

            {/* Section 1: Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 text-[#0e4f8b]">Personal Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="applicant_name">Full Name (as per IC) *</Label>
                  <Input
                    id="applicant_name"
                    name="applicant_name"
                    type="text"
                    placeholder="e.g. Ahmad bin Abdullah"
                    value={formData.applicant_name}
                    onChange={(e) => handleInputChange('applicant_name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="applicant_ic">IC Number *</Label>
                  <Input
                    id="applicant_ic"
                    name="applicant_ic"
                    type="text"
                    placeholder="e.g. 900101-14-1234"
                    value={formData.applicant_ic}
                    onChange={(e) => handleInputChange('applicant_ic', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="applicant_phone">Phone Number *</Label>
                  <Input
                    id="applicant_phone"
                    name="applicant_phone"
                    type="tel"
                    placeholder="e.g. 012-3456789"
                    value={formData.applicant_phone}
                    onChange={(e) => handleInputChange('applicant_phone', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="applicant_email">Email Address *</Label>
                  <Input
                    id="applicant_email"
                    name="applicant_email"
                    type="email"
                    placeholder="e.g. ahmad@email.com"
                    value={formData.applicant_email}
                    onChange={(e) => handleInputChange('applicant_email', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicant_address">Home Address *</Label>
                <Textarea
                  id="applicant_address"
                  name="applicant_address"
                  placeholder="e.g. No. 123, Jalan ABC, Taman XYZ, 50000 Kuala Lumpur"
                  rows={3}
                  value={formData.applicant_address}
                  onChange={(e) => handleInputChange('applicant_address', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Section 2: Employment Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 text-[#0e4f8b]">Employment Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="applicant_occupation">Occupation *</Label>
                  <Input
                    id="applicant_occupation"
                    name="applicant_occupation"
                    type="text"
                    placeholder="e.g. Software Engineer"
                    value={formData.applicant_occupation}
                    onChange={(e) => handleInputChange('applicant_occupation', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="applicant_employer">Employer Name *</Label>
                  <Input
                    id="applicant_employer"
                    name="applicant_employer"
                    type="text"
                    placeholder="e.g. ABC Company Sdn Bhd"
                    value={formData.applicant_employer}
                    onChange={(e) => handleInputChange('applicant_employer', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicant_monthly_income">Monthly Income (MYR) *</Label>
                <Input
                  id="applicant_monthly_income"
                  name="applicant_monthly_income"
                  type="number"
                  placeholder="e.g. 5000"
                  min="0"
                  step="100"
                  value={formData.applicant_monthly_income}
                  onChange={(e) => handleInputChange('applicant_monthly_income', e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Gross monthly income before deductions
                </p>
              </div>
            </div>

            {/* Section 3: Financing Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 text-[#0e4f8b]">Financing Details</h3>

              <div className="space-y-2">
                <Label htmlFor="product_type">Product Type *</Label>
                <Select value={productType} onValueChange={setProductType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="principal_amount">Financing Amount (MYR) *</Label>
                  <Input
                    id="principal_amount"
                    name="principal_amount"
                    type="number"
                    placeholder="e.g. 50000"
                    min="1000"
                    step="100"
                    value={formData.principal_amount}
                    onChange={(e) => handleInputChange('principal_amount', e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum: RM 1,000
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tenure_months">Tenure *</Label>
                  <Select value={tenure} onValueChange={setTenure} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tenure" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenureOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#0e4f8b]">Profit Rate</span>
                  <span className="text-lg font-semibold text-[#0e4f8b]">5.00% p.a.</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Fixed rate for all Tawarruq financing products
                </p>
              </div>
            </div>

            {/* Section 4: Wakalah Agreement */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 text-[#0e4f8b]">
                Wakalah (Agency) Agreement
              </h3>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  By submitting this application, I hereby appoint <strong>Bank Rakyat</strong> as
                  my agent (Wakil) to:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                  <li>Purchase Shariah-compliant commodities on my behalf</li>
                  <li>Execute all necessary Tawarruq transactions</li>
                  <li>Sell the commodities to a third party and credit proceeds to my account</li>
                </ul>
                <p className="text-sm text-gray-700 mt-2">
                  This agency appointment is in accordance with Shariah principles and Bank Negara
                  Malaysia guidelines on Tawarruq.
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="wakalah-agreement"
                  checked={agreedToWakalah}
                  onCheckedChange={(checked) => setAgreedToWakalah(checked as boolean)}
                />
                <Label htmlFor="wakalah-agreement" className="text-sm leading-relaxed">
                  I have read and agree to the Wakalah (Agency) Agreement. I understand that by
                  submitting this application, I am appointing Bank Rakyat as my agent for
                  Tawarruq financing.
                </Label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading || !agreedToWakalah}
                className="flex-1 bg-[#f7941d] hover:bg-[#e8850a]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application and Appoint Bank as Agent'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
