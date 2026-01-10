'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Calendar, Clock, User, Mail, FileText } from 'lucide-react'

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

const timeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
]

export default function NewAdminBookingPage() {
  const router = useRouter()
  const [clients, setClients] = useState<any[]>([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [clientSelection, setClientSelection] = useState<'existing' | 'manual'>('existing')
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [manualName, setManualName] = useState('')
  const [manualEmail, setManualEmail] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [inquiryType, setInquiryType] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  useEffect(() => {
    const loadClients = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('role', 'client')
        .order('name', { ascending: true })

      if (error) {
        console.error('Error loading clients:', error)
        setClients([])
      } else {
        setClients(data || [])
      }
      setLoadingClients(false)
    }

    loadClients()
  }, [])

  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate required fields
    if (!selectedDate || !selectedTime || !inquiryType) {
      setError('Please fill in all required fields')
      return
    }

    if (clientSelection === 'existing' && !selectedClientId) {
      setError('Please select a client')
      return
    }

    if (clientSelection === 'manual') {
      if (!manualName || !manualEmail) {
        setError('Please enter both name and email for manual entry')
        return
      }
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(manualEmail)) {
        setError('Please enter a valid email address')
        return
      }
    }

    setIsSubmitting(true)

    try {
      const body: any = {
        isAdmin: true,
        date: selectedDate,
        time: selectedTime,
        type: inquiryType,
        notes: notes || '',
      }

      if (clientSelection === 'existing') {
        const selectedClient = clients.find(c => c.id === selectedClientId)
        if (selectedClient) {
          body.user_id = selectedClient.id
          body.name = selectedClient.name
          body.email = selectedClient.email
        }
      } else {
        body.name = manualName
        body.email = manualEmail
      }

      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking')
      }

      // Redirect to bookings page on success
      router.push('/admin/bookings')
    } catch (err: any) {
      console.error('Error creating booking:', err)
      setError(err.message || 'Failed to create booking. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-2 text-[#81D8D0] hover:text-[#81D8D0]/80 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to Bookings</span>
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1 w-1 rounded-full bg-[#81D8D0]"></div>
            <span className="text-[#81D8D0] text-sm font-medium uppercase tracking-wider">Admin</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-semibold text-white mb-2">Create New Booking</h1>
          <p className="text-[#a1a1a1]">Book a meeting on behalf of a client</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Client Selection */}
          <div className="border-b border-white/10 pb-6">
            <label className="block text-white/60 text-xs uppercase tracking-wider mb-4">Client</label>
            
            {/* Selection Type Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setClientSelection('existing')
                  setSelectedClientId('')
                  setManualName('')
                  setManualEmail('')
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  clientSelection === 'existing'
                    ? 'bg-[#81D8D0] text-dark'
                    : 'bg-[#0a0a0a] border border-[#333333] text-white/70 hover:text-white'
                }`}
              >
                Existing Client
              </button>
              <button
                type="button"
                onClick={() => {
                  setClientSelection('manual')
                  setSelectedClientId('')
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  clientSelection === 'manual'
                    ? 'bg-[#81D8D0] text-dark'
                    : 'bg-[#0a0a0a] border border-[#333333] text-white/70 hover:text-white'
                }`}
              >
                Manual Entry
              </button>
            </div>

            {/* Existing Client Dropdown */}
            {clientSelection === 'existing' && (
              <div>
                {loadingClients ? (
                  <div className="text-[#a1a1a1] text-sm">Loading clients...</div>
                ) : (
                  <div className="relative">
                    <select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      className="w-full bg-transparent border-b border-white/20 px-0 py-3 pr-8 text-white text-lg focus:outline-none focus:border-[#81D8D0] transition-colors appearance-none cursor-pointer"
                      required={clientSelection === 'existing'}
                    >
                      <option value="" className="bg-[#0a0a0a]">Select a client...</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id} className="bg-[#0a0a0a]">
                          {client.name} ({client.email})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Manual Entry Fields */}
            {clientSelection === 'manual' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-white/60 text-xs uppercase tracking-wider mb-4">Name</label>
                  <input
                    type="text"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white text-lg placeholder-white/30 focus:outline-none focus:border-[#81D8D0] transition-colors"
                    placeholder="Enter client name"
                    required={clientSelection === 'manual'}
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-xs uppercase tracking-wider mb-4">Email</label>
                  <input
                    type="email"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white text-lg placeholder-white/30 focus:outline-none focus:border-[#81D8D0] transition-colors"
                    placeholder="Enter client email"
                    required={clientSelection === 'manual'}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Date Picker */}
          <div className="border-b border-white/10 pb-6">
            <label className="block text-white/60 text-xs uppercase tracking-wider mb-4">
              Date
            </label>
            <div className="relative">
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
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getMinDate()}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
                style={{ fontSize: '16px' }}
                required
              />
            </div>
          </div>

          {/* Time Picker */}
          <div className="border-b border-white/10 pb-6">
            <label className="block text-white/60 text-xs uppercase tracking-wider mb-4">
              Time (Central Time)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((slot) => (
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
          </div>

          {/* Inquiry Type */}
          <div className="border-b border-white/10 pb-6">
            <label className="block text-white/60 text-xs uppercase tracking-wider mb-4">
              Inquiry Type
            </label>
            <div className="relative">
              <select
                value={inquiryType}
                onChange={(e) => setInquiryType(e.target.value)}
                className="w-full bg-transparent border-b border-white/20 px-0 py-3 pr-8 text-white text-lg focus:outline-none focus:border-[#81D8D0] transition-colors appearance-none cursor-pointer"
                required
              >
                <option value="" className="bg-[#0a0a0a]">Select inquiry type...</option>
                {Object.entries(inquiryTypeLabels).map(([key, value]) => (
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

          {/* Notes */}
          <div className="border-b border-white/10 pb-6">
            <label className="block text-white/60 text-xs uppercase tracking-wider mb-4">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white text-lg placeholder-white/30 focus:outline-none focus:border-[#81D8D0] transition-colors resize-none"
              placeholder="Add any additional notes or details..."
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#81D8D0] text-dark font-semibold py-4 px-0 text-sm uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Booking...' : 'Create Booking'}
            </button>
            <Link
              href="/admin/bookings"
              className="px-6 py-4 border border-white/20 text-white rounded-sm hover:bg-white/5 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
