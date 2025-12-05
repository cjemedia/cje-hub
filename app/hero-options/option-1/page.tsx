'use client'

import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import Button from '@/components/Button'
import Image from 'next/image'
import Link from 'next/link'

export default function Option1() {
  return (
    <main className="min-h-screen bg-primary-white overflow-x-hidden">
      <Navigation />
      
      {/* Option Badge */}
      <div className="fixed top-24 left-4 z-50 bg-black text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
        Option 1: PNG Cutout
      </div>
      <Link href="/hero-options" className="fixed top-24 right-4 z-50 bg-[#81D8D0] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#6bc4bc] shadow-lg">
        ← All Options
      </Link>

      {/* HERO */}
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

        {/* Desktop */}
        <div className="hidden lg:flex items-center min-h-screen max-w-7xl mx-auto px-8">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="w-1/2 space-y-8 py-32 relative z-10">
            <p className="text-sm uppercase tracking-widest text-gray-500">Creative Director & Brand Strategist</p>
            <h1 className="text-5xl xl:text-6xl font-serif font-bold text-gray-900 leading-tight">
              Where Creativity, <span className="text-[#81D8D0]">Clarity</span>, and Connection Meet
            </h1>
            <p className="text-xl text-gray-600 max-w-xl">
              Brand development, content direction, and elevated event experiences for purpose-driven brands, creators, and entrepreneurs.
            </p>
            <div className="flex gap-4 pt-4">
              <Button href="/booking" size="lg" className="bg-[#81D8D0] hover:bg-[#6bc4bc] text-white px-8 h-14">Book a Call</Button>
              <Button href="/services" variant="outline" size="lg" className="border-2 border-gray-900 hover:bg-gray-900 hover:text-white px-8 h-14">Explore Services</Button>
            </div>
          </motion.div>

          {/* Image overlapping */}
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="absolute right-0 bottom-0 w-[55%] h-[85vh] z-20">
            <Image src="/images/cje14.png" alt="Ciara J Evans" fill className="object-contain object-bottom" priority />
          </motion.div>
        </div>

        {/* Black Band */}
        <div className="absolute bottom-0 left-0 right-0 bg-black py-6 z-30">
          <p className="text-white text-center text-lg font-light">CJE Media • Brand Management • Social Media Strategy • Content Creation</p>
        </div>
      </section>

      {/* Info */}
      <section className="bg-amber-50 py-6 px-6">
        <p className="text-center text-gray-700">
          <strong>💡 This works best with a transparent PNG.</strong> Use <a href="https://remove.bg" target="_blank" className="text-[#81D8D0] underline">remove.bg</a> to remove the background.
        </p>
      </section>
    </main>
  )
}
