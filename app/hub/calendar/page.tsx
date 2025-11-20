'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar as CalendarIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import HubHeader from '@/components/HubHeader'

export default function CalendarPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/hub/login')
        return
      }

      setUser(user)
      setLoading(false)
    }

    loadUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary-charcoal/70">Loading...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-primary-white">
      <HubHeader user={user} onLogout={async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/hub/login')
      }} />

      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-12 space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <CalendarIcon size={24} className="sm:w-8 sm:h-8 text-primary-tiffany flex-shrink-0" />
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-primary-charcoal">My Calendar</h1>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
          <p className="text-sm sm:text-base text-primary-charcoal/70 mb-3 sm:mb-4">
            View all your upcoming bookings and appointments.
          </p>
          <div className="rounded-lg overflow-hidden border border-primary-charcoal/10">
            <iframe
              src="https://calendar.google.com/calendar/embed?src=media%40ciarajevans.com&ctz=America%2FChicago"
              className="w-full h-[500px] sm:h-[600px] lg:h-[700px] border-0"
              title="CJE Media Calendar"
            />
          </div>
        </div>
      </div>
    </main>
  )
}

