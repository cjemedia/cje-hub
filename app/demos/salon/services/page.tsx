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
      {/* Demo Banner */}
      <div className="bg-[#81D8D0] text-dark text-center py-2 text-sm">
        This is a demo site. <a href="/demos" className="underline">View all demos</a>
      </div>
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
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="mb-4">
              <span className="text-xs font-light tracking-[0.3em] text-[#8B4A6B]/60 uppercase">Our Services</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-serif font-light text-[#2C2C2C] mb-6 tracking-tight">
              Services & Pricing
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
              A curated selection of luxury hair and beauty services, executed with precision and artistry.
            </p>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="py-20 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {services.map((category, catIndex) => {
            const CategoryIcon = category.icon
            return (
              <motion.div 
                key={catIndex} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: catIndex * 0.1 }}
                className="mb-20 last:mb-0"
              >
                <div className="flex items-center gap-4 mb-12">
                  <div className="w-14 h-14 border border-[#D4A574]/30 flex items-center justify-center">
                    <CategoryIcon size={24} className="text-[#8B4A6B]" />
                  </div>
                  <h2 className="text-4xl font-serif font-light text-[#2C2C2C] tracking-tight">
                    {category.category}
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  {category.items.map((service, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: (catIndex * 0.1) + (index * 0.05) }}
                      className="bg-white p-8 border border-rose-100/50 hover:border-[#D4A574]/30 transition-all duration-300 shadow-sm hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <h3 className="text-2xl font-serif font-light text-[#2C2C2C] mb-3 tracking-wide">
                            {service.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 font-light leading-relaxed">{service.description}</p>
                          <div className="flex items-center gap-6 text-sm">
                            <span className="text-gray-500 font-light">{service.duration}</span>
                            <span className="text-[#8B4A6B] font-light text-xl">{service.price}</span>
                          </div>
                        </div>
                      </div>
                      <button className="w-full mt-6 bg-[#8B4A6B] text-white px-6 py-4 rounded-lg font-light tracking-wide hover:bg-[#A05C7F] transition-colors flex items-center justify-center gap-2">
                        <Calendar size={18} />
                        Book Now
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-[#8B4A6B]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl sm:text-6xl font-serif font-light text-white mb-8 tracking-tight">
            Ready to Transform
            <br />
            Your Look?
          </h2>
          <p className="text-lg text-white/90 mb-12 font-light max-w-xl mx-auto leading-relaxed">
            Book your appointment today and experience the Belle difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/demos/salon"
              className="inline-flex items-center gap-3 bg-white text-[#8B4A6B] px-8 py-4 font-light tracking-wide hover:bg-[#FAF8F5] transition-all duration-300 shadow-xl"
            >
              Back to Home
            </Link>
            <Link
              href="/demos/salon/portal"
              className="inline-flex items-center gap-3 bg-white/10 text-white border border-white/30 px-8 py-4 font-light tracking-wide hover:bg-white/20 transition-all duration-300"
            >
              Client Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-[#2C2C2C] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-2xl font-serif font-light mb-4 tracking-wider">BELLE</h3>
              <p className="text-gray-400 font-light">Where beauty meets elegance.</p>
            </div>
            <div>
              <h4 className="font-light mb-4 tracking-wide text-sm uppercase">Hours</h4>
              <p className="text-gray-400 font-light">Tue-Sat: 9am - 7pm</p>
              <p className="text-gray-400 font-light">Sun-Mon: Closed</p>
            </div>
            <div>
              <h4 className="font-light mb-4 tracking-wide text-sm uppercase">Contact</h4>
              <p className="text-gray-400 font-light">(555) 123-4567</p>
              <p className="text-gray-400 font-light">hello@bellesalon.com</p>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-500 text-sm font-light">
            <p>© 2024 Belle Salon. Demo Site.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

