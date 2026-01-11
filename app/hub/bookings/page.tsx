'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  CalendarPlus,
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
  X,
  AlertCircle,
  Loader2,
  CalendarDays,
  XCircle,
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
        <p className="text-[#a1a1a1] mb-6">
          View and manage your scheduled sessions and consultations.
        </p>
        <Link
          href="/hub/booking"
          className="inline-flex items-center gap-2 bg-[#81D8D0] text-[#0a0a0a] px-5 py-2.5 rounded-lg font-medium hover:bg-[#81D8D0]/90 transition-colors"
        >
          <CalendarPlus size={18} />
          Book a Session
        </Link>
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
            className="inline-flex items-center gap-2 bg-[#81D8D0] text-[#0a0a0a] px-6 py-3 rounded-lg font-medium hover:bg-[#81D8D0]/90 transition-colors shadow-lg hover:shadow-xl"
          >
            Book a Session
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} onUpdate={() => {
              // Reload bookings after update
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
              }
              loadBookings()
            }} />
          ))}
        </div>
      )}
    </div>
  )
}

function BookingCard({ booking, onUpdate }: { booking: Booking; onUpdate: () => void }) {
  const config = inquiryTypeConfig[booking.inquiry_type] || {
    icon: Calendar,
    label: booking.inquiry_type,
  }
  const Icon = config.icon

  const formattedDate = booking.booking_date
    ? format(new Date(booking.booking_date), 'EEEE, MMMM d, yyyy')
    : 'TBD'

  const today = new Date().toISOString().split('T')[0]
  const isUpcoming = booking.booking_date >= today && booking.status !== 'cancelled' && booking.status !== 'completed'
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Get min date (today)
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // Check if date is weekend
  const isWeekend = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    const dayOfWeek = date.getDay()
    return dayOfWeek === 0 || dayOfWeek === 6
  }

  // Fetch available slots when date changes
  useEffect(() => {
    if (selectedDate && !isWeekend(selectedDate)) {
      setLoadingSlots(true)
      fetch(`/api/booking/availability?date=${selectedDate}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.availableSlots) {
            setAvailableSlots(data.availableSlots)
          } else {
            setAvailableSlots([])
          }
        })
        .catch((error) => {
          console.error('Error fetching availability:', error)
          setAvailableSlots([])
        })
        .finally(() => setLoadingSlots(false))
    } else {
      setAvailableSlots([])
      setSelectedTime('')
    }
  }, [selectedDate])

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleCancel = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/booking/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          action: 'cancel',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel booking')
      }

      setShowCancelModal(false)
      onUpdate()
    } catch (error: any) {
      alert(error.message || 'Failed to cancel booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select a date and time')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/booking/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          action: 'reschedule',
          date: selectedDate,
          time: selectedTime,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reschedule booking')
      }

      setShowRescheduleModal(false)
      setSelectedDate('')
      setSelectedTime('')
      onUpdate()
    } catch (error: any) {
      alert(error.message || 'Failed to reschedule booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 hover:border-[#81D8D0]/50 transition-colors"
      >
        <div className="flex items-start gap-4">
          <div className="bg-[#81D8D0]/10 text-[#81D8D0] w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {config.label}
                </h3>
                <StatusBadge status={booking.status} />
              </div>
            </div>

            <div className="space-y-2 text-sm text-[#a1a1a1] mb-4">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[#81D8D0] flex-shrink-0" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#81D8D0] flex-shrink-0" />
                <span>{booking.booking_time}</span>
              </div>
            </div>

            {booking.notes && (
              <div className="mt-4 pt-4 border-t border-[#333333]">
                <p className="text-sm text-[#a1a1a1]">{booking.notes}</p>
              </div>
            )}

            {isUpcoming && (
              <div className="mt-6 pt-4 border-t border-[#333333] flex gap-3">
                <button
                  onClick={() => setShowRescheduleModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0a0a0a] border border-[#333333] text-white text-sm font-medium rounded-lg hover:border-[#81D8D0]/50 hover:bg-[#81D8D0]/5 transition-all"
                >
                  <CalendarDays size={16} />
                  Reschedule
                </button>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0a0a0a] border border-red-500/30 text-red-400 text-sm font-medium rounded-lg hover:border-red-500/50 hover:bg-red-500/5 transition-all"
                >
                  <XCircle size={16} />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Cancel Booking</h3>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="text-[#a1a1a1] hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-[#a1a1a1] mb-6">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 bg-[#0a0a0a] border border-[#333333] text-white rounded-lg hover:border-[#81D8D0]/50 transition-colors"
                  disabled={loading}
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:border-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : null}
                  Cancel Booking
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {showRescheduleModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Reschedule Booking</h3>
                <button
                  onClick={() => {
                    setShowRescheduleModal(false)
                    setSelectedDate('')
                    setSelectedTime('')
                  }}
                  className="text-[#a1a1a1] hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Date Picker */}
                <div>
                  <label className="block text-white/60 text-xs uppercase tracking-wider mb-3">
                    Select New Date
                  </label>
                  <input
                    type="date"
                    min={getMinDate()}
                    value={selectedDate}
                    onChange={(e) => {
                      const date = e.target.value
                      if (date && !isWeekend(date)) {
                        setSelectedDate(date)
                      } else if (date) {
                        alert('Weekends are not available. Please select a weekday.')
                      }
                    }}
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#81D8D0] transition-colors"
                  />
                  {selectedDate && isWeekend(selectedDate) && (
                    <p className="text-red-400 text-sm mt-2">Weekends are not available</p>
                  )}
                </div>

                {/* Time Slots */}
                {selectedDate && !isWeekend(selectedDate) && (
                  <div>
                    <label className="block text-white/60 text-xs uppercase tracking-wider mb-3">
                      Select New Time
                    </label>
                    {loadingSlots ? (
                      <div className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 text-white/50 text-center">
                        Loading available times...
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                              selectedTime === slot
                                ? 'bg-[#81D8D0] text-[#0a0a0a]'
                                : 'bg-[#0a0a0a] border border-[#333333] text-white hover:border-[#81D8D0]/50'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 text-white/50 text-center">
                        No available times for this date
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowRescheduleModal(false)
                      setSelectedDate('')
                      setSelectedTime('')
                    }}
                    className="flex-1 px-4 py-2 bg-[#0a0a0a] border border-[#333333] text-white rounded-lg hover:border-[#81D8D0]/50 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReschedule}
                    disabled={loading || !selectedDate || !selectedTime}
                    className="flex-1 px-4 py-2 bg-[#81D8D0] text-[#0a0a0a] rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : null}
                    Reschedule
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

