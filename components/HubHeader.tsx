'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useHubUser } from '@/components/hub/HubUserProvider'

interface HubHeaderProps {
  user?: any
  onLogout?: () => Promise<void> | void
  showBackButton?: boolean
  backHref?: string
  title?: string
  subtitle?: string
}

export default function HubHeader({
  user,
  onLogout,
  showBackButton = false,
  backHref = '/hub/dashboard',
  title,
  subtitle,
}: HubHeaderProps) {
  const router = useRouter()
  const { user: contextUser, role } = useHubUser()
  const [menuOpen, setMenuOpen] = useState(false)

  const displayUser = contextUser || (user ? { email: user.email, name: user.user_metadata?.full_name } : null)

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout()
      return
    }
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/hub/login')
  }

  const clientMenu = [
    { label: 'Events', href: '/hub/events' },
    { label: 'Profile', href: '/hub/profile' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Logout', action: 'logout' as const },
  ]

  const adminMenu = [
    { label: 'Clients', href: '/hub/clients' },
    { label: 'Events', href: '/hub/events' },
    { label: 'Profile', href: '/hub/profile' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Logout', action: 'logout' as const },
  ]

  const menuItems = role === 'admin' ? adminMenu : clientMenu
  const avatarInitial =
    displayUser?.name?.charAt(0)?.toUpperCase() || displayUser?.email?.charAt(0)?.toUpperCase() || 'C'

  return (
    <header className="bg-primary-white border-b border-primary-charcoal/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4 md:py-6">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6 min-w-0 flex-1">
            <Link href="/hub/dashboard" className="group flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/cje-media-logo.png"
                alt="CJE Media"
                className="h-16 sm:h-24 md:h-32 lg:h-40 w-auto max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px] transition-opacity group-hover:opacity-80"
              />
            </Link>
            {showBackButton && (
              <button
                onClick={() => router.push(backHref)}
                className="text-xs sm:text-sm text-primary-charcoal/70 hover:text-primary-charcoal transition-colors flex-shrink-0"
              >
                ← Back
              </button>
            )}
            {title && (
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-serif font-bold text-primary-black truncate">{title}</h1>
                {subtitle && <p className="text-xs sm:text-sm text-primary-charcoal/70 mt-1 sm:mt-2 truncate">{subtitle}</p>}
              </div>
            )}
          </div>

          <div className="relative flex-shrink-0">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="bg-primary-tiffany text-primary-white w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
              aria-label="User menu"
            >
              {avatarInitial}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-primary-charcoal/10 shadow-xl z-20">
                {displayUser && (
                  <div className="px-4 py-3 border-b border-primary-charcoal/10">
                    <p className="text-sm font-semibold text-primary-charcoal">{displayUser.email}</p>
                    <p className="text-xs text-primary-charcoal/60">{role.toUpperCase()}</p>
                  </div>
                )}
                <div className="py-2">
                  {menuItems.map((item) =>
                    item.action === 'logout' ? (
                      <button
                        key={item.label}
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-primary-charcoal hover:bg-primary-charcoal/5"
                      >
                        Logout
                      </button>
                    ) : (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="block px-4 py-2 text-sm text-primary-charcoal hover:bg-primary-charcoal/5"
                        onClick={() => setMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

