'use client'

import { useMemo, useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Calendar, ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import Image from 'next/image'

// Inquiry type mapping
const inquiryTypes: Record<string, string> = {
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
}

function BookingContent() {
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type')
  const inquiryParam = searchParams.get('inquiry')
  const initialType = useMemo(() => {
    if (typeParam && inquiryTypes[typeParam]) {
      return inquiryTypes[typeParam]
    }
    return null
  }, [typeParam])

  const [selectedType, setSelectedType] = useState<string | null>(initialType)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitAsInquiry, setSubmitAsInquiry] = useState(inquiryParam === 'true')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  })
  const [subscribe, setSubscribe] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [bookingDetails, setBookingDetails] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Get min date (today)
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // Check if date is weekend
  const isWeekend = (dateString: string) => {
    // Parse date string (YYYY-MM-DD) in local timezone to avoid timezone shift
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day) // month is 0-indexed
    const dayOfWeek = date.getDay()
    return dayOfWeek === 0 || dayOfWeek === 6 // Sunday or Saturday
  }

  // Fetch available slots when date changes
  useEffect(() => {
    if (selectedDate && !isWeekend(selectedDate)) {
      setLoadingSlots(true)
      setSelectedTime('') // Reset selected time
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
        .finally(() => {
          setLoadingSlots(false)
        })
    } else {
      setAvailableSlots([])
      setSelectedTime('')
    }
  }, [selectedDate])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedType || !formData.name || !formData.email) {
      setErrorMessage('Please fill in all required fields')
      setSubmitStatus('error')
      return
    }

    // If submitting as inquiry (no date/time), use contact API
    if (submitAsInquiry || !selectedDate || !selectedTime) {
      setIsSubmitting(true)
      setSubmitStatus('idle')
      setErrorMessage('')

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            message: formData.notes || `Inquiry about: ${selectedType}${selectedDate ? `\nPreferred date: ${formatDate(selectedDate)}` : ''}${selectedTime ? `\nPreferred time: ${selectedTime}` : ''}`,
            subject: `Booking Inquiry: ${selectedType}`,
            inquiryType: selectedType,
            subscribe: subscribe,
            website: honeypot,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to submit inquiry')
        }

        setSubmitStatus('success')
        setBookingDetails({
          type: 'Inquiry',
          email: formData.email,
          message: 'We\'ll get back to you soon to schedule your consultation.',
        })
        
        // Reset form
        setFormData({ name: '', email: '', phone: '', notes: '' })
        setSubscribe(false)
        setHoneypot('')
        setSelectedDate('')
        setSelectedTime('')
        setSubmitAsInquiry(false)
        setSelectedType(null)
      } catch (error: any) {
        setSubmitStatus('error')
        setErrorMessage(error.message || 'Failed to submit inquiry. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    // Otherwise, create a booking
    if (!selectedDate || !selectedTime) {
      setErrorMessage('Please select a date and time, or submit as inquiry')
      setSubmitStatus('error')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            date: selectedDate,
            time: selectedTime,
            type: selectedType,
            notes: formData.notes,
            user_id: null,
            subscribe: subscribe,
            website: honeypot,
          }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking')
      }

      setSubmitStatus('success')
      setBookingDetails(data.booking)
      
      // Reset form
      setFormData({ name: '', email: '', phone: '', notes: '' })
      setSubscribe(false)
      setHoneypot('')
      setSelectedDate('')
      setSelectedTime('')
      setSubmitAsInquiry(false)
    } catch (error: any) {
      setSubmitStatus('error')
      setErrorMessage(error.message || 'Failed to create booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    // Parse date string (YYYY-MM-DD) in local timezone to avoid timezone shift
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day) // month is 0-indexed
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <main className="min-h-screen bg-dark overflow-x-hidden">
      <Navigation />

      <section className="min-h-screen pt-32 pb-8 sm:pt-12 sm:pb-12 md:pt-16 md:pb-16 lg:py-section">
        <div className="section-max-width">
          <div className="grid lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-12">
            {/* Left Column - Image & Hero */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 lg:sticky lg:top-24 h-fit order-1"
            >
              <div className="relative h-[400px] sm:h-[550px] lg:h-[800px] rounded-xl sm:rounded-2xl overflow-hidden">
                <Image
                  src="/images/cje10.JPG"
                  alt="Ciara J. Evans - Let's Work Together"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/40 to-transparent flex items-end justify-center pb-8 sm:pb-12">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center px-4 sm:px-8"
                  >
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-4">
                      Let&apos;s Work Together
                    </h1>
                    <p className="text-white/80 text-sm sm:text-base max-w-md mx-auto">
                      Schedule a consultation and let&apos;s discuss how we can bring your vision to life.
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3 order-2"
            >
              <div className="mb-6 sm:mb-8 pt-8 sm:pt-12 md:pt-8 lg:pt-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4">
                  Book a Consultation
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-white/80">
                  Select your preferred date and time, then share a bit about your project.
                </p>
              </div>

              {/* Success State */}
              {submitStatus === 'success' && bookingDetails && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-b border-accent/30 pb-8 mb-8"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <CheckCircle className="text-accent flex-shrink-0 mt-1" size={20} />
                    <div>
                      <h3 className="text-xl font-light text-white mb-3">
                        {bookingDetails.type === 'Inquiry' ? 'Inquiry Submitted' : 'Booking Confirmed'}
                      </h3>
                      <p className="text-white/60 text-sm mb-6 leading-relaxed">
                        {bookingDetails.type === 'Inquiry' 
                          ? bookingDetails.message || 'We\'ll get back to you soon to schedule your consultation.'
                          : `A confirmation email has been sent to ${bookingDetails.email}.`
                        }
                      </p>
                      {bookingDetails.type !== 'Inquiry' && (
                        <>
                          <div className="space-y-4 mb-6">
                            <div>
                              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Session Type</p>
                              <p className="text-white font-light">{bookingDetails.type}</p>
                            </div>
                            <div>
                              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Date & Time</p>
                              <p className="text-white font-light">{formatDate(bookingDetails.date)} at {bookingDetails.time}</p>
                            </div>
                          </div>
                          {bookingDetails.calendarLink && (
                            <a
                              href={bookingDetails.calendarLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 text-sm font-light border-b border-accent/30 hover:border-accent transition-colors"
                            >
                              <Calendar size={16} />
                              Add to Calendar
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error State */}
              {submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-b border-red-500/30 pb-6 mb-8"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                    <div>
                      <h3 className="text-lg font-light text-white mb-1">Booking Failed</h3>
                      <p className="text-white/60 text-sm">{errorMessage}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Booking Form */}
              {submitStatus !== 'success' && (
                <form onSubmit={handleSubmit} className="space-y-10">
                  {/* Inquiry Option - At Top */}
                  <div className="flex items-center gap-3 pb-6 border-b border-white/10">
                    <input
                      type="checkbox"
                      id="submit-as-inquiry"
                      checked={submitAsInquiry}
                      onChange={(e) => {
                        setSubmitAsInquiry(e.target.checked)
                        if (e.target.checked) {
                          setSelectedDate('')
                          setSelectedTime('')
                        }
                      }}
                      className="w-4 h-4 accent-accent cursor-pointer"
                    />
                    <label htmlFor="submit-as-inquiry" className="text-white/70 text-sm cursor-pointer">
                      Not ready to select a date? Check this box and complete the contact form.
                    </label>
                  </div>

                  {/* 1. Inquiry Type */}
                  <div className="border-b border-white/10 pb-6">
                    <label className="block text-white/60 text-xs uppercase tracking-wider mb-3">
                      1. Inquiry Type
                    </label>
                    <div className="relative">
                      <select
                        value={selectedType || ''}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full bg-transparent border-b border-white/20 px-0 py-3 pr-8 text-white text-lg focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
                        required
                      >
                        <option value="" className="bg-dark">Select inquiry type...</option>
                        {Object.entries(inquiryTypes).map(([key, value]) => (
                          <option key={key} value={value} className="bg-dark">
                            {value}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* 2. Select Date */}
                  {!submitAsInquiry && (
                  <div className="border-b border-white/10 pb-6">
                    <label className="block text-white/60 text-xs uppercase tracking-wider mb-4">
                      2. Select Date
                    </label>
                    
                    {/* Date Input */}
                    <div className="relative">
                      {/* Visual display - shows selected date */}
                      <div className="w-full border-b border-white/20 px-0 py-4 text-left flex items-center justify-between group pointer-events-none">
                        <div>
                          {selectedDate ? (
                            <span className="text-white text-lg font-light">
                              {formatDate(selectedDate)}
                            </span>
                          ) : (
                            <span className="text-white/30 text-lg font-light">
                              Select a date
                            </span>
                          )}
                        </div>
                        <Calendar className="w-5 h-5 text-white/60 group-hover:text-accent transition-colors" size={20} />
                      </div>
                      
                      {/* Date input - fully covers the visual display */}
                      <input
                        type="date"
                        id="date-picker"
                        min={getMinDate()}
                        value={selectedDate}
                        onChange={(e) => {
                          const date = e.target.value
                          // Always update the state when a date is selected
                          if (date) {
                            setSelectedDate(date)
                            // Clear time selection if weekend is selected
                            if (isWeekend(date)) {
                              setSelectedTime('')
                            }
                          }
                        }}
                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
                        style={{ 
                          fontSize: '16px', // Prevents zoom on iOS
                        }}
                        required
                      />
                    </div>
                    
                    {selectedDate && isWeekend(selectedDate) && (
                      <p className="text-red-400 text-xs mt-2">Please select a weekday</p>
                    )}
                  </div>
                  )}

                  {/* 3. Select Time */}
                  {!submitAsInquiry && selectedDate && !isWeekend(selectedDate) && (
                    <div className="border-b border-white/10 pb-6">
                      <div className="flex items-center justify-between mb-4">
                        <label className="block text-white/60 text-xs uppercase tracking-wider">
                          3. Select Time
                        </label>
                        <span className="text-white/40 text-xs">
                          All times in Central Time (CT)
                        </span>
                      </div>
                      {loadingSlots ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {[...Array(8)].map((_, i) => (
                            <div
                              key={i}
                              className="h-10 bg-dark/30 rounded-sm animate-pulse"
                            />
                          ))}
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedTime(slot)}
                              className={`h-10 rounded-sm font-light text-sm transition-all ${
                                selectedTime === slot
                                  ? 'bg-accent text-dark border border-accent'
                                  : 'bg-transparent text-white/70 border border-white/10 hover:border-white/30 hover:text-white'
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-white/50 text-sm">No available slots for this date</p>
                      )}
                    </div>
                  )}

                  {/* 4. Your Details */}
                  <div className="border-b border-white/10 pb-6">
                    <label className="block text-white/60 text-xs uppercase tracking-wider mb-6">
                      4. Your Details
                    </label>
                    <div className="space-y-6">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white text-lg placeholder-white/30 focus:outline-none focus:border-accent transition-colors"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white text-lg placeholder-white/30 focus:outline-none focus:border-accent transition-colors"
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Phone (optional)"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white text-lg placeholder-white/30 focus:outline-none focus:border-accent transition-colors"
                      />
                      <textarea
                        placeholder="Tell us about your project (optional)"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={4}
                        className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white text-lg placeholder-white/30 focus:outline-none focus:border-accent transition-colors resize-none"
                      />
                      {/* Honeypot field to catch bots */}
                      <input
                        type="text"
                        name="website"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                        style={{ position: 'absolute', left: '-9999px' }}
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                      />
                      <label className="flex items-start gap-3 cursor-pointer pt-2">
                        <input
                          type="checkbox"
                          checked={subscribe}
                          onChange={(e) => setSubscribe(e.target.checked)}
                          className="mt-1 w-4 h-4 accent-accent cursor-pointer"
                        />
                        <span className="text-white/70 text-sm">
                          Keep me updated on events and offerings
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* 5. Submit Button */}
                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={isSubmitting || !selectedType || !formData.name || !formData.email}
                      className="w-full bg-accent text-dark px-0 py-4 text-sm uppercase tracking-wider font-light hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          <span>{submitAsInquiry ? 'Submitting' : 'Confirming'}</span>
                        </>
                      ) : (
                        <>
                          <span>{submitAsInquiry ? 'Submit Inquiry' : 'Confirm Booking'}</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Alternative Contact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 sm:mt-12 text-center"
              >
                <p className="text-sm sm:text-base text-white/70 mb-3 sm:mb-4">
                  Prefer to reach out directly?
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-sm sm:text-base">
                  <a
                    href="mailto:media@ciarajevans.com"
                    className="text-accent hover:text-accent/80 font-semibold break-all"
                  >
                    media@ciarajevans.com
                  </a>
                  <span className="text-white/40 hidden sm:inline">•</span>
                  <a
                    href="tel:7737278262"
                    className="text-accent hover:text-accent/80 font-semibold"
                  >
                    (773) 727-8262
                  </a>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-dark">
          <Navigation />
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-white/70">Loading...</div>
          </div>
          <Footer />
        </main>
      }
    >
      <BookingContent />
    </Suspense>
  )
}
