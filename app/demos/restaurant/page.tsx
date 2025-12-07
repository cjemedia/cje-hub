'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Calendar, UtensilsCrossed, Clock, MapPin, Phone, Menu, X } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export default function RestaurantDemo() {
  const [isOpen, setIsOpen] = useState(false)
  const featuredDishes = [
    {
      name: 'Truffle Risotto',
      description: 'Creamy arborio rice with black truffle and parmesan',
      price: '$32',
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
    },
    {
      name: 'Wagyu Beef Tenderloin',
      description: 'Premium wagyu with roasted vegetables and red wine reduction',
      price: '$68',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80',
    },
    {
      name: 'Lobster Thermidor',
      description: 'Fresh lobster in creamy cognac sauce, gratinated',
      price: '$45',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
    },
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
              <Link href="/demos/restaurant" className="text-amber-400 hover:text-amber-300 font-medium">
                Home
              </Link>
              <Link href="/demos/restaurant/menu" className="text-gray-300 hover:text-amber-400 font-medium">
                Menu
              </Link>
              <Link href="/demos/restaurant/reservation" className="text-gray-300 hover:text-amber-400 font-medium">
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
                  className="block text-amber-400 hover:text-amber-300 font-medium transition-colors py-2"
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
                  className="block text-gray-300 hover:text-amber-400 font-medium transition-colors py-2"
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

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80"
            alt="Restaurant interior"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        </div>
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-3xl">
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
                Fine Dining
                <br />
                <span className="text-amber-400">Reimagined</span>
              </h1>
              <p className="text-xl text-gray-300 mb-10 font-light max-w-xl">
                Experience culinary excellence in an intimate, sophisticated atmosphere.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/demos/restaurant/menu"
                  className="inline-flex items-center justify-center gap-2 bg-amber-500 text-black px-8 py-4 rounded-lg font-semibold hover:bg-amber-400 transition-colors shadow-lg"
                >
                  <UtensilsCrossed size={20} />
                  View Menu
                </Link>
                <Link
                  href="/demos/restaurant/reservation"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-colors"
                >
                  <Calendar size={20} />
                  Make Reservation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-[#1a1612]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                A Culinary Journey
              </h2>
              <p className="text-lg text-gray-300 mb-4 leading-relaxed">
                At Ember, we believe dining is an experience that engages all the senses. Our chef-driven menu features seasonal ingredients sourced from local farms, prepared with precision and passion.
              </p>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                Each dish tells a story, combining traditional techniques with modern innovation to create unforgettable flavors.
              </p>
              <div className="flex items-center gap-8 text-gray-400">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed size={20} />
                  <span>Fine Dining</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={20} />
                  <span>Seasonal Menu</span>
                </div>
              </div>
            </div>
            <div className="relative h-[500px] rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80"
                alt="Chef preparing food"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Dishes */}
      <section className="py-24 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Featured Dishes
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              A selection of our signature creations
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredDishes.map((dish, index) => (
              <div
                key={index}
                className="bg-[#1a1612] rounded-xl overflow-hidden border border-amber-900/30 hover:border-amber-700/50 transition-all group"
              >
                <div className="relative h-64">
                  <Image
                    src={dish.image}
                    alt={dish.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-white">{dish.name}</h3>
                    <span className="text-amber-400 font-semibold">{dish.price}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{dish.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/demos/restaurant/menu"
              className="inline-flex items-center gap-2 bg-amber-500 text-black px-8 py-4 rounded-lg font-semibold hover:bg-amber-400 transition-colors"
            >
              View Full Menu →
            </Link>
          </div>
        </div>
      </section>

      {/* Reservation CTA */}
      <section className="py-24 bg-gradient-to-r from-amber-900/30 to-amber-800/20 border-y border-amber-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Reserve Your Table
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join us for an exceptional dining experience. Reservations recommended.
          </p>
          <Link
            href="/demos/restaurant/reservation"
            className="inline-flex items-center gap-2 bg-amber-500 text-black px-10 py-5 rounded-lg font-semibold hover:bg-amber-400 transition-colors shadow-lg text-lg"
          >
            <Calendar size={24} />
            Book a Table
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-16 border-t border-amber-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-amber-400 mb-4">Ember Restaurant</h3>
              <p className="text-gray-400">Fine dining reimagined.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Hours</h4>
              <p className="text-gray-400 mb-2">Tue-Thu: 5pm - 10pm</p>
              <p className="text-gray-400 mb-2">Fri-Sat: 5pm - 11pm</p>
              <p className="text-gray-400">Sun: 5pm - 9pm</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <p className="flex items-center gap-2">
                  <Phone size={16} />
                  (555) 234-5678
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={16} />
                  123 Fine Dining Ave
                </p>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-amber-900/30 text-center text-gray-500 text-sm">
            <p>© 2024 Ember Restaurant. Demo Site.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

