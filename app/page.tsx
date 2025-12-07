'use client'

import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Button from '@/components/Button'
import { ArrowRight, Sparkles, Users, Target, Play } from 'lucide-react'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="min-h-screen bg-dark overflow-x-hidden">
      <Navigation />

      {/* HERO SECTION - Option 4 Style */}
      <section className="relative min-h-[85vh] lg:min-h-screen bg-dark overflow-hidden">
        {/* Giant background text - only show on lg and up */}
        <div className="absolute inset-0 hidden lg:flex items-start justify-center pt-8 md:pt-16 pointer-events-none" style={{ zIndex: 1 }}>
          <h1 className="text-[25vw] lg:text-[18vw] font-bold text-white/[0.06] select-none tracking-tight whitespace-nowrap">
            PURPOSE
          </h1>
        </div>

        {/* Mobile/Tablet layout */}
        <div className="lg:hidden absolute inset-0 flex flex-col justify-end" style={{ zIndex: 2 }}>
          {/* PURPOSE - behind head area */}
          <div className="absolute top-52 left-0 right-0 flex justify-center pointer-events-none">
            <h1 className="text-[22vw] font-bold text-white/[0.06] select-none tracking-tight">
              PURPOSE
            </h1>
          </div>
          
          {/* Image + Text container - sits at bottom */}
          <div className="relative">
            {/* Image */}
            <img 
              src="/images/cje19.png" 
              alt="Ciara J. Evans" 
              className="w-full h-auto object-contain scale-[1.36] brightness-[0.75]" 
            />
{/* Bottom gradient */}
<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            {/* Text overlay - positioned at bottom of image */}
            <div className="absolute bottom-4 left-0 right-0 px-6 space-y-1">
              <p className="text-accent uppercase tracking-[0.2em] text-xs">Speaker • Host • Creator</p>
              <h2 className="text-3xl text-white font-light">Ciara J. Evans</h2>
              <div className="pt-2">
                <Button href="/booking" size="lg" className="btn-primary">
                  Book Ciara
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="relative min-h-screen hidden lg:flex items-end" style={{ zIndex: 2 }}>
          <div className="w-full max-w-[1600px] mx-auto px-8 md:px-16 pb-24">
            <div className="grid grid-cols-2 gap-8 items-end">
              {/* Text content - bottom left */}
              <div className="relative pr-16 z-20">
                <div className="space-y-4">
                  <p className="text-accent uppercase tracking-[0.3em] text-sm mb-2">Speaker • Host • Creator</p>
                  <h2 className="text-6xl lg:text-7xl text-white font-light mb-4">Ciara J. Evans</h2>
                  <p className="text-white/60 max-w-md text-lg">Inspiring purpose-driven action through storytelling, speaking, and strategic visibility.</p>
                  <div className="mt-6">
                    <Button href="/booking" size="lg" className="btn-primary">
                      Book Ciara
                    </Button>
                  </div>
                </div>
              </div>

              {/* Ciara's image - right side */}
              <div className="absolute right-0 top-0 bottom-0 flex items-end justify-end">
                <img 
                  src="/images/cje19.png" 
                  alt="Ciara J. Evans" 
                  className="h-[90vh] w-auto object-contain object-bottom -mr-8 xl:-mr-16 brightness-[0.75]" 
                />
               {/* Bottom gradient */}
<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ALL OTHER SECTIONS */}
      <section className="section-padding bg-dark-light py-16 sm:py-24 lg:py-32">
        <div className="section-max-width">
          <div className="space-y-8 lg:space-y-12">
            {/* Heading above photo */}
            <div className="text-center lg:text-left">
              <div className="inline-block px-4 py-2 bg-accent/10 rounded-full mb-4"><span className="text-accent font-semibold text-sm">About CJE Media</span></div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">Meet Ciara</h2>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                viewport={{ once: true, margin: "-100px" }} 
                transition={{ duration: 0.6 }}
                className="relative h-[500px] lg:h-[700px] rounded-2xl overflow-hidden"
              >
                <Image src="/images/cje2.JPEG" alt="Ciara J Evans" fill className="object-cover" />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 50 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                viewport={{ once: true, margin: "-100px" }} 
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="space-y-4 text-base sm:text-lg text-white/80 leading-relaxed">
                <p>Ciara J Evans is a dynamic creative director and entrepreneur who has built CJE Media into a full-service marketing agency and CJE Experiences into a transformative event company.</p>
                <p>With a passion for purpose-driven storytelling, Ciara helps content creators, celebrities, attorneys, and entrepreneurs build brands that resonate. Her approach blends strategic thinking with creative excellence, ensuring every project aligns with your vision and values.</p>
                <p>Beyond strategy, Ciara is an accomplished public speaker and MC, bringing energy and authenticity to every stage she graces. Her work is for the culture—authentic, impactful, and beautifully executed.</p>
              </div>
              <blockquote className="text-2xl sm:text-3xl italic text-white border-l-4 border-accent pl-6 py-4 mt-8">"Inspiring purpose-driven action through storytelling, speaking, and strategic visibility."</blockquote>
              <Button href="/booking" className="btn-primary h-14 w-full sm:w-[240px] inline-flex items-center justify-center"><span>Work With Ciara</span><ArrowRight className="ml-2" size={18} /></Button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      <section className="section-padding bg-dark-light py-16 sm:py-24 lg:py-32">
        <div className="section-max-width">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-100px" }} 
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-2 bg-accent/20 rounded-full mb-4"><span className="text-accent font-semibold text-sm">What We Offer</span></div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">Our Services</h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">Comprehensive brand solutions tailored to your vision</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Sparkles, title: 'Brand Management', description: 'Full-service management to oversee your brand\'s growth, voice, and visibility. We handle strategy, content direction, partnerships, and performance tracking.' },
              { icon: Users, title: 'Social Media Strategy', description: 'We develop your campaign\'s creative vision, storyline, and rollout strategy. Perfect for launches, announcements, or brand moments.' },
              { icon: Target, title: 'Content Creation & Direction', description: 'We bring your campaign to life from concept to completion, including hiring and managing videographers, editors, and designers.' },
            ].map((service, index) => (
              <motion.div 
                key={service.title}
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true, margin: "-50px" }} 
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-dark p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-white/20"
              >
                <div className="w-16 h-16 bg-accent/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/30 transition-colors"><service.icon size={32} className="text-accent" /></div>
                <h3 className="text-2xl font-bold text-white mb-4">{service.title}</h3>
                <p className="text-white/80 leading-relaxed mb-6">{service.description}</p>
                <a href="/services" className="text-accent font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all"><span>Learn More</span><ArrowRight size={18} /></a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="section-padding bg-dark py-16 sm:py-24 lg:py-32">
        <div className="section-max-width">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true, margin: "-100px" }} 
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-block px-4 py-2 bg-accent/10 rounded-full"><span className="text-accent font-semibold text-sm">Our Process</span></div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">How We Work</h2>
              <div className="space-y-8">
                {[
                  { number: '01', title: 'Strategic Discovery', description: 'We dive deep into your brand, audience, and goals to create a tailored strategy.' },
                  { number: '02', title: 'Creative Execution', description: 'From concept to completion, we bring your vision to life with precision and style.' },
                  { number: '03', title: 'Ongoing Partnership', description: 'We\'re with you for the long haul, ensuring consistent growth and brand evolution.' },
                ].map((item, index) => (
                  <motion.div 
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true, margin: "-50px" }} 
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex gap-6"
                  >
                    <div className="text-5xl font-bold text-accent/20">{item.number}</div>
                    <div className="flex-1">
                      <h4 className="text-xl sm:text-2xl font-semibold text-accent mb-2">{item.title}</h4>
                      <p className="text-white/80 leading-relaxed">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Button href="/booking" className="btn-primary h-14 w-full sm:w-[240px] inline-flex items-center justify-center mt-8"><span>Start Your Project</span><ArrowRight className="ml-2" size={18} /></Button>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true, margin: "-100px" }} 
              transition={{ duration: 0.6 }}
              className="relative h-[600px] rounded-2xl overflow-hidden border-4 border-white"
            >
              <Image src="/images/cje4.JPG" alt="Ciara presenting" fill className="object-cover" />
            </motion.div>
          </div>
        </div>
      </section>
      <section className="section-padding bg-dark-light py-16 sm:py-24">
        <div className="section-max-width">
          <div className="grid sm:grid-cols-3 gap-12">
            {[
              { number: '50+', label: 'Brands Elevated' },
              { number: '100+', label: 'Happy Clients' },
              { number: '25+', label: 'Events Hosted' },
            ].map((stat, index) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true, margin: "-50px" }} 
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white mb-4">{stat.number}</div>
                <div className="text-xl sm:text-2xl text-white font-semibold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="section-padding bg-dark-light py-16 sm:py-24 lg:py-32">
        <div className="section-max-width">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              whileInView={{ opacity: 1, scale: 1 }} 
              viewport={{ once: true, margin: "-100px" }} 
              transition={{ duration: 0.6 }}
              className="relative w-full aspect-square max-w-lg mx-auto lg:ml-auto order-2 lg:order-1"
            >
              <div className="absolute inset-0 rounded-full overflow-hidden shadow-2xl"><Image src="/images/cje6.JPG" alt="Ciara professional" fill className="object-cover" /></div>
              <div className="absolute -z-10 inset-0 bg-accent/20 rounded-full scale-105 blur-3xl" />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true, margin: "-100px" }} 
              transition={{ duration: 0.6 }}
              className="space-y-8 order-1 lg:order-2 text-center lg:text-left"
            >
              <div className="inline-block px-4 py-2 bg-accent/10 rounded-full"><span className="text-accent font-semibold text-sm">Let's Connect</span></div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">Ready to Elevate Your Brand?</h2>
              <p className="text-lg sm:text-xl text-white/80 leading-relaxed max-w-xl mx-auto lg:mx-0">Let's discuss how we can bring your vision to life through strategic brand management and creative excellence.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button href="/booking" size="lg" className="btn-primary text-base px-6 h-14 w-full sm:w-[240px]">Schedule Consultation</Button>
                <Button href="/services" variant="outline" size="lg" className="border-2 border-accent text-accent hover:bg-accent hover:text-dark text-base px-6 h-14 w-full sm:w-[240px]">View Services</Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}