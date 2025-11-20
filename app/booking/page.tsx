'use client'

import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Button from '@/components/Button'
import { Calendar, Clock, Video, Camera, ArrowRight } from 'lucide-react'
import { useState } from 'react'

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

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary-white to-primary-charcoal/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-primary-black mb-6">
              Book a Call
            </h1>
            <p className="text-xl text-primary-charcoal/70 max-w-3xl mx-auto">
              Schedule a strategy session, consultation, or content shoot. Let's
              discuss how we can bring your vision to life.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Booking Types */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedType('meeting')
                setFormData({ ...formData, type: 'meeting' })
              }}
              className={`p-8 rounded-lg border-2 transition-all duration-300 text-left ${
                selectedType === 'meeting'
                  ? 'border-primary-tiffany bg-primary-tiffany/5'
                  : 'border-primary-charcoal/10 hover:border-primary-tiffany/50'
              }`}
            >
              <div className="bg-primary-tiffany/10 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                <Video size={32} className="text-primary-tiffany" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-primary-black mb-2">
                Strategy Meeting
              </h3>
              <p className="text-primary-charcoal/70">
                Book a consultation call to discuss your project, goals, and how
                we can help bring your vision to life.
              </p>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedType('content-shoot')
                setFormData({ ...formData, type: 'content-shoot' })
              }}
              className={`p-8 rounded-lg border-2 transition-all duration-300 text-left ${
                selectedType === 'content-shoot'
                  ? 'border-primary-tiffany bg-primary-tiffany/5'
                  : 'border-primary-charcoal/10 hover:border-primary-tiffany/50'
              }`}
            >
              <div className="bg-primary-tiffany/10 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                <Camera size={32} className="text-primary-tiffany" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-primary-black mb-2">
                Content Shoot
              </h3>
              <p className="text-primary-charcoal/70">
                Schedule a professional content shoot for your brand. We'll
                handle everything from concept to delivery.
              </p>
            </motion.button>
          </div>

          {/* Booking Form */}
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="bg-primary-white border-2 border-primary-charcoal/10 rounded-lg p-8 shadow-lg"
          >
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-primary-charcoal mb-2"
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
                    className="w-full px-4 py-3 border border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-transparent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-primary-charcoal mb-2"
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
                    className="w-full px-4 py-3 border border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-primary-charcoal mb-2"
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
                  className="w-full px-4 py-3 border border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-transparent"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-primary-charcoal mb-2"
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
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 border border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="time"
                    className="block text-sm font-medium text-primary-charcoal mb-2"
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
                      className="w-full pl-10 pr-4 py-3 border border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-primary-charcoal mb-2"
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
                  className="w-full px-4 py-3 border border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-transparent resize-none"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                icon={ArrowRight}
               
              >
                {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
              </Button>

              {!selectedType && (
                <p className="text-sm text-primary-charcoal/60 text-center">
                  Please select a booking type above
                </p>
              )}
            </div>
          </motion.form>

          {/* Alternative Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-primary-charcoal/70 mb-4">
              Prefer to reach out directly?
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:media@ciarajevans.com"
                className="text-primary-tiffany hover:underline font-medium"
              >
                media@ciarajevans.com
              </a>
              <span className="text-primary-charcoal/40">•</span>
              <a
                href="tel:7737278262"
                className="text-primary-tiffany hover:underline font-medium"
              >
                (773) 727-8262
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

