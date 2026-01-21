'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { signWakalah, acceptAsset, liquidateAsset } from '../actions'

type FlowStep = 'IDLE' | 'WAKALAH_SIGNING' | 'WAKALAH_SIGNED' | 'ASSET_READY' | 'ASSET_ACCEPTED' | 'LIQUIDATING' | 'COMPLETED'

type Props = {
  applicationId: string
  applicantName: string
  principalAmount: number
  status: string
}

export function TawarruqFlow({ applicationId, applicantName, principalAmount, status }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<FlowStep>('IDLE')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txData, setTxData] = useState<{
    wakalahTime?: string
    t1Time?: string
    t2Time?: string
    commodityType?: string
    commodityId?: string
  }>({})

  // Only show for submitted status
  if (status !== 'submitted') {
    return null
  }

  const handleSignWakalah = async () => {
    setLoading(true)
    setError(null)
    setStep('WAKALAH_SIGNING')

    try {
      setTxData(prev => ({
        ...prev,
        wakalahTime: new Date().toLocaleTimeString('ms-MY'),
      }))
      setStep('WAKALAH_SIGNED')

      // Simulate brief delay then call server action
      await new Promise(resolve => setTimeout(resolve, 1000))

      const result = await signWakalah(applicationId)

      if (result.error) {
        setError(result.error)
        setStep('IDLE')
      } else {
        // T1 is processed by signWakalah
        setTxData(prev => ({
          ...prev,
          t1Time: new Date().toLocaleTimeString('ms-MY'),
          commodityType: (result.details?.commodity as string) || 'CPO',
          commodityId: (result.details?.reference as string) || 'COM-XXXXX',
        }))
        setStep('ASSET_READY')
        router.refresh()
      }
    } catch {
      setError('Gagal menandatangani Wakalah')
      setStep('IDLE')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptAsset = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await acceptAsset(applicationId)

      if (result.error) {
        setError(result.error)
      } else {
        setTxData(prev => ({
          ...prev,
          t2Time: new Date().toLocaleTimeString('ms-MY'),
        }))
        setStep('ASSET_ACCEPTED')
        router.refresh()
      }
    } catch {
      setError('Gagal menerima aset')
    } finally {
      setLoading(false)
    }
  }

  const handleLiquidate = async () => {
    setLoading(true)
    setError(null)
    setStep('LIQUIDATING')

    try {
      const result = await liquidateAsset(applicationId)

      if (result.error) {
        setError(result.error)
        setStep('ASSET_ACCEPTED')
      } else {
        setStep('COMPLETED')
        router.refresh()
      }
    } catch {
      setError('Gagal mencairkan aset')
      setStep('ASSET_ACCEPTED')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4">
          <div className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold">Proses Tawarruq</p>
              <p className="text-xs text-white/80">Kontrak Patuh Syariah</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Step 1: Wakalah */}
          {step === 'IDLE' && (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Langkah 1: Lantik Ejen</h3>
                <p className="text-sm text-gray-500">Kontrak Wakalah (Agensi)</p>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl border">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Mandat Pembelian Komoditi</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Saya, <span className="font-medium">{applicantName}</span>, melantik Bank sebagai ejen untuk membeli komoditi bernilai{' '}
                      <span className="font-bold text-emerald-600">RM {principalAmount.toLocaleString()}</span> bagi pihak saya.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-700">
                  <span className="font-semibold">Nota Syariah:</span> Wakalah adalah kontrak agensi di mana anda melantik Bank untuk bertindak bagi pihak anda dalam urusan pembelian komoditi.
                </p>
              </div>

              <Button
                onClick={handleSignWakalah}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-12"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Memproses...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                    </svg>
                    Sahkan & Lantik Ejen
                  </span>
                )}
              </Button>
            </div>
          )}

          {/* Wakalah Signing / Bank Processing T1 */}
          {(step === 'WAKALAH_SIGNING' || step === 'WAKALAH_SIGNED') && (
            <div className="text-center py-8 space-y-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 mx-auto border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  {step === 'WAKALAH_SIGNING' ? 'Menandatangani Wakalah...' : 'Bank Sedang Membeli Komoditi...'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {step === 'WAKALAH_SIGNING'
                    ? 'Sila tunggu sebentar'
                    : 'Transaksi T1 sedang diproses di platform BSAS'}
                </p>
              </div>
              {txData.wakalahTime && (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  Wakalah ditandatangani: {txData.wakalahTime}
                </Badge>
              )}
            </div>
          )}

          {/* Step 2: Accept Asset */}
          {step === 'ASSET_READY' && (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Langkah 2: Terima Aset</h3>
                <p className="text-sm text-gray-500">Akad Murabahah (Jual Beli)</p>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-emerald-600">Pemilikan Bank Sah</Badge>
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Komoditi Token</p>
                <p className="font-bold text-lg text-gray-900">{txData.commodityId || 'COM-XXXXX'}</p>
                <p className="text-sm text-gray-600 mt-1">{txData.commodityType || 'Crude Palm Oil (CPO)'}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="text-sm text-gray-700">
                  Bank kini memiliki komoditi ini dan menawarkan kepada anda secara <span className="font-semibold">Murabahah</span> (jualan dengan margin keuntungan yang dipersetujui).
                </p>
              </div>

              <div className="flex gap-2 text-xs">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  T1: {txData.t1Time || '-'}
                </Badge>
              </div>

              <Button
                onClick={handleAcceptAsset}
                disabled={loading}
                className="w-full bg-gray-900 hover:bg-gray-800 h-12"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Memproses...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Terima & Beli Aset
                  </span>
                )}
              </Button>
            </div>
          )}

          {/* Step 3: Liquidate */}
          {step === 'ASSET_ACCEPTED' && (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Aset Kini Milik Anda</h3>
                <p className="text-sm text-gray-500">Langkah 3: Pencairan (Opsional)</p>
              </div>

              <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                <p className="text-sm text-amber-800 mb-4">
                  Anda boleh memegang aset ini atau menjualnya kepada pihak ketiga untuk mendapatkan tunai segera.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-amber-700">Nilai Tunai</span>
                  <span className="font-bold text-xl text-amber-900">RM {principalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-2 text-xs">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  T1: {txData.t1Time || '-'}
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  T2: {txData.t2Time || '-'}
                </Badge>
              </div>

              <Button
                onClick={handleLiquidate}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-12"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Memproses...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Cairkan Untuk Tunai
                  </span>
                )}
              </Button>
            </div>
          )}

          {/* Liquidating */}
          {step === 'LIQUIDATING' && (
            <div className="text-center py-8 space-y-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 mx-auto border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
              <div>
                <h3 className="font-semibold text-gray-900">Mencairkan Aset...</h3>
                <p className="text-sm text-gray-500 mt-1">Menjual komoditi kepada pihak ketiga</p>
              </div>
            </div>
          )}

          {/* Completed */}
          {step === 'COMPLETED' && (
            <div className="text-center py-8 space-y-4 animate-in zoom-in duration-300">
              <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Tawarruq Selesai!</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Audit Syariah automatik telah mengesahkan transaksi ini sebagai <span className="text-emerald-600 font-semibold">PATUH SYARIAH</span>.
                </p>
              </div>
              <div className="flex justify-center gap-2 text-xs">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  Wakalah ✓
                </Badge>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  T1 ✓
                </Badge>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  T2 ✓
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
