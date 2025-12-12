'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Calendar, MapPin, DollarSign, Users, CheckCircle, X, AlertCircle, Clock, Plus, Edit, ChevronUp, ChevronDown, ZoomIn } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { formatTime12Hour } from '@/lib/time-format'
import { createSlug, generateUniqueSlug } from '@/lib/slug'

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    end_time: '',
    location: '',
    price: '',
    capacity: '',
    ticket_link: '',
  })

  useEffect(() => {
    loadEvents()
  }, [filter])

  const loadEvents = async () => {
    const supabase = createClient()
    let query = supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error loading events:', error)
      setLoading(false)
      return
    }

    // Fetch user info for each event
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(e => e.user_id).filter(Boolean))]
      const { data: usersData } = await supabase
        .from('users')
        .select('id, name, email')
        .in('id', userIds)

      const usersMap = new Map((usersData || []).map(u => [u.id, u]))
      
      const eventsWithUsers = data.map(event => ({
        ...event,
        users: event.user_id ? usersMap.get(event.user_id) : null,
      }))

      setEvents(eventsWithUsers)
    } else {
      setEvents([])
    }

    setLoading(false)
  }

  const handleApprove = async (eventId: string) => {
    if (!confirm('Approve this event? It will be visible on the public site.')) return

    try {
      const res = await fetch(`/api/events/${eventId}/approve`, {
        method: 'POST',
      })

      if (!res.ok) {
        alert('Failed to approve event')
        return
      }

      loadEvents()
    } catch (error) {
      console.error('Error approving event:', error)
      alert('Failed to approve event')
    }
  }

  const handleReject = async (eventId: string) => {
    const reason = prompt('Please provide a reason for rejection (optional):')
    if (reason === null) return // User cancelled

    try {
      const res = await fetch(`/api/events/${eventId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || null }),
      })

      if (!res.ok) {
        alert('Failed to reject event')
        return
      }

      loadEvents()
    } catch (error) {
      console.error('Error rejecting event:', error)
      alert('Failed to reject event')
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const totalImages = existingImages.length + images.length + files.length
    if (totalImages > 2) {
      alert('You can have a maximum of 2 images total (including existing images)')
      return
    }
    const remainingSlots = 2 - existingImages.length - images.length
    setImages([...images, ...files.slice(0, remainingSlots)])
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return []

    setUploadingImages(true)
    const uploadedUrls: string[] = []

    try {
      for (const image of images) {
        const formData = new FormData()
        formData.append('file', image)

        const res = await fetch('/api/events/upload-image', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          throw new Error('Failed to upload image')
        }

        const { url } = await res.json()
        uploadedUrls.push(url)
      }
    } catch (error) {
      console.error('Error uploading images:', error)
      throw error
    } finally {
      setUploadingImages(false)
    }

    return uploadedUrls
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      // Upload images first
      let imageUrls: string[] = []
      if (images.length > 0) {
        imageUrls = await uploadImages()
      }

      // Combine date and time
      const eventDate = new Date(`${formData.date}T${formData.time}`).toISOString()

      // Generate unique slug
      const baseSlug = createSlug(formData.title)
      const { data: existingEvents } = await supabase
        .from('events')
        .select('slug')
      const existingSlugs = (existingEvents || []).map(e => e.slug).filter(Boolean)
      const slug = generateUniqueSlug(baseSlug, existingSlugs)

      // Admin-created events are auto-approved
      const { error } = await supabase.from('events').insert({
        user_id: user.id,
        title: formData.title,
        slug: slug,
        description: formData.description || null,
        date: eventDate,
        end_time: formData.end_time || null,
        location: formData.location,
        price: formData.price ? parseFloat(formData.price) : null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
        ticket_link: formData.ticket_link || null,
        status: 'approved', // Admin events are auto-approved
      })

      if (error) {
        alert('Failed to create event. Please try again.')
        console.error(error)
        return
      }

      // Reset form and reload
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        end_time: '',
        location: '',
        price: '',
        capacity: '',
        ticket_link: '',
      })
      setImages([])
      setShowCreateModal(false)
      loadEvents()
    } catch (error) {
      console.error('Error creating event:', error)
      alert('Failed to create event. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditEvent = (event: any) => {
    const eventDate = new Date(event.date)
    const dateStr = eventDate.toISOString().split('T')[0]
    const timeStr = eventDate.toTimeString().slice(0, 5)
    
    setEditingEvent(event)
    setExistingImages(event.image_urls || [])
    setFormData({
      title: event.title || '',
      description: event.description || '',
      date: dateStr,
      time: timeStr,
      end_time: event.end_time || '',
      location: event.location || '',
      price: event.price ? event.price.toString() : '',
      capacity: event.capacity ? event.capacity.toString() : '',
      ticket_link: event.ticket_link || '',
    })
    setImages([])
    setShowEditModal(true)
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index))
  }

  const moveImageUp = (index: number) => {
    if (index === 0) return
    const newImages = [...existingImages]
    ;[newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]]
    setExistingImages(newImages)
  }

  const moveImageDown = (index: number) => {
    if (index === existingImages.length - 1) return
    const newImages = [...existingImages]
    ;[newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]]
    setExistingImages(newImages)
  }

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEvent) return

    setSubmitting(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      // Combine existing images (after removals/reordering) with new uploads
      let imageUrls: string[] = [...existingImages]
      if (images.length > 0) {
        const newImageUrls = await uploadImages()
        imageUrls = [...imageUrls, ...newImageUrls]
      }

      // Combine date and time
      const eventDate = new Date(`${formData.date}T${formData.time}`).toISOString()

      // Generate new slug if title changed
      let slug = editingEvent.slug
      if (formData.title !== editingEvent.title) {
        const baseSlug = createSlug(formData.title)
        const { data: existingEvents } = await supabase
          .from('events')
          .select('slug')
          .neq('id', editingEvent.id)
        const existingSlugs = (existingEvents || []).map(e => e.slug).filter(Boolean)
        slug = generateUniqueSlug(baseSlug, existingSlugs)
      }

      // Admin can edit and keep current status
      const { error } = await supabase
        .from('events')
        .update({
          title: formData.title,
          slug: slug,
          description: formData.description || null,
          date: eventDate,
          end_time: formData.end_time || null,
          location: formData.location,
          price: formData.price ? parseFloat(formData.price) : null,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          image_urls: imageUrls.length > 0 ? imageUrls : null,
          ticket_link: formData.ticket_link || null,
          // Keep current status for admin edits
        })
        .eq('id', editingEvent.id)

      if (error) {
        alert('Failed to update event. Please try again.')
        console.error(error)
        return
      }

      // Reset form and reload
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        end_time: '',
        location: '',
        price: '',
        capacity: '',
        ticket_link: '',
      })
      setImages([])
      setEditingEvent(null)
      setShowEditModal(false)
      loadEvents()
    } catch (error) {
      console.error('Error updating event:', error)
      alert('Failed to update event. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { label: 'Pending', icon: Clock, color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
      approved: { label: 'Approved', icon: CheckCircle, color: 'bg-green-500/20 text-green-500 border-green-500/30' },
      rejected: { label: 'Rejected', icon: X, color: 'bg-red-500/20 text-red-500 border-red-500/30' },
    }
    const badge = badges[status as keyof typeof badges] || badges.pending
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
        <Icon size={14} />
        {badge.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white/70">Loading...</div>
      </div>
    )
  }

  const filteredEvents = filter === 'all' ? events : events.filter(e => e.status === filter)

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-semibold text-white mb-2">
            Event Management
          </h1>
          <p className="text-[#a1a1a1]">
            Review and manage event submissions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#81D8D0] text-[#0a0a0a] rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          Create Event
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === f
                ? 'bg-[#81D8D0] text-[#0a0a0a]'
                : 'bg-[#1a1a1a] text-white border border-[#333333] hover:border-[#81D8D0]/50'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && (
              <span className="ml-2 text-xs">
                ({events.filter(e => e.status === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="bg-[#1A1A1A] border border-primary-tiffany/30 rounded-lg p-8 text-center">
            <Calendar size={48} className="text-primary-tiffany/50 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No Events</h2>
            <p className="text-white/70">No events match the current filter.</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1A1A1A] border border-primary-tiffany/30 rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-white">{event.title}</h3>
                    {getStatusBadge(event.status)}
                  </div>
                  {event.users && (
                    <p className="text-[#a1a1a1] text-sm mb-2">
                      Created by: {event.users.name || event.users.email}
                    </p>
                  )}
                  {event.description && (
                    <p className="text-white/70 mb-4 line-clamp-2">{event.description}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <Calendar size={16} className="text-[#81D8D0]" />
                  <span>
                    {format(new Date(event.date), 'MMMM d, yyyy • h:mm a')}
                    {event.end_time && ` - ${formatTime12Hour(event.end_time)}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <MapPin size={16} className="text-[#81D8D0]" />
                  <span>{event.location}</span>
                </div>
                {event.ticket_link && (
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <a
                      href={event.ticket_link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#81D8D0] hover:underline"
                    >
                      View Tickets →
                    </a>
                  </div>
                )}
                {event.price && (
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <DollarSign size={16} className="text-[#81D8D0]" />
                    <span>${event.price}</span>
                  </div>
                )}
                {event.capacity && (
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Users size={16} className="text-[#81D8D0]" />
                    <span>Capacity: {event.capacity}</span>
                  </div>
                )}
              </div>

              {event.rejection_reason && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                  <p className="text-red-500 text-sm">
                    <strong>Rejection reason:</strong> {event.rejection_reason}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                {event.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(event.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(event.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                    >
                      Reject
                    </button>
                  </>
                )}
                {event.status === 'approved' && (
                  <Link
                    href={`/events/${event.slug || event.id}`}
                    target="_blank"
                    className="px-4 py-2 bg-[#81D8D0] text-[#0a0a0a] rounded-lg hover:opacity-90 transition-opacity font-semibold"
                  >
                    View Public Page
                  </Link>
                )}
                <button
                  onClick={() => handleEditEvent(event)}
                  className="px-4 py-2 border border-[#333333] text-white rounded-lg hover:bg-[#0a0a0a] transition-colors flex items-center gap-2"
                >
                  <Edit size={16} />
                  Edit
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-5 max-w-xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Create Event</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#a1a1a1] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-1.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-1.5 text-sm text-white resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-1.5 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-1.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-1.5 text-sm text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Chicago, IL or Virtual"
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-1.5 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white mb-1">
                    Price (optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-1.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white mb-1">
                    Capacity (optional)
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-1.5 text-sm text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  Images (optional, max 2)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-1.5 text-sm text-white"
                />
                {images.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {images.map((image, index) => (
                      <div key={index} className="flex items-center gap-2 bg-[#0a0a0a] p-1.5 rounded text-xs">
                        <span className="text-white flex-1 truncate">{image.name}</span>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  Ticket Link (optional)
                </label>
                <input
                  type="url"
                  value={formData.ticket_link}
                  onChange={(e) => setFormData({ ...formData, ticket_link: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-1.5 text-sm text-white"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-3 py-1.5 border border-[#333333] rounded-lg text-sm text-white hover:bg-[#0a0a0a] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImages}
                  className="flex-1 px-3 py-1.5 bg-[#81D8D0] text-[#0a0a0a] rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {uploadingImages ? 'Uploading...' : submitting ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && editingEvent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-5 max-w-xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Edit Event</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingEvent(null)
                }}
                className="text-[#a1a1a1] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-1.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-1.5 text-sm text-white resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-1.5 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-1.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-1.5 text-sm text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Chicago, IL or Virtual"
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-1.5 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white mb-1">
                    Price (optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-1.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white mb-1">
                    Capacity (optional)
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-1.5 text-sm text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  Event Images
                </label>
                
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {existingImages.map((imgUrl, index) => (
                      <div key={index} className="flex items-center gap-2 bg-[#0a0a0a] border border-[#333333] rounded-lg p-2">
                        <div className="flex-1 flex items-center gap-2">
                          <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={imgUrl}
                              alt={editingEvent?.title ? `${editingEvent.title} - Image ${index + 1}` : `Event image ${index + 1}`}
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => setLightboxImage(imgUrl)}
                            />
                          </div>
                          <span className="text-xs text-white/60 flex-1 truncate">Image {index + 1}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveImageUp(index)}
                            disabled={index === 0}
                            className="p-1 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move up"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImageDown(index)}
                            disabled={index === existingImages.length - 1}
                            className="p-1 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move down"
                          >
                            <ChevronDown size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="p-1 text-red-400 hover:text-red-300"
                            title="Remove"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Images */}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-1.5 text-sm text-white"
                />
                {images.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {images.map((image, index) => (
                      <div key={index} className="flex items-center gap-2 bg-[#0a0a0a] p-1.5 rounded text-xs">
                        <span className="text-white flex-1 truncate">{image.name}</span>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-xs text-white/60">
                  Max 2 images total. Click image to view full size.
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  Ticket Link (optional)
                </label>
                <input
                  type="url"
                  value={formData.ticket_link}
                  onChange={(e) => setFormData({ ...formData, ticket_link: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-1.5 text-sm text-white"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingEvent(null)
                  }}
                  className="flex-1 px-3 py-1.5 border border-[#333333] rounded-lg text-sm text-white hover:bg-[#0a0a0a] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImages}
                  className="flex-1 px-3 py-1.5 bg-[#81D8D0] text-[#0a0a0a] rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {uploadingImages ? 'Uploading Images...' : submitting ? 'Updating...' : 'Update Event'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Image Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white hover:text-white/70 transition-colors"
          >
            <X size={24} />
          </button>
          <img
            src={lightboxImage}
            alt={editingEvent?.title ? `${editingEvent.title} - Full size image` : "Event image - Full size view"}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

