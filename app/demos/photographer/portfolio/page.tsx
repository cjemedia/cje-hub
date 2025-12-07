'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, ArrowRight, Menu, X } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export default function PhotographerPortfolio() {
  const [isOpen, setIsOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  const portfolioImages = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
    'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80',
  ]

  return (
    <main className="min-h-screen bg-white">
      {/* Simple Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/demos/photographer" className="text-2xl font-light tracking-wider text-black">
              ALEX MARTIN
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/demos/photographer" className="text-gray-600 hover:text-black font-light text-sm tracking-wide">
                Home
              </Link>
              <Link href="/demos/photographer/portfolio" className="text-black hover:text-gray-600 font-light text-sm tracking-wide">
                Portfolio
              </Link>
              <Link href="/demos/photographer/portal" className="text-gray-600 hover:text-black font-light text-sm tracking-wide">
                Client Login
              </Link>
              <Link href="/demos" className="text-xs text-gray-400 hover:text-gray-600">
                ← Demos
              </Link>
            </div>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-black hover:text-gray-600 transition-colors"
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
                  href="/demos/photographer"
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-600 hover:text-black font-light text-sm tracking-wide transition-colors py-2"
                >
                  Home
                </Link>
                <Link
                  href="/demos/photographer/portfolio"
                  onClick={() => setIsOpen(false)}
                  className="block text-black hover:text-gray-600 font-light text-sm tracking-wide transition-colors py-2"
                >
                  Portfolio
                </Link>
                <Link
                  href="/demos/photographer/portal"
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-600 hover:text-black font-light text-sm tracking-wide transition-colors py-2"
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
      <section className="py-20 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/demos/photographer"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-8 font-light tracking-wide"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
          <h1 className="text-5xl sm:text-6xl font-light text-black tracking-tight mb-4">
            Portfolio
          </h1>
          <p className="text-lg text-gray-600 font-light">
            A selection of recent work
          </p>
        </div>
      </section>

      {/* Portfolio Grid - Masonry Style */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolioImages.map((image, index) => (
              <div
                key={index}
                className="relative aspect-[4/5] cursor-pointer group overflow-hidden"
                onClick={() => setLightboxImage(image)}
              >
                <Image
                  src={image}
                  alt={`Portfolio ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-600 font-light text-sm">© 2024 Alex Martin Photography. Demo Site.</p>
          </div>
        </div>
      </footer>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-400 z-10"
            onClick={() => setLightboxImage(null)}
          >
            ×
          </button>
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full">
            <Image
              src={lightboxImage}
              alt="Lightbox"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </main>
  )
}

