'use client'

import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Button from '@/components/Button'
import {
  Calendar,
  Users,
  Mic,
  Sparkles,
  Camera,
  FileText,
  Globe,
  Code,
  Settings,
  ArrowRight,
  Check,
} from 'lucide-react'
import Image from 'next/image'
import { FormEvent, useState } from 'react'

const services = {
  experiences: [
    {
      icon: Calendar,
      title: 'Event Curator (Creative Direction Only)',
      description:
        'You provide the budget and vision, we handle creative direction, event mood board, vendor recommendations, and timeline coordination.',
      includes: [
        'Creative plan',
        'Vendor guide',
        'Execution outline',
      ],
      price: 'Starting at $800',
    },
    {
      icon: Users,
      title: 'Event Manager (Full Execution)',
      description:
        'Full-service event planning and management: from concept to day-of operations. We handle planning, budgeting, vendor coordination, timeline creation, and on-site execution.',
      includes: [
        'Budget management',
        'Setup oversight',
        'Team coordination',
      ],
      pricing: [
        'Small-Scale (0-50 guests): $1,500-$2,500',
        'Mid-Scale (50-150 guests): $3,000-$5,000',
        'Large-Scale (150+ guests): Custom Quote',
      ],
    },
    {
      icon: Mic,
      title: 'Event Host/Moderator',
      description:
        'Hosting and moderating panels, introducing speakers, engaging attendees, and maintaining program flow with Ciara J. Evans as the on-stage lead.',
      includes: [
        'Pre-event coordination call',
        'Run-of-show review',
        'Hosting outline',
        'On-stage moderation',
      ],
      pricing: [
        '$300-$500 (for single-day events under 4 hours)',
        '$600-$800 (events over 4 hours, includes prep or script assistance)',
      ],
    },
  ],
  media: [
    {
      icon: Sparkles,
      title: 'Brand Management',
      description:
        'Full-service management to oversee your brand\'s growth, voice, and visibility: including strategy, content direction, partnerships, and performance tracking.',
      pricing: ['Monthly: $1,200-$1,500', 'Quarterly: $3,600-$4,500'],
    },
    {
      icon: FileText,
      title: 'Campaign Curator',
      description:
        'We develop your campaign\'s creative vision, storyline, and rollout strategy: perfect for launches, announcements, or brand moments.',
      price: 'Per Campaign: $600-$1,000',
    },
    {
      icon: Camera,
      title: 'Campaign Manager',
      description:
        'We bring your campaign to life from concept to completion: including hiring and managing videographers, editors, and designers.',
      price: 'Per Campaign: $1,200-$2,000',
    },
    {
      icon: FileText,
      title: 'Social Media Curator',
      description:
        'Ideal for brands that film their own content but need help organizing, captioning, and staying consistent. We turn your content into a strategic plan.',
      pricing: ['Monthly: $500', 'Quarterly: $1,350'],
    },
    {
      icon: Sparkles,
      title: 'Social Media Manager',
      description:
        'We handle the full posting process using the content you provide, editing videos, designing graphics, scheduling posts, writing captions, and managing engagement.',
      pricing: ['Monthly: $850-$1,000', 'Quarterly: $2,400-$2,800'],
    },
  ],
  custom: [
    {
      icon: Globe,
      title: 'Custom Website Build',
      description:
        'Fully customized website development tailored to your brand. From design to deployment, we create stunning, conversion-focused websites.',
      includes: [
        'Custom design & development',
        'Responsive mobile optimization',
        'SEO optimization',
        'Content management system',
        'Ongoing support',
      ],
      price: 'Custom Quote',
    },
    {
      icon: Code,
      title: 'Custom Client Portal Build',
      description:
        'Streamline your client experience with a branded portal. Manage projects, deliverables, communications, and payments all in one place.',
      includes: [
        'Client dashboard',
        'Project management',
        'File sharing & storage',
        'Payment integration',
        'Booking system',
      ],
      price: 'Custom Quote',
    },
    {
      icon: Settings,
      title: 'Internal Business Tools & Solutions',
      description:
        'Custom software solutions to automate and optimize your business operations. From CRM systems to workflow automation.',
      includes: [
        'Business process automation',
        'Custom CRM development',
        'Integration with existing tools',
        'Analytics & reporting',
        'Team collaboration tools',
      ],
      price: 'Custom Quote',
    },
  ],
}

export default function ServicesPage() {
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactForm, setContactForm] = useState({
    from: '',
    phone: '',
    subject: '',
    inquiryTypes: [] as string[],
    preferredContact: 'email',
    message: '',
  })
  const [contactStatus, setContactStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCheckboxChange = (value: string) => {
    setContactForm((prev) => {
      const exists = prev.inquiryTypes.includes(value)
      const updated = exists
        ? prev.inquiryTypes.filter((item) => item !== value)
        : [...prev.inquiryTypes, value]
      return { ...prev, inquiryTypes: updated }
    })
  }

  const handleContactSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setContactStatus('idle')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'CJE Services Contact',
          from: contactForm.from,
          phone: contactForm.phone,
          subject: contactForm.subject,
          inquiryType: contactForm.inquiryTypes,
          preferredContact: contactForm.preferredContact,
          message: contactForm.message,
        }),
      })

      if (!res.ok) throw new Error('Failed to send message')

      setContactStatus('success')
      setContactForm({
        from: '',
        phone: '',
        subject: '',
        inquiryTypes: [],
        preferredContact: 'email',
        message: '',
      })
    } catch (error) {
      console.error(error)
      setContactStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-primary-white">
      <Navigation />

      {/* HERO */}
      <section className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="/images/cje12.JPG"
            alt="Services"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-primary-charcoal/50" />
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-h1 font-serif font-bold text-primary-white text-center px-4"
        >
          Services
        </motion.h1>
      </section>

      {/* CJE Experiences */}
      <section className="section-padding bg-primary-white py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="section-max-width">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 lg:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-h2 font-serif font-semibold text-primary-charcoal mb-3 sm:mb-4">
              CJE Experiences
            </h2>
            <p className="text-sm sm:text-base lg:text-body text-primary-charcoal/70 max-w-2xl mx-auto px-4">
              From concept to in-person experiences, these packages are for
              brands and creatives ready to bring their ideas to life through
              unforgettable experiences.
            </p>
          </motion.div>

          <div className="space-y-12 sm:space-y-16 lg:space-y-24">
            {services.experiences.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`${
                    index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'
                  } relative h-[300px] sm:h-[400px] lg:h-[500px] rounded-xl sm:rounded-2xl overflow-hidden order-1`}
                >
                  <Image
                    src={
                      index === 0
                        ? '/images/cje3.JPG'
                        : index === 1
                        ? '/images/cje1.JPEG'
                        : '/images/cje9.JPG'
                    }
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div
                  className={`${
                    index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'
                  } space-y-4 sm:space-y-6 order-2 ${
                    index % 2 === 0
                      ? 'border-l-0 lg:border-l-4 border-t-4 lg:border-t-0 border-primary-tiffany pl-0 lg:pl-8 pt-4 lg:pt-0'
                      : 'border-r-0 lg:border-r-4 border-t-4 lg:border-t-0 border-primary-tiffany pr-0 lg:pr-8 pt-4 lg:pt-0'
                  }`}
                >
                  <h3 className="text-2xl sm:text-3xl lg:text-h3 font-serif font-semibold text-primary-charcoal">
                    {service.title}
                  </h3>
                  <p className="text-sm sm:text-base lg:text-body text-primary-charcoal/80 leading-relaxed">
                    {service.description}
                  </p>
                  {service.includes && (
                    <ul className="space-y-3">
                      {service.includes.map((item) => (
                        <li
                          key={item}
                          className="flex items-start space-x-3 text-small"
                        >
                          <Check
                            size={20}
                            className="text-primary-tiffany mt-0.5 flex-shrink-0"
                          />
                          <span className="text-primary-charcoal/80">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="pt-4">
                    {service.price ? (
                      <div className="text-xl font-semibold text-primary-tiffany">
                        {service.price}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {service.pricing?.map((price, i) => (
                          <div
                            key={i}
                            className="text-small text-primary-charcoal/70"
                          >
                            {price}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CJE Media - Tiffany Blue Background */}
      <section className="section-padding bg-[#81D8D0] py-32">
        <div className="section-max-width">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-h2 font-serif font-semibold text-white mb-4">
              CJE Media
            </h2>
            <p className="text-body text-white/90 max-w-2xl mx-auto">
              This suite of services is designed to build, nurture, and amplify
              your brand&apos;s digital presence from the inside out.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.media.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl card-hover border-2 border-white/20 hover:border-white"
              >
                <div className="bg-white/20 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                  <service.icon size={32} className="text-white" />
                </div>
                <h3 className="text-h3 font-serif font-semibold text-white mb-4">
                  {service.title}
                </h3>
                <p className="text-small text-white/90 mb-6 leading-relaxed">
                  {service.description}
                </p>
                <div className="pt-4 border-t border-white/20">
                  {service.price ? (
                    <div className="text-lg font-semibold text-white">
                      {service.price}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {service.pricing?.map((price, i) => (
                        <div
                          key={i}
                          className="text-small text-white/90"
                        >
                          {price}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Solutions */}
      <section className="section-padding bg-primary-white">
        <div className="section-max-width">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-h2 font-serif font-semibold text-primary-charcoal mb-4">
              Custom Solutions
            </h2>
            <p className="text-body text-primary-charcoal/70 max-w-2xl mx-auto">
              Tailored technology solutions to elevate your business operations
              and client experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.custom.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-primary-white border-2 border-primary-charcoal/10 rounded-2xl p-8 card-hover hover:border-primary-tiffany"
              >
                <div className="bg-primary-tiffany/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                  <service.icon size={32} className="text-primary-tiffany" />
                </div>
                <h3 className="text-h3 font-serif font-semibold text-primary-charcoal mb-4">
                  {service.title}
                </h3>
                <p className="text-small text-primary-charcoal/70 mb-6 leading-relaxed">
                  {service.description}
                </p>
                {service.includes && (
                  <ul className="space-y-2 mb-6">
                    {service.includes.map((item) => (
                      <li
                        key={item}
                        className="flex items-start space-x-2 text-small"
                      >
                        <Check
                          size={16}
                          className="text-primary-tiffany mt-0.5 flex-shrink-0"
                        />
                        <span className="text-primary-charcoal/80">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="pt-4 border-t border-primary-charcoal/10">
                  <div className="text-lg font-semibold text-primary-tiffany">
                    {service.price}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-[#2D2D2D] py-32 text-white">
        <div className="section-max-width text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6 max-w-3xl mx-auto"
          >
            <h2 className="text-h2 font-serif font-semibold text-primary-white">
              Ready to Get Started?
            </h2>
            <p className="text-body text-primary-white/80">
              Let&apos;s discuss how we can bring your vision to life.
            </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button href="/booking" size="lg" className="btn-primary w-full sm:w-auto sm:min-w-[220px] h-[56px]">
                Book a Call
              </Button>
                <Button
                  onClick={() => setShowContactModal(true)}
                  variant="outline"
                  size="lg"
                  className="border-2 border-primary-white text-primary-white hover:bg-primary-white hover:text-primary-charcoal w-full sm:w-auto sm:min-w-[220px] h-[56px]"
                >
                Contact Us
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {showContactModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative"
          >
            <button
              onClick={() => {
                setShowContactModal(false)
                setContactStatus('idle')
              }}
              className="absolute top-4 right-4 text-primary-charcoal/60 hover:text-primary-charcoal"
              aria-label="Close contact form"
            >
              ×
            </button>
            <h3 className="text-3xl font-serif font-semibold text-primary-charcoal mb-4 text-center">
              Send Us a Message
            </h3>
            <p className="text-sm text-primary-charcoal/70 text-center mb-6">
              Emails go directly to <span className="font-semibold">media@ciarajevans.com</span>
            </p>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-primary-charcoal mb-2">
                  From *
                </label>
                <input
                  type="email"
                  required
                  value={contactForm.from}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, from: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border-2 border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-primary-tiffany"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary-charcoal mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-3 border-2 border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-primary-tiffany"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary-charcoal mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, subject: e.target.value }))}
                  placeholder="Project inquiry, collaboration, etc."
                  className="w-full px-4 py-3 border-2 border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-primary-tiffany"
                />
              </div>

              <div>
                <span className="block text-sm font-semibold text-primary-charcoal mb-2">
                  Inquiry Type
                </span>
                <div className="flex flex-col gap-2">
                  {['Marketing', 'Events', 'Business Services'].map((type) => (
                    <label key={type} className="flex items-center gap-2 text-sm text-primary-charcoal/80">
                      <input
                        type="checkbox"
                        checked={contactForm.inquiryTypes.includes(type)}
                        onChange={() => handleCheckboxChange(type)}
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-sm font-semibold text-primary-charcoal mb-2">
                  Preferred Contact
                </span>
                <div className="flex gap-6 text-sm text-primary-charcoal/80">
                  {['email', 'call'].map((method) => (
                    <label key={method} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="preferredContact"
                        value={method}
                        checked={contactForm.preferredContact === method}
                        onChange={(e) =>
                          setContactForm((prev) => ({ ...prev, preferredContact: e.target.value }))
                        }
                      />
                      {method === 'email' ? 'Email' : 'Call'}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary-charcoal mb-2">
                  Message *
                </label>
                <textarea
                  required
                  rows={5}
                  value={contactForm.message}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="Tell us about your goals or request..."
                  className="w-full px-4 py-3 border-2 border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-primary-tiffany"
                />
              </div>

              {contactStatus === 'success' && (
                <p className="text-sm text-green-600">
                  Thank you for contacting us. We will reply within 24 business hours. Have a great day!
                </p>
              )}
              {contactStatus === 'error' && (
                <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send'}
              </Button>
            </form>
          </motion.div>
        </div>
      )}

      <Footer />
    </main>
  )
}
