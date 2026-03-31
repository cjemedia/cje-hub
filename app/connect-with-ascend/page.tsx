'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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

export default function ConnectWithAscendPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: insertError } = await supabase.from('ascend_leads').insert([
      {
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone || null,
        how_heard: form.howHeard || null,
        grade_level: form.gradeLevel || null,
        high_school: form.highSchool || null,
      },
    ])

    setLoading(false)

    if (insertError) {
      setError('Something went wrong. Please try again.')
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          {/* Animated checkmark circle */}
          <div className="mx-auto mb-8 w-20 h-20 rounded-full bg-[#0ABAB5]/10 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-[#0ABAB5]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1
            className="text-4xl text-charcoal mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            You&apos;re In.
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            Welcome to the Ascend community, {form.firstName}. We&apos;ll be in
            touch with everything you need to know.
          </p>
          <div className="mt-8 w-16 h-px bg-[#0ABAB5] mx-auto" />
          <p className="mt-6 text-sm text-gray-400">
            Powered by{' '}
            <span className="text-[#0ABAB5] font-medium">CJE Media</span>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0ABAB5] px-6 pt-16 pb-20 text-white text-center">
        {/* Subtle decorative circles */}
        <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5" />

        <p className="uppercase tracking-[0.25em] text-xs font-medium text-white/70 mb-4">
          Ciara J. Evans Presents
        </p>
        <h1
          className="text-5xl md:text-6xl font-normal leading-tight mb-4"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Ascend
        </h1>
        <div className="w-12 h-px bg-white/50 mx-auto mb-5" />
        <p className="text-white/90 text-lg max-w-sm mx-auto leading-relaxed">
          A youth initiative for the next generation of leaders, thinkers, and
          changemakers.
        </p>
      </section>

      {/* Form card */}
      <section className="px-6 py-12 max-w-lg mx-auto">
        <div className="mb-8 text-center">
          <h2
            className="text-2xl text-gray-800 mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Stay Connected
          </h2>
          <p className="text-gray-500 text-sm">
            Fill out the form below and we&apos;ll keep you in the loop on
            events, opportunities, and everything Ascend.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1.5">
                First Name <span className="text-[#0ABAB5]">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                required
                value={form.firstName}
                onChange={handleChange}
                placeholder="First"
                className="w-full border border-gray-200 rounded-none px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#0ABAB5] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1.5">
                Last Name <span className="text-[#0ABAB5]">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                required
                value={form.lastName}
                onChange={handleChange}
                placeholder="Last"
                className="w-full border border-gray-200 rounded-none px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#0ABAB5] transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1.5">
              Email Address <span className="text-[#0ABAB5]">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-none px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#0ABAB5] transition-colors"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1.5">
              Phone Number{' '}
              <span className="text-gray-400 font-normal normal-case">
                (optional)
              </span>
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="(555) 000-0000"
              className="w-full border border-gray-200 rounded-none px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#0ABAB5] transition-colors"
            />
          </div>

          {/* Grade Level */}
          <div>
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1.5">
              Grade Level
            </label>
            <select
              name="gradeLevel"
              value={form.gradeLevel}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-none px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#0ABAB5] transition-colors bg-white appearance-none"
            >
              <option value="">Select grade level</option>
              {GRADE_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* High School */}
          <div>
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1.5">
              High School
            </label>
            <input
              type="text"
              name="highSchool"
              value={form.highSchool}
              onChange={handleChange}
              placeholder="School name"
              className="w-full border border-gray-200 rounded-none px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#0ABAB5] transition-colors"
            />
          </div>

          {/* How they heard */}
          <div>
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1.5">
              How did you hear about Ascend?
            </label>
            <select
              name="howHeard"
              value={form.howHeard}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-none px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#0ABAB5] transition-colors bg-white appearance-none"
            >
              <option value="">Select an option</option>
              {HEARD_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0ABAB5] text-white text-sm font-medium uppercase tracking-widest py-4 transition-colors hover:bg-[#089490] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Join the Community'}
          </button>

          <p className="text-center text-xs text-gray-400 leading-relaxed">
            By submitting, you agree to receive updates from CJE Media. We
            respect your privacy and will never share your information.
          </p>
        </form>
      </section>

      {/* Footer */}
      <footer className="text-center pb-10">
        <div className="w-16 h-px bg-[#0ABAB5]/30 mx-auto mb-4" />
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} CJE Media · ciarajevans.com
        </p>
      </footer>
    </main>
  )
}