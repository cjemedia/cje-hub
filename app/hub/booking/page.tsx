'use client'

import { useMemo, useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useHubUser } from '@/components/hub/HubUserProvider'
import { createClient } from '@/lib/supabase/client'

// Inquiry type mapping
const inquiryTypes: Record<string, string> = {
  existing_project: 'Existing Project',
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useHubUser()
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
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [projects, setProjects] = useState<any[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [bookingDetails, setBookingDetails] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Update form data when user loads
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }))
    }
  }, [user])

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

  // Fetch projects when "Existing Project" is selected
  useEffect(() => {
    if (selectedType === 'Existing Project' && user?.id) {
      const fetchProjects = async () => {
        setLoadingProjects(true)
        try {
          const supabase = createClient()
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          if (error) throw error
          setProjects(data || [])
        } catch (error) {
          console.error('Error fetching projects:', error)
          setProjects([])
        } finally {
          setLoadingProjects(false)
        }
      }

      fetchProjects()
    } else {
      setSelectedProject('')
      setProjects([])
    }
  }, [selectedType, user?.id])

  // Fetch available slots when date changes
  useEffect(() => {
    if (selectedDate && !isWeekend(selectedDate)) {
      setLoadingSlots(true)
      setSelectedTime('')
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

    // Validate project selection if "Existing Project" is selected
    if (selectedType === 'Existing Project' && !selectedProject) {
      setErrorMessage('Please select a project')
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
        setFormData({ ...formData, phone: '', notes: '' })
        setSelectedDate('')
        setSelectedTime('')
        setSelectedProject('')
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
          project_id: selectedType === 'Existing Project' ? selectedProject : undefined,
          user_id: user?.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking')
      }

      setSubmitStatus('success')
      setBookingDetails(data.booking)
      
      // Reset form
      setFormData({ ...formData, phone: '', notes: '' })
      setSelectedDate('')
      setSelectedTime('')
      setSelectedProject('')
      setSubmitAsInquiry(false)
    } catch (error: any) {
      setSubmitStatus('error')
      setErrorMessage(error.message || 'Failed to create booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

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

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-semibold text-white mb-2">
            Book a Session
          </h1>
          <p className="text-[#a1a1a1]">
            Schedule your next consultation
          </p>
        </div>

        {/* Success State */}
        {submitStatus === 'success' && bookingDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-8 mb-8"
          >
            <div className="flex items-start gap-4 mb-6">
              <CheckCircle className="text-[#81D8D0] flex-shrink-0 mt-1" size={24} />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-3">
                  {bookingDetails.type === 'Inquiry' ? 'Inquiry Submitted' : 'Booking Confirmed'}
                </h3>
                <p className="text-white/70 text-sm mb-6 leading-relaxed">
                  {bookingDetails.type === 'Inquiry' 
                    ? bookingDetails.message || 'We\'ll get back to you soon to schedule your consultation.'
                    : `A confirmation email has been sent to ${bookingDetails.email}.`
                  }
                </p>
                {bookingDetails.type !== 'Inquiry' && (
                  <div className="space-y-3 mb-6">
                    <div>
                      <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Session Type</p>
                      <p className="text-white">{bookingDetails.type}</p>
                    </div>
                    <div>
                      <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Date & Time</p>
                      <p className="text-white">{formatDate(bookingDetails.date)} at {bookingDetails.time}</p>
                    </div>
                  </div>
                )}
                <Link
                  href="/hub/bookings"
                  className="inline-flex items-center gap-2 bg-[#81D8D0] text-dark px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl"
                >
                  View My Bookings
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {submitStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 mb-8"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Booking Failed</h3>
                <p className="text-red-300 text-sm">{errorMessage}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Booking Form */}
        {submitStatus !== 'success' && (
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Inquiry Option */}
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
                className="w-4 h-4 accent-[#81D8D0] cursor-pointer"
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
                  onChange={(e) => {
                    setSelectedType(e.target.value)
                    if (e.target.value !== 'Existing Project') {
                      setSelectedProject('')
                    }
                  }}
                  className="w-full bg-transparent border-b border-white/20 px-0 py-3 pr-8 text-white text-lg focus:outline-none focus:border-[#81D8D0] transition-colors appearance-none cursor-pointer"
                  required
                >
                  <option value="" className="bg-[#0a0a0a]">Select inquiry type...</option>
                  {Object.entries(inquiryTypes).map(([key, value]) => (
                    <option key={key} value={value} className="bg-[#0a0a0a]">
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

            {/* 1b. Select Project (if Existing Project is selected) */}
            {selectedType === 'Existing Project' && (
              <div className="border-b border-white/10 pb-6">
                <label className="block text-white/60 text-xs uppercase tracking-wider mb-3">
                  Select Project
                </label>
                {loadingProjects ? (
                  <div className="text-white/50 text-sm">Loading projects...</div>
                ) : projects.length > 0 ? (
                  <div className="relative">
                    <select
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="w-full bg-transparent border-b border-white/20 px-0 py-3 pr-8 text-white text-lg focus:outline-none focus:border-[#81D8D0] transition-colors appearance-none cursor-pointer"
                      required
                    >
                      <option value="" className="bg-[#0a0a0a]">Select a project...</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id} className="bg-[#0a0a0a]">
                          {project.name || 'Untitled Project'}
                          {project.service_type ? ` (${project.service_type.replace('_', ' ')})` : ''}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="text-white/50 text-sm">No projects found</div>
                )}
              </div>
            )}

            {/* 2. Select Date */}
            {!submitAsInquiry && (
              <div className="border-b border-white/10 pb-6">
                <label className="block text-white/60 text-xs uppercase tracking-wider mb-4">
                  2. Select Date
                </label>
                <div 
                  className="relative cursor-pointer"
                  onClick={(e) => {
                    const input = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement
                    if (input) {
                      if (input.showPicker) {
                        input.showPicker()
                      } else {
                        input.click()
                      }
                    }
                  }}
                >
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
                    <Calendar className="w-5 h-5 text-white/60 group-hover:text-[#81D8D0] transition-colors" />
                  </div>
                  <input
                    type="date"
                    min={getMinDate()}
                    value={selectedDate}
                    onChange={(e) => {
                      const date = e.target.value
                      if (date) {
                        setSelectedDate(date)
                        if (isWeekend(date)) {
                          setSelectedTime('')
                        }
                      }
                    }}
                    className="absolute top-0 left-0 w-full h-full opacity-0 pointer-events-none"
                    style={{ fontSize: '16px' }}
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
                        className="h-10 bg-transparent border border-white/10 rounded-sm animate-pulse"
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
                            ? 'bg-[#81D8D0] text-[#0a0a0a] border border-[#81D8D0]'
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
                <p className="text-white/50 text-sm mt-4">
                  Don't see a time that works?{' '}
                  <a href="mailto:media@ciarajevans.com" className="text-accent hover:text-accent/80 underline">
                    Contact us
                  </a>{' '}
                  to request a different time.
                </p>
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
                  className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white text-lg placeholder-white/30 focus:outline-none focus:border-[#81D8D0] transition-colors"
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white text-lg placeholder-white/30 focus:outline-none focus:border-[#81D8D0] transition-colors"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white text-lg placeholder-white/30 focus:outline-none focus:border-[#81D8D0] transition-colors"
                />
                <textarea
                  placeholder="Tell us about your project (optional)"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white text-lg placeholder-white/30 focus:outline-none focus:border-[#81D8D0] transition-colors resize-none"
                />
              </div>
            </div>

            {/* 5. Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={
                  isSubmitting || 
                  !selectedType || 
                  !formData.name || 
                  !formData.email ||
                  (selectedType === 'Existing Project' && !selectedProject)
                }
                className="w-full bg-[#81D8D0] text-dark px-6 py-4 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>{submitAsInquiry ? 'Submitting' : 'Confirming'}</span>
                  </>
                ) : (
                  <>
                    <span>{submitAsInquiry ? 'Submit Inquiry' : 'Confirm Booking'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <div className="text-white/70">Loading...</div>
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  )
}
