'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Calendar, Scissors, Sparkles, Star, Menu, X } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export default function SalonDemo() {
  const [isOpen, setIsOpen] = useState(false)

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
              <Link href="/demos/salon" className="text-[#8B4A6B] hover:text-[#A05C7F] font-light text-sm tracking-wide transition-colors">
                Home
              </Link>
              <Link href="/demos/salon/services" className="text-gray-600 hover:text-[#8B4A6B] font-light text-sm tracking-wide transition-colors">
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
                  className="block text-[#8B4A6B] hover:text-[#A05C7F] font-light tracking-wide transition-colors py-2"
                >
                  Home
                </Link>
                <Link
                  href="/demos/salon/services"
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-600 hover:text-[#8B4A6B] font-light tracking-wide transition-colors py-2"
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

      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&q=80"
            alt="Salon interior"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        </div>
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-3xl">
              <div className="mb-6">
                <span className="text-sm font-light tracking-[0.3em] text-white/80 uppercase">Luxury Hair & Beauty</span>
              </div>
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-serif font-light text-white mb-8 leading-[1.1] tracking-tight">
                Where Beauty
                <br />
                Meets Elegance
              </h1>
              <p className="text-lg text-white/90 mb-10 font-light max-w-xl leading-relaxed">
                Experience refined luxury in our serene, sophisticated salon. Where artistry meets precision.
              </p>
              <Link
                href="/demos/salon/services"
                className="inline-flex items-center gap-3 bg-white text-[#8B4A6B] px-10 py-4 font-light tracking-wide hover:bg-[#FAF8F5] transition-all duration-300 border border-white/20 shadow-xl"
              >
                <Calendar size={18} />
                Book Appointment
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="mb-4">
              <span className="text-xs font-light tracking-[0.3em] text-[#8B4A6B]/60 uppercase">What We Offer</span>
            </div>
            <h2 className="text-5xl sm:text-6xl font-serif font-light text-[#2C2C2C] mb-6 tracking-tight">
              Our Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
              A curated selection of luxury hair and beauty services, executed with precision and artistry.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { name: 'Haircuts & Styling', price: '$75+', icon: Scissors },
              { name: 'Color Services', price: '$120+', icon: Sparkles },
              { name: 'Hair Treatments', price: '$65+', icon: Star },
            ].map((service, index) => {
              const Icon = service.icon
              return (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#FAF8F5] p-10 border border-rose-100/50 hover:border-[#D4A574]/30 transition-all duration-300 group shadow-sm hover:shadow-lg"
                >
                  <div className="w-14 h-14 border border-[#D4A574]/30 flex items-center justify-center mb-8 group-hover:border-[#D4A574] transition-colors">
                    <Icon size={24} className="text-[#8B4A6B]" />
                  </div>
                  <h3 className="text-2xl font-serif font-light text-[#2C2C2C] mb-3 tracking-wide">
                    {service.name}
                  </h3>
                  <p className="text-[#8B4A6B] font-light text-xl mb-6">Starting at {service.price}</p>
                  <Link
                    href="/demos/salon/services"
                    className="text-[#8B4A6B] hover:text-[#A05C7F] font-light text-sm tracking-wide inline-flex items-center gap-2 transition-colors"
                  >
                    View Details
                    <span className="text-[#D4A574]">→</span>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="mb-4">
              <span className="text-xs font-light tracking-[0.3em] text-[#8B4A6B]/60 uppercase">Testimonials</span>
            </div>
            <h2 className="text-5xl sm:text-6xl font-serif font-light text-[#2C2C2C] mb-6 tracking-tight">
              What Our Clients Say
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                quote: 'The most refined salon experience. The stylists are true artists.',
                author: 'Sarah M.',
                rating: 5,
              },
              {
                quote: 'I always leave feeling elegant and transformed. Exquisite attention to detail.',
                author: 'Jessica L.',
                rating: 5,
              },
              {
                quote: 'Sophisticated service in a serene atmosphere. Pure luxury.',
                author: 'Emily R.',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-10 border border-rose-100/50 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={18} className="fill-[#D4A574] text-[#D4A574]" />
                  ))}
                </div>
                <p className="text-gray-700 mb-8 font-light leading-relaxed italic text-[15px]">"{testimonial.quote}"</p>
                <p className="text-[#2C2C2C] font-light tracking-wide">— {testimonial.author}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
          <Link
            href="/demos/salon/services"
            className="inline-flex items-center gap-3 bg-white text-[#8B4A6B] px-10 py-4 font-light tracking-wide hover:bg-[#FAF8F5] transition-all duration-300 shadow-xl"
          >
            <Calendar size={18} />
            Book Now
          </Link>
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

