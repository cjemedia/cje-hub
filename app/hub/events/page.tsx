'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, MapPin, DollarSign, X, Plus, Edit, ChevronDown, ChevronUp, ExternalLink, Info } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import Button from '@/components/Button'
import { formatTime12Hour } from '@/lib/time-format'
import { createSlug, generateUniqueSlug } from '@/lib/slug'

export default function EventsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [myEvents, setMyEvents] = useState<any[]>([])
  const [communityEvents, setCommunityEvents] = useState<any[]>([])
  const [pastEvents, setPastEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(true)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
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
  const [images, setImages] = useState<File[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)

  const loadData = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    setUser(user)

    // Fetch user's own events
    const { data: myEventsData } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Fetch approved community events (excluding user's own, future dates only)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { data: communityEventsData } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'approved')
      .neq('user_id', user.id)
      .gte('date', today.toISOString())
      .order('date', { ascending: true })

    // Fetch past approved community events (excluding user's own)
    const { data: pastEventsData } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'approved')
      .neq('user_id', user.id)
      .lt('date', today.toISOString())
      .order('date', { ascending: false })
      .limit(6)

    setMyEvents(myEventsData || [])
    setCommunityEvents(communityEventsData || [])
    setPastEvents(pastEventsData || [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [router])

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
        status: 'pending',
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
      await loadData()
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
    setExistingImages(event.image_urls || (event.image_url ? [event.image_url] : []))
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
    if (!editingEvent) {
      alert('No event selected for editing')
      return
    }

    setSubmitting(true)

    try {
      const supabase = createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        alert('You must be logged in to edit events')
        setSubmitting(false)
        return
      }

      // Combine existing images (after removals/reordering) with new uploads
      let imageUrls: string[] = [...existingImages]
      if (images.length > 0) {
        try {
          const newImageUrls = await uploadImages()
          imageUrls = [...imageUrls, ...newImageUrls]
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError)
          alert('Failed to upload images. Please try again.')
          setSubmitting(false)
          return
        }
      }

      // Combine date and time
      const eventDate = new Date(`${formData.date}T${formData.time}`).toISOString()

      // Generate new slug if title changed
      let slug = editingEvent.slug
      if (formData.title !== editingEvent.title) {
        const baseSlug = createSlug(formData.title)
        const { data: existingEvents, error: slugError } = await supabase
          .from('events')
          .select('slug')
          .neq('id', editingEvent.id)
        
        if (slugError) {
          console.error('Error fetching existing slugs:', slugError)
        } else {
          const existingSlugs = (existingEvents || []).map(e => e.slug).filter(Boolean)
          slug = generateUniqueSlug(baseSlug, existingSlugs)
        }
      }

      // When resubmitting after changes_requested, set status to pending and clear rejection_reason
      const updatePayload: any = {
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
        status: 'pending',
        rejection_reason: null, // Clear rejection reason on resubmit
      }

      const { error } = await supabase
        .from('events')
        .update(updatePayload)
        .eq('id', editingEvent.id)

      if (error) {
        console.error('Update error:', error)
        alert(`Failed to update event: ${error.message || 'Unknown error'}`)
        setSubmitting(false)
        return
      }

      // Reset form and close modal
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
      setExistingImages([])
      setEditingEvent(null)
      setShowEditModal(false)
      
      alert('Event updated successfully! It has been submitted for review.')
      await loadData()
    } catch (error: any) {
      console.error('Error updating event:', error)
      alert(`Failed to update event: ${error?.message || 'Unknown error'}`)
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pending Review', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      approved: { label: 'Live', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
      changes_requested: { label: 'Changes Requested', className: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
      rejected: { label: 'Rejected', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
    }
    const badge = badges[status] || badges.pending
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.className}`}>
        {badge.label}
      </span>
    )
  }

  const getEventImage = (event: any) => {
    if (event.image_urls && Array.isArray(event.image_urls) && event.image_urls.length > 0) {
      return event.image_urls[0]
    }
    if (event.image_url) {
      return event.image_url
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white/70">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Back Link */}
        <Link
          href="/hub/dashboard"
          className="inline-flex items-center gap-2 text-[#a1a1a1] hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        {/* Section 1: Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl lg:text-4xl font-semibold text-white">
              Submit Your Event
            </h1>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={18} />
              Submit Event
            </Button>
          </div>
          <p className="text-[#a1a1a1]">
            Submit your event for promotion on ciarajevans.com. Approved events get a dedicated page and featured placement.
          </p>
          <p className="text-sm text-[#81D8D0]">
            Looking to book Ciara J. for your event?{' '}
            <a
              href="https://www.ciarajevans.com/events"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              View speaking & hosting services →
            </a>
          </p>
        </div>

        {/* Section 2: How It Works */}
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl overflow-hidden">
          <button
            onClick={() => setShowHowItWorks(!showHowItWorks)}
            className="w-full flex items-center justify-between p-4 hover:bg-[#0a0a0a] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Info size={20} className="text-[#81D8D0]" />
              <span className="text-white font-semibold">How it works</span>
            </div>
            {showHowItWorks ? <ChevronUp size={20} className="text-[#a1a1a1]" /> : <ChevronDown size={20} className="text-[#a1a1a1]" />}
          </button>
          {showHowItWorks && (
            <div className="p-4 pt-0 border-t border-[#333333] space-y-2 text-[#a1a1a1] text-sm">
              <p>1. Submit your event details</p>
              <p>2. Our team reviews your submission</p>
              <p>3. Approved events get their own page on ciarajevans.com/events/[slug]</p>
              <p>4. Your event is featured in the Upcoming Events section</p>
            </div>
          )}
        </div>

        {/* Section 3: My Submissions */}
        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">My Submissions</h2>
          {myEvents.length === 0 ? (
            <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-12 text-center">
              <Calendar size={48} className="text-[#81D8D0]/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">You haven't submitted any events yet.</h3>
              <Button onClick={() => setShowCreateModal(true)} className="mt-4">
                Submit Your First Event
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myEvents.map((event) => {
                const eventImage = getEventImage(event)
                const eventDate = new Date(event.date)
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#1a1a1a] border border-[#333333] rounded-xl overflow-hidden hover:border-[#81D8D0]/50 transition-colors"
                  >
                    {eventImage && (
                      <div className="aspect-video w-full bg-[#0a0a0a] overflow-hidden">
                        <img
                          src={eventImage}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-lg font-semibold text-white flex-1">{event.title}</h3>
                        {getStatusBadge(event.status)}
                      </div>
                      
                      <div className="space-y-2 text-sm text-[#a1a1a1]">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-[#81D8D0] flex-shrink-0" />
                          <span>
                            {format(eventDate, 'MMM d, yyyy')}
                            {event.end_time && ` • ${formatTime12Hour(event.end_time)}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-[#81D8D0] flex-shrink-0" />
                          <span>{event.location}</span>
                        </div>
                      </div>

                      {/* Status-specific content */}
                      {event.status === 'changes_requested' && event.rejection_reason && (
                        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                          <p className="text-orange-400 text-xs font-semibold mb-1">Feedback:</p>
                          <p className="text-orange-300/90 text-xs">{event.rejection_reason}</p>
                        </div>
                      )}
                      {event.status === 'rejected' && event.rejection_reason && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                          <p className="text-red-400 text-xs font-semibold mb-1">Reason:</p>
                          <p className="text-red-300/90 text-xs">{event.rejection_reason}</p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2 border-t border-[#333333]">
                        {(event.status === 'pending' || event.status === 'changes_requested') && (
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="flex-1 px-3 py-2 bg-[#81D8D0] text-[#0a0a0a] rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                          >
                            <Edit size={14} />
                            {event.status === 'changes_requested' ? 'Edit & Resubmit' : 'Edit'}
                          </button>
                        )}
                        {event.status === 'approved' && event.slug && (
                          <a
                            href={`https://ciarajevans.com/events/${event.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-3 py-2 bg-[#81D8D0] text-[#0a0a0a] rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                          >
                            <ExternalLink size={14} />
                            View on Site
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Section 4: Explore Community Events */}
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-white mb-1">Upcoming Community Events</h2>
            <p className="text-[#a1a1a1]">Discover events from The CJE Experience community</p>
          </div>
          {communityEvents.length === 0 ? (
            <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-12 text-center">
              <Calendar size={48} className="text-[#81D8D0]/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No upcoming community events at this time.</h3>
              <p className="text-[#a1a1a1]">Check back soon for new events!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communityEvents.map((event) => {
                const eventImage = getEventImage(event)
                const eventDate = new Date(event.date)
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#1a1a1a] border border-[#333333] rounded-xl overflow-hidden hover:border-[#81D8D0]/50 transition-colors"
                  >
                    {eventImage && (
                      <div className="aspect-video w-full bg-[#0a0a0a] overflow-hidden">
                        <img
                          src={eventImage}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-5 space-y-3">
                      <h3 className="text-xl font-semibold text-white">{event.title}</h3>
                      {event.description && (
                        <p className="text-[#a1a1a1] text-sm line-clamp-3">{event.description}</p>
                      )}
                      <div className="space-y-2 text-sm text-[#a1a1a1]">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-[#81D8D0] flex-shrink-0" />
                          <span>
                            {format(eventDate, 'MMM d, yyyy')}
                            {event.end_time && ` • ${formatTime12Hour(event.end_time)}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-[#81D8D0] flex-shrink-0" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign size={14} className="text-[#81D8D0] flex-shrink-0" />
                          <span>{event.price && event.price > 0 ? `$${event.price}` : 'Free'}</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-[#333333]">
                        {event.ticket_link ? (
                          <a
                            href={event.ticket_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full text-center px-4 py-2 bg-[#81D8D0] text-[#0a0a0a] rounded-lg font-semibold hover:opacity-90 transition-opacity"
                          >
                            Get Tickets →
                          </a>
                        ) : (
                          <a
                            href={`https://ciarajevans.com/events/${event.slug || event.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full text-center px-4 py-2 bg-[#81D8D0] text-[#0a0a0a] rounded-lg font-semibold hover:opacity-90 transition-opacity"
                          >
                            Learn More →
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Section 5: Past Events */}
        {pastEvents.length > 0 && (
          <div>
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-white mb-1">Past Events</h2>
              <p className="text-[#a1a1a1]">Events from The CJE Experience community</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => {
                const eventImage = getEventImage(event)
                const eventDate = new Date(event.date)
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#1a1a1a] border border-[#333333] rounded-xl overflow-hidden hover:border-[#81D8D0]/30 transition-colors opacity-75"
                  >
                    {eventImage && (
                      <div className="aspect-video w-full bg-[#0a0a0a] overflow-hidden grayscale">
                        <img
                          src={eventImage}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-5 space-y-3">
                      <h3 className="text-xl font-semibold text-white/90">{event.title}</h3>
                      {event.description && (
                        <p className="text-[#a1a1a1]/70 text-sm line-clamp-3">{event.description}</p>
                      )}
                      <div className="space-y-2 text-sm text-[#a1a1a1]/70">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-[#81D8D0]/70 flex-shrink-0" />
                          <span>
                            {format(eventDate, 'MMM d, yyyy')}
                            {event.end_time && ` • ${formatTime12Hour(event.end_time)}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-[#81D8D0]/70 flex-shrink-0" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-[#333333]">
                        <a
                          href={`https://ciarajevans.com/events/${event.slug || event.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center px-4 py-2 bg-[#0a0a0a] border border-[#333333] text-white/70 rounded-lg font-semibold hover:border-[#81D8D0]/50 hover:text-white transition-colors"
                        >
                          View Details →
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
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
              <h2 className="text-xl font-semibold text-white">Submit Event</h2>
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
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-yellow-500 text-xs">
                  Your event will be submitted for review. You'll be notified once it's approved.
                </p>
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
                  {uploadingImages ? 'Uploading Images...' : submitting ? 'Submitting...' : 'Submit for Review'}
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
                              alt={`${editingEvent?.title || 'Event'} - Image ${index + 1}`}
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
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-yellow-500 text-xs font-semibold mb-1">
                  ⚠️ Status Change Notice
                </p>
                <p className="text-yellow-500/90 text-xs">
                  Your event will show as <strong>"Pending Review"</strong> until approved by admin. You'll be notified once it's approved.
                </p>
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
