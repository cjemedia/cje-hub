'use client'

import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Button from '@/components/Button'
import { Calendar, Clock, Video, Smartphone, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'

export default function BookingPage() {
  const [selectedType, setSelectedType] = useState<'meeting' | 'content-shoot' | null>(null)
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

      <section className="min-h-screen py-section">
        <div className="section-max-width">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Left Column (40%) - Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 lg:sticky lg:top-24 h-fit"
            >
              <div className="relative h-[600px] rounded-2xl overflow-hidden">
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
                    className="text-h2 font-serif font-semibold text-primary-white text-center px-8"
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
              className="lg:col-span-3"
            >
              <div className="mb-8">
                <h1 className="text-h1 font-serif font-bold text-primary-charcoal mb-4">
                  Book a Call
                </h1>
                <p className="text-body text-primary-charcoal/80">
                  Schedule a strategy session, consultation, or content shoot.
                  Let&apos;s discuss how we can bring your vision to life.
                </p>
              </div>

              {/* Booking Type Selection */}
              {!selectedType && (
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedType('meeting')
                      setFormData({ ...formData, type: 'meeting' })
                    }}
                    className="p-8 rounded-2xl border-2 border-primary-charcoal/10 hover:border-primary-tiffany transition-all duration-300 text-left card-hover"
                  >
                    <div className="bg-primary-tiffany/10 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                      <Video size={32} className="text-primary-tiffany" />
                    </div>
                    <h3 className="text-h3 font-serif font-semibold text-primary-charcoal mb-2 text-center">
                      Vision Mapping<br />Session
                    </h3>
                    <p className="text-sm font-semibold text-primary-charcoal/70 mb-2">30 min</p>
                    <p className="text-small text-primary-charcoal/70">
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
                    className="p-8 rounded-2xl border-2 border-primary-charcoal/10 hover:border-primary-tiffany transition-all duration-300 text-left card-hover"
                  >
                    <div className="bg-primary-tiffany/10 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                      <Smartphone size={32} className="text-primary-tiffany" />
                    </div>
                    <h3 className="text-h3 font-serif font-semibold text-primary-charcoal mb-2 text-center">
                      Strategy Session<br />Clients Only
                    </h3>
                    <p className="text-sm font-semibold text-primary-charcoal/70 mb-2">1 hr</p>
                    <p className="text-small text-primary-charcoal/70">
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
                  className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto border border-primary-charcoal/10"
                >
                  <button
                    onClick={() => setSelectedType(null)}
                    className="text-primary-tiffany mb-6 flex items-center gap-2 hover:gap-3 transition-all font-semibold"
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
                      height="1250"
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
                className="mt-12 text-center"
              >
                <p className="text-body text-primary-charcoal/70 mb-4">
                  Prefer to reach out directly?
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href="mailto:media@ciarajevans.com"
                    className="text-primary-tiffany hover:underline font-semibold"
                  >
                    media@ciarajevans.com
                  </a>
                  <span className="text-primary-charcoal/40">•</span>
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
