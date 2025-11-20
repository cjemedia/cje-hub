'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  Camera,
  Video,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react'
import Button from '@/components/Button'
import { format } from 'date-fns'

function BookingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [selectedType, setSelectedType] = useState<'meeting' | 'content-shoot' | null>(
    (searchParams.get('type') as 'meeting' | 'content-shoot') || null
  )
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: '60',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookings, setBookings] = useState<any[]>([])

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/hub/login')
        return
      }

      setUser(user)

      // Fetch existing bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .eq('client_id', user.id)
        .order('date', { ascending: true })

      setBookings(bookingsData || [])
    }

    getUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedType) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          date: formData.date,
          time: formData.time,
          duration: parseInt(formData.duration),
          notes: formData.notes,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit booking')
      }

      alert('Booking request submitted! We\'ll confirm your appointment soon.')
      setFormData({ date: '', time: '', duration: '60', notes: '' })
      router.push('/hub/dashboard')
    } catch (error) {
      alert('Failed to submit booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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
            Book a Session
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Booking Type Selection */}
        {!selectedType && (
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedType('meeting')}
              className="p-8 rounded-lg border-2 border-primary-charcoal/10 hover:border-primary-tiffany transition-all duration-300 text-left"
            >
              <div className="bg-primary-tiffany/10 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                <Video size={32} className="text-primary-tiffany" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-primary-black mb-2">
                Strategy Meeting
              </h3>
              <p className="text-primary-charcoal/70">
                Book a consultation call to discuss your project and goals.
              </p>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedType('content-shoot')}
              className="p-8 rounded-lg border-2 border-primary-charcoal/10 hover:border-primary-tiffany transition-all duration-300 text-left"
            >
              <div className="bg-primary-tiffany/10 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                <Camera size={32} className="text-primary-tiffany" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-primary-black mb-2">
                Content Shoot
              </h3>
              <p className="text-primary-charcoal/70">
                Schedule a professional content shoot for your brand.
              </p>
            </motion.button>
          </div>
        )}

        {/* Booking Form */}
        {selectedType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-6">
              <button
                onClick={() => setSelectedType(null)}
                className="text-primary-tiffany hover:underline text-sm flex items-center space-x-1"
              >
                <ArrowLeft size={16} />
                <span>Change booking type</span>
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-primary-white border-2 border-primary-charcoal/10 rounded-lg p-8 shadow-lg"
            >
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="date"
                      className="block text-sm font-medium text-primary-charcoal mb-2"
                    >
                      Date *
                    </label>
                    <div className="relative">
                      <Calendar
                        size={20}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-charcoal/40"
                      />
                      <input
                        type="date"
                        id="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 border border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="time"
                      className="block text-sm font-medium text-primary-charcoal mb-2"
                    >
                      Time *
                    </label>
                    <div className="relative">
                      <Clock
                        size={20}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-charcoal/40"
                      />
                      <input
                        type="time"
                        id="time"
                        required
                        value={formData.time}
                        onChange={(e) =>
                          setFormData({ ...formData, time: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 border border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="duration"
                    className="block text-sm font-medium text-primary-charcoal mb-2"
                  >
                    Duration (minutes) *
                  </label>
                  <select
                    id="duration"
                    required
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-transparent"
                  >
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-primary-charcoal mb-2"
                  >
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Any specific requirements or topics you'd like to discuss..."
                    className="w-full px-4 py-3 border border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-transparent resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Existing Bookings */}
        {bookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-serif font-bold text-primary-black mb-6">
              Your Bookings
            </h2>
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-primary-white border-2 border-primary-charcoal/10 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        {booking.type === 'meeting' ? (
                          <Video size={20} className="text-primary-tiffany" />
                        ) : (
                          <Camera size={20} className="text-primary-tiffany" />
                        )}
                        <span className="font-semibold text-primary-black capitalize">
                          {booking.type.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="text-sm text-primary-charcoal/70">
                        {format(new Date(booking.date), 'MMMM d, yyyy')} at{' '}
                        {booking.time}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : booking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-primary-white flex items-center justify-center">
        <div className="text-primary-charcoal/70">Loading...</div>
      </main>
    }>
      <BookingPageContent />
    </Suspense>
  )
}

