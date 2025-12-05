'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'

export default function HeroOptionsPage() {
  const options = [
    { number: 1, title: 'PNG Cutout', description: 'Transparent image overlaps text naturally', note: 'Requires bg removal on photo' },
    { number: 2, title: 'CSS Grid Overlap', description: 'Same grid cell - z-index works!', note: '⭐ Recommended' },
    { number: 3, title: 'Offset/Overlap', description: 'Image bleeds into text with negative margins', note: 'Editorial magazine feel' },
    { number: 4, title: 'Text Behind Image', description: 'Giant faded text background, image on top', note: 'High-fashion vibe' },
    { number: 5, title: 'Split Screen', description: 'Clean 50/50 layout with color accents', note: 'Most reliable' },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">Hero Options</h1>
            <p className="text-xl text-gray-600">Click each to preview full page. Pick your favorite!</p>
          </motion.div>

          <div className="space-y-4">
            {options.map((option, index) => (
              <motion.div key={option.number} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Link href={`/hero-options/option-${option.number}`}>
                  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all border-2 border-transparent hover:border-[#81D8D0] cursor-pointer flex items-center gap-6">
                    <div className="w-14 h-14 bg-[#81D8D0] rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-white">{option.number}</span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900">{option.title}</h2>
                      <p className="text-gray-600">{option.description}</p>
                      <p className="text-sm text-[#81D8D0] font-medium mt-1">{option.note}</p>
                    </div>
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="text-[#81D8D0] font-semibold hover:underline">← Back to Current Homepage</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
