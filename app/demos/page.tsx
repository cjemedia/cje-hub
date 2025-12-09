'use client'

import Link from 'next/link'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Scissors, UtensilsCrossed, Camera, Home } from 'lucide-react'

export default function DemosGallery() {
  const demos = [
    {
      id: 'salon',
      name: 'Salon',
      icon: Scissors,
      preview: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80',
      style: 'Soft, feminine, elegant',
      colors: 'Light pinks, cream, gold accents',
      features: ['Service menu', 'Booking system', 'Client portal', 'Testimonials'],
      hasPortal: true,
      pages: ['Home', 'Services', 'Client Portal'],
      description: 'Elegant salon website with booking and client portal for appointments and loyalty points.',
    },
    {
      id: 'restaurant',
      name: 'Restaurant',
      icon: UtensilsCrossed,
      preview: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
      style: 'Warm, moody, sophisticated',
      colors: 'Dark backgrounds, warm lighting',
      features: ['Menu display', 'Reservation system', 'Featured dishes'],
      hasPortal: false,
      pages: ['Home', 'Menu', 'Reservation'],
      description: 'Sophisticated restaurant site with full menu and reservation booking.',
    },
    {
      id: 'photographer',
      name: 'Photographer',
      icon: Camera,
      preview: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
      style: 'Minimal, artistic, editorial',
      colors: 'Black, white, subtle accents',
      features: ['Portfolio gallery', 'Client portal', 'Proof selection'],
      hasPortal: true,
      pages: ['Home', 'Portfolio', 'Client Portal'],
      description: 'Minimalist photographer portfolio with client portal for proof selection.',
    },
    {
      id: 'realtor',
      name: 'Realtor',
      icon: Home,
      preview: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200&q=80',
      style: 'Luxury, elegant, sophisticated',
      colors: 'Black, gold, minimal accents',
      features: ['Property listings', 'Search & filter', 'Agent contact'],
      hasPortal: false,
      pages: ['Home', 'Listings'],
      description: 'Luxury real estate site with property listings and agent information.',
    },
  ]

  return (
    <main className="min-h-screen bg-dark">
      <Navigation />
      <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4">Website Demos</h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Explore examples of custom websites we've created. Each demo showcases unique styling and features. All sites are fully custom-built to meet specific client needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {demos.map((demo) => {
            const Icon = demo.icon
            return (
              <Link
                key={demo.id}
                href={`/demos/${demo.id}`}
                className="group bg-dark-light rounded-2xl hover:bg-dark-lighter transition-all duration-300 border border-white/10 hover:border-accent/50 overflow-hidden"
              >
                {/* Preview Image */}
                <div className="relative h-64 w-full overflow-hidden">
                  <Image
                    src={demo.preview}
                    alt={`${demo.name} demo preview`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-light via-transparent to-transparent" />
                  <div className="absolute top-4 right-4">
                    {demo.hasPortal && (
                      <span className="inline-block px-3 py-1 bg-accent/90 text-dark text-xs font-semibold rounded-full backdrop-blur-sm">
                        Client Portal
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                      <Icon size={24} className="text-accent" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">{demo.name}</h2>
                  </div>

                  <p className="text-white/80 mb-6">{demo.description}</p>

                  <div className="space-y-3 mb-6">
                    <div>
                      <p className="text-sm text-white/60 mb-1">Style</p>
                      <p className="text-white/90">{demo.style}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60 mb-1">Colors</p>
                      <p className="text-white/90">{demo.colors}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60 mb-2">Pages</p>
                      <div className="flex flex-wrap gap-2">
                        {demo.pages.map((page) => (
                          <span key={page} className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded">
                            {page}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white/60 mb-2">Features</p>
                        <ul className="flex flex-wrap gap-2">
                          {demo.features.map((feature) => (
                            <li key={feature} className="text-xs text-white/70">
                              • {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-accent group-hover:translate-x-1 transition-transform text-xl">
                        →
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="text-accent hover:underline">
            ← Back to Homepage
          </Link>
        </div>
      </div>
      </div>
      <Footer />
    </main>
  )
}

