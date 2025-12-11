'use client'

import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Button from '@/components/Button'
import { ArrowRight, Globe, Lock, Package, Settings, Sparkles, Target } from 'lucide-react'
import Link from 'next/link'

export default function BrandingPage() {
  const services = [
    {
      icon: Globe,
      title: 'Custom Websites',
      description: 'Fully custom design, not templates. Mobile responsive. Free hosting included. 30 days post-launch support.',
    },
    {
      icon: Lock,
      title: 'Client Portals',
      description: 'Secure branded login area. Admin dashboard. User authentication & security.',
    },
    {
      icon: Package,
      title: 'Website & Portal Bundle',
      description: 'Complete digital presence. Best value package.',
    },
    {
      icon: Settings,
      title: 'Business Tools',
      description: 'Custom software solutions. Tailored to your workflow. Training & 60 days support.',
    },
    {
      icon: Sparkles,
      title: 'Creative Direction',
      description: 'Content shoot direction. Visual strategy. Campaign concepts.',
    },
    {
      icon: Target,
      title: 'Brand Identity Consulting',
      description: 'Brand strategy sessions. Visual direction guidance. Clarity on positioning & messaging.',
    },
  ]

  const demos = [
    { name: 'Salon Demo', href: '/demos/salon' },
    { name: 'Restaurant Demo', href: '/demos/restaurant' },
    { name: 'Photographer Demo', href: '/demos/photographer' },
    { name: 'Realtor Demo', href: '/demos/realtor' },
  ]

  const processSteps = [
    { number: '1', title: 'Consultation', description: 'We learn about your project' },
    { number: '2', title: 'Assets & Deposit', description: 'You provide content, we begin' },
    { number: '3', title: 'Design & Build', description: 'Mockups, draft, revisions' },
    { number: '4', title: 'Launch', description: 'Final payment, go live' },
  ]

  return (
    <main className="min-h-screen bg-dark overflow-x-hidden">
      <Navigation />

      {/* HERO SECTION */}
      <section className="relative min-h-[60vh] flex items-center justify-center bg-dark pt-32 pb-16">
        <div className="section-max-width text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-accent uppercase tracking-widest text-sm mb-6">
              BRANDING & WEB
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              CJE Media
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-8">
              Custom websites, portals, and brand identity, built for your vision.
            </p>
            <div className="flex justify-center">
              <a href="/booking?inquiry=true" className="border border-white text-white px-8 py-4 rounded-lg hover:bg-white/10 transition-colors text-center inline-flex items-center justify-center">
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="section-padding bg-dark-light">
        <div className="section-max-width">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Our Services
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Comprehensive branding and web solutions tailored to your needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-dark p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-white/20"
              >
                <div className="w-16 h-16 bg-accent/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/30 transition-colors">
                  <service.icon size={32} className="text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{service.title}</h3>
                <p className="text-white/80 leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* DEMOS SECTION */}
      <section className="section-padding bg-dark">
        <div className="section-max-width">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              See Our Work
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Browse sample sites built for different industries
            </p>
            <Button href="/demos" size="lg" className="btn-primary">
              <span>View Demos</span>
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {demos.map((demo, index) => (
              <motion.div
                key={demo.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={demo.href}
                  className="block bg-dark-light p-6 rounded-2xl border-2 border-white/10 hover:border-white/20 transition-all duration-300 text-center group"
                >
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent transition-colors">
                    {demo.name}
                  </h3>
                  <p className="text-accent text-sm font-medium">View Demo →</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS SECTION */}
      <section className="section-padding bg-dark-light">
        <div className="section-max-width">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Our Process
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Simple steps from concept to launch
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <span className="text-accent text-2xl font-bold">{step.number}</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-white/80 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="section-padding bg-dark">
        <div className="section-max-width">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Ready to build your brand?
            </h2>
            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              Let's discuss your vision and create something extraordinary together.
            </p>
            <Button href="/booking?type=website" size="lg" className="btn-primary">
              <span>Book a Consultation</span>
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

