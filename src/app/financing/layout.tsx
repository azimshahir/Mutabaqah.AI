import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { logout } from '@/app/(auth)/actions'
import { BankRakyatLogoWhite } from '@/components/logo'

export default async function FinancingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get customer info
  const { data: customer } = await supabase
    .from('customers')
    .select('full_name, is_admin')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-[#0e4f8b] text-white shadow-md">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/financing">
            <BankRakyatLogoWhite size="sm" />
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-blue-100 hidden sm:inline">
              {customer?.full_name || user.email}
            </span>
            {customer?.is_admin && (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 hover:text-white border border-white/30"
              >
                <Link href="/admin">Admin</Link>
              </Button>
            )}
            <form action={logout}>
              <Button
                variant="ghost"
                size="sm"
                type="submit"
                className="text-white hover:bg-white/20 hover:text-white border border-white/30"
              >
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6 mt-auto">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Bank Rakyat. All rights reserved.</p>
          <p className="mt-1">Licensed by Bank Negara Malaysia. Shariah-compliant banking.</p>
        </div>
      </footer>
    </div>
  )
}
