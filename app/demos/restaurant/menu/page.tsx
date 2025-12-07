'use client'

import Link from 'next/link'
import { useState } from 'react'
import { UtensilsCrossed, Menu, X } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export default function RestaurantMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuSections = [
    {
      category: 'Appetizers',
      items: [
        { name: 'Burrata & Prosciutto', description: 'Fresh burrata, prosciutto di parma, arugula, balsamic reduction', price: '$18' },
        { name: 'Tuna Tartare', description: 'Fresh tuna, avocado, yuzu, crispy wonton', price: '$22' },
        { name: 'Foie Gras', description: 'Pan-seared foie gras, fig compote, brioche', price: '$28' },
        { name: 'Oysters', description: 'Half dozen fresh oysters, mignonette, lemon', price: '$24' },
      ],
    },
    {
      category: 'Mains',
      items: [
        { name: 'Wagyu Beef Tenderloin', description: 'Premium wagyu, roasted vegetables, red wine reduction', price: '$68' },
        { name: 'Lobster Thermidor', description: 'Fresh lobster, cognac cream sauce, gratinated', price: '$45' },
        { name: 'Duck Confit', description: 'Slow-cooked duck leg, cherry gastrique, roasted potatoes', price: '$38' },
        { name: 'Truffle Risotto', description: 'Creamy arborio rice, black truffle, parmesan', price: '$32' },
        { name: 'Sea Bass', description: 'Pan-seared sea bass, fennel, lemon beurre blanc', price: '$36' },
        { name: 'Rack of Lamb', description: 'Herb-crusted lamb, mint pesto, roasted root vegetables', price: '$42' },
      ],
    },
    {
      category: 'Desserts',
      items: [
        { name: 'Chocolate Soufflé', description: 'Warm chocolate soufflé, vanilla ice cream', price: '$14' },
        { name: 'Crème Brûlée', description: 'Classic vanilla crème brûlée, fresh berries', price: '$12' },
        { name: 'Tiramisu', description: 'Traditional Italian tiramisu, espresso, cocoa', price: '$13' },
        { name: 'Cheese Selection', description: 'Artisan cheese board, honey, crackers', price: '$18' },
      ],
    },
    {
      category: 'Drinks',
      items: [
        { name: 'Wine Selection', description: 'Curated wines by the glass or bottle', price: '$12-$200' },
        { name: 'Craft Cocktails', description: 'Signature cocktails, classic favorites', price: '$16' },
        { name: 'Champagne', description: 'Selection of premium champagnes', price: '$25-$500' },
        { name: 'Espresso & Coffee', description: 'Italian espresso, specialty coffee', price: '$6' },
      ],
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
              <Link href="/demos/restaurant" className="text-gray-300 hover:text-amber-400 font-medium">
                Home
              </Link>
              <Link href="/demos/restaurant/menu" className="text-amber-400 hover:text-amber-300 font-medium">
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
                  className="block text-gray-300 hover:text-amber-400 font-medium transition-colors py-2"
                >
                  Home
                </Link>
                <Link
                  href="/demos/restaurant/menu"
                  onClick={() => setIsOpen(false)}
                  className="block text-amber-400 hover:text-amber-300 font-medium transition-colors py-2"
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

      {/* Menu Header */}
      <section className="relative h-[40vh] min-h-[300px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&q=80"
            alt="Food presentation"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/60" />
        </div>
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4">
              Our Menu
            </h1>
            <p className="text-xl text-gray-300">
              Chef's seasonal selection
            </p>
          </div>
        </div>
      </section>

      {/* Menu Content */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-16 last:mb-0">
              <div className="flex items-center gap-4 mb-8">
                <UtensilsCrossed size={28} className="text-amber-400" />
                <h2 className="text-3xl sm:text-4xl font-bold text-white">
                  {section.category}
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-amber-900/50 to-transparent" />
              </div>
              <div className="space-y-6">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex items-start justify-between gap-6 py-4 border-b border-amber-900/20 last:border-0 hover:bg-white/5 transition-colors rounded-lg px-4 -mx-4"
                  >
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{item.name}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                    </div>
                    <span className="text-amber-400 font-bold text-lg whitespace-nowrap">
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-black/40 border-t border-amber-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Dine With Us?
          </h2>
          <p className="text-gray-400 mb-8">
            Make a reservation to experience our seasonal menu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/demos/restaurant"
              className="bg-gray-800 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Back to Home
            </Link>
            <Link
              href="/demos/restaurant/reservation"
              className="bg-amber-500 text-black px-8 py-3 rounded-lg font-medium hover:bg-amber-400 transition-colors inline-block"
            >
              Make Reservation
            </Link>
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

