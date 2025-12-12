'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Share2, Link as LinkIcon } from 'lucide-react'
import {
  FacebookShareButton,
  TwitterShareButton,
  PinterestShareButton,
  LinkedinShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  PinterestIcon,
  LinkedinIcon,
  EmailIcon,
} from 'react-share'

type ResourceItem = { title: string; description: string; href?: string }
type ResourceSection = { category: string; items: ResourceItem[] }

const resources: ResourceSection[] = [
  {
    category: 'Funding & Grants',
    items: [
      { title: 'Awesome Foundation Micro-Grants', description: 'Monthly $1,000 micro-grants for awesome projects from local chapters.', href: 'https://www.awesomefoundation.org/en' },
      { title: 'Backing Small Business (American Express)', description: 'Grant program supporting small business owners with flexible funding.', href: 'https://www.americanexpress.com/en-us/newsroom/articles/corporate-sustainability/american-express-to-provide--3-95m-in-support-for-restaurants-wo.html' },
    ],
  },
  {
    category: 'Free Business Support & Mentorship',
    items: [
      { title: 'SCORE Chicago', description: 'Free mentorship, workshops, and templates from experienced business mentors.', href: 'https://www.score.org/chicago' },
      { title: 'Small Business Development Centers (SBDCs)', description: 'Local advising on business plans, funding, and growth strategies.', href: 'https://americassbdc.org/' },
    ],
  },
  {
    category: 'Tools & Platforms',
    items: [
      { title: 'Zenbusiness', description: 'Business formation, compliance reminders, and simple LLC setup support.', href: 'https://www.zenbusiness.com/' },
      { title: 'Google Workspace', description: 'Professional email, docs, and collaboration suite to run your back office.', href: 'https://workspace.google.com/' },
    ],
  },
  {
    category: 'Learning & Development',
    items: [
      { title: 'Google Career Certificates', description: 'Job-ready certificates in project management, data analytics, UX, and more.', href: 'https://grow.google/certificates/' },
      { title: 'YouTube (Ex: Emma Grede)', description: 'Founder insights, brand-building, and entrepreneurship case studies.', href: 'https://youtube.com/@emmagrede?si=ciQ5gT7N4n_G1kxu' },
    ],
  },
  {
    category: 'Systems to Build',
    items: [
      { title: 'Create automated email sequences', description: 'Nurture leads and onboard clients with triggered journeys.' },
      { title: 'Build SOPs (Standard Operating Procedures) for tasks', description: 'Document repeatable steps to delegate and scale.' },
      { title: 'Build CRM (Customer Relationship Management) for lead tracking', description: 'Centralize contacts, pipeline stages, and follow-ups.' },
    ],
  },
]

export default function BusinessResourcesPage() {
  const imageUrl = 'https://www.ciarajevans.com/images/B.Y.O.B.png'
  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://www.ciarajevans.com/business-resources'
  const shareTitle = 'B.Y.O.B. — Build Your Own Business'
  const shareDescription = 'Curated tools, funding, and systems for business owners and entrepreneurs. Save these, share them, and put them to work immediately.'
  
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(imageUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen bg-dark overflow-x-hidden">
      <Navigation />

      {/* Hero */}
      <section className="relative bg-dark pt-28 pb-16 sm:pb-20">
        <div className="section-max-width">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 max-w-3xl mx-auto"
          >
            <p className="text-accent uppercase tracking-[0.3em] text-xs sm:text-sm">Resources</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">B.Y.O.B.</h1>
            <p className="text-lg sm:text-xl text-white/80">Build Your Own Business</p>
            <p className="text-base sm:text-lg text-white/70 leading-relaxed">
              Curated tools, funding, and systems for business owners and entrepreneurs. Save these, share them, and put them to work immediately.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Intro */}
      <section className="section-padding bg-dark-light">
        <div className="section-max-width">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center space-y-4"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Your go-to hub for building momentum</h2>
            <p className="text-white/70 text-lg leading-relaxed">
              Everything here is designed to help you move faster: funding resources, mentors, proven tools, and the core systems every business needs. Start with one action today.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Resources */}
      <section className="section-padding bg-dark">
        <div className="section-max-width space-y-10">
          {resources.map((section, idx) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className="bg-dark-light border border-white/10 rounded-2xl p-6 sm:p-8"
            >
              <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                <h3 className="text-2xl sm:text-3xl font-semibold text-white">{section.category}</h3>
                <div className="h-px flex-1 bg-white/10" />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {section.items.map((item) => {
                  const Component = item.href ? 'a' : 'div'
                  const props = item.href
                    ? {
                        href: item.href,
                        target: '_blank',
                        rel: 'noreferrer',
                      }
                    : {}
                  
                  return (
                    <Component
                      key={item.title}
                      {...props}
                      className="bg-dark rounded-xl border border-white/5 p-5 hover:border-white/15 transition-colors block"
                    >
                      <h4 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                        {item.title}
                        {item.href && <span className="text-xs text-accent font-semibold">↗</span>}
                      </h4>
                      <p className="text-white/70 leading-relaxed text-sm sm:text-base">{item.description}</p>
                    </Component>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Graphic + Closing */}
      <section className="section-padding bg-dark-light">
        <div className="section-max-width grid lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <p className="text-accent uppercase tracking-[0.3em] text-xs">Reminder</p>
            <h3 className="text-3xl sm:text-4xl font-bold text-white">Start scared, but start anyway.</h3>
            <p className="text-white/70 text-lg leading-relaxed">
              Pick one resource above, take one action, and build your own business one intentional step at a time. Share this page with someone who needs the push.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="relative w-full max-w-xl mx-auto"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-dark">
              <Image
                src="/images/B.Y.O.B.png"
                alt="B.Y.O.B. Build Your Own Business graphic"
                width={1200}
                height={900}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
            <p className="text-center text-white/60 text-sm mt-3 mb-4">B.Y.O.B. graphic — save or share.</p>
            
            {/* Share Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <FacebookShareButton url={pageUrl}>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-white/80 hover:border-accent hover:text-accent transition-colors">
                  <FacebookIcon size={16} round />
                  <span className="text-xs">Facebook</span>
                </div>
              </FacebookShareButton>
              <TwitterShareButton url={pageUrl} title={shareTitle}>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-white/80 hover:border-accent hover:text-accent transition-colors">
                  <TwitterIcon size={16} round />
                  <span className="text-xs">Twitter</span>
                </div>
              </TwitterShareButton>
              <PinterestShareButton url={pageUrl} description={shareDescription} media={imageUrl}>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-white/80 hover:border-accent hover:text-accent transition-colors">
                  <PinterestIcon size={16} round />
                  <span className="text-xs">Pinterest</span>
                </div>
              </PinterestShareButton>
              <LinkedinShareButton url={pageUrl} title={shareTitle} summary={shareDescription}>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-white/80 hover:border-accent hover:text-accent transition-colors">
                  <LinkedinIcon size={16} round />
                  <span className="text-xs">LinkedIn</span>
                </div>
              </LinkedinShareButton>
              <EmailShareButton url={pageUrl} subject={shareTitle} body={`Check out these curated tools, funding, and systems for business owners and entrepreneurs:\n\n${pageUrl}\n\nSave these, share them, and put them to work immediately.`}>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-white/80 hover:border-accent hover:text-accent transition-colors">
                  <EmailIcon size={16} round />
                  <span className="text-xs">Email</span>
                </div>
              </EmailShareButton>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-white/80 hover:border-accent hover:text-accent transition-colors"
              >
                <LinkIcon size={14} />
                <span className="text-xs">{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

