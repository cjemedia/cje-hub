'use client'

import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Button from '@/components/Button'
import { ArrowRight, Users, Presentation, GraduationCap, Briefcase, Mic, Target } from 'lucide-react'

export default function OrganizationsPage() {
  const services = [
    {
      icon: Target,
      title: 'Purpose & Leadership Workshops',
      description: 'Transformative workshops that help teams discover their collective purpose and develop authentic leadership skills.',
    },
    {
      icon: Presentation,
      title: 'Brand Storytelling Workshops',
      description: 'Interactive sessions teaching organizations how to craft and share compelling brand narratives that resonate.',
    },
    {
      icon: Briefcase,
      title: 'Professional Development Training',
      description: 'Comprehensive training programs designed to elevate team performance, communication, and professional growth.',
    },
    {
      icon: GraduationCap,
      title: 'Scholarship Readiness Programs',
      description: 'Specialized programs for schools and educational institutions to prepare students for scholarship success.',
    },
    {
      icon: Users,
      title: 'College & Career Readiness Sessions',
      description: 'Engaging sessions that equip students with the tools and confidence needed for college and career transitions.',
    },
    {
      icon: Mic,
      title: 'Event Moderation/Hosting Packages',
      description: 'Complete event hosting solutions, from corporate conferences to school assemblies, ensuring memorable experiences.',
    },
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
            <div className="inline-block px-4 py-2 bg-accent/10 rounded-full mb-6">
              <span className="text-accent font-semibold text-sm">For Organizations</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Partner With Ciara
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Workshops, training, and speaking services for teams, schools, and organizations. 
              Bring purpose-driven transformation to your institution with customized programs that inspire and empower.
            </p>
          </motion.div>
        </div>
      </section>

      {/* SERVICES GRID */}
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
              Comprehensive solutions tailored to your organization's needs
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

      {/* CTA SECTION */}
      <section className="section-padding bg-dark-light">
        <div className="section-max-width">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Request a Proposal
            </h2>
            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              Ready to bring purpose-driven transformation to your organization? Let's discuss your needs and create a customized proposal.
            </p>
            <Button href="/booking?type=organization" size="lg" className="btn-primary">
              <span>Get Started</span>
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

