'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { format } from 'date-fns'
import { formatDate } from '@/lib/utils/date'
import { StatusBadge } from '@/components/StatusBadge'
import { Calendar, Clock, Info, Plus } from 'lucide-react'

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


  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white/70">Loading bookings...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1 w-1 rounded-full bg-[#81D8D0]"></div>
              <span className="text-[#81D8D0] text-sm font-medium uppercase tracking-wider">Admin</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-semibold text-white mb-2">All Bookings</h1>
            <p className="text-[#a1a1a1]">View and manage all client bookings</p>
          </div>
          <Link
            href="/admin/bookings/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus size={18} />
            New Booking
          </Link>
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

        {/* Booking Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.length === 0 ? (
            <div className="col-span-full bg-[#1a1a1a] border border-[#333333] rounded-xl p-8 text-center text-[#a1a1a1]">
              No bookings found
            </div>
          ) : (
            bookings.map((booking: any) => (
              <Link
                key={booking.id}
                href={`/admin/bookings/${booking.id}`}
                className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-5 hover:border-[#81D8D0]/50 transition-colors flex flex-col"
              >
                {/* Top: Name and Status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-lg truncate">
                      {booking.users?.name || booking.name || 'N/A'}
                    </h3>
                    <p className="text-[#a1a1a1] text-sm truncate">
                      {booking.users?.email || booking.email || 'N/A'}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {renderStatus(booking.status)}
                  </div>
                </div>

                {/* Middle: Date, Time, Type */}
                <div className="space-y-2 text-sm text-[#a1a1a1] mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-[#81D8D0]" />
                    <span>{booking.booking_date ? formatDate(booking.booking_date) : 'TBD'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-[#81D8D0]" />
                    <span>{booking.booking_time || 'TBD'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Info size={14} className="text-[#81D8D0]" />
                    <span className="text-[#81D8D0] truncate">
                      {inquiryTypeLabels[booking.inquiry_type] || booking.inquiry_type || booking.type || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Bottom: Footer with notes preview */}
                <div className="mt-auto pt-3 border-t border-[#333333] text-xs text-[#a1a1a1]">
                  {booking.notes ? (
                    <p className="line-clamp-2">{booking.notes}</p>
                  ) : (
                    <p>No notes</p>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

