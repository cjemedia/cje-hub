'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { format } from 'date-fns'
import { formatDate } from '@/lib/utils/date'
import { StatusBadge } from '@/components/StatusBadge'
import { Calendar, Clock, Info, Mail, Phone } from 'lucide-react'

const inquiryTypeLabels: Record<string, string> = {
  speaking: 'Speaking Engagement',
  workshop: 'Workshop / Training',
  hosting: 'Event Hosting / Emcee',
  coaching: '1:1 Coaching',
  accelerator: 'Purpose Accelerator Cohort',
  scholarship: 'Your Scholarship Era Course',
  website: 'Custom Website',
  portal: 'Client Portal',
  tools: 'Business Tools',
  brand: 'Brand Identity Consulting',
  creative: 'Creative Direction',
  organization: 'Organization / Corporate Inquiry',
  existing_project: 'Existing Project',
}

type FilterType = 'all' | 'upcoming' | 'past'

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [loading, setLoading] = useState(true)
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const loadBookings = async () => {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]

      let query = supabase
        .from('bookings')
        .select('*, users(name, email)')
        .order('booking_date', { ascending: false })
        .order('booking_time', { ascending: false })

      if (filter === 'upcoming') {
        query = query.gte('booking_date', today)
      } else if (filter === 'past') {
        query = query.lt('booking_date', today)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error loading bookings:', error)
        setBookings([])
      } else {
        setBookings(data || [])
      }
      setLoading(false)
    }

    loadBookings()
  }, [filter])

  const renderStatus = (status: string) => {
    const base = 'px-2.5 py-1 rounded-full text-xs font-semibold border'
    switch (status) {
      case 'pending':
        return <span className={`${base} bg-yellow-500/20 text-yellow-300 border-yellow-500/30`}>pending</span>
      case 'confirmed':
        return <span className={`${base} bg-[#81D8D0]/20 text-[#81D8D0] border-[#81D8D0]/30`}>confirmed</span>
      case 'completed':
        return <span className={`${base} bg-green-500/20 text-green-300 border-green-500/30`}>completed</span>
      case 'cancelled':
        return <span className={`${base} bg-red-500/20 text-red-300 border-red-500/30`}>cancelled</span>
      case 'rescheduled':
        return <span className={`${base} bg-amber-500/20 text-amber-300 border-amber-500/40`}>rescheduled</span>
      default:
        return <StatusBadge status={status} />
    }
  }

  const toggleNotes = (id: string) => {
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white/70">Loading bookings...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1 w-1 rounded-full bg-[#81D8D0]"></div>
            <span className="text-[#81D8D0] text-sm font-medium uppercase tracking-wider">Admin</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-semibold text-white mb-2">All Bookings</h1>
          <p className="text-[#a1a1a1]">View and manage all client bookings</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'upcoming', 'past'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-[#81D8D0] text-dark'
                  : 'bg-[#1a1a1a] border border-[#333333] text-white/70 hover:text-white'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Booking Cards */}
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl overflow-hidden">
          <div className="divide-y divide-[#333333]">
            {bookings.length === 0 ? (
              <div className="px-6 py-12 text-center text-[#a1a1a1]">No bookings found</div>
            ) : (
              bookings.map((booking: any) => {
                const isExpanded = expandedNotes[booking.id]
                const notes = booking.notes || ''
                const truncated = notes.length > 140 && !isExpanded ? `${notes.slice(0, 140)}...` : notes
                return (
                  <div key={booking.id} className="p-5 space-y-3 hover:bg-white/5 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <Link href={`/admin/bookings/${booking.id}`} className="text-white font-semibold hover:text-[#81D8D0]">
                          {booking.users?.name || booking.name || 'N/A'}
                        </Link>
                        <div className="flex items-center gap-2 text-sm text-[#a1a1a1]">
                          <Mail size={14} />
                          <span>{booking.users?.email || booking.email || 'N/A'}</span>
                        </div>
                        {booking.phone && (
                          <div className="flex items-center gap-2 text-sm text-[#a1a1a1]">
                            <Phone size={14} />
                            <span>{booking.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {renderStatus(booking.status)}
                        <Link href={`/admin/bookings/${booking.id}`} className="text-sm text-[#81D8D0] hover:underline">
                          View
                        </Link>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-white">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-[#a1a1a1]" />
                        <span>{booking.booking_date ? formatDate(booking.booking_date) : 'TBD'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-[#a1a1a1]" />
                        <span>{booking.booking_time || 'TBD'}</span>
                      </div>
                      <div className="flex items-center gap-2 md:col-span-2">
                        <Info size={14} className="text-[#a1a1a1]" />
                        <span className="capitalize text-[#81D8D0]">
                          {inquiryTypeLabels[booking.inquiry_type] || booking.inquiry_type || booking.type || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {notes && (
                      <div className="text-sm text-[#a1a1a1]">
                        <p className="text-white font-medium mb-1">Notes</p>
                        <p>{truncated}</p>
                        {notes.length > 140 && (
                          <button
                            onClick={() => toggleNotes(booking.id)}
                            className="text-xs text-[#81D8D0] hover:underline mt-1"
                          >
                            {isExpanded ? 'Show less' : 'Show more'}
                          </button>
                        )}
                      </div>
                    )}

                    {booking.status === 'rescheduled' && booking.original_date && (
                      <p className="text-xs text-amber-300">
                        Rescheduled from {format(new Date(booking.original_date), 'MMM d, yyyy')}
                        {booking.original_time ? ` at ${booking.original_time}` : ''}
                      </p>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

