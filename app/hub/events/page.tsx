'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, MapPin, DollarSign, Users, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
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
    <main className="min-h-screen bg-primary-white">
      {/* Header */}
      <header className="bg-primary-white border-b border-primary-charcoal/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push('/hub/dashboard')}
            className="flex items-center space-x-2 text-primary-charcoal/70 hover:text-primary-charcoal transition-colors mb-4"
          >
            <ArrowLeft size={18} />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-serif font-bold text-primary-black">
            CJE Experiences
          </h1>
          <p className="text-primary-charcoal/70 mt-2">
            Upcoming events and experiences
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary-white border-2 border-primary-charcoal/10 rounded-lg p-12 text-center"
          >
            <Calendar size={48} className="text-primary-charcoal/30 mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-primary-black mb-2">
              No Upcoming Events
            </h2>
            <p className="text-primary-charcoal/70">
              Check back soon for new CJE Experiences events!
            </p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-primary-white border-2 border-primary-charcoal/10 rounded-lg p-6 hover:border-primary-tiffany transition-all duration-300"
              >
                <h3 className="text-2xl font-serif font-bold text-primary-black mb-3">
                  {event.title}
                </h3>
                {event.description && (
                  <p className="text-primary-charcoal/70 mb-4 line-clamp-3">
                    {event.description}
                  </p>
                )}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center space-x-2 text-sm text-primary-charcoal/70">
                    <Calendar size={16} className="text-primary-tiffany" />
                    <span>
                      {format(new Date(event.date), 'MMMM d, yyyy • h:mm a')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-primary-charcoal/70">
                    <MapPin size={16} className="text-primary-tiffany" />
                    <span>{event.location}</span>
                  </div>
                  {event.price && (
                    <div className="flex items-center space-x-2 text-sm text-primary-charcoal/70">
                      <DollarSign size={16} className="text-primary-tiffany" />
                      <span>${event.price}</span>
                    </div>
                  )}
                  {event.capacity && (
                    <div className="flex items-center space-x-2 text-sm text-primary-charcoal/70">
                      <Users size={16} className="text-primary-tiffany" />
                      <span>
                        {event.rsvp_count || 0} / {event.capacity} attendees
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => handleRSVP(event.id)}
                  size="md"
                  className="w-full"
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

