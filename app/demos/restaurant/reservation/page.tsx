'use client'

import Link from 'next/link'
import { Calendar, Clock, Users, Phone, Mail, MapPin, ArrowLeft, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function RestaurantReservation() {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
    specialRequests: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Visual only - no backend functionality
    alert('Reservation request submitted! (Demo only)')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const timeSlots = [
    '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM',
    '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM',
  ]

  return (
    <main className="min-h-screen bg-[#1a1612] text-white">
      {/* Simple Navigation */}
      <nav className="bg-black/60 backdrop-blur-sm border-b border-amber-900/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/demos/restaurant" className="text-2xl font-bold text-amber-400">
              Ember Restaurant
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/demos/restaurant" className="text-gray-300 hover:text-amber-400 font-medium">
                Home
              </Link>
              <Link href="/demos/restaurant/menu" className="text-gray-300 hover:text-amber-400 font-medium">
                Menu
              </Link>
              <Link href="/demos/restaurant/reservation" className="text-amber-400 hover:text-amber-300 font-medium">
                Reservation
              </Link>
              <Link href="/demos" className="text-xs text-gray-500 hover:text-gray-300">
                ← Demos
              </Link>
            </div>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-amber-400 hover:text-amber-300 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black/95 border-t border-amber-900/30"
            >
              <div className="px-4 py-6 space-y-4">
                <Link
                  href="/demos/restaurant"
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-300 hover:text-amber-400 font-medium transition-colors py-2"
                >
                  Home
                </Link>
                <Link
                  href="/demos/restaurant/menu"
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-300 hover:text-amber-400 font-medium transition-colors py-2"
                >
                  Menu
                </Link>
                <Link
                  href="/demos/restaurant/reservation"
                  onClick={() => setIsOpen(false)}
                  className="block text-amber-400 hover:text-amber-300 font-medium transition-colors py-2"
                >
                  Reservation
                </Link>
                <Link
                  href="/demos"
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-500 hover:text-gray-300 text-xs py-2"
                >
                  ← Demos
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Header */}
      <section className="bg-gradient-to-r from-amber-900/30 to-amber-800/20 border-b border-amber-900/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/demos/restaurant"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-8 font-medium"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Make a Reservation
          </h1>
          <p className="text-xl text-gray-300">
            Reserve your table for an exceptional dining experience
          </p>
        </div>
      </section>

      {/* Reservation Form */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-black/40 border border-amber-900/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-black/40 border border-amber-900/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-amber-900/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      required
                      value={formData.date}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-black/40 border border-amber-900/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-2">
                      Time *
                    </label>
                    <select
                      id="time"
                      name="time"
                      required
                      value={formData.time}
                      onChange={handleChange}
                      className="w-full bg-black/40 border border-amber-900/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="">Select time</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time} className="bg-[#1a1612]">
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="guests" className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Guests *
                  </label>
                  <select
                    id="guests"
                    name="guests"
                    required
                    value={formData.guests}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-amber-900/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <option key={num} value={num.toString()} className="bg-[#1a1612]">
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-300 mb-2">
                    Special Requests
                  </label>
                  <textarea
                    id="specialRequests"
                    name="specialRequests"
                    rows={4}
                    value={formData.specialRequests}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-amber-900/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    placeholder="Dietary restrictions, celebrations, seating preferences..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 text-black px-8 py-4 rounded-lg font-semibold hover:bg-amber-400 transition-colors shadow-lg text-lg"
                >
                  Submit Reservation
                </button>
              </form>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <div className="bg-black/40 border border-amber-900/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Clock size={20} className="text-amber-400" />
                  Hours
                </h3>
                <div className="space-y-2 text-gray-300">
                  <p className="flex justify-between">
                    <span>Tuesday - Thursday</span>
                    <span className="text-white">5pm - 10pm</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Friday - Saturday</span>
                    <span className="text-white">5pm - 11pm</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Sunday</span>
                    <span className="text-white">5pm - 9pm</span>
                  </p>
                  <p className="flex justify-between text-gray-500">
                    <span>Monday</span>
                    <span>Closed</span>
                  </p>
                </div>
              </div>

              <div className="bg-black/40 border border-amber-900/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <MapPin size={20} className="text-amber-400" />
                  Location
                </h3>
                <p className="text-gray-300 mb-4">
                  123 Fine Dining Ave<br />
                  San Francisco, CA 94102
                </p>
                <p className="text-sm text-gray-400">
                  Valet parking available
                </p>
              </div>

              <div className="bg-black/40 border border-amber-900/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Phone size={20} className="text-amber-400" />
                  Contact
                </h3>
                <p className="text-gray-300 mb-2">
                  <a href="tel:+15552345678" className="hover:text-amber-400 transition-colors">
                    (555) 234-5678
                  </a>
                </p>
                <p className="text-gray-300">
                  <a href="mailto:reservations@ember.com" className="hover:text-amber-400 transition-colors text-sm">
                    reservations@ember.com
                  </a>
                </p>
              </div>

              <div className="bg-amber-900/20 border border-amber-900/30 rounded-lg p-6">
                <p className="text-sm text-gray-300">
                  <strong className="text-white">Note:</strong> Reservations are recommended, especially for weekend dining. We'll confirm your reservation via email or phone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-amber-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>© 2024 Ember Restaurant. Demo Site.</p>
        </div>
      </footer>
    </main>
  )
}

