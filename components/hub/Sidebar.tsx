'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  FolderKanban,
  Download,
  MessageSquare,
  Receipt,
  Settings,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/hub/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/hub/bookings', icon: Calendar, label: 'My Bookings' },
  { href: '/hub/projects', icon: FolderKanban, label: 'Projects' },
  { href: '/hub/deliverables', icon: Download, label: 'Resources' },
  { href: '/hub/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/hub/invoices', icon: Receipt, label: 'Invoices' },
  { href: '/hub/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/hub/login')
  }

  return (
    <aside className="w-64 bg-[#1a1a1a] border-r border-[#333333] min-h-screen flex flex-col">
      <div className="p-6 border-b border-[#333333]">
        <Link href="/hub/dashboard" className="flex items-center gap-3">
          <img
            src="/images/cje-logo.png"
            alt="The CJE Experience"
            className="h-8 w-auto brightness-0 invert"
          />
          <span className="text-white font-semibold text-sm">The CJE Experience</span>
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

      <div className="p-4 border-t border-[#333333]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#a1a1a1] hover:bg-red-500/10 hover:text-red-400 w-full transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  )
}

