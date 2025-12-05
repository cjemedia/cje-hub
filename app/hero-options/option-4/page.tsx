'use client'

import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import Button from '@/components/Button'
import Image from 'next/image'
import Link from 'next/link'

export default function Option4() {
  return (
    <main className="min-h-screen bg-primary-white overflow-x-hidden">
      <Navigation />
      
      {/* Option Badge */}
      <div className="fixed top-24 left-4 z-50 bg-black text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
        Option 4: Text Behind
      </div>
      <Link href="/hero-options" className="fixed top-24 right-4 z-50 bg-[#81D8D0] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#6bc4bc] shadow-lg">
        ← All Options
      </Link>

      {/* HERO - TEXT BEHIND IMAGE */}
      <section className="relative min-h-screen w-full bg-[#F5F5F5] overflow-hidden">
        {/* Mobile */}
        <div className="lg:hidden min-h-screen flex flex-col justify-center px-6 py-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <p className="text-sm uppercase tracking-widest text-gray-500">Creative Director & Brand Strategist</p>
            <h1 className="text-4xl font-serif font-bold text-gray-900 leading-tight">
              Where Creativity, <span className="text-[#81D8D0]">Clarity</span>, and Connection Meet
            </h1>
            <div className="relative w-full h-[350px]">
              <Image src="/images/cje14.png" alt="Ciara J Evans" fill className="object-contain" priority />
            </div>
            <p className="text-lg text-gray-600">Brand development, content direction, and elevated event experiences.</p>
            <div className="flex flex-col gap-4">
              <Button href="/booking" size="lg" className="bg-[#81D8D0] text-white h-14 w-full">Book a Call</Button>
              <Button href="/services" variant="outline" size="lg" className="border-2 border-gray-900 h-14 w-full">Explore Services</Button>
            </div>
          </motion.div>
        </div>

        {/* Desktop - BIG TEXT BEHIND */}
        <div className="hidden lg:block min-h-screen relative">
          {/* Layer 1: HUGE Background Text */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden z-0">
            <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 0.06 }} transition={{ duration: 1 }} className="text-[18vw] font-serif font-bold text-gray-900 whitespace-nowrap select-none">
              CREATIVE
            </motion.h1>
          </div>

          {/* Layer 2: Ciara's Image - ON TOP of big text */}
          <div className="absolute inset-0 flex items-end justify-center z-10">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="relative w-[45%] h-[80vh]">
              <Image src="/images/cje14.png" alt="Ciara J Evans" fill className="object-contain object-bottom" priority />
            </motion.div>
          </div>

          {/* Layer 3: Readable Content */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            <div className="max-w-7xl mx-auto px-8 h-full flex flex-col justify-between py-32">
              {/* Top headline */}
              <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl">
                <p className="text-sm uppercase tracking-widest text-gray-500 mb-4">Creative Director & Brand Strategist</p>
                <h2 className="text-4xl xl:text-5xl font-serif font-bold text-gray-900 leading-tight">
                  Where Creativity, <span className="text-[#81D8D0]">Clarity</span>, and Connection Meet
                </h2>
              </motion.div>

              {/* Bottom CTA */}
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-xl pointer-events-auto">
                <p className="text-xl text-gray-600 mb-8">
                  Brand development, content direction, and elevated event experiences for purpose-driven brands.
                </p>
                <div className="flex gap-4">
                  <Button href="/booking" size="lg" className="bg-[#81D8D0] hover:bg-[#6bc4bc] text-white px-8 h-14">Book a Call</Button>
                  <Button href="/services" variant="outline" size="lg" className="border-2 border-gray-900 hover:bg-gray-900 hover:text-white px-8 h-14">Explore Services</Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Black Band */}
        <div className="absolute bottom-0 left-0 right-0 bg-black py-6 z-30">
          <p className="text-white text-center text-lg font-light">CJE Media • Brand Management • Social Media Strategy • Content Creation</p>
        </div>
      </section>

      {/* Info */}
      <section className="bg-purple-50 py-6 px-6">
        <p className="text-center text-gray-700">
          <strong>💡 High-fashion editorial vibe.</strong> Giant "CREATIVE" text behind Ciara creates dramatic depth.
        </p>
      </section>
    </main>
  )
}
