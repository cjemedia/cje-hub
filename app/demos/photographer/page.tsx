'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Camera, Mail, Instagram, ArrowRight, Menu, X } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export default function PhotographerDemo() {
  const [isOpen, setIsOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  const portfolioImages = [
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&q=80',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80',
  ]

  return (
    <main className="min-h-screen bg-white">
      {/* Demo Banner */}
      <div className="bg-[#81D8D0] text-dark text-center py-2 text-sm">
        This is a CJE demo site. <a href="/demos" className="underline">View all demos</a>
      </div>
      {/* Simple Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/demos/photographer" className="text-2xl font-light tracking-wider text-black">
              ALEX MARTIN
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/demos/photographer" className="text-black hover:text-gray-600 font-light text-sm tracking-wide">
                Home
              </Link>
              <Link href="/demos/photographer/portfolio" className="text-gray-600 hover:text-black font-light text-sm tracking-wide">
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
                  className="block text-black hover:text-gray-600 font-light text-sm tracking-wide transition-colors py-2"
                >
                  Home
                </Link>
                <Link
                  href="/demos/photographer/portfolio"
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-600 hover:text-black font-light text-sm tracking-wide transition-colors py-2"
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

      {/* Hero Section - Full Screen Image */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1600&q=80"
            alt="Photography hero"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 h-full flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-20">
            <div className="max-w-2xl">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-white mb-6 tracking-tight leading-tight">
                Capturing
                <br />
                Moments That
                <br />
                Matter
              </h1>
              <Link
                href="/demos/photographer/portfolio"
                className="inline-flex items-center gap-2 text-white border border-white/30 px-8 py-4 hover:bg-white/10 transition-colors font-light tracking-wide"
              >
                View Work
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="mb-4">
                <span className="text-xs text-black/40 uppercase tracking-widest">About</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-light text-black mb-8 tracking-tight leading-tight">
                Alex Martin
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed font-light">
                I'm a photographer specializing in editorial, portrait, and event photography. My work focuses on authentic moments and emotional storytelling.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed font-light">
                With over a decade of experience, I've worked with brands, publications, and individuals to create imagery that resonates.
              </p>
              <div className="flex items-center gap-6">
                <a href="#" className="text-black hover:text-gray-600 transition-colors">
                  <Instagram size={24} />
                </a>
                <a href="#" className="text-black hover:text-gray-600 transition-colors">
                  <Mail size={24} />
                </a>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[600px]"
            >
              <Image
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
                alt="Alex Martin"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Service Types */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-light text-black mb-4 tracking-tight">
              Services
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: 'Editorial',
                description: 'Fashion and editorial photography for magazines and brands',
              },
              {
                title: 'Portraits',
                description: 'Professional headshots and personal portrait sessions',
              },
              {
                title: 'Events',
                description: 'Weddings, corporate events, and special occasions',
              },
            ].map((service, index) => (
              <div key={index} className="text-center">
                <h3 className="text-2xl font-light text-black mb-4 tracking-wide">
                  {service.title}
                </h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Preview */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-16">
            <div>
              <div className="mb-4">
                <span className="text-xs text-black/40 uppercase tracking-widest">Portfolio</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-light text-black tracking-tight leading-tight">
                Recent Work
              </h2>
            </div>
            <Link
              href="/demos/photographer/portfolio"
              className="text-black hover:text-gray-600 font-light tracking-wide flex items-center gap-2 transition-colors"
            >
              View All
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {portfolioImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative h-[500px] cursor-pointer group overflow-hidden"
                onClick={() => setLightboxImage(image)}
              >
                <Image
                  src={image}
                  alt={`Portfolio ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-32 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-light mb-8 tracking-tight">
            Let's Create Something Together
          </h2>
          <p className="text-xl text-gray-400 mb-12 font-light">
            Get in touch to discuss your project
          </p>
          <button className="inline-flex items-center gap-2 border border-white/30 px-8 py-4 hover:bg-white/10 transition-colors font-light tracking-wide">
            <Mail size={20} />
            Contact Me
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-600 font-light text-sm">© 2024 Alex Martin Photography. Demo Site.</p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                <Mail size={20} />
              </a>
            </div>
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
            className="absolute top-4 right-4 text-white text-2xl hover:text-gray-400"
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

