import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { logout } from '@/app/(auth)/actions'
import { LayoutDashboard, FileText, LogOut, Zap } from 'lucide-react'
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
      {/* Modern Admin Header */}
      <header className="sticky top-0 z-50 w-full border-b backdrop-blur-sm bg-gradient-to-r from-[#0e4f8b] via-[#1a6eb5] to-[#0e4f8b] shadow-lg">
        <div className="container flex h-20 items-center justify-between px-6">
          {/* Logo Section */}
          <Link href="/admin" className="flex items-center gap-4 group">
            <div className="bg-white/10 p-2.5 rounded-xl group-hover:bg-white/20 transition-all duration-300">
              <BankRakyatLogoWhite size="sm" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-semibold text-lg">Admin Portal</span>
              <span className="text-blue-200 text-xs">Bank Rakyat System</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-white/90 hover:text-white hover:bg-white/15 transition-all duration-200 font-medium"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/admin/applications"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-white/90 hover:text-white hover:bg-white/15 transition-all duration-200 font-medium"
            >
              <FileText className="w-4 h-4" />
              <span>Applications</span>
            </Link>
            <Link
              href="/admin/automated-application"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-white/90 hover:text-white hover:bg-white/15 transition-all duration-200 font-medium"
            >
              <Zap className="w-4 h-4" />
              <span>Auto Process</span>
            </Link>
          </nav>

          {/* User & Logout Section */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-white font-medium text-sm">
                {customer?.full_name || 'Admin'}
              </span>
              <span className="text-blue-200 text-xs">{user.email}</span>
            </div>
            <form action={logout}>
              <Button
                variant="ghost"
                size="sm"
                type="submit"
                className="text-white hover:text-white hover:bg-red-500/20 border border-white/20 hover:border-red-400/40 transition-all duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Modern Mobile Navigation */}
      <nav className="md:hidden bg-gradient-to-r from-[#1a6eb5] to-[#0e4f8b] text-white px-3 py-3 flex gap-2 overflow-x-auto shadow-md">
        <Link
          href="/admin"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/15 text-sm font-medium whitespace-nowrap transition-all duration-200"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>
        <Link
          href="/admin/applications"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/15 text-sm font-medium whitespace-nowrap transition-all duration-200"
        >
          <FileText className="w-4 h-4" />
          <span>Applications</span>
        </Link>
        <Link
          href="/admin/automated-application"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/15 text-sm font-medium whitespace-nowrap transition-all duration-200"
        >
          <Zap className="w-4 h-4" />
          <span>Auto Process</span>
        </Link>
      </nav>

      {/* Main Content */}
      <main className="container px-4 py-6">
        {children}
      </main>
    </div>
  )
}
