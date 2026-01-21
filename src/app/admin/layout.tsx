import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { logout } from '@/app/(auth)/actions'
import { LayoutDashboard, FileText, LogOut, Zap, Settings } from 'lucide-react'
import { BankRakyatLogoWhite } from '@/components/logo'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: customer } = await supabase
    .from('customers')
    .select('full_name, is_admin')
    .eq('id', user.id)
    .single()

  if (!customer?.is_admin) {
    redirect('/financing')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-[#0e4f8b] text-white">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-3">
              <BankRakyatLogoWhite size="sm" />
              <span className="text-blue-200 text-sm">Admin Portal</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/admin/applications"
              className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors"
            >
              <FileText className="w-4 h-4" />
              Applications
            </Link>
            <Link
              href="/admin/automated-application"
              className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors"
            >
              <Zap className="w-4 h-4" />
              Automated Application
            </Link>
            <Link
              href="/admin/api-settings"
              className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
              API Keys
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-sm text-blue-100 hidden sm:inline">
              {customer?.full_name || user.email}
            </span>
            <form action={logout}>
              <Button
                variant="ghost"
                size="sm"
                type="submit"
                className="text-white hover:text-white hover:bg-white/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-[#1a6eb5] text-white px-4 py-2 flex gap-4">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-blue-100 hover:text-white text-sm"
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </Link>
        <Link
          href="/admin/applications"
          className="flex items-center gap-2 text-blue-100 hover:text-white text-sm"
        >
          <FileText className="w-4 h-4" />
          Applications
        </Link>
        <Link
          href="/admin/automated-application"
          className="flex items-center gap-2 text-blue-100 hover:text-white text-sm"
        >
          <Zap className="w-4 h-4" />
          Automated
        </Link>
        <Link
          href="/admin/api-settings"
          className="flex items-center gap-2 text-blue-100 hover:text-white text-sm"
        >
          <Settings className="w-4 h-4" />
          API Keys
        </Link>
      </nav>

      {/* Main Content */}
      <main className="container px-4 py-6">
        {children}
      </main>
    </div>
  )
}
