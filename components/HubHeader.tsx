'use client'

import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

interface HubHeaderProps {
  user?: any
  onLogout?: () => void
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
  const [currentUser, setCurrentUser] = useState(user)

  useEffect(() => {
    if (!currentUser) {
      const getUser = async () => {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setCurrentUser(user)
      }
      getUser()
    }
  }, [currentUser])

  const handleLogout = async () => {
    if (onLogout) {
      onLogout()
    } else {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/hub/login')
    }
  }

  return (
    <header className="bg-primary-white border-b border-primary-charcoal/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/hub/dashboard" className="group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/cje-media-logo.png"
                alt="CJE Media"
                className="h-32 md:h-40 w-auto max-w-[400px] md:max-w-[500px] transition-opacity group-hover:opacity-80"
              />
            </Link>
            {showBackButton && (
              <button
                onClick={() => router.push(backHref)}
                className="text-sm text-primary-charcoal/70 hover:text-primary-charcoal transition-colors"
              >
                ← Back
              </button>
            )}
            {title && (
              <div>
                <h1 className="text-3xl font-serif font-bold text-primary-black">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-primary-charcoal/70 mt-2">{subtitle}</p>
                )}
              </div>
            )}
          </div>
          {currentUser && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-primary-charcoal/70">
                {currentUser.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-primary-charcoal/70 hover:text-primary-charcoal transition-colors"
              >
                <LogOut size={18} />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

