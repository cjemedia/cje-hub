'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Calendar, Scissors, Sparkles, Star, Heart, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SalonServices() {
  const [isOpen, setIsOpen] = useState(false)
  const services = [
    {
      category: 'Haircuts & Styling',
      icon: Scissors,
      items: [
        { name: 'Women\'s Cut & Style', price: '$75', duration: '60 min', description: 'Professional cut and styling with consultation' },
        { name: 'Men\'s Cut & Style', price: '$45', duration: '30 min', description: 'Classic or modern men\'s haircut' },
        { name: 'Blowout', price: '$40', duration: '45 min', description: 'Professional blow dry and styling' },
        { name: 'Updo & Special Occasion', price: '$95', duration: '90 min', description: 'Elegant updos for events and special occasions' },
      ],
    },
    {
      category: 'Color Services',
      icon: Sparkles,
      items: [
        { name: 'Full Color', price: '$120', duration: '120 min', description: 'Complete color application with root touch-up' },
        { name: 'Highlights', price: '$150', duration: '150 min', description: 'Partial or full highlights' },
        { name: 'Balayage', price: '$180', duration: '180 min', description: 'Hand-painted highlights for natural look' },
        { name: 'Color Correction', price: '$200+', duration: '240 min', description: 'Fix previous color issues' },
      ],
    },
    {
      category: 'Hair Treatments',
      icon: Star,
      items: [
        { name: 'Deep Conditioning', price: '$65', duration: '45 min', description: 'Intensive moisture treatment' },
        { name: 'Keratin Treatment', price: '$250', duration: '180 min', description: 'Smoothing and frizz reduction' },
        { name: 'Scalp Treatment', price: '$55', duration: '30 min', description: 'Nourishing scalp massage and treatment' },
      ],
    },
  ]

  return (
    <main className="min-h-screen bg-[#FAF8F5]">
      {/* Simple Navigation */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-rose-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            <Link href="/demos/salon" className="text-3xl font-serif font-light tracking-wider text-[#8B4A6B]">
              BELLE
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/demos/salon" className="text-gray-600 hover:text-[#8B4A6B] font-light text-sm tracking-wide transition-colors">
                Home
              </Link>
              <Link href="/demos/salon/services" className="text-[#8B4A6B] hover:text-[#A05C7F] font-light text-sm tracking-wide transition-colors">
                Services
              </Link>
              <Link href="/demos/salon/portal" className="text-gray-600 hover:text-[#8B4A6B] font-light text-sm tracking-wide transition-colors">
                Client Login
              </Link>
              <Link href="/demos" className="text-xs text-gray-400 hover:text-gray-600">
                ← Demos
              </Link>
            </div>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-[#8B4A6B] hover:text-[#A05C7F] transition-colors"
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
              className="md:hidden bg-white border-t border-rose-200/50"
            >
              <div className="px-4 py-6 space-y-4">
                <Link
                  href="/demos/salon"
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-600 hover:text-[#8B4A6B] font-light tracking-wide transition-colors py-2"
                >
                  Home
                </Link>
                <Link
                  href="/demos/salon/services"
                  onClick={() => setIsOpen(false)}
                  className="block text-[#8B4A6B] hover:text-[#A05C7F] font-light tracking-wide transition-colors py-2"
                >
                  Services
                </Link>
                <Link
                  href="/demos/salon/portal"
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-600 hover:text-[#8B4A6B] font-light tracking-wide transition-colors py-2"
                >
                  Client Login
                </Link>
                <Link
                  href="/demos"
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-400 hover:text-gray-600 text-xs py-2"
                >
                  ← Demos
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Header */}
      <section className="bg-gradient-to-r from-rose-500 to-pink-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white mb-4">
            Our Services
          </h1>
          <p className="text-xl text-white/90">
            Professional hair and beauty services tailored to you
          </p>
        </div>
      </section>

      {/* Services List */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {services.map((category, catIndex) => {
            const CategoryIcon = category.icon
            return (
              <div key={catIndex} className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                    <CategoryIcon size={24} className="text-rose-600" />
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-gray-900">
                    {category.category}
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {category.items.map((service, index) => (
                    <div
                      key={index}
                      className="bg-white p-6 rounded-xl border border-pink-100 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {service.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{service.duration}</span>
                            <span className="text-rose-600 font-bold text-lg">{service.price}</span>
                          </div>
                        </div>
                      </div>
                      <button className="w-full mt-4 bg-rose-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-rose-600 transition-colors flex items-center justify-center gap-2">
                        <Calendar size={18} />
                        Book Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white border-t border-pink-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            Questions? We're Here to Help
          </h2>
          <p className="text-gray-600 mb-8">
            Contact us to discuss your hair goals and find the perfect service for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/demos/salon"
              className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Back to Home
            </Link>
            <Link
              href="/demos/salon/portal"
              className="bg-rose-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-rose-600 transition-colors"
            >
              Client Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-serif font-bold mb-4">Belle Salon</h3>
              <p className="text-gray-400">Where beauty meets elegance.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hours</h4>
              <p className="text-gray-400">Tue-Sat: 9am - 7pm</p>
              <p className="text-gray-400">Sun-Mon: Closed</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-gray-400">(555) 123-4567</p>
              <p className="text-gray-400">hello@bellesalon.com</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>© 2024 Belle Salon. Demo Site.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

