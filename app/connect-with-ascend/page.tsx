'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Button from '@/components/Button'
import { ArrowRight } from 'lucide-react'

const HEARD_OPTIONS = [
  'A school event',
  'A speaking engagement',
  'Social media',
  'A friend or classmate',
  'A teacher or counselor',
  'A parent or family member',
  'Other',
]

const GRADE_OPTIONS = [
  '8th Grade',
  '9th Grade',
  '10th Grade',
  '11th Grade',
  '12th Grade',
  'College Freshman',
  'Other',
]

type FormState = {
  firstName: string
  lastName: string
  email: string
  phone: string
  howHeard: string
  gradeLevel: string
  highSchool: string
}

const INITIAL_FORM: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  howHeard: '',
  gradeLevel: '',
  highSchool: '',
}

const inputClass =
  'w-full bg-dark border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-sm'

const labelClass = 'block text-sm font-medium text-white/80 mb-2'

export default function ConnectWithAscendPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  setLoading(true)
  setError(null)

  const res = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tag: 'ascend',
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      phone: form.phone || null,
      how_heard: form.howHeard || null,
      grade_level: form.gradeLevel || null,
      high_school: form.highSchool || null,
    }),
  })

  setLoading(false)

  if (!res.ok) {
    setError('Something went wrong. Please try again.')
    return
  }

  setSubmitted(true)
}

  if (submitted) {
    return (
      <main className="min-h-screen bg-dark overflow-x-hidden">
        <Navigation />
        <div className="flex items-center justify-center min-h-[80vh] px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <div className="mx-auto mb-8 w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">You&apos;re In.</h1>
            <p className="text-white/70 text-lg leading-relaxed">
              Welcome to the Ascend community, {form.firstName}. We&apos;ll be in touch with everything you need to know.
            </p>
            <div className="mt-8 w-16 h-px bg-accent/40 mx-auto" />
            <p className="mt-6 text-sm text-white/40">
              Powered by <span className="text-accent">CJE Media</span>
            </p>
          </motion.div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-dark overflow-x-hidden">
      <Navigation />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
        {/* Background text like homepage */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
          <div className="text-[20vw] font-bold text-white/[0.04] select-none tracking-tight whitespace-nowrap" aria-hidden="true">
            ASCEND
          </div>
        </div>
        <div className="relative" style={{ zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-4 py-2 bg-accent/10 rounded-full mb-6">
              <span className="text-accent font-semibold text-sm">Ciara J. Evans Presents</span>
            </div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6">Ascend</h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto leading-relaxed">
              A scholarship strategy program for the next generation of HBCU scholars, leaders, and changemakers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-lg mx-auto"
        >
          <div className="bg-dark-light rounded-2xl border border-white/10 shadow-2xl p-8">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Stay Connected</h2>
              <p className="text-white/60 text-sm">
                Join Ascend and stay connected to scholarship opportunities, resources, and strategies for HBCU-bound students.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    First Name <span className="text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="First"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Last Name <span className="text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Last"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={labelClass}>
                  Email Address <span className="text-accent">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>

              {/* Phone */}
              <div>
                <label className={labelClass}>
                  Phone Number{' '}
                  <span className="text-white/40 font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="(555) 000-0000"
                  className={inputClass}
                />
              </div>

              {/* Grade */}
              <div>
                <label className={labelClass}>Grade Level</label>
                <select
                  name="gradeLevel"
                  value={form.gradeLevel}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="" className="bg-[#1a1a1a]">Select grade level</option>
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g} value={g} className="bg-[#1a1a1a]">{g}</option>
                  ))}
                </select>
              </div>

              {/* High School */}
              <div>
                <label className={labelClass}>High School</label>
                <input
                  type="text"
                  name="highSchool"
                  value={form.highSchool}
                  onChange={handleChange}
                  placeholder="School name"
                  className={inputClass}
                />
              </div>

              {/* How they heard */}
              <div>
                <label className={labelClass}>How did you hear about Ascend?</label>
                <select
                  name="howHeard"
                  value={form.howHeard}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="" className="bg-[#1a1a1a]">Select an option</option>
                  {HEARD_OPTIONS.map((o) => (
                    <option key={o} value={o} className="bg-[#1a1a1a]">{o}</option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="btn-primary w-full"
                icon={ArrowRight}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Join the Community'}
              </Button>

              <p className="text-center text-xs text-white/30 leading-relaxed">
                By submitting, you agree to receive updates from CJE Media. We respect your privacy and will never share your information.
              </p>
            </form>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  )
}