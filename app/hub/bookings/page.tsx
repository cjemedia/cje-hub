'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  ArrowLeft,
  Mic,
  BookOpen,
  PartyPopper,
  MessageCircle,
  Users,
  GraduationCap,
  Globe,
  Monitor,
  Settings,
  Sparkles,
  Palette,
  Building2,
  type LucideIcon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useHubUser } from '@/components/hub/HubUserProvider'
import { StatusBadge } from '@/components/StatusBadge'
import { format } from 'date-fns'
import type { Booking, InquiryType } from '@/types/database'

const inquiryTypeConfig: Record<
  string,
  { icon: LucideIcon; label: string }
> = {
  speaking: { icon: Mic, label: 'Speaking Engagement' },
  workshop: { icon: BookOpen, label: 'Workshop / Training' },
  hosting: { icon: PartyPopper, label: 'Event Hosting / Emcee' },
  coaching: { icon: MessageCircle, label: '1:1 Coaching' },
  accelerator: { icon: Users, label: 'Purpose Accelerator Cohort' },
  scholarship: { icon: GraduationCap, label: 'Your Scholarship Era Course' },
  website: { icon: Globe, label: 'Custom Website' },
  portal: { icon: Monitor, label: 'Client Portal' },
  tools: { icon: Settings, label: 'Business Tools' },
  brand: { icon: Sparkles, label: 'Brand Identity Consulting' },
  creative: { icon: Palette, label: 'Creative Direction' },
  organization: { icon: Building2, label: 'Organization / Corporate' },
}

type FilterType = 'all' | 'upcoming' | 'past'

export default function BookingsPage() {
  const { user } = useHubUser()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBookings = async () => {
      if (!user?.id) return
      const supabase = createClient()

      const today = new Date().toISOString().split('T')[0]

      let query = supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('booking_date', { ascending: false })
        .order('booking_time', { ascending: false })

      if (filter === 'upcoming') {
        query = query.gte('booking_date', today)
      } else if (filter === 'past') {
        query = query.lt('booking_date', today)
      }

      const { data } = await query

      setBookings(data || [])
      setLoading(false)
    }

    loadBookings()
  }, [user, filter])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8">
        <div className="min-h-[60vh] flex items-center justify-center text-[#a1a1a1]">
          Loading bookings...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link
          href="/hub/dashboard"
          className="inline-flex items-center gap-2 text-[#a1a1a1] hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl lg:text-4xl font-semibold text-white mb-2">
          My Bookings
        </h1>
        <p className="text-[#a1a1a1]">
          View and manage your scheduled sessions and consultations.
        </p>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[#333333]">
        {(['all', 'upcoming', 'past'] as FilterType[]).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              filter === filterType
                ? 'border-[#81D8D0] text-[#81D8D0]'
                : 'border-transparent text-[#a1a1a1] hover:text-white'
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-12 text-center"
        >
          <Calendar className="w-16 h-16 text-[#a1a1a1]/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No bookings yet</h2>
          <p className="text-[#a1a1a1] mb-6">
            {filter === 'upcoming'
              ? "You don't have any upcoming sessions scheduled."
              : filter === 'past'
              ? "You don't have any past bookings."
              : "You haven't booked any sessions yet."}
          </p>
          <Link
            href="/hub/booking"
            className="inline-flex items-center gap-2 bg-[#81D8D0] text-[#0a0a0a] px-6 py-3 rounded-lg font-medium hover:bg-[#81D8D0]/90 transition-colors"
          >
            Book a Session
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  )
}

function BookingCard({ booking }: { booking: Booking }) {
  const config = inquiryTypeConfig[booking.inquiry_type] || {
    icon: Calendar,
    label: booking.inquiry_type,
  }
  const Icon = config.icon

  const formattedDate = booking.booking_date
    ? format(new Date(booking.booking_date), 'EEEE, MMMM d, yyyy')
    : 'TBD'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 hover:border-[#81D8D0]/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#81D8D0]/10 text-[#81D8D0] w-10 h-10 rounded-lg flex items-center justify-center">
              <Icon size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                {config.label}
              </h3>
              <StatusBadge status={booking.status} />
            </div>
          </div>

          <div className="space-y-2 text-sm text-[#a1a1a1] mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#81D8D0]" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#81D8D0]" />
              <span>{booking.booking_time}</span>
            </div>
          </div>

          {booking.notes && (
            <div className="mt-4 pt-4 border-t border-[#333333]">
              <p className="text-sm text-[#a1a1a1]">{booking.notes}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

