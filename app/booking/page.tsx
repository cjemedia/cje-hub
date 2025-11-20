'use client'

import { useMemo, useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Button from '@/components/Button'
import { Calendar, Clock, Video, Smartphone, ArrowRight } from 'lucide-react'
import Image from 'next/image'

function BookingContent() {
  const searchParams = useSearchParams()
  const initialType = useMemo(() => {
    const typeParam = searchParams.get('type')
    if (typeParam === 'content-shoot') return 'content-shoot'
    if (typeParam === 'meeting') return 'meeting'
    return null
  }, [searchParams])

  const [selectedType, setSelectedType] = useState<'meeting' | 'content-shoot' | null>(initialType)
  useEffect(() => {
    setSelectedType(initialType)
  }, [initialType])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: '',
    date: '',
    time: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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
          duration: 60,
          notes: formData.message,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit booking')
      }

      alert('Booking request submitted! We\'ll confirm your appointment soon.')
      setFormData({
        name: '',
        email: '',
        phone: '',
        type: '',
        date: '',
        time: '',
        message: '',
      })
      setSelectedType(null)
    } catch (error) {
      alert('Failed to submit booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-primary-white">
      <Navigation />

      <section className="min-h-screen py-8 sm:py-12 md:py-16 lg:py-section">
        <div className="section-max-width">
          <div className="grid lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-12">
            {/* Left Column (40%) - Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 lg:sticky lg:top-24 h-fit order-2 lg:order-1"
            >
              <div className="relative h-[300px] sm:h-[400px] lg:h-[600px] rounded-xl sm:rounded-2xl overflow-hidden">
                <Image
                  src="/images/cje10.JPG"
                  alt="Let's Work Together"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-primary-charcoal/40 flex items-center justify-center">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-h2 font-serif font-semibold text-primary-white text-center px-4 sm:px-8"
                  >
                    Let&apos;s Work Together
                  </motion.h2>
                </div>
              </div>
            </motion.div>

            {/* Right Column (60%) - Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3 order-1 lg:order-2"
            >
              <div className="mb-6 sm:mb-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-h1 font-serif font-bold text-primary-charcoal mb-3 sm:mb-4">
                  Book a Call
                </h1>
                <p className="text-sm sm:text-base lg:text-body text-primary-charcoal/80">
                  Schedule a strategy session, consultation, or content shoot.
                  Let&apos;s discuss how we can bring your vision to life.
                </p>
              </div>

              {/* Booking Type Selection */}
              {!selectedType && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedType('meeting')
                      setFormData({ ...formData, type: 'meeting' })
                    }}
                    className="p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border-2 border-primary-charcoal/10 hover:border-primary-tiffany transition-all duration-300 text-left card-hover"
                  >
                    <div className="bg-primary-tiffany/10 w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center mb-3 sm:mb-4 mx-auto sm:mx-0">
                      <Video size={24} className="sm:w-8 sm:h-8 text-primary-tiffany" />
                    </div>
                    <h3 className="text-xl sm:text-2xl lg:text-h3 font-serif font-semibold text-primary-charcoal mb-2 text-center sm:text-left">
                      Vision Mapping<br />Session
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-primary-charcoal/70 mb-2 text-center sm:text-left">30 min</p>
                    <p className="text-xs sm:text-sm lg:text-small text-primary-charcoal/70">
                      Welcome to CJE Media, The Storytelling Marketing Agency! We are so excited to hear from you and hopefully help bring your vision to life! Web conferencing details will be provided upon confirmation.
                    </p>
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedType('content-shoot')
                      setFormData({ ...formData, type: 'content-shoot' })
                    }}
                    className="p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border-2 border-primary-charcoal/10 hover:border-primary-tiffany transition-all duration-300 text-left card-hover"
                  >
                    <div className="bg-primary-tiffany/10 w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center mb-3 sm:mb-4 mx-auto sm:mx-0">
                      <Smartphone size={24} className="sm:w-8 sm:h-8 text-primary-tiffany" />
                    </div>
                    <h3 className="text-xl sm:text-2xl lg:text-h3 font-serif font-semibold text-primary-charcoal mb-2 text-center sm:text-left">
                      Strategy Session<br />Clients Only
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-primary-charcoal/70 mb-2 text-center sm:text-left">1 hr</p>
                    <p className="text-xs sm:text-sm lg:text-small text-primary-charcoal/70">
                      This weekly strategy session is for current CJE Media clients. We&apos;ll focus on your tailored marketing strategy, content planning, and storytelling, aligned with your brand and goals. Use this link to book your dedicated time each week.
                    </p>
                  </motion.button>
                </div>
              )}

              {/* Booking Experience via Calendly */}
              {selectedType && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto border border-primary-charcoal/10"
                >
                  <button
                    onClick={() => setSelectedType(null)}
                    className="text-primary-tiffany mb-4 sm:mb-6 flex items-center gap-2 hover:gap-3 transition-all font-semibold text-sm sm:text-base"
                  >
                    ← Change booking type
                  </button>

                  <div className="w-full rounded-lg overflow-hidden border border-gray-200">
                    <iframe
                      src={
                        selectedType === 'meeting'
                          ? 'https://calendly.com/media-ciarajevans/30min'
                          : 'https://calendly.com/media-ciarajevans/strategy-session-cje-media-clients-only'
                      }
                      width="100%"
                      height="800"
                      className="sm:h-[1000px] lg:h-[1250px]"
                      frameBorder="0"
                      scrolling="no"
                      title="Schedule with Calendly"
                    />
                  </div>
                </motion.div>
              )}

              {/* Alternative Contact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 sm:mt-12 text-center"
              >
                <p className="text-sm sm:text-base lg:text-body text-primary-charcoal/70 mb-3 sm:mb-4">
                  Prefer to reach out directly?
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-sm sm:text-base">
                  <a
                    href="mailto:media@ciarajevans.com"
                    className="text-primary-tiffany hover:underline font-semibold break-all"
                  >
                    media@ciarajevans.com
                  </a>
                  <span className="text-primary-charcoal/40 hidden sm:inline">•</span>
                  <a
                    href="tel:7737278262"
                    className="text-primary-tiffany hover:underline font-semibold"
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
    <Suspense fallback={
      <main className="min-h-screen bg-primary-white">
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-primary-charcoal/70">Loading...</div>
        </div>
        <Footer />
      </main>
    }>
      <BookingContent />
    </Suspense>
  )
}
