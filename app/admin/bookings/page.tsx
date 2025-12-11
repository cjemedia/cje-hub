'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { format } from 'date-fns'
import { StatusBadge } from '@/components/StatusBadge'
import { Calendar, Clock, Search, Filter } from 'lucide-react'

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

        {/* Bookings Table */}
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0a0a0a] border-b border-[#333333]">
                <tr>
                  <th className="text-left px-6 py-4 text-white/80 text-sm font-semibold">Client</th>
                  <th className="text-left px-6 py-4 text-white/80 text-sm font-semibold">Email</th>
                  <th className="text-left px-6 py-4 text-white/80 text-sm font-semibold">Date & Time</th>
                  <th className="text-left px-6 py-4 text-white/80 text-sm font-semibold">Inquiry Type</th>
                  <th className="text-left px-6 py-4 text-white/80 text-sm font-semibold">Status</th>
                  <th className="text-left px-6 py-4 text-white/80 text-sm font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#a1a1a1]">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking: any) => (
                    <tr
                      key={booking.id}
                      className="border-b border-[#333333] hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <Link href={`/admin/bookings/${booking.id}`} className="text-white hover:text-[#81D8D0] transition-colors">
                          {booking.users?.name || booking.name || 'N/A'}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-[#a1a1a1]">{booking.users?.email || booking.email || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-white">
                          <Calendar size={14} className="text-[#a1a1a1]" />
                          <span className="text-sm">
                            {booking.booking_date ? format(new Date(booking.booking_date), 'MMM d, yyyy') : 'TBD'}
                          </span>
                          {booking.booking_time && (
                            <>
                              <Clock size={14} className="text-[#a1a1a1] ml-2" />
                              <span className="text-sm">{booking.booking_time}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white text-sm">
                        {inquiryTypeLabels[booking.inquiry_type] || booking.type || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-6 py-4 text-[#a1a1a1] text-sm">
                        {format(new Date(booking.created_at), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

