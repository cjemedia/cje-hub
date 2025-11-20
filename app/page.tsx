'use client'

import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Button from '@/components/Button'
import { ArrowRight, Sparkles, Users, Target } from 'lucide-react'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bgPosition, setBgPosition] = useState('center center')

  useEffect(() => {
    const updateBgPosition = () => {
      if (window.innerWidth < 640) {
        setBgPosition('center 70%')
      } else {
        setBgPosition('center 45%')
      }
    }
    
    updateBgPosition()
    window.addEventListener('resize', updateBgPosition)
    return () => window.removeEventListener('resize', updateBgPosition)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      alert('Thank you for your message! We\'ll get back to you soon.')
      setFormData({ name: '', email: '', message: '' })
    } catch (error) {
      alert('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-primary-white overflow-x-hidden">
      <Navigation />

      {/* SECTION 1: HERO */}
      <section
        className="relative min-h-screen w-screen overflow-hidden bg-cover bg-center bg-no-repeat flex items-end sm:items-center"
        style={{ 
          backgroundImage: "url('/images/cje14.png')", 
          backgroundPosition: bgPosition
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/20 to-white/40 sm:from-white/50 sm:via-white/40 sm:to-white/50" />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-40 sm:pt-32 sm:pb-24 md:pt-40 md:pb-32 flex flex-col items-start sm:items-center text-left sm:text-center space-y-8 sm:space-y-8">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-h1 font-serif font-bold text-primary-charcoal leading-tight"
          >
            Where Creativity,<br />
            <span className="text-primary-tiffany">Clarity</span>, and<br />
            Connection Meet
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-md sm:max-w-none sm:w-auto mt-8"
          >
            <Button href="/services" size="lg" className="btn-primary w-full sm:w-auto sm:min-w-[200px] h-[52px] sm:h-[56px] text-sm sm:text-base">
              Explore Services
            </Button>
            <Button
              href="/booking"
              variant="outline"
              size="lg"
              className="border-2 border-primary-tiffany text-primary-tiffany hover:bg-primary-tiffany hover:text-primary-white w-full sm:w-auto sm:min-w-[200px] h-[52px] sm:h-[56px] text-sm sm:text-base"
            >
              Book a Call
            </Button>
          </motion.div>
        </div>

        {/* Black band overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
          <div className="bg-black/95 py-8 sm:py-12 md:py-16 lg:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-serif font-semibold text-white leading-tight px-2">
                Brand development, content direction, and elevated event experiences for for purpose-driven brands, creators, and entrepreneurs.
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ABOUT - Tiffany Blue Background */}
      <section className="section-padding bg-[#81D8D0] py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="section-max-width">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Image - Left */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative h-[400px] sm:h-[500px] lg:h-[600px] rounded-xl sm:rounded-2xl overflow-hidden order-2 lg:order-1"
            >
              <Image
                src="/images/cje11.JPG"
                alt="Ciara J Evans"
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Text - Right */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4 sm:space-y-6 order-1 lg:order-2"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-h2 font-serif font-semibold text-white">
                Meet Ciara
              </h2>
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base lg:text-body text-white/90 leading-relaxed">
                <p>
                  At 26, Ciara J Evans is a dynamic creative director and
                  entrepreneur who has built CJE Media into a full-service
                  marketing agency and CJE Experiences into a transformative
                  event company.
                </p>
                <p>
                  With a passion for purpose-driven storytelling, Ciara helps
                  content creators, celebrities, attorneys, and entrepreneurs
                  build brands that resonate. Her approach blends strategic
                  thinking with creative excellence, ensuring every project
                  aligns with your vision and values.
                </p>
                <p>
                  Beyond strategy, Ciara is an accomplished public speaker and
                  MC, bringing energy and authenticity to every stage she
                  graces. Her work is for the culture—authentic, impactful, and
                  beautifully executed.
                </p>
              </div>
              <blockquote className="text-lg sm:text-xl lg:text-2xl italic text-white font-serif border-l-4 border-white pl-4 sm:pl-6 py-3 sm:py-4">
                "Where creativity, clarity, and connection meet."
              </blockquote>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 3: SERVICES GRID - Charcoal Background */}
      <section className="section-padding bg-[#2D2D2D] py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="section-max-width">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 lg:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-h2 font-serif font-semibold text-white mb-3 sm:mb-4">
              Our Services
            </h2>
            <p className="text-sm sm:text-base lg:text-body text-white/80 max-w-2xl mx-auto px-4">
              Comprehensive brand solutions tailored to your vision
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {[
              {
                icon: Sparkles,
                title: 'Brand Management',
                description:
                  'Full-service management to oversee your brand\'s growth, voice, and visibility. We handle strategy, content direction, partnerships, and performance tracking.',
              },
              {
                icon: Users,
                title: 'Social Media Strategy',
                description:
                  'We develop your campaign\'s creative vision, storyline, and rollout strategy. Perfect for launches, announcements, or brand moments.',
              },
              {
                icon: Target,
                title: 'Content Creation & Direction',
                description:
                  'We bring your campaign to life from concept to completion, including hiring and managing videographers, editors, and designers.',
              },
            ].map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#3D3D3D] p-6 sm:p-8 rounded-xl sm:rounded-2xl card-hover border-2 border-transparent hover:border-primary-tiffany"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-tiffany/20 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                  <service.icon size={24} className="sm:w-8 sm:h-8 text-primary-tiffany" />
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-h3 font-serif font-semibold text-white mb-3 sm:mb-4">
                  {service.title}
                </h3>
                <p className="text-sm sm:text-base lg:text-small text-white/80 mb-4 sm:mb-6 leading-relaxed">
                  {service.description}
                </p>
                <a
                  href="/services"
                  className="text-primary-tiffany font-semibold inline-flex items-center space-x-2 hover:space-x-3 transition-all"
                >
                  <span>Learn More</span>
                  <ArrowRight size={18} />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: PROCESS/PHILOSOPHY - Black Background */}
      <section className="section-padding bg-black py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="section-max-width">
          <div className="grid lg:grid-cols-5 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Text - Left (40%) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 space-y-6 sm:space-y-8 order-2 lg:order-1"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-h2 font-serif font-semibold text-white">
                How We Work
              </h2>
              <div className="space-y-4 sm:space-y-6">
                {[
                  {
                    title: 'Strategic Discovery',
                    description:
                      'We dive deep into your brand, audience, and goals to create a tailored strategy.',
                  },
                  {
                    title: 'Creative Execution',
                    description:
                      'From concept to completion, we bring your vision to life with precision and style.',
                  },
                  {
                    title: 'Ongoing Partnership',
                    description:
                      'We\'re with you for the long haul, ensuring consistent growth and brand evolution.',
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-2"
                  >
                    <h4 className="text-lg sm:text-xl font-semibold text-primary-tiffany">
                      {item.title}
                    </h4>
                    <p className="text-sm sm:text-base lg:text-body text-white/80">
                      {item.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Image - Right (55%) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3 relative h-[300px] sm:h-[400px] lg:h-[600px] rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-4 border-white order-1 lg:order-2"
            >
              <Image
                src="/images/cje4.JPG"
                alt="Ciara presenting"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 5: TESTIMONIAL/STATS - Tiffany Blue Background */}
      <section className="section-padding bg-[#81D8D0] py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="section-max-width text-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
            {[
              { number: '50+', label: 'Brands Elevated' },
              { number: '100+', label: 'Happy Clients' },
              { number: '25+', label: 'Events Hosted' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold text-white">
                  {stat.number}
                </div>
                <div className="text-lg sm:text-xl lg:text-2xl text-white font-semibold">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: CALL TO ACTION */}
      <section className="section-padding bg-primary-white py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="section-max-width">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Image - Left (50%) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative w-full aspect-square max-w-sm sm:max-w-md lg:max-w-lg mx-auto lg:ml-auto order-2 lg:order-1"
            >
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <Image
                  src="/images/cje6.JPG"
                  alt="Ciara professional"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>

            {/* CTA Box - Right (50%) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6 sm:space-y-8 order-1 lg:order-2 text-center lg:text-left"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-h2 font-serif font-semibold text-primary-charcoal">
                Ready to Elevate?
              </h2>
              <p className="text-sm sm:text-base lg:text-body text-primary-charcoal/80 leading-relaxed">
                Let's discuss how we can bring your vision to life through
                strategic brand management and creative excellence.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Button href="/booking" size="lg" className="btn-primary w-full sm:w-auto sm:min-w-[220px] h-[52px] sm:h-[56px] text-sm sm:text-base">
                  Schedule Consultation
                </Button>
                <Button
                  href="/services"
                  variant="outline"
                  size="lg"
                  className="border-2 border-primary-tiffany text-primary-tiffany hover:bg-primary-tiffany hover:text-primary-white w-full sm:w-auto sm:min-w-[220px] h-[52px] sm:h-[56px] text-sm sm:text-base"
                >
                  View Services
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
