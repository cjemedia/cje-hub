'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { StatusBadge } from '@/components/StatusBadge'
import { format } from 'date-fns'
import { ArrowLeft, Calendar, Clock, Mail, Phone, Trash, Video, User, FileText, ExternalLink } from 'lucide-react'
import { formatDate } from '@/lib/utils/date'

const statusOptions = ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled']

const inquiryTypeLabels: Record<string, string> = {
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

export default function AdminBookingDetailPage() {
  const params = useParams()
  const bookingId = params?.id as string
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [creatingClient, setCreatingClient] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [booking, setBooking] = useState<any>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [editForm, setEditForm] = useState({
    status: 'pending',
    date: '',
    time: '',
    notes: '',
  })

  useEffect(() => {
    if (!bookingId) return
    loadBooking()
  }, [bookingId])

  const loadBooking = async () => {
    setLoading(true)
    setError('')
    const { data, error: fetchError } = await supabase
      .from('bookings')
      .select('*, users(id, name, email, role), projects(id, name)')
      .eq('id', bookingId)
      .single()

    if (fetchError || !data) {
      setError('Booking not found')
      setLoading(false)
      return
    }

    setBooking(data)
    setEditForm({
      status: data.status || 'pending',
      date: data.booking_date || '',
      time: data.booking_time || '',
      notes: data.notes || '',
    })
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // Update booking via API (handles both Supabase and Google Calendar)
      const response = await fetch('/api/booking/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          status: editForm.status,
          date: editForm.date,
          time: editForm.time,
          notes: editForm.notes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update booking')
      }

      setSuccess('Booking updated successfully')
      await loadBooking()
    } catch (err: any) {
      console.error('Error saving booking:', err)
      setError(err.message || 'Failed to update booking')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this booking? This will also remove the Google Calendar event. This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    setError('')

    try {
      // Delete booking via API (handles both Supabase and Google Calendar)
      const response = await fetch(`/api/booking/update?bookingId=${bookingId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete booking')
      }

      // Redirect to bookings page
      router.push('/admin/bookings')
    } catch (err: any) {
      console.error('Error deleting booking:', err)
      setError(err.message || 'Failed to delete booking')
      setDeleting(false)
    }
  }

  const handleCreateClient = async () => {
    if (!booking?.name || !booking?.email) {
      setError('Booking must have name and email to create client')
      return
    }

    setCreatingClient(true)
    setError('')
    setSuccess('')

    try {
      // Create client using existing API route
      const response = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: booking.name,
          email: booking.email,
          phone: booking.phone || null,
          company: null,
          sendInvite: false, // Don't send invite email for bookings-created clients
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create client')
      }

      // Update booking with user_id from created client
      if (data.user?.id) {
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ user_id: data.user.id })
          .eq('id', bookingId)

        if (updateError) {
          console.error('Error updating booking with user_id:', updateError)
          // Continue anyway - client was created successfully
        }
      } else {
        throw new Error('Client was created but user ID was not returned')
      }

      setSuccess('Client created successfully')
      await loadBooking()
    } catch (err: any) {
      console.error('Error creating client:', err)
      setError(err.message || 'Failed to create client')
    } finally {
      setCreatingClient(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/70">
        Loading booking...
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-2 text-[#81D8D0] hover:text-[#81D8D0]/80 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to Bookings</span>
          </Link>
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 text-red-300">
            {error || 'Booking not found'}
          </div>
        </div>
      </div>
    )
  }

  const client = booking.users
  const project = booking.projects
  const googleMeetLink = booking.hangoutLink || booking.hangout_link || null

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-4xl mx-auto">
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
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-semibold text-white mb-2">Booking Details</h1>
              <p className="text-[#a1a1a1]">View and manage booking information</p>
            </div>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash size={18} />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-300 text-sm mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 text-green-300 text-sm mb-6">
            {success}
          </div>
        )}

        {/* Booking Info */}
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 space-y-6 mb-6">
          {/* Client Section */}
          <div className="border-b border-[#333333] pb-4">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User size={18} />
              Client Information
            </h2>
            {client ? (
              <div className="space-y-2">
                <Link
                  href={`/admin/clients/${client.id}`}
                  className="text-[#81D8D0] hover:text-[#81D8D0]/80 font-medium"
                >
                  {client.name || booking.name || 'N/A'}
                </Link>
                <div className="flex items-center gap-2 text-sm text-[#a1a1a1]">
                  <Mail size={14} />
                  <span>{client.email || booking.email || 'N/A'}</span>
                </div>
                {booking.phone && (
                  <div className="flex items-center gap-2 text-sm text-[#a1a1a1]">
                    <Phone size={14} />
                    <span>{booking.phone}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-white font-medium">{booking.name || 'N/A'}</p>
                  <div className="flex items-center gap-2 text-sm text-[#a1a1a1] mt-1">
                    <Mail size={14} />
                    <span>{booking.email || 'N/A'}</span>
                  </div>
                  {booking.phone && (
                    <div className="flex items-center gap-2 text-sm text-[#a1a1a1] mt-1">
                      <Phone size={14} />
                      <span>{booking.phone}</span>
                    </div>
                  )}
                </div>
                {booking.name && booking.email && (
                  <button
                    onClick={handleCreateClient}
                    disabled={creatingClient}
                    className="flex items-center gap-2 px-4 py-2 bg-[#81D8D0] text-[#0a0a0a] font-semibold rounded-lg hover:bg-[#81D8D0]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <User size={18} />
                    {creatingClient ? 'Creating Client...' : 'Create Client'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Booking Details */}
          <div className="border-b border-[#333333] pb-4">
            <h2 className="text-lg font-semibold text-white mb-4">Booking Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} className="text-[#a1a1a1]" />
                <span className="text-white">Date:</span>
                <span className="text-[#a1a1a1]">{booking.booking_date ? formatDate(booking.booking_date) : 'TBD'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} className="text-[#a1a1a1]" />
                <span className="text-white">Time:</span>
                <span className="text-[#a1a1a1]">{booking.booking_time || 'TBD'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:col-span-2">
                <span className="text-white">Inquiry Type:</span>
                <span className="text-[#81D8D0]">
                  {inquiryTypeLabels[booking.inquiry_type] || booking.inquiry_type || booking.type || 'N/A'}
                </span>
              </div>
              {project && (
                <div className="flex items-center gap-2 text-sm md:col-span-2">
                  <span className="text-white">Project:</span>
                  <Link
                    href={`/admin/projects/${project.id}`}
                    className="text-[#81D8D0] hover:text-[#81D8D0]/80"
                  >
                    {project.name}
                  </Link>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm md:col-span-2">
                <span className="text-white">Status:</span>
                <StatusBadge status={booking.status} />
              </div>
              {googleMeetLink && (
                <div className="flex items-center gap-2 text-sm md:col-span-2">
                  <Video size={16} className="text-[#a1a1a1]" />
                  <a
                    href={googleMeetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#81D8D0] hover:text-[#81D8D0]/80 flex items-center gap-1"
                  >
                    Join Google Meet
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="border-b border-[#333333] pb-4">
              <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <FileText size={18} />
                Notes
              </h2>
              <p className="text-[#a1a1a1] text-sm whitespace-pre-wrap">{booking.notes}</p>
            </div>
          )}

          {booking.status === 'rescheduled' && booking.original_date && (
            <div className="border-b border-[#333333] pb-4">
              <p className="text-xs text-amber-300">
                Rescheduled from {formatDate(booking.original_date)}
                {booking.original_time ? ` at ${booking.original_time}` : ''}
              </p>
            </div>
          )}
        </div>

        {/* Edit Form */}
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Edit Booking</h2>
          <div className="space-y-4">
            {/* Status */}
            <div>
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-2">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#81D8D0] transition-colors"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                <Calendar size={16} />
                Date
              </label>
              <input
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#81D8D0] transition-colors"
                required
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                <Clock size={16} />
                Time
              </label>
              <input
                type="text"
                value={editForm.time}
                onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                placeholder="9:00 AM"
                className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#81D8D0] transition-colors"
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                <FileText size={16} />
                Notes
              </label>
              <textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                rows={4}
                className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#81D8D0] transition-colors resize-none"
                placeholder="Add notes about this booking..."
              />
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-[#81D8D0] text-[#0a0a0a] font-semibold py-3 px-6 rounded-lg hover:bg-[#81D8D0]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
