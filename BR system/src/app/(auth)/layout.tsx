import { BankRakyatLogo } from '@/components/logo'

type AuthLayoutProps = {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center islamic-pattern px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <BankRakyatLogo size="lg" className="bg-white/90 p-4 rounded-xl shadow-lg" />
        </div>
        <div className="bg-white rounded-xl shadow-xl p-6">
          {children}
        </div>
        <p className="text-center text-blue-100 text-sm mt-6">
          Shariah-compliant Islamic Financing
        </p>
      </div>
    </div>
  )
}
