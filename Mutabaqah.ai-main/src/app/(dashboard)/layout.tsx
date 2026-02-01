'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Shield,
  LayoutDashboard,
  FileText,
  Activity,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
  Settings,
  Bell,
  Search,
  Plus,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/dashboard/transactions', icon: FileText },
  { name: 'Live Monitor', href: '/dashboard/monitor', icon: Activity },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut({ callbackUrl: '/login' });
  };

  // Always show Admin for demo purposes
  const userName = 'Admin';
  const userEmail = 'admin@mutabaqah.ai';
  const userInitials = 'AD';

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 h-[73px] border-b border-slate-700/50">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/25">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">Mutabaqah</span>
              <span className="text-xl font-light text-green-400">.ai</span>
            </div>
            <button
              className="ml-auto lg:hidden text-slate-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Quick Action */}
          <div className="px-4 py-4">
            <Link href="/dashboard/transactions/new">
              <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25 border-0">
                <Plus className="h-4 w-4 mr-2" />
                New Transaction
              </Button>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 space-y-1">
            <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Main Menu
            </p>
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/10 text-green-400 border border-green-500/20 shadow-lg shadow-green-500/5'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={cn('h-5 w-5', isActive && 'text-green-400')} />
                  <span className="font-medium">{item.name}</span>
                  {item.name === 'Live Monitor' && (
                    <span className="ml-auto flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Help Section */}
          <div className="px-4 py-4 mx-3 mb-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <HelpCircle className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Need Help?</p>
                <p className="text-xs text-slate-400">Check documentation</p>
              </div>
            </div>
          </div>

          {/* User section */}
          <div className="border-t border-slate-700/50 p-4">
            <div className="relative">
              <button
                className="flex items-center gap-3 w-full px-3 py-3 rounded-xl hover:bg-slate-800/50 transition-all duration-200"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <Avatar className="h-10 w-10 ring-2 ring-green-500/30">
                  <AvatarFallback className="bg-gradient-to-br from-green-400 to-emerald-600 text-white font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-white">{userName}</p>
                  <p className="text-xs text-slate-400">{userEmail}</p>
                </div>
                <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform duration-200', userMenuOpen && 'rotate-180')} />
              </button>

              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 rounded-xl shadow-xl border border-slate-700 py-2 overflow-hidden">
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <div className="border-t border-slate-700 my-1"></div>
                  <button
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors disabled:opacity-50"
                    onClick={handleLogout}
                    disabled={loggingOut}
                  >
                    {loggingOut ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}
                    {loggingOut ? 'Signing out...' : 'Sign out'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-[73px]">
          <div className="flex items-center justify-between px-4 lg:px-8 h-full">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6 text-slate-600" />
              </button>

              {/* Search Bar */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl w-80">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="bg-transparent border-none outline-none text-sm text-slate-600 placeholder-slate-400 w-full"
                />
                <kbd className="hidden lg:inline-flex items-center px-2 py-0.5 text-xs text-slate-400 bg-white rounded border border-slate-200">
                  ⌘K
                </kbd>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Status Badge */}
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium text-green-700">All Systems Online</span>
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <Bell className="h-5 w-5 text-slate-600" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Mobile User Avatar */}
              <div className="lg:hidden">
                <Avatar className="h-9 w-9 ring-2 ring-green-500/30">
                  <AvatarFallback className="bg-gradient-to-br from-green-400 to-emerald-600 text-white text-sm font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6 lg:p-8 bg-slate-50 min-h-[calc(100vh-73px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
