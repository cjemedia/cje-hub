'use client'

import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Button from '@/components/Button'
import { ArrowRight, Sparkles, Users, Target } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    <main className="min-h-screen bg-primary-white">
      <Navigation />

      {/* SECTION 1: HERO */}
      <section className="min-h-screen flex items-center">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left side (larger - 7 columns) */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7 space-y-8"
            >
              <h1 className="text-h1 font-serif font-bold text-primary-charcoal leading-tight">
                Where Creativity,<br />
                <span className="text-primary-tiffany">Clarity</span>, and<br />
                Connection Meet
              </h1>
              <p className="text-body text-primary-charcoal/80 leading-relaxed">
                Marketing agency and event experiences for purpose-driven brands,
                creators, and entrepreneurs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button href="/services" size="lg" className="btn-primary">
                  Explore Services
                </Button>
                <Button
                  href="/booking"
                  variant="outline"
                  size="lg"
                  className="border-2 border-primary-tiffany text-primary-tiffany hover:bg-primary-tiffany hover:text-primary-white"
                >
                  Book a Call
                </Button>
              </div>
            </motion.div>

            {/* Right side (slimmer - 5 columns) */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5 relative h-[600px] lg:h-[700px] rounded-2xl overflow-hidden"
            >
              <Image
                src="/images/cje1.JPEG"
                alt="Ciara J Evans"
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ABOUT - Tiffany Blue Background */}
      <section className="section-padding bg-[#81D8D0] py-32">
        <div className="section-max-width">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image - Left */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative h-[600px] rounded-2xl overflow-hidden"
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
              className="space-y-6"
            >
              <h2 className="text-h2 font-serif font-semibold text-white">
                Meet Ciara
              </h2>
              <div className="space-y-4 text-body text-white/90 leading-relaxed">
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
              <blockquote className="text-2xl italic text-white font-serif border-l-4 border-white pl-6 py-4">
                "Where creativity, clarity, and connection meet."
              </blockquote>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 3: SERVICES GRID - Charcoal Background */}
      <section className="section-padding bg-[#2D2D2D] py-32">
        <div className="section-max-width">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-h2 font-serif font-semibold text-white mb-4">
              Our Services
            </h2>
            <p className="text-body text-white/80 max-w-2xl mx-auto">
              Comprehensive brand solutions tailored to your vision
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10">
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
                className="bg-[#3D3D3D] p-8 rounded-2xl card-hover border-2 border-transparent hover:border-primary-tiffany"
              >
                <div className="w-16 h-16 bg-primary-tiffany/20 rounded-lg flex items-center justify-center mb-6">
                  <service.icon size={32} className="text-primary-tiffany" />
                </div>
                <h3 className="text-h3 font-serif font-semibold text-white mb-4">
                  {service.title}
                </h3>
                <p className="text-small text-white/80 mb-6 leading-relaxed">
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
      <section className="section-padding bg-black py-32">
        <div className="section-max-width">
          <div className="grid lg:grid-cols-5 gap-16 items-center">
            {/* Text - Left (40%) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 space-y-8"
            >
              <h2 className="text-h2 font-serif font-semibold text-white">
                How We Work
              </h2>
              <div className="space-y-6">
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
                    <h4 className="text-xl font-semibold text-primary-tiffany">
                      {item.title}
                    </h4>
                    <p className="text-body text-white/80">
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
              className="lg:col-span-3 relative h-[600px] rounded-2xl overflow-hidden border-4 border-white"
            >
              <Image
                src="/images/cje5.JPG"
                alt="Ciara presenting"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 5: TESTIMONIAL/STATS - Tiffany Blue Background */}
      <section className="section-padding bg-[#81D8D0] py-32">
        <div className="section-max-width text-center">
          <div className="grid md:grid-cols-3 gap-12">
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
                <div className="text-7xl font-serif font-bold text-white">
                  {stat.number}
                </div>
                <div className="text-2xl text-white font-semibold">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: CALL TO ACTION */}
      <section className="section-padding bg-primary-white">
        <div className="section-max-width">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image - Left (50%) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative w-full aspect-square max-w-md mx-auto lg:mx-0"
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
              className="space-y-8"
            >
              <h2 className="text-h2 font-serif font-semibold text-primary-charcoal">
                Ready to Elevate Your Brand?
              </h2>
              <p className="text-body text-primary-charcoal/80 leading-relaxed">
                Let's discuss how we can bring your vision to life through
                strategic brand management and creative excellence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button href="/booking" size="lg" className="btn-primary">
                  Schedule Your Consultation
                </Button>
                <Button
                  href="/services"
                  variant="outline"
                  size="lg"
                  className="border-2 border-primary-tiffany text-primary-tiffany hover:bg-primary-tiffany hover:text-primary-white"
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
