'use client'

import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Button from '@/components/Button'
import { ArrowRight, GraduationCap, Target, Users, BookOpen, Sparkles, TrendingUp } from 'lucide-react'

export default function ProgramsPage() {
  const courseModules = {
    scholarship: [
      'Academic Excellence',
      'Leadership Development',
      'Personal Branding',
      'Community Service',
      'Essay Writing',
      'Scholarship Search',
    ],
    branding: [
      'Purpose Discovery',
      'Storytelling',
      'Digital Presence',
      'Content Pillars',
      'Networking',
      'Confidence Building',
    ],
  }

  const cohortModules = [
    'Purpose Discovery',
    'Personal Development',
    'Mindset Transformation',
    'Brand Identity',
    'Visibility Strategy',
    'Action Plan Creation',
  ]

  const coachingAreas = [
    'Career Pivots',
    'Goal Clarity',
    'Public Speaking',
    'Confidence Building',
    'Personal Mission',
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
              <span className="text-accent font-semibold text-sm">Courses & Coaching</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Programs & Coaching
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Transform your life and career through purpose-driven courses, cohort programs, and personalized coaching. 
              Designed for students, professionals, and creatives ready to unlock their potential.
            </p>
          </motion.div>
        </div>
      </section>

      {/* COURSES SECTION */}
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
              Digital Courses
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Self-paced learning designed to transform your journey
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Scholarship Era Course */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
              className="bg-dark p-8 rounded-2xl border-2 border-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-accent/20 rounded-xl flex items-center justify-center mb-6">
                <GraduationCap size={32} className="text-accent" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Your Scholarship Era</h3>
              <p className="text-white/80 mb-6 leading-relaxed">
                A comprehensive course for students, parents, and educators focused on scholarship readiness and application success.
              </p>
              <div className="mb-6">
                <p className="text-accent font-semibold mb-3">Modules Include:</p>
                <ul className="space-y-2">
                  {courseModules.scholarship.map((module, index) => (
                    <li key={index} className="text-white/70 flex items-center">
                      <ArrowRight size={16} className="text-accent mr-2" />
                      {module}
                    </li>
                  ))}
                </ul>
              </div>
              <Button href="/booking" variant="outline" size="md">
                Learn More
              </Button>
            </motion.div>

            {/* Brand Building Course */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-dark p-8 rounded-2xl border-2 border-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-accent/20 rounded-xl flex items-center justify-center mb-6">
                <Sparkles size={32} className="text-accent" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Build Your Brand With Purpose</h3>
              <p className="text-white/80 mb-6 leading-relaxed">
                A universal personal branding course that helps anyone discover their purpose and build an authentic, impactful brand.
              </p>
              <div className="mb-6">
                <p className="text-accent font-semibold mb-3">Modules Include:</p>
                <ul className="space-y-2">
                  {courseModules.branding.map((module, index) => (
                    <li key={index} className="text-white/70 flex items-center">
                      <ArrowRight size={16} className="text-accent mr-2" />
                      {module}
                    </li>
                  ))}
                </ul>
              </div>
              <Button href="/booking" variant="outline" size="md">
                Learn More
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* COHORT PROGRAM SECTION */}
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
              <span className="text-accent font-semibold text-sm">Group Program</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              The Purpose Accelerator
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              A 6-week cohort program for students, professionals, and creatives
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto bg-dark-light p-8 lg:p-12 rounded-2xl border-2 border-white/10"
          >
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">What You'll Gain</h3>
                <ul className="space-y-3">
                  {cohortModules.map((module, index) => (
                    <li key={index} className="text-white/80 flex items-start">
                      <TrendingUp size={20} className="text-accent mr-3 mt-1 flex-shrink-0" />
                      <span>{module}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Who It's For</h3>
                <ul className="space-y-3">
                  <li className="text-white/80 flex items-start">
                    <Users size={20} className="text-accent mr-3 mt-1 flex-shrink-0" />
                    <span>Students seeking clarity and direction</span>
                  </li>
                  <li className="text-white/80 flex items-start">
                    <Users size={20} className="text-accent mr-3 mt-1 flex-shrink-0" />
                    <span>Professionals navigating career transitions</span>
                  </li>
                  <li className="text-white/80 flex items-start">
                    <Users size={20} className="text-accent mr-3 mt-1 flex-shrink-0" />
                    <span>Creatives building their personal brand</span>
                  </li>
                </ul>
              </div>
            </div>
            <Button href="/booking" size="lg" className="btn-primary w-full md:w-auto">
              <span>Join Waitlist</span>
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* 1:1 COACHING SECTION */}
      <section className="section-padding bg-dark-light">
        <div className="section-max-width">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-2 bg-accent/20 rounded-full mb-4">
              <span className="text-accent font-semibold text-sm">Personalized Support</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              1:1 Coaching
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Purpose & Presence Coaching for personalized transformation
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-dark p-8 lg:p-12 rounded-2xl border-2 border-white/10">
              <div className="flex items-start mb-8">
                <div className="w-16 h-16 bg-accent/20 rounded-xl flex items-center justify-center mr-6 flex-shrink-0">
                  <Target size={32} className="text-accent" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">Purpose & Presence Coaching</h3>
                  <p className="text-white/80 leading-relaxed mb-6">
                    One-on-one coaching sessions designed to help you navigate transitions, clarify goals, and build confidence 
                    in your personal and professional journey.
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-accent font-semibold mb-4 text-lg">Perfect For:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  {coachingAreas.map((area, index) => (
                    <div key={index} className="flex items-center text-white/80">
                      <BookOpen size={18} className="text-accent mr-3" />
                      <span>{area}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button href="/booking" size="lg" className="btn-primary">
                <span>Apply Now</span>
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

