'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, MapPin, DollarSign, Users, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import Button from '@/components/Button'
import HubHeader from '@/components/HubHeader'

export default function EventsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/hub/login')
        return
      }

      setUser(user)

      // Fetch events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })

      setEvents(eventsData || [])
      setLoading(false)
    }

    loadData()
  }, [router])

  const handleRSVP = async (eventId: string) => {
    const supabase = createClient()
    
    // Get client info
    const { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('id', user.id)
      .single()

    const { error } = await supabase.from('event_rsvps').insert({
      event_id: eventId,
      client_id: user.id,
      email: user.email,
      name: client?.name || user.email,
      status: 'pending',
    })

    if (error) {
      alert('Failed to RSVP. Please try again.')
      return
    }

    alert('RSVP submitted! We\'ll confirm your attendance soon.')
    // Refresh events to show updated RSVP count
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary-charcoal/70">Loading...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#2D2D2D]">
      <HubHeader
        user={user}
        showBackButton
        backHref="/hub/dashboard"
        title="CJE Experiences"
        subtitle="Upcoming events and experiences"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1A1A1A] border-2 border-primary-tiffany/30 rounded-lg p-8 sm:p-12 text-center"
          >
            <Calendar size={48} className="text-primary-tiffany/50 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2">
              No Upcoming Events
            </h2>
            <p className="text-white/70 text-sm sm:text-base">
              Check back soon for new CJE Experiences events!
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#1A1A1A] border-2 border-primary-tiffany/30 rounded-lg p-4 sm:p-6 hover:border-primary-tiffany transition-all duration-300"
              >
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-3">
                  {event.title}
                </h3>
                {event.description && (
                  <p className="text-white/70 mb-4 line-clamp-3 text-sm sm:text-base">
                    {event.description}
                  </p>
                )}
                <div className="space-y-2 mb-4 sm:mb-6">
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-white/80">
                    <Calendar size={14} className="text-primary-tiffany flex-shrink-0" />
                    <span className="break-words">
                      {format(new Date(event.date), 'MMMM d, yyyy • h:mm a')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-white/80">
                    <MapPin size={14} className="text-primary-tiffany flex-shrink-0" />
                    <span className="break-words">{event.location}</span>
                  </div>
                  {event.price && (
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-white/80">
                      <DollarSign size={14} className="text-primary-tiffany flex-shrink-0" />
                      <span>${event.price}</span>
                    </div>
                  )}
                  {event.capacity && (
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-white/80">
                      <Users size={14} className="text-primary-tiffany flex-shrink-0" />
                      <span>
                        {event.rsvp_count || 0} / {event.capacity} attendees
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => handleRSVP(event.id)}
                  size="md"
                  className="w-full text-sm sm:text-base"
                >
                  RSVP
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

