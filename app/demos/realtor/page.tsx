'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Home, Mail, Phone, MapPin, Menu, X, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function RealtorDemo() {
  const [isOpen, setIsOpen] = useState(false)

  const featuredListings = [
    {
      address: '123 Oak Street',
      city: 'San Francisco, CA',
      price: '$1,250,000',
      beds: 3,
      baths: 2,
      sqft: '2,400',
      image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
    },
    {
      address: '456 Maple Avenue',
      city: 'San Francisco, CA',
      price: '$895,000',
      beds: 2,
      baths: 2,
      sqft: '1,800',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
    },
    {
      address: '789 Pine Drive',
      city: 'San Francisco, CA',
      price: '$2,100,000',
      beds: 4,
      baths: 3,
      sqft: '3,200',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    },
  ]

  return (
    <main className="min-h-screen bg-black">
      {/* Demo Banner */}
      <div className="bg-[#81D8D0] text-dark text-center py-2 text-sm">
        This is a demo site. <a href="/demos" className="underline">View all demos</a>
      </div>
      {/* Navigation */}
      <nav className="bg-black border-b border-[#A27414]/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/demos/realtor" className="text-xl font-light tracking-wider text-[#A27414]">
              SARAH MITCHELL
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/demos/realtor" className="text-[#A27414] hover:text-[#B8860B] font-light text-sm tracking-wide transition-colors">
                Home
              </Link>
              <Link href="/demos/realtor/listings" className="text-gray-300 hover:text-[#A27414] font-light text-sm tracking-wide transition-colors">
                Listings
              </Link>
              <Link href="/demos" className="text-xs text-gray-500 hover:text-gray-300">
                ← Demos
              </Link>
            </div>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-[#A27414] hover:text-[#B8860B] transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-black border-t border-[#A27414]/30">
            <div className="px-4 py-6 space-y-4">
              <Link
                href="/demos/realtor"
                onClick={() => setIsOpen(false)}
                className="block text-[#A27414] hover:text-[#B8860B] font-light text-sm tracking-wide transition-colors py-2"
              >
                Home
              </Link>
              <Link
                href="/demos/realtor/listings"
                onClick={() => setIsOpen(false)}
                className="block text-gray-300 hover:text-[#A27414] font-light text-sm tracking-wide transition-colors py-2"
              >
                Listings
              </Link>
              <Link
                href="/demos"
                onClick={() => setIsOpen(false)}
                className="block text-gray-500 hover:text-gray-300 text-xs py-2"
              >
                ← Demos
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1600&q=80"
            alt="Luxury home interior"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl"
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-white mb-6 leading-tight tracking-tight">
                Find Your
                <br />
                Dream Home
              </h1>
              <p className="text-xl text-white/90 mb-8 font-light">
                Expert real estate services in San Francisco and the Bay Area.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/demos/realtor/listings"
                  className="inline-flex items-center justify-center gap-2 bg-[#A27414] text-black px-8 py-4 font-light tracking-wide hover:bg-[#B8860B] transition-colors"
                >
                  <Home size={20} />
                  View Listings
                </Link>
                <button className="inline-flex items-center justify-center gap-2 bg-transparent text-white border border-[#A27414]/50 px-8 py-4 font-light tracking-wide hover:bg-[#A27414]/10 transition-colors">
                  <Mail size={20} />
                  Contact Me
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Agent Bio */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[600px]"
            >
              <Image
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80"
                alt="Sarah Mitchell"
                fill
                className="object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="mb-6">
                <span className="text-xs text-[#A27414] uppercase tracking-widest font-light">About</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-light text-white mb-8 leading-tight tracking-tight">
                Meet Sarah Mitchell
              </h2>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed font-light">
                With over 15 years of experience in San Francisco real estate, I've helped hundreds of families find their perfect home. My approach combines market expertise with personalized service.
              </p>
              <p className="text-lg text-gray-300 mb-12 leading-relaxed font-light">
                Whether you're buying your first home or selling an investment property, I'm here to guide you through every step of the process.
              </p>
              <div className="flex items-center gap-6">
                <button className="bg-[#A27414] text-black px-8 py-4 font-light tracking-wide hover:bg-[#B8860B] transition-colors">
                  Get in Touch
                </button>
                <a href="tel:+15551234567" className="flex items-center gap-2 text-gray-300 hover:text-[#A27414] font-light transition-colors">
                  <Phone size={20} />
                  (555) 123-4567
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="mb-4">
              <span className="text-xs text-[#A27414] uppercase tracking-widest font-light">Properties</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-light text-white mb-4 tracking-tight">
              Featured Listings
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed font-light">
              Explore our current selection of premium properties in San Francisco and the Bay Area.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredListings.map((listing, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-black border border-[#A27414]/30 overflow-hidden group cursor-pointer hover:border-[#A27414]/50 transition-colors"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={listing.image}
                    alt={listing.address}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-8">
                  <div className="mb-4">
                    <h3 className="text-xl font-light text-white mb-2 tracking-tight">{listing.address}</h3>
                    <p className="text-gray-400 text-sm font-light flex items-center gap-1">
                      <MapPin size={14} />
                      {listing.city}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-[#A27414]/30">
                    <span className="text-2xl font-light text-[#A27414]">{listing.price}</span>
                    <div className="flex items-center gap-4 text-sm text-gray-400 font-light">
                      <span>{listing.beds} Beds</span>
                      <span>{listing.baths} Baths</span>
                      <span>{listing.sqft} sqft</span>
                    </div>
                  </div>
                  <Link
                    href="/demos/realtor/listings"
                    className="inline-flex items-center gap-2 text-[#A27414] hover:text-[#B8860B] font-light text-sm tracking-wide transition-colors"
                  >
                    View Details
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/demos/realtor/listings"
              className="inline-flex items-center gap-2 bg-[#A27414] text-black px-8 py-4 font-light tracking-wide hover:bg-[#B8860B] transition-colors"
            >
              View All Listings
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24 bg-black border-t border-[#A27414]/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-light text-white mb-6 tracking-tight">
            Ready to Start Your Search?
          </h2>
          <p className="text-xl text-gray-300 mb-10 font-light">
            Let's discuss your real estate goals and find the perfect property for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-[#A27414] text-black px-8 py-4 font-light tracking-wide hover:bg-[#B8860B] transition-colors">
              Schedule Consultation
            </button>
            <button className="bg-transparent text-white border border-[#A27414]/50 px-8 py-4 font-light tracking-wide hover:bg-[#A27414]/10 transition-colors">
              Contact Me
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-[#A27414]/30 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-xl font-light mb-4 tracking-wide text-[#A27414]">Sarah Mitchell</h3>
              <p className="text-gray-400 font-light">Your trusted real estate partner in San Francisco.</p>
            </div>
            <div>
              <h4 className="font-light mb-4 tracking-wide text-[#A27414]">Contact</h4>
              <div className="space-y-2 text-gray-400 font-light">
                <p className="flex items-center gap-2">
                  <Phone size={16} />
                  (555) 123-4567
                </p>
                <p className="flex items-center gap-2">
                  <Mail size={16} />
                  sarah@sarahmitchellrealty.com
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={16} />
                  San Francisco, CA
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-light mb-4 tracking-wide text-[#A27414]">Services</h4>
              <ul className="space-y-2 text-gray-400 font-light">
                <li>Home Buying</li>
                <li>Home Selling</li>
                <li>Property Investment</li>
                <li>Market Analysis</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-[#A27414]/30 text-center text-gray-500 text-sm font-light">
            <p>© 2024 Sarah Mitchell Realty. Demo Site.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
