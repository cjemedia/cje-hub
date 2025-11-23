'use client'

import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Button from '@/components/Button'
import { ArrowRight, Sparkles, Users, Target, Play } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <main className="min-h-screen bg-primary-white overflow-x-hidden">
      <Navigation />

      {/* HERO SECTION */}
      <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#b8b8b8] via-[#9a9a9a] to-[#7a7a7a]">
        {/* MOBILE - Using isolation and transform */}
        <div className="sm:hidden w-full min-h-screen relative" style={{ isolation: 'isolate' }}>
          {/* Headline Layer - behind image */}
          <div className="absolute inset-0 flex items-start justify-center pt-40 px-4 py-32" style={{ zIndex: 10 }}>
            <div className="max-w-4xl w-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-6xl font-serif font-bold text-white leading-tight drop-shadow-lg">
                  Where<br />
                  Creativity,<br />
                  <span className="text-primary-tiffany">Clarity</span>, and<br />
                  Connection<br />
                  Meet
                </h1>
              </motion.div>
            </div>
          </div>

          {/* Image Layer - in front of headline but behind buttons */}
          <div className="absolute" style={{ zIndex: 20, pointerEvents: 'none', width: '200%', height: '342%', left: '-60%', top: '-70%' }}>
  <Image
                src="/images/cje14.png"
                alt="Ciara J Evans"
                fill
                className="object-cover object-center"
                priority
                sizes="150vw" 
              />
            </div>
          

          {/* Buttons Layer - in front of image */}
          <div className="absolute inset-0 flex items-start justify-center px-4 py-32 pointer-events-none" style={{ zIndex: 30 }}>
            <div className="max-w-4xl w-full">
              <div className="h-[500px]"></div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-6"
              >
                <p className="text-lg text-white/90 font-normal max-w-2xl drop-shadow-md">
                  Brand development, content direction, and elevated event experiences for <span className="relative inline-block px-1 py-1">
                    <Image 
                      src="/images/hand-drawn-oval.png" 
                      alt="" 
                      fill 
                      className="object-fill scale-150 pointer-events-none"
                      style={{ zIndex: -1 }}
                    />
                    <span className="relative whitespace-nowrap" style={{ zIndex: 10 }}>purpose-driven</span>
                  </span> brands, creators, and entrepreneurs.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-col gap-4 pointer-events-auto"
              >
                <Button 
                  href="/booking" 
                  size="lg" 
                  className="btn-primary text-base px-6 h-14 w-full"
                >
                  Book a Call
                </Button>
                <Button
                  href="/services"
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-primary-charcoal text-base px-6 h-14 w-full"
                >
                  Explore Services
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden sm:block relative w-full min-h-screen">
          {/* Headline Layer - behind image */}
          <div className="absolute inset-0 flex items-start max-w-7xl mx-auto pt-70 px-4 sm:px-6 lg:px-8 py-32 sm:py-40" style={{ zIndex: 10 }}>
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-10"
              >
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight">
                  Where Creativity, <span className="text-primary-tiffany">Clarity</span>, and Connection Meet
                </h1>
                
                <p className="text-xl md:text-2xl text-white/90 font-light max-w-2xl">
                  Brand development, content direction, and elevated event experiences for <span className="relative inline-block px-1 py-1">
                    <Image 
                      src="/images/hand-drawn-oval.png" 
                      alt="" 
                      fill 
                      className="object-fill scale-150 pointer-events-none"
                      style={{ zIndex: -1 }}
                    />
                    <span className="relative whitespace-nowrap" style={{ zIndex: 10 }}>purpose-driven</span>
                  </span> brands, creators, and entrepreneurs.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Image Layer - in front of headline but behind buttons */}
          <div className="absolute inset-0" style={{ zIndex: 20, pointerEvents: 'none' }}>
            <div style={{ transform: 'scale(1.3)', width: '100%', height: '100%', position: 'relative' }}>
              <Image
                src="/images/cje14.png"
                alt="Ciara J Evans"
                fill
                className="object-cover object-[center_35%]"
                priority
              />
            </div>
          </div>

          {/* Buttons Layer - in front of image */}
          <div className="absolute inset-0 flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 sm:py-40 pointer-events-none" style={{ zIndex: 30 }}>
            <div className="max-w-4xl">
              <div className="h-[600px]"></div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-row gap-4 pointer-events-auto"
              >
                <Button 
                  href="/booking" 
                  size="lg" 
                  className="btn-primary text-base px-6 h-14 w-[240px]"
                >
                  Book a Call
                </Button>
                <Button
                  href="/services"
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-primary-charcoal text-base px-6 h-14 w-[240px]"
                >
                  Explore Services
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          style={{ zIndex: 40 }}
        >
          <div className="flex flex-col items-center gap-2 text-white/60">
            <span className="text-sm">Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="rotate-90" size={20} />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ALL OTHER SECTIONS EXACTLY THE SAME */}
      <section className="section-padding bg-primary-white py-16 sm:py-24 lg:py-32">
        <div className="section-max-width">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative h-[500px] lg:h-[700px] rounded-2xl overflow-hidden">
              <Image src="/images/cje11.JPG" alt="Ciara J Evans" fill className="object-cover" />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="space-y-6">
              <div className="inline-block px-4 py-2 bg-primary-tiffany/10 rounded-full"><span className="text-primary-tiffany font-semibold text-sm">About CJE Media</span></div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-primary-charcoal">Meet Ciara</h2>
              <div className="space-y-4 text-base sm:text-lg text-primary-charcoal/80 leading-relaxed">
                <p>Ciara J Evans is a dynamic creative director and entrepreneur who has built CJE Media into a full-service marketing agency and CJE Experiences into a transformative event company.</p>
                <p>With a passion for purpose-driven storytelling, Ciara helps content creators, celebrities, attorneys, and entrepreneurs build brands that resonate. Her approach blends strategic thinking with creative excellence, ensuring every project aligns with your vision and values.</p>
                <p>Beyond strategy, Ciara is an accomplished public speaker and MC, bringing energy and authenticity to every stage she graces. Her work is for the culture—authentic, impactful, and beautifully executed.</p>
              </div>
              <blockquote className="text-2xl sm:text-3xl italic text-primary-charcoal font-serif border-l-4 border-primary-tiffany pl-6 py-4 mt-8">"Where creativity, clarity, and connection meet."</blockquote>
              <Button href="/booking" className="btn-primary h-14 w-full sm:w-[240px] inline-flex items-center justify-center"><span>Work With Ciara</span><ArrowRight className="ml-2" size={18} /></Button>
            </motion.div>
          </div>
        </div>
      </section>
      <section className="section-padding bg-[#81D8D0] py-16 sm:py-24 lg:py-32">
        <div className="section-max-width">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-white/20 rounded-full mb-4"><span className="text-primary-charcoal font-semibold text-sm">What We Offer</span></div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-primary-charcoal mb-4">Our Services</h2>
            <p className="text-lg text-primary-charcoal/80 max-w-2xl mx-auto">Comprehensive brand solutions tailored to your vision</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Sparkles, title: 'Brand Management', description: 'Full-service management to oversee your brand\'s growth, voice, and visibility. We handle strategy, content direction, partnerships, and performance tracking.' },
              { icon: Users, title: 'Social Media Strategy', description: 'We develop your campaign\'s creative vision, storyline, and rollout strategy. Perfect for launches, announcements, or brand moments.' },
              { icon: Target, title: 'Content Creation & Direction', description: 'We bring your campaign to life from concept to completion, including hiring and managing videographers, editors, and designers.' },
            ].map((service, index) => (
              <motion.div key={service.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="group bg-white p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary-charcoal">
                <div className="w-16 h-16 bg-primary-tiffany/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-tiffany/30 transition-colors"><service.icon size={32} className="text-primary-tiffany" /></div>
                <h3 className="text-2xl font-serif font-bold text-primary-charcoal mb-4">{service.title}</h3>
                <p className="text-primary-charcoal/80 leading-relaxed mb-6">{service.description}</p>
                <a href="/services" className="text-primary-tiffany font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all"><span>Learn More</span><ArrowRight size={18} /></a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="section-padding bg-black py-16 sm:py-24 lg:py-32">
        <div className="section-max-width">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-8">
              <div className="inline-block px-4 py-2 bg-primary-tiffany/10 rounded-full"><span className="text-primary-tiffany font-semibold text-sm">Our Process</span></div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white">How We Work</h2>
              <div className="space-y-8">
                {[
                  { number: '01', title: 'Strategic Discovery', description: 'We dive deep into your brand, audience, and goals to create a tailored strategy.' },
                  { number: '02', title: 'Creative Execution', description: 'From concept to completion, we bring your vision to life with precision and style.' },
                  { number: '03', title: 'Ongoing Partnership', description: 'We\'re with you for the long haul, ensuring consistent growth and brand evolution.' },
                ].map((item, index) => (
                  <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.15 }} className="flex gap-6">
                    <div className="text-5xl font-serif font-bold text-primary-tiffany/20">{item.number}</div>
                    <div className="flex-1">
                      <h4 className="text-xl sm:text-2xl font-semibold text-primary-tiffany mb-2">{item.title}</h4>
                      <p className="text-white/80 leading-relaxed">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Button href="/booking" className="btn-primary h-14 w-full sm:w-[240px] inline-flex items-center justify-center mt-8"><span>Start Your Project</span><ArrowRight className="ml-2" size={18} /></Button>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative h-[600px] rounded-2xl overflow-hidden border-4 border-white">
              <Image src="/images/cje4.JPG" alt="Ciara presenting" fill className="object-cover" />
            </motion.div>
          </div>
        </div>
      </section>
      <section className="section-padding bg-[#81D8D0] py-16 sm:py-24">
        <div className="section-max-width">
          <div className="grid sm:grid-cols-3 gap-12">
            {[
              { number: '50+', label: 'Brands Elevated' },
              { number: '100+', label: 'Happy Clients' },
              { number: '25+', label: 'Events Hosted' },
            ].map((stat, index) => (
              <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="text-center">
                <div className="text-6xl sm:text-7xl lg:text-8xl font-serif font-bold text-white mb-4">{stat.number}</div>
                <div className="text-xl sm:text-2xl text-white font-semibold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="section-padding bg-primary-white py-16 sm:py-24 lg:py-32">
        <div className="section-max-width">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative w-full aspect-square max-w-lg mx-auto lg:ml-auto order-2 lg:order-1">
              <div className="absolute inset-0 rounded-full overflow-hidden shadow-2xl"><Image src="/images/cje6.JPG" alt="Ciara professional" fill className="object-cover" /></div>
              <div className="absolute -z-10 inset-0 bg-primary-tiffany/20 rounded-full scale-105 blur-3xl" />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-8 order-1 lg:order-2 text-center lg:text-left">
              <div className="inline-block px-4 py-2 bg-primary-tiffany/10 rounded-full"><span className="text-primary-tiffany font-semibold text-sm">Let's Connect</span></div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-primary-charcoal">Ready to Elevate Your Brand?</h2>
              <p className="text-lg sm:text-xl text-primary-charcoal/80 leading-relaxed max-w-xl mx-auto lg:mx-0">Let's discuss how we can bring your vision to life through strategic brand management and creative excellence.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button href="/booking" size="lg" className="btn-primary text-base px-6 h-14 w-full sm:w-[240px]">Schedule Consultation</Button>
                <Button href="/services" variant="outline" size="lg" className="border-2 border-primary-tiffany text-primary-tiffany hover:bg-primary-tiffany hover:text-white text-base px-6 h-14 w-full sm:w-[240px]">View Services</Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
