'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Home, Mail, Phone, MapPin, Award, Users, Menu, X } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

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
    <main className="min-h-screen bg-white">
      {/* Simple Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/demos/realtor" className="text-2xl font-bold text-blue-900">
              Sarah Mitchell
              <span className="text-blue-600"> Realty</span>
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/demos/realtor" className="text-blue-900 hover:text-blue-700 font-medium">
                Home
              </Link>
              <Link href="/demos/realtor/listings" className="text-gray-600 hover:text-blue-900 font-medium">
                Listings
              </Link>
              <Link href="/demos" className="text-xs text-gray-500 hover:text-gray-700">
                ← Demos
              </Link>
            </div>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-blue-900 hover:text-blue-700 transition-colors"
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
              className="md:hidden bg-white border-t border-gray-200"
            >
              <div className="px-4 py-6 space-y-4">
                <Link
                  href="/demos/realtor"
                  onClick={() => setIsOpen(false)}
                  className="block text-blue-900 hover:text-blue-700 font-medium transition-colors py-2"
                >
                  Home
                </Link>
                <Link
                  href="/demos/realtor/listings"
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-600 hover:text-blue-900 font-medium transition-colors py-2"
                >
                  Listings
                </Link>
                <Link
                  href="/demos"
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-500 hover:text-gray-700 text-xs py-2"
                >
                  ← Demos
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] overflow-hidden bg-blue-900">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=80"
            alt="Modern home exterior"
            fill
            className="object-cover opacity-40"
            priority
          />
        </div>
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Find Your
                <br />
                Dream Home
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Expert real estate services in San Francisco and the Bay Area.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/demos/realtor/listings"
                  className="inline-flex items-center justify-center gap-2 bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                >
                  <Home size={20} />
                  View Listings
                </Link>
                <button className="inline-flex items-center justify-center gap-2 bg-blue-700 text-white border border-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                  <Mail size={20} />
                  Contact Me
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agent Bio */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[500px] rounded-lg overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80"
                alt="Sarah Mitchell"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Meet Sarah Mitchell
              </h2>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                With over 15 years of experience in San Francisco real estate, I've helped hundreds of families find their perfect home. My approach combines market expertise with personalized service.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Whether you're buying your first home or selling an investment property, I'm here to guide you through every step of the process.
              </p>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Award size={24} className="text-blue-600" />
                    <span className="text-3xl font-bold text-blue-900">15+</span>
                  </div>
                  <p className="text-gray-600">Years Experience</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Users size={24} className="text-blue-600" />
                    <span className="text-3xl font-bold text-blue-900">200+</span>
                  </div>
                  <p className="text-gray-600">Happy Clients</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="bg-blue-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors">
                  Get in Touch
                </button>
                <a href="tel:+15551234567" className="flex items-center gap-2 text-gray-600 hover:text-blue-900">
                  <Phone size={20} />
                  (555) 123-4567
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Featured Listings
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our current selection of premium properties
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredListings.map((listing, index) => (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-gray-200"
              >
                <div className="relative h-64">
                  <Image
                    src={listing.image}
                    alt={listing.address}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{listing.address}</h3>
                      <p className="text-gray-600 text-sm flex items-center gap-1">
                        <MapPin size={14} />
                        {listing.city}
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-blue-900">{listing.price}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
                    <span>{listing.beds} Beds</span>
                    <span>{listing.baths} Baths</span>
                    <span>{listing.sqft} sqft</span>
                  </div>
                  <button className="w-full bg-blue-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/demos/realtor/listings"
              className="inline-flex items-center gap-2 bg-blue-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              View All Listings →
            </Link>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24 bg-blue-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Start Your Search?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Let's discuss your real estate goals and find the perfect property for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg">
              Schedule Consultation
            </button>
            <button className="bg-blue-700 text-white border border-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
              Contact Me
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-4">Sarah Mitchell Realty</h3>
              <p className="text-gray-400">Your trusted real estate partner in San Francisco.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
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
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Home Buying</li>
                <li>Home Selling</li>
                <li>Property Investment</li>
                <li>Market Analysis</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>© 2024 Sarah Mitchell Realty. Demo Site.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

