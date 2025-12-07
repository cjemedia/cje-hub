'use client'

import Link from 'next/link'
import { Home, MapPin, Search, Filter, Menu, X } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function RealtorListings() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const listings = [
    {
      address: '123 Oak Street',
      city: 'San Francisco, CA',
      price: '$1,250,000',
      beds: 3,
      baths: 2,
      sqft: '2,400',
      year: '2018',
      image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
    },
    {
      address: '456 Maple Avenue',
      city: 'San Francisco, CA',
      price: '$895,000',
      beds: 2,
      baths: 2,
      sqft: '1,800',
      year: '2020',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
    },
    {
      address: '789 Pine Drive',
      city: 'San Francisco, CA',
      price: '$2,100,000',
      beds: 4,
      baths: 3,
      sqft: '3,200',
      year: '2015',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    },
    {
      address: '321 Elm Court',
      city: 'San Francisco, CA',
      price: '$650,000',
      beds: 1,
      baths: 1,
      sqft: '950',
      year: '2019',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    },
    {
      address: '654 Cedar Lane',
      city: 'San Francisco, CA',
      price: '$1,850,000',
      beds: 4,
      baths: 3,
      sqft: '2,800',
      year: '2017',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    },
    {
      address: '987 Birch Way',
      city: 'San Francisco, CA',
      price: '$1,100,000',
      beds: 3,
      baths: 2,
      sqft: '2,100',
      year: '2021',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    },
  ]

  const filteredListings = listings.filter((listing) =>
    listing.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-gray-50">
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
              <Link href="/demos/realtor" className="text-gray-600 hover:text-blue-900 font-medium">
                Home
              </Link>
              <Link href="/demos/realtor/listings" className="text-blue-900 hover:text-blue-700 font-medium">
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
                  className="block text-gray-600 hover:text-blue-900 font-medium transition-colors py-2"
                >
                  Home
                </Link>
                <Link
                  href="/demos/realtor/listings"
                  onClick={() => setIsOpen(false)}
                  className="block text-blue-900 hover:text-blue-700 font-medium transition-colors py-2"
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

      {/* Header */}
      <section className="bg-blue-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Property Listings
          </h1>
          <p className="text-xl text-white/90">
            Browse our available properties in San Francisco
          </p>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by address or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              <Filter size={20} />
              Filters
            </button>
          </div>
        </div>
      </section>

      {/* Listings Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredListings.length}</span> properties
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredListings.map((listing, index) => (
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
                    <div className="flex-1">
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
                    <span>Built {listing.year}</span>
                  </div>
                  <button className="w-full bg-blue-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Don't See What You're Looking For?
          </h2>
          <p className="text-gray-600 mb-8">
            Contact me to discuss your specific needs and explore additional properties.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/demos/realtor"
              className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Back to Home
            </Link>
            <button className="bg-blue-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors">
              Contact Agent
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400 text-sm">
          <p>© 2024 Sarah Mitchell Realty. Demo Site.</p>
        </div>
      </footer>
    </main>
  )
}

