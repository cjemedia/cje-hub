'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, MapPin, DollarSign, Users, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import Button from '@/components/Button'

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
        router.push('/login')
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
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    const { error } = await supabase.from('event_rsvps').insert({
      event_id: eventId,
      user_id: user.id,
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white/70">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="mb-8">
        <Link
          href="/hub/dashboard"
          className="inline-flex items-center gap-2 text-[#a1a1a1] hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl lg:text-4xl font-semibold text-white mb-2">
          CJE Experiences
        </h1>
        <p className="text-[#a1a1a1]">
          Upcoming events and experiences
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
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
    </div>
  )
}

