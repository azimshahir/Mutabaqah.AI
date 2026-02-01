'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function NewTransactionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    customerName: '',
    customerId: '',
    commodityType: 'CPO',
    amount: '',
    currency: 'MYR',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create transaction');
        return;
      }

      router.push(`/dashboard/transactions/${data.transaction.id}/audit`);
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Back Button */}
      <Link href="/dashboard/transactions" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to Transactions
      </Link>

      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-semibold text-slate-900">New Tawarruq Transaction</CardTitle>
          <CardDescription className="text-slate-500">Create a new commodity purchase transaction</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  placeholder="Enter customer full name"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerId">Customer ID *</Label>
                <Input
                  id="customerId"
                  name="customerId"
                  placeholder="e.g., CUS-001"
                  value={formData.customerId}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commodityType">Commodity Type *</Label>
              <select
                id="commodityType"
                name="commodityType"
                className="w-full h-10 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors cursor-pointer"
                value={formData.commodityType}
                onChange={handleChange}
                required
              >
                <option value="CPO">CPO - Crude Palm Oil</option>
                <option value="FPOL">FPOL - RBD Palm Olein Futures</option>
                <option value="FUPO">FUPO - USD Palm Olein Futures</option>
                <option value="FGLD">FGLD - Gold Futures</option>
                <option value="OTHER">OTHER - Other Commodity</option>
              </select>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  name="currency"
                  className="w-full h-10 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors cursor-pointer"
                  value={formData.currency}
                  onChange={handleChange}
                >
                  <option value="MYR">MYR - Malaysian Ringgit</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="SGD">SGD - Singapore Dollar</option>
                </select>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h4 className="font-medium text-emerald-800 mb-2">Tawarruq Process</h4>
              <p className="text-sm text-emerald-700">
                After creating this transaction, the system will automatically set up the audit trail
                for the three Tawarruq stages:
              </p>
              <ul className="mt-2 text-sm text-emerald-700 space-y-1">
                <li>• T0 - Wakalah Agreement (Agent Appointment)</li>
                <li>• T1 - Qabd (Commodity Purchase)</li>
                <li>• T2 - Liquidate (Murabahah Sale)</li>
              </ul>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
              <Link href="/dashboard/transactions">
                <Button type="button" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Transaction'
                )}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
