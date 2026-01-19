'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Button from '@/components/Button'
import { ArrowRight, Mic, Users, MessageSquare, Presentation, Radio, Calendar, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import Link from 'next/link'
import Image from 'next/image'
import { formatTime12Hour } from '@/lib/time-format'

export default function SpeakingPage() {
  const formats = [
    { icon: Mic, title: 'Keynote Speaker', description: 'Inspiring opening or closing addresses that set the tone for your event' },
    { icon: Presentation, title: 'Motivational Speaker', description: 'Energizing talks that motivate audiences to take action' },
    { icon: Users, title: 'Workshop Facilitator', description: 'Interactive sessions that engage participants in hands-on learning' },
    { icon: MessageSquare, title: 'Panelist', description: 'Thoughtful contributions to panel discussions and Q&A sessions' },
    { icon: Radio, title: 'Moderator', description: 'Expert facilitation of conversations and panel discussions' },
    { icon: Mic, title: 'Emcee/Host', description: 'Dynamic event hosting that keeps audiences engaged from start to finish' },
  ]

  const keynotes = [
    {
      title: 'The Power of Purpose: Finding Direction When Life Feels Uncertain',
      description: 'A transformative talk on discovering your purpose and navigating life\'s uncertainties with clarity and confidence.',
    },
    {
      title: 'Aligned Action: How to Navigate Transitions With Intention',
      description: 'Learn to move through life transitions with purpose, making decisions that align with your values and goals.',
    },
    {
      title: 'Your Story Is Your Advantage',
      description: 'Discover how to leverage your unique experiences and stories to build a compelling personal brand.',
    },
    {
      title: 'Your Scholarship Era: Becoming the Top-Tier Candidate',
      description: 'Essential strategies for students, parents, and educators on standing out in competitive scholarship applications.',
    },
    {
      title: 'Identity & Influence: Building a Life and Brand With Purpose',
      description: 'Explore how to build an authentic brand and life that reflects your true identity and creates meaningful influence.',
    },
    {
      title: 'Purpose Over Perfection: Progress as a Lifestyle',
      description: 'Shift from perfectionism to purpose-driven progress, embracing growth and action over perfection.',
    },
  ]

  return (
    <main className="min-h-screen bg-dark overflow-x-hidden">
      <Navigation />

      {/* HERO SECTION */}
      <section className="relative min-h-[60vh] flex items-center justify-center bg-dark pt-32 pb-16">
        <div className="section-max-width text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-accent uppercase tracking-widest text-sm mb-6">
              SPEAKING • HOSTING
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              The CJE Experience
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-8">
              Inspiring purpose-driven action through powerful storytelling, engaging presentations, and authentic connection. 
              Whether you need a keynote speaker, workshop facilitator, or event host, Ciara J. brings energy, expertise, and impact to every stage.
            </p>
            <div className="flex justify-center">
              <a href="/booking?inquiry=true" className="border border-white text-white px-8 py-4 rounded-lg hover:bg-white/10 transition-colors text-center inline-flex items-center justify-center">
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FORMATS SECTION */}
      <section className="section-padding bg-dark-light">
        <div className="section-max-width">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Formats Offered
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Versatile speaking and hosting services tailored to your event needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {formats.map((format, index) => (
              <motion.div
                key={format.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-dark p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-white/20"
              >
                <div className="w-16 h-16 bg-accent/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/30 transition-colors">
                  <format.icon size={32} className="text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{format.title}</h3>
                <p className="text-white/80 leading-relaxed">{format.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SIGNATURE KEYNOTES SECTION */}
      <section className="section-padding bg-dark">
        <div className="section-max-width">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-2 bg-accent/20 rounded-full mb-4">
              <span className="text-accent font-semibold text-sm">Signature Topics</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Signature Keynotes
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Proven talks that inspire, educate, and transform audiences
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {keynotes.map((keynote, index) => (
              <motion.div
                key={keynote.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-dark-light p-8 rounded-2xl border-2 border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <h3 className="text-2xl font-bold text-white mb-4">{keynote.title}</h3>
                <p className="text-white/80 leading-relaxed">{keynote.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="section-padding bg-dark-light">
        <div className="section-max-width">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Book Ciara J. for Your Next Event
            </h2>
            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              Ready to bring purpose-driven inspiration to your audience? Let's discuss how Ciara J. can make your next event unforgettable.
            </p>
            <Button href="/booking?type=speaking" size="lg" className="btn-primary">
              <span>Book a Call</span>
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* UPCOMING EVENTS SECTION */}
      <UpcomingEventsSection />

      {/* PAST EVENTS SECTION */}
      <PastEventsSection />

      <Footer />
    </main>
  )
}

function UpcomingEventsSection() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEvents = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'approved')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(6)

      if (!error && data) {
        setEvents(data)
      }
      setLoading(false)
    }

    loadEvents()
  }, [])

  if (loading) {
    return null
  }

  if (events.length === 0) {
    return null
  }

  return (
    <section className="section-padding bg-dark">
      <div className="section-max-width">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Upcoming Events
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Join us for these upcoming experiences and gatherings
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={`/events/${event.slug || event.id}`}
                className="block bg-dark-light border-2 border-white/10 rounded-2xl overflow-hidden hover:border-accent transition-all duration-300 group"
              >
                {((event.image_urls && event.image_urls.length > 0) || event.image_url) && (
                  <div className="relative w-full h-48 overflow-hidden">
                    <Image
                      src={(event.image_urls && event.image_urls[0]) || event.image_url}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-accent transition-colors">
                    {event.title}
                  </h3>
                  {event.description && (
                    <p className="text-white/70 mb-4 line-clamp-2 text-sm">
                      {event.description}
                    </p>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <Calendar size={16} className="text-accent flex-shrink-0" />
                      <span>
                        {format(new Date(event.date), 'MMMM d, yyyy • h:mm a')}
                        {event.end_time && ` - ${formatTime12Hour(event.end_time)}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <MapPin size={16} className="text-accent flex-shrink-0" />
                      <span>{event.location}</span>
                    </div>
                    {event.ticket_link && (
                      <div className="pt-2">
                        <span className="text-accent text-sm font-semibold">Get Tickets →</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PastEventsSection() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const loadEvents = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'approved')
        .lt('date', new Date().toISOString())
        .order('date', { ascending: false })
        .limit(showAll ? 50 : 6)

      if (!error && data) {
        setEvents(data)
      }
      setLoading(false)
    }

    loadEvents()
  }, [showAll])

  if (loading) {
    return null
  }

  if (events.length === 0) {
    return null
  }

  return (
    <section className="section-padding bg-dark-light">
      <div className="section-max-width">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Past Events
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Browse our event archive
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={`/events/${event.slug || event.id}`}
                className="block bg-dark border-2 border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300 group opacity-75"
              >
                {((event.image_urls && event.image_urls.length > 0) || event.image_url) && (
                  <div className="relative w-full h-48 overflow-hidden grayscale">
                    <Image
                      src={(event.image_urls && event.image_urls[0]) || event.image_url}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white/90 mb-3 group-hover:text-accent/80 transition-colors">
                    {event.title}
                  </h3>
                  {event.description && (
                    <p className="text-white/60 mb-4 line-clamp-2 text-sm">
                      {event.description}
                    </p>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <Calendar size={16} className="text-accent/70 flex-shrink-0" />
                      <span>
                        {format(new Date(event.date), 'MMMM d, yyyy • h:mm a')}
                        {event.end_time && ` - ${formatTime12Hour(event.end_time)}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <MapPin size={16} className="text-accent/70 flex-shrink-0" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>        {events.length >= 6 && !showAll && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowAll(true)}
              className="px-6 py-3 bg-dark border-2 border-white/10 text-white rounded-lg hover:border-accent transition-colors"
            >
              Load More Past Events
            </button>
          </div>
        )}
      </div>
    </section>
  )
}