'use client'

import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import Button from '@/components/Button'
import Image from 'next/image'
import Link from 'next/link'

export default function Option5() {
  return (
    <main className="min-h-screen bg-primary-white overflow-x-hidden">
      <Navigation />
      
      {/* Option Badge */}
      <div className="fixed top-24 left-4 z-50 bg-black text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
        Option 5: Split Screen
      </div>
      <Link href="/hero-options" className="fixed top-24 right-4 z-50 bg-[#81D8D0] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#6bc4bc] shadow-lg">
        ← All Options
      </Link>

      {/* HERO - SPLIT SCREEN */}
      <section className="relative min-h-screen w-full overflow-hidden">
        {/* Mobile */}
        <div className="lg:hidden min-h-screen bg-[#F5F5F5]">
          <div className="px-6 pt-32 pb-8">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <p className="text-sm uppercase tracking-widest text-gray-500">Creative Director & Brand Strategist</p>
              <h1 className="text-4xl font-serif font-bold text-gray-900 leading-tight">
                Where Creativity, <span className="text-[#81D8D0]">Clarity</span>, and Connection Meet
              </h1>
              <p className="text-lg text-gray-600">Brand development, content direction, and elevated event experiences.</p>
              <div className="flex flex-col gap-4 pt-4">
                <Button href="/booking" size="lg" className="bg-[#81D8D0] text-white h-14 w-full">Book a Call</Button>
                <Button href="/services" variant="outline" size="lg" className="border-2 border-gray-900 h-14 w-full">Explore Services</Button>
              </div>
            </motion.div>
          </div>
          <div className="relative h-[450px] bg-[#81D8D0]/20">
            <Image src="/images/cje14.png" alt="Ciara J Evans" fill className="object-contain object-bottom" priority />
          </div>
        </div>

        {/* Desktop - SPLIT SCREEN */}
        <div className="hidden lg:flex min-h-screen">
          {/* Left - Content */}
          <div className="w-1/2 bg-[#F5F5F5] flex items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="max-w-xl mx-auto px-12 xl:px-16 space-y-8">
              <p className="text-sm uppercase tracking-widest text-gray-500">Creative Director & Brand Strategist</p>
              <h1 className="text-5xl xl:text-6xl font-serif font-bold text-gray-900 leading-tight">
                Where Creativity, <span className="text-[#81D8D0]">Clarity</span>, and Connection Meet
              </h1>
              <p className="text-xl text-gray-600">
                Brand development, content direction, and elevated event experiences for purpose-driven brands, creators, and entrepreneurs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button href="/booking" size="lg" className="bg-[#81D8D0] hover:bg-[#6bc4bc] text-white px-8 h-14">Book a Call</Button>
                <Button href="/services" variant="outline" size="lg" className="border-2 border-gray-900 hover:bg-gray-900 hover:text-white px-8 h-14">Explore Services</Button>
              </div>
            </motion.div>
          </div>

          {/* Right - Image with color accents */}
          <div className="w-1/2 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#81D8D0]/30 to-[#81D8D0]/10" />
            <div className="absolute top-20 right-20 w-64 h-64 bg-[#81D8D0]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-40 left-10 w-48 h-48 bg-gray-900/5 rounded-full blur-2xl" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="absolute inset-0">
              <Image src="/images/cje14.png" alt="Ciara J Evans" fill className="object-contain object-center" priority />
            </motion.div>
          </div>
        </div>

        {/* Black Band */}
        <div className="absolute bottom-0 left-0 right-0 bg-black py-6 z-30">
          <p className="text-white text-center text-lg font-light">CJE Media • Brand Management • Social Media Strategy • Content Creation</p>
        </div>
      </section>

      {/* Info */}
      <section className="bg-emerald-50 py-6 px-6">
        <p className="text-center text-gray-700">
          <strong>✅ Most reliable option.</strong> Clean 50/50 split with decorative accents - works perfectly every time.
        </p>
      </section>
    </main>
  )
}
