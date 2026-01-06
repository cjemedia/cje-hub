'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Calendar, MapPin, DollarSign, Users, Share2, X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Button from '@/components/Button'
import { formatTime12Hour } from '@/lib/time-format'
import {
  FacebookShareButton,
  TwitterShareButton,
  PinterestShareButton,
  LinkedinShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  PinterestIcon,
  LinkedinIcon,
  EmailIcon,
} from 'react-share'

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number>(0)
  const [organizer, setOrganizer] = useState<any>(null)

  useEffect(() => {
    const loadEvent = async () => {
      const supabase = createClient()

      let foundEvent: any = null
      let foundOrganizer: any = null

      try {
        // Try by slug with organizer relation
        const { data, error } = await supabase
          .from('events')
          .select('*, organizer:users(id, name, email, bio, avatar_url, company, phone)')
          .eq('slug', params.slug)
          .eq('status', 'approved')
          .single()

        if (!error && data) {
          foundEvent = data
          foundOrganizer = (data as any).organizer || null
        }

        // Fallback to ID with relation
        if (!foundEvent) {
          const { data: dataById, error: errorById } = await supabase
            .from('events')
            .select('*, organizer:users(id, name, email, bio, avatar_url, company, phone)')
            .eq('id', params.slug)
            .eq('status', 'approved')
            .single()
          if (!errorById && dataById) {
            foundEvent = dataById
            foundOrganizer = (dataById as any).organizer || null
          }
        }

        // If still no event, try plain fetch without relation
        if (!foundEvent) {
          const { data } = await supabase
            .from('events')
            .select('*')
            .eq('slug', params.slug)
            .eq('status', 'approved')
            .single()
          if (data) foundEvent = data
        }
        if (!foundEvent) {
          const { data: dataById } = await supabase
            .from('events')
            .select('*')
            .eq('id', params.slug)
            .eq('status', 'approved')
            .single()
          if (dataById) foundEvent = dataById
        }
      } catch (err) {
        // ignore and fall through
      }

      setEvent(foundEvent)

      // Load organizer separately if relation was missing
      if (!foundOrganizer && foundEvent?.user_id) {
        const { data: organizerData } = await supabase
          .from('users')
          .select('id, name, email, bio, avatar_url, company, phone')
          .eq('id', foundEvent.user_id)
          .single()
        foundOrganizer = organizerData || null
      }

      setOrganizer(foundOrganizer)
      setLoading(false)
    }

    if (params.slug) {
      loadEvent()
    }
  }, [params.slug])

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareTitle = event?.title || ''
  const shareDescription = event?.description || ''

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-dark">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-white/70">Loading...</div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!event) {
    return null
  }

  const eventDate = new Date(event.date)
  const images = event.image_urls && event.image_urls.length > 0
    ? event.image_urls
    : event.image_url
      ? [event.image_url]
      : []
  const secondaryImage = images[1]

  const renderImageCard = (imgUrl: string, index: number, extraClasses = '') => (
    <motion.div
      key={`${imgUrl}-${index}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative w-full min-h-[300px] rounded-2xl overflow-hidden cursor-pointer group bg-[#0a0a0a] flex items-center justify-center ${extraClasses}`}
      onClick={() => {
        setLightboxImage(imgUrl)
        setLightboxIndex(index)
      }}
    >
      <Image
        src={imgUrl}
        alt={`${event.title} - Image ${index + 1}`}
        width={800}
        height={600}
        className="max-w-full max-h-[600px] w-auto h-auto object-contain group-hover:opacity-90 transition-opacity"
        priority={index === 0}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
        <ZoomIn size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  )

  return (
    <main className="min-h-screen bg-dark">
      <Navigation />

      <div className="pt-32 pb-16">
        <div className="section-max-width">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Events
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Images */}
            {images.length > 0 && (
              <div className="space-y-4">
                {images.map((imgUrl: string, index: number) =>
                  renderImageCard(imgUrl, index, index === 1 ? 'hidden lg:flex' : '')
                )}
              </div>
            )}

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                  {event.title}
                </h1>

                {/* Event Details - Moved to top */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-white/80">
                    <Calendar size={20} className="text-accent flex-shrink-0" />
                    <span className="text-lg">
                      {format(eventDate, 'EEEE, MMMM d, yyyy')} at {format(eventDate, 'h:mm a')}
                      {event.end_time && ` - ${formatTime12Hour(event.end_time)}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <MapPin size={20} className="text-accent flex-shrink-0" />
                    <span className="text-lg">{event.location}</span>
                  </div>
                  {event.price && (
                    <div className="flex items-center gap-3 text-white/80">
                      <DollarSign size={20} className="text-accent flex-shrink-0" />
                      <span className="text-lg">${event.price}</span>
                    </div>
                  )}
                  {event.capacity && (
                    <div className="flex items-center gap-3 text-white/80">
                      <Users size={20} className="text-accent flex-shrink-0" />
                      <span className="text-lg">Capacity: {event.capacity} attendees</span>
                    </div>
                  )}
                  {event.ticket_link && (
                    <div className="pt-2">
                      <a
                        href={event.ticket_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-dark rounded-lg font-semibold hover:opacity-90 transition-opacity"
                      >
                        Get Tickets
                        <ArrowRight size={18} />
                      </a>
                    </div>
                  )}
                </div>

                {/* Share Buttons - Moved to top */}
                <div className="mb-6 pb-6 border-b border-white/10">
                  <p className="text-white/70 mb-3 font-semibold text-sm">Share this event:</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <FacebookShareButton url={shareUrl}>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] border border-white/10 rounded-lg hover:border-accent transition-colors">
                        <FacebookIcon size={16} round />
                        <span className="text-white text-xs">Facebook</span>
                      </div>
                    </FacebookShareButton>
                    <TwitterShareButton url={shareUrl} title={shareTitle}>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] border border-white/10 rounded-lg hover:border-accent transition-colors">
                        <TwitterIcon size={16} round />
                        <span className="text-white text-xs">Twitter</span>
                      </div>
                    </TwitterShareButton>
                    <PinterestShareButton url={shareUrl} description={shareDescription} media={(event.image_urls && event.image_urls[0]) || event.image_url || ''}>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] border border-white/10 rounded-lg hover:border-accent transition-colors">
                        <PinterestIcon size={16} round />
                        <span className="text-white text-xs">Pinterest</span>
                      </div>
                    </PinterestShareButton>
                    <LinkedinShareButton url={shareUrl} title={shareTitle} summary={shareDescription}>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] border border-white/10 rounded-lg hover:border-accent transition-colors">
                        <LinkedinIcon size={16} round />
                        <span className="text-white text-xs">LinkedIn</span>
                      </div>
                    </LinkedinShareButton>
                    <EmailShareButton url={shareUrl} subject={shareTitle} body={`Check out this event: ${shareTitle}\n\n${shareUrl}`}>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] border border-white/10 rounded-lg hover:border-accent transition-colors">
                        <EmailIcon size={16} round />
                        <span className="text-white text-xs">Email</span>
                      </div>
                    </EmailShareButton>
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] border border-white/10 rounded-lg hover:border-accent transition-colors"
                    >
                      <Share2 size={16} className="text-white" />
                      <span className="text-white text-xs">{copied ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>

                {/* Description - Moved to bottom */}
                {event.description && (
                  <div className="text-lg text-white/80 leading-relaxed whitespace-pre-wrap">
                    {event.description}
                  </div>
                )}
              </div>

            </motion.div>
          </div>

          {/* Mobile-only secondary image at bottom */}
          {secondaryImage && (
            <div className="mt-10 lg:hidden">
              {renderImageCard(secondaryImage, 1)}
            </div>
          )}

          {/* Organizer profile */}
          {organizer && (
            <div className="mt-12 lg:mt-16 border-t border-white/10 pt-8 flex flex-col items-center">
              <div className="flex w-full max-w-3xl items-start gap-6">
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-white/10 flex-shrink-0 flex items-center justify-center text-2xl font-semibold text-white">
                  {organizer.avatar_url ? (
                    <Image
                      src={organizer.avatar_url}
                      alt={organizer.name || 'Event organizer'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span>{(organizer.name || organizer.email || '?').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="space-y-1 text-left">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">Event Organizer</p>
                  <p className="text-xl font-semibold text-white">{organizer.name || organizer.email}</p>
                  {organizer.company && <p className="text-white/70 text-sm">{organizer.company}</p>}
                  <p className="text-white/60 text-sm">{organizer.email}</p>
                  {organizer.phone && <p className="text-white/60 text-sm">{organizer.phone}</p>}
                  {organizer.bio && <p className="text-white/60 text-sm mt-3 leading-relaxed max-w-2xl">{organizer.bio}</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Image Lightbox */}
      {lightboxImage && (() => {
        const allImages = (event.image_urls && event.image_urls.length > 0) 
          ? event.image_urls 
          : (event.image_url ? [event.image_url] : [])
        const currentIndex = lightboxIndex
        const hasMultiple = allImages.length > 1
        
        const goToNext = (e: React.MouseEvent) => {
          e.stopPropagation()
          if (currentIndex < allImages.length - 1) {
            const nextIndex = currentIndex + 1
            setLightboxIndex(nextIndex)
            setLightboxImage(allImages[nextIndex])
          }
        }
        
        const goToPrev = (e: React.MouseEvent) => {
          e.stopPropagation()
          if (currentIndex > 0) {
            const prevIndex = currentIndex - 1
            setLightboxIndex(prevIndex)
            setLightboxImage(allImages[prevIndex])
          }
        }
        
        return (
          <div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4"
            onClick={() => {
              setLightboxImage(null)
              setLightboxIndex(0)
            }}
          >
            <button
              onClick={() => {
                setLightboxImage(null)
                setLightboxIndex(0)
              }}
              className="absolute top-4 right-4 text-white hover:text-white/70 transition-colors z-10 bg-black/50 rounded-full p-2"
            >
              <X size={24} />
            </button>
            
            {hasMultiple && currentIndex > 0 && (
              <button
                onClick={goToPrev}
                className="absolute left-4 text-white hover:text-white/70 transition-colors z-10 bg-black/50 rounded-full p-3 hover:bg-black/70"
                aria-label="Previous image"
              >
                <ChevronLeft size={32} />
              </button>
            )}
            
            {hasMultiple && currentIndex < allImages.length - 1 && (
              <button
                onClick={goToNext}
                className="absolute right-4 text-white hover:text-white/70 transition-colors z-10 bg-black/50 rounded-full p-3 hover:bg-black/70"
                aria-label="Next image"
              >
                <ChevronRight size={32} />
              </button>
            )}
            
            <img
              src={lightboxImage}
              alt={`${event.title} - Image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            {hasMultiple && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/70 text-sm bg-black/50 px-4 py-2 rounded-full z-10">
                {currentIndex + 1} / {allImages.length}
              </div>
            )}
          </div>
        )
      })()}
    </main>
  )
}

