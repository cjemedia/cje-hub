'use client'

import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Button from '@/components/Button'
import { ArrowRight, Mic, Users, MessageSquare, Presentation, Radio } from 'lucide-react'

export default function SpeakingPage() {
  const formats = [
    { icon: Mic, title: 'Keynote Speaker', description: 'Inspiring opening or closing addresses that set the tone for your event' },
    { icon: Presentation, title: 'Motivational Speaker', description: 'Energizing talks that motivate audiences to take action' },
    { icon: Users, title: 'Workshop Facilitator', description: 'Interactive sessions that engage participants in hands-on learning' },
    { icon: MessageSquare, title: 'Panelist', description: 'Thoughtful contributions to panel discussions and Q&A sessions' },
    { icon: Radio, title: 'Moderator', description: 'Expert facilitation of conversations and panel discussions' },
    { icon: Mic, title: 'Emcee/Host', description: 'Dynamic event hosting that keeps audiences engaged from start to finish' },
  ]

  const keynotes = [
    {
      title: 'The Power of Purpose: Finding Direction When Life Feels Uncertain',
      description: 'A transformative talk on discovering your purpose and navigating life\'s uncertainties with clarity and confidence.',
    },
    {
      title: 'Aligned Action: How to Navigate Transitions With Intention',
      description: 'Learn to move through life transitions with purpose, making decisions that align with your values and goals.',
    },
    {
      title: 'Your Story Is Your Advantage',
      description: 'Discover how to leverage your unique experiences and stories to build a compelling personal brand.',
    },
    {
      title: 'Scholarship Szn: Becoming the Top-Tier Candidate',
      description: 'Essential strategies for students, parents, and educators on standing out in competitive scholarship applications.',
    },
    {
      title: 'Identity & Influence: Building a Life and Brand With Purpose',
      description: 'Explore how to build an authentic brand and life that reflects your true identity and creates meaningful influence.',
    },
    {
      title: 'Purpose Over Perfection: Progress as a Lifestyle',
      description: 'Shift from perfectionism to purpose-driven progress, embracing growth and action over perfection.',
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
            <p className="text-accent uppercase tracking-widest text-sm mb-6">
              SPEAKING • HOSTING
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              The CJE Experience
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Inspiring purpose-driven action through powerful storytelling, engaging presentations, and authentic connection. 
              Whether you need a keynote speaker, workshop facilitator, or event host, Ciara brings energy, expertise, and impact to every stage.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FORMATS SECTION */}
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
              Formats Offered
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Versatile speaking and hosting services tailored to your event needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {formats.map((format, index) => (
              <motion.div
                key={format.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-dark p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-white/20"
              >
                <div className="w-16 h-16 bg-accent/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/30 transition-colors">
                  <format.icon size={32} className="text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{format.title}</h3>
                <p className="text-white/80 leading-relaxed">{format.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SIGNATURE KEYNOTES SECTION */}
      <section className="section-padding bg-dark">
        <div className="section-max-width">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-2 bg-accent/20 rounded-full mb-4">
              <span className="text-accent font-semibold text-sm">Signature Topics</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Signature Keynotes
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Proven talks that inspire, educate, and transform audiences
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {keynotes.map((keynote, index) => (
              <motion.div
                key={keynote.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-dark-light p-8 rounded-2xl border-2 border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <h3 className="text-2xl font-bold text-white mb-4">{keynote.title}</h3>
                <p className="text-white/80 leading-relaxed">{keynote.description}</p>
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
              Book Ciara for Your Next Event
            </h2>
            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              Ready to bring purpose-driven inspiration to your audience? Let's discuss how Ciara can make your next event unforgettable.
            </p>
            <Button href="/booking?type=speaking" size="lg" className="btn-primary">
              <span>Book a Call</span>
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

