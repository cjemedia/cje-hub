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
        <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 space-y-6">
          {/* Client Selection */}
          <div className="space-y-4">
            <label className="block text-white font-medium mb-2">Client</label>
            
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
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#81D8D0] transition-colors"
                    required={clientSelection === 'existing'}
                  >
                    <option value="">Select a client...</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} ({client.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Manual Entry Fields */}
            {clientSelection === 'manual' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[#a1a1a1] text-sm mb-2 flex items-center gap-2">
                    <User size={16} />
                    Name
                  </label>
                  <input
                    type="text"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#81D8D0] transition-colors"
                    placeholder="Enter client name"
                    required={clientSelection === 'manual'}
                  />
                </div>
                <div>
                  <label className="block text-[#a1a1a1] text-sm mb-2 flex items-center gap-2">
                    <Mail size={16} />
                    Email
                  </label>
                  <input
                    type="email"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#81D8D0] transition-colors"
                    placeholder="Enter client email"
                    required={clientSelection === 'manual'}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-white font-medium mb-2 flex items-center gap-2">
              <Calendar size={16} />
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getMinDate()}
              className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#81D8D0] transition-colors"
              required
            />
          </div>

          {/* Time Picker */}
          <div>
            <label className="block text-white font-medium mb-2 flex items-center gap-2">
              <Clock size={16} />
              Time
            </label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#81D8D0] transition-colors"
              required
            >
              <option value="">Select a time...</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          {/* Inquiry Type */}
          <div>
            <label className="block text-white font-medium mb-2">Inquiry Type</label>
            <select
              value={inquiryType}
              onChange={(e) => setInquiryType(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#81D8D0] transition-colors"
              required
            >
              <option value="">Select inquiry type...</option>
              {Object.entries(inquiryTypeLabels).map(([value, label]) => (
                <option key={value} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-white font-medium mb-2 flex items-center gap-2">
              <FileText size={16} />
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#81D8D0] transition-colors resize-none"
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
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#81D8D0] text-dark font-semibold py-3 px-6 rounded-lg hover:bg-[#81D8D0]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Booking...' : 'Create Booking'}
            </button>
            <Link
              href="/admin/bookings"
              className="px-6 py-3 border border-[#333333] text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
