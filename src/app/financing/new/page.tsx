'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createFinancingApplication } from '../actions'

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

export default function NewApplicationPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [productType, setProductType] = useState('')
  const [tenure, setTenure] = useState('')

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)

    // Add select values to formData
    formData.set('product_type', productType)
    formData.set('tenure_months', tenure)

    const result = await createFinancingApplication(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push(`/financing/${result.applicationId}`)
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
          <CardTitle>New Financing Application</CardTitle>
          <CardDescription>
            Fill in your details below to apply for Tawarruq financing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            {/* Section 1: Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="applicant_name">Full Name (as per IC) *</Label>
                  <Input
                    id="applicant_name"
                    name="applicant_name"
                    type="text"
                    placeholder="e.g. Ahmad bin Abdullah"
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
                  required
                />
              </div>
            </div>

            {/* Section 2: Employment Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Employment Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="applicant_occupation">Occupation *</Label>
                  <Input
                    id="applicant_occupation"
                    name="applicant_occupation"
                    type="text"
                    placeholder="e.g. Software Engineer"
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
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Gross monthly income before deductions
                </p>
              </div>
            </div>

            {/* Section 3: Financing Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Financing Details</h3>

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

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Profit Rate</span>
                  <span className="text-lg font-semibold">5.00% p.a.</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Fixed rate for all Tawarruq financing products
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Submitting...' : 'Submit Application'}
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
