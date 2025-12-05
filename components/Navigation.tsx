'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type NavItem = {
  href: string
  label: string
  external?: boolean
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems: NavItem[] = [
    { href: '/', label: 'Home' },
    { href: '/speaking', label: 'Speaking' },
    { href: '/programs', label: 'Programs' },
    { href: '/shop', label: 'Shop' },
    { href: '/organizations', label: 'Organizations' },
    { href: '/about', label: 'About' },
  ]
  const clientLogin: NavItem = { href: 'https://cje-gk7q2rsk7-cje-media.vercel.app/hub/dashboard', label: 'Client Login', external: true }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-dark/95 backdrop-blur-sm shadow-sm border-b border-white/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24 md:h-28">
          <Link href="/" className="group">
            <img
              src="/images/cje-media-logo.png"
              alt="CJE Media"
              className="h-32 md:h-40 w-auto max-w-[400px] md:max-w-[500px] transition-opacity group-hover:opacity-80 brightness-0 invert"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                className="text-white/80 hover:text-white font-medium transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
            <Link
              href="/booking"
              className="bg-accent text-dark px-6 py-2.5 rounded-lg text-sm font-semibold shadow-lg hover:opacity-90 transition-all"
            >
              Book Ciara
            </Link>
            <Link
              href={clientLogin.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white text-sm font-medium transition-colors"
            >
              {clientLogin.label}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white hover:text-accent transition-colors"
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
            className="md:hidden bg-dark-light border-t border-white/10"
          >
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  onClick={() => setIsOpen(false)}
                  className="block text-white/80 hover:text-white font-medium transition-colors py-2"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/booking"
                onClick={() => setIsOpen(false)}
                className="block bg-accent text-dark px-4 py-2.5 rounded-lg text-sm font-semibold text-center mt-4"
              >
                Book Ciara
              </Link>
              <Link
                href={clientLogin.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="block text-white/60 hover:text-white text-sm font-medium transition-colors py-2"
              >
                {clientLogin.label}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

