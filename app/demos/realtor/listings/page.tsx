'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Home, Mail, Phone, MapPin, Menu, X, ArrowLeft, Bed, Bath, Square } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function RealtorListings() {
  const [isOpen, setIsOpen] = useState(false)

  const listings = [
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
    {
      address: '321 Elm Court',
      city: 'San Francisco, CA',
      price: '$1,650,000',
      beds: 3,
      baths: 2.5,
      sqft: '2,800',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    },
    {
      address: '654 Cedar Lane',
      city: 'San Francisco, CA',
      price: '$1,450,000',
      beds: 4,
      baths: 3,
      sqft: '3,000',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    },
    {
      address: '987 Birch Way',
      city: 'San Francisco, CA',
      price: '$1,850,000',
      beds: 5,
      baths: 4,
      sqft: '3,600',
      image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
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
              <Link href="/demos/realtor" className="text-gray-300 hover:text-[#A27414] font-light text-sm tracking-wide transition-colors">
                Home
              </Link>
              <Link href="/demos/realtor/listings" className="text-[#A27414] hover:text-[#B8860B] font-light text-sm tracking-wide transition-colors">
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
                className="block text-gray-300 hover:text-[#A27414] font-light text-sm tracking-wide transition-colors py-2"
              >
                Home
              </Link>
              <Link
                href="/demos/realtor/listings"
                onClick={() => setIsOpen(false)}
                className="block text-[#A27414] hover:text-[#B8860B] font-light text-sm tracking-wide transition-colors py-2"
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

      {/* Header */}
      <section className="py-20 bg-black border-b border-[#A27414]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/demos/realtor"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-[#A27414] mb-8 font-light tracking-wide transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
          <h1 className="text-5xl sm:text-6xl font-light text-white tracking-tight mb-4">
            All Listings
          </h1>
          <p className="text-lg text-gray-300 font-light">
            Browse our complete selection of available properties
          </p>
        </div>
      </section>

      {/* Listings Grid */}
      <section className="py-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((listing, index) => (
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
                      <span className="flex items-center gap-1">
                        <Bed size={14} />
                        {listing.beds}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath size={14} />
                        {listing.baths}
                      </span>
                      <span className="flex items-center gap-1">
                        <Square size={14} />
                        {listing.sqft}
                      </span>
                    </div>
                  </div>
                  <button className="w-full bg-[#A27414] text-black px-6 py-3 font-light tracking-wide hover:bg-[#B8860B] transition-colors">
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-[#A27414]/30 text-white py-16 mt-20">
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

