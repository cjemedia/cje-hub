'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  Calendar,
  FolderKanban,
  MessageSquare,
  Receipt,
  ArrowLeft,
  LogOut,
  ChevronUp,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useHubUser } from '@/components/hub/HubUserProvider'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Admin Home' },
  { href: '/admin/clients', icon: Users, label: 'Clients' },
  { href: '/admin/bookings', icon: Calendar, label: 'Bookings' },
  { href: '/admin/projects', icon: FolderKanban, label: 'Projects' },
  { href: '/admin/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/admin/invoices', icon: Receipt, label: 'Invoices' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, role } = useHubUser()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const avatarInitial = user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'

  return (
    <aside className="w-64 bg-[#1a1a1a] border-r border-[#333333] min-h-screen flex flex-col">
      <div className="p-6 border-b border-[#333333]">
        <Link href="/hub/dashboard" className="flex items-center gap-3 mb-4 text-[#a1a1a1] hover:text-white transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm">Back to Portal</span>
        </Link>
        <Link href="/admin" className="flex items-center gap-3">
          <img
            src="/images/cje-logo.png"
            alt="The CJE Experience"
            className="h-8 w-auto brightness-0 invert"
          />
          <div>
            <span className="text-white font-semibold text-sm block">The CJE Experience</span>
            <span className="text-[#81D8D0] text-xs">Admin Dashboard</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#81D8D0]/10 text-[#81D8D0]'
                      : 'text-[#a1a1a1] hover:bg-[#81D8D0]/10 hover:text-white'
                  )}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="mt-auto p-4 border-t border-[#333333] space-y-2">
        <Link
          href="https://www.ciarajevans.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#a1a1a1] hover:bg-[#81D8D0]/10 hover:text-white transition-colors"
        >
          <ExternalLink size={20} />
          Main Site
        </Link>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#81D8D0] flex items-center justify-center text-dark font-semibold flex-shrink-0">
              {avatarInitial}
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name || 'Admin'}</p>
              <p className="text-[#a1a1a1] text-xs capitalize">{role || 'Admin'}</p>
            </div>
            {menuOpen ? <ChevronUp size={16} className="text-[#a1a1a1] flex-shrink-0" /> : <ChevronDown size={16} className="text-[#a1a1a1] flex-shrink-0" />}
          </button>
          
          {menuOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#1a1a1a] border border-[#333333] rounded-lg shadow-xl py-2 z-50">
              <Link
                href="/hub/profile"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-sm text-white hover:bg-white/5 transition-colors"
              >
                Profile
              </Link>
              <Link
                href="/privacy"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-sm text-white hover:bg-white/5 transition-colors"
              >
                Privacy Policy
              </Link>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  handleLogout()
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <LogOut size={16} />
                  Logout
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

