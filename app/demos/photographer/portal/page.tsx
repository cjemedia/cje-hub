'use client'

import Link from 'next/link'
import { Check, Download, LogOut, Heart } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

export default function PhotographerPortal() {
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set())

  const sessionImages = [
    { id: 1, url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80' },
    { id: 2, url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80' },
    { id: 3, url: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&q=80' },
    { id: 4, url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80' },
    { id: 5, url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80' },
    { id: 6, url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80' },
    { id: 7, url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80' },
    { id: 8, url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80' },
    { id: 9, url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80' },
    { id: 10, url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&q=80' },
    { id: 11, url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80' },
    { id: 12, url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80' },
  ]

  const toggleSelection = (id: number) => {
    const newSelected = new Set(selectedImages)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedImages(newSelected)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Portal Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/demos/photographer" className="text-xl font-light tracking-wider text-black">
                ALEX MARTIN
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-sm text-gray-600 font-light">Client Portal</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 font-light">Welcome, Jennifer</span>
              <Link href="/demos" className="text-xs text-gray-400 hover:text-gray-600">
                ← Demos
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Portal Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg p-8 mb-8 border border-gray-200">
          <h1 className="text-3xl font-light text-black mb-2 tracking-tight">Welcome back, Jennifer</h1>
          <p className="text-gray-600 font-light">Your Session: <span className="font-medium">Wedding Photography - October 15, 2024</span></p>
        </div>

        {/* Package Info */}
        <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-black mb-2">Your Package</h2>
              <p className="text-gray-600 font-light">Premium Wedding Package - Includes 50 edited images</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 font-light">Selected</p>
              <p className="text-2xl font-light text-black">{selectedImages.size} / 50</p>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-light text-black tracking-tight">Your Proofs</h2>
            <p className="text-sm text-gray-600 font-light">
              Click images to select your favorites
            </p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sessionImages.map((image) => {
              const isSelected = selectedImages.has(image.id)
              return (
                <div
                  key={image.id}
                  className={`relative aspect-square cursor-pointer group overflow-hidden rounded-lg border-2 transition-all ${
                    isSelected ? 'border-black' : 'border-gray-200'
                  }`}
                  onClick={() => toggleSelection(image.id)}
                >
                  <Image
                    src={image.url}
                    alt={`Proof ${image.id}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                        <Check size={24} className="text-white" />
                      </div>
                    </div>
                  )}
                  {!isSelected && (
                    <div className="absolute top-2 right-2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart size={18} className="text-gray-600" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-gray-600 font-light">
                You've selected <span className="font-medium text-black">{selectedImages.size}</span> images
              </p>
              <p className="text-sm text-gray-500 font-light mt-1">
                Select up to 50 images to download
              </p>
            </div>
            <div className="flex gap-4">
              <button
                className="bg-gray-900 text-white px-6 py-3 rounded-lg font-light tracking-wide hover:bg-gray-800 transition-colors"
                disabled={selectedImages.size === 0}
              >
                Clear Selection
              </button>
              <button
                className="bg-black text-white px-8 py-3 rounded-lg font-light tracking-wide hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedImages.size === 0}
              >
                <Download size={18} />
                Download Selected ({selectedImages.size})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm font-light">
          <p>© 2024 Alex Martin Photography. Demo Site.</p>
        </div>
      </footer>
    </main>
  )
}

