'use client'

import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Button from '@/components/Button'
import { Calendar, Clock, Video, Camera, ArrowRight } from 'lucide-react'
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
                    <h3 className="text-h3 font-serif font-semibold text-primary-charcoal mb-2">
                      Strategy Meeting
                    </h3>
                    <p className="text-small text-primary-charcoal/70">
                      Book a consultation call to discuss your project, goals,
                      and how we can help bring your vision to life.
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
                      <Camera size={32} className="text-primary-tiffany" />
                    </div>
                    <h3 className="text-h3 font-serif font-semibold text-primary-charcoal mb-2">
                      Content Shoot
                    </h3>
                    <p className="text-small text-primary-charcoal/70">
                      Schedule a professional content shoot for your brand.
                      We&apos;ll handle everything from concept to delivery.
                    </p>
                  </motion.button>
                </div>
              )}

              {/* Booking Form */}
              {selectedType && (
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleSubmit}
                  className="bg-primary-white border-2 border-primary-charcoal/10 rounded-2xl p-8 shadow-lg"
                >
                  <div className="mb-6">
                    <button
                      type="button"
                      onClick={() => setSelectedType(null)}
                      className="text-primary-tiffany hover:underline text-small flex items-center space-x-2"
                    >
                      <ArrowRight size={16} className="rotate-180" />
                      <span>Change booking type</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-small font-semibold text-primary-charcoal mb-2"
                        >
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-4 py-3 border-2 border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-primary-tiffany transition-all"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-small font-semibold text-primary-charcoal mb-2"
                        >
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full px-4 py-3 border-2 border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-primary-tiffany transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-small font-semibold text-primary-charcoal mb-2"
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-primary-tiffany transition-all"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="date"
                          className="block text-small font-semibold text-primary-charcoal mb-2"
                        >
                          Preferred Date *
                        </label>
                        <div className="relative">
                          <Calendar
                            size={20}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-charcoal/40"
                          />
                          <input
                            type="date"
                            id="date"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={formData.date}
                            onChange={(e) =>
                              setFormData({ ...formData, date: e.target.value })
                            }
                            className="w-full pl-10 pr-4 py-3 border-2 border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-primary-tiffany transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="time"
                          className="block text-small font-semibold text-primary-charcoal mb-2"
                        >
                          Preferred Time *
                        </label>
                        <div className="relative">
                          <Clock
                            size={20}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-charcoal/40"
                          />
                          <input
                            type="time"
                            id="time"
                            required
                            value={formData.time}
                            onChange={(e) =>
                              setFormData({ ...formData, time: e.target.value })
                            }
                            className="w-full pl-10 pr-4 py-3 border-2 border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-primary-tiffany transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-small font-semibold text-primary-charcoal mb-2"
                      >
                        Additional Details
                      </label>
                      <textarea
                        id="message"
                        rows={4}
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        placeholder="Tell us about your project, goals, or any specific requirements..."
                        className="w-full px-4 py-3 border-2 border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-primary-tiffany transition-all resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full btn-primary"
                      icon={ArrowRight}
                      disabled={isSubmitting || !selectedType}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
                    </Button>

                    {!selectedType && (
                      <p className="text-small text-primary-charcoal/60 text-center">
                        Please select a booking type above
                      </p>
                    )}
                  </div>
                </motion.form>
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
