'use client'

import { useEffect, useState, FormEvent } from 'react'
import { Clock, PlaySquare, Folder, Check, ArrowRight } from 'lucide-react'

// ============== Constants ==============
const CITY_OPTIONS = ['Houston', 'Chicago', 'Other'] as const
const READY_OPTIONS = [
  { value: 'ready', label: "Yes, I'm ready to secure my date" },
  { value: 'questions_first', label: 'I have a few questions first' },
] as const

type FunnelStep = 'landing' | 'form' | 'schedule' | 'confirmed'

// ============== Page ==============
export default function ContentDaysPage() {
  const [step, setStep] = useState<FunnelStep>('landing')
  const [submitting, setSubmitting] = useState(false)
  const [inquiryId, setInquiryId] = useState<string | null>(null)

  // Form state
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    instagram_handle: '',
    tiktok_handle: '',
    business_name: '',
    preferred_shoot_city: '' as '' | typeof CITY_OPTIONS[number],
    preferred_date: '',
    ready_to_book: '' as '' | 'ready' | 'questions_first',
    how_heard: '',
  })

  // Scheduling state
  const [callDate, setCallDate] = useState('')
  const [callTime, setCallTime] = useState('')
  const [slots, setSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [slotsError, setSlotsError] = useState('')

  // Confirmation details (passed back from the booking API)
  const [confirmedCallDate, setConfirmedCallDate] = useState('')
  const [confirmedCallTime, setConfirmedCallTime] = useState('')

  // Scroll to top whenever the step changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [step])

  // Fetch available slots whenever the call date changes
  useEffect(() => {
    if (!callDate) {
      setSlots([])
      setCallTime('')
      return
    }
    setLoadingSlots(true)
    setSlotsError('')
    setCallTime('')
    fetch(`/api/content-days/availability?date=${callDate}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.availableSlots)) {
          setSlots(data.availableSlots)
          if (data.availableSlots.length === 0) {
            setSlotsError(data.message || 'No times available on this date. Please pick another day.')
          }
        } else {
          setSlots([])
          setSlotsError(data.error || 'Could not load times. Please try again.')
        }
      })
      .catch(() => {
        setSlots([])
        setSlotsError('Connection error. Please try again.')
      })
      .finally(() => setLoadingSlots(false))
  }, [callDate])

  // Submit lead form
  async function submitForm(e: FormEvent) {
    e.preventDefault()
    if (!form.preferred_shoot_city || !form.ready_to_book) {
      alert('Please complete all required fields.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/content-days/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Submission failed')
      }
      setInquiryId(data.id)
      setStep('schedule')
    } catch (err: any) {
      alert(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Submit scheduling
  async function bookCall(e: FormEvent) {
    e.preventDefault()
    if (!inquiryId || !callDate || !callTime) {
      alert('Please pick a date and time.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/content-days/book-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiry_id: inquiryId,
          call_date: callDate,
          call_time: callTime,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Booking failed')
      }
      setConfirmedCallDate(callDate)
      setConfirmedCallTime(callTime)
      setStep('confirmed')
    } catch (err: any) {
      alert(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Min date = today
  const today = new Date().toISOString().split('T')[0]

  // Friendly date format for confirmation screen
  const friendlyConfirmedDate = confirmedCallDate
    ? (() => {
        const [year, month, day] = confirmedCallDate.split('-').map(Number)
        return new Date(year, month - 1, day).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })
      })()
    : ''

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div className="cd-page">
        {/* Topbar */}
        <header className="cd-topbar">
          <div className="cd-topbar-mark">
            CJE <span>MEDIA</span>
          </div>
          {step !== 'landing' && step !== 'confirmed' && (
            <button
              type="button"
              className="cd-topbar-back"
              onClick={() => {
                if (step === 'schedule') setStep('form')
                else if (step === 'form') setStep('landing')
              }}
            >
              ← Back
            </button>
          )}
        </header>

        {/* =========================================
            LANDING
            ========================================= */}
        {step === 'landing' && (
          <>
            <section className="cd-hero">
              <div className="cd-rule" />
              <h1 className="cd-title">
                <span className="cd-title-line cd-black">CJE</span>
                <span className="cd-title-line cd-tiffany">CONTENT</span>
                <span className="cd-title-line cd-black">DAYS</span>
              </h1>
              <div className="cd-rule" />
              <div className="cd-hero-sub">
                <p className="cd-hero-sub-lead">1-2 HOUR SHOOTS</p>
                <p className="cd-hero-sub-tag">MAXIMUM CONTENT. MINIMAL TIME.</p>
              </div>
            </section>

            <section className="cd-features">
              <FeatureRow
                variant="black"
                icon={<Clock strokeWidth={1.5} />}
                title="1-2 HOUR SHOOT"
                tagline="FOCUSED. EFFICIENT. HIGH VALUE."
              />
              <FeatureRow
                variant="tiffany"
                icon={<FortyEightHourIcon />}
                title="48 HOUR TURNAROUND"
                tagline="FAST DELIVERY. NO COMPROMISE."
              />
              <FeatureRow
                variant="black"
                icon={<PlaySquare strokeWidth={1.5} />}
                title="2 REELS INCLUDED"
                tagline="READY TO POST. MADE FOR IMPACT."
              />
              <FeatureRow
                variant="tiffany"
                icon={<Folder strokeWidth={1.5} />}
                title="ALL RAW FOOTAGE"
                tagline="YOURS TO KEEP. USE IT YOUR WAY."
              />
            </section>

            <section className="cd-price-section">
              <div className="cd-price-rule" />
              <div className="cd-price-block">
                <div className="cd-price-num">
                  <span className="cd-price-currency">$</span>200
                </div>
                <div className="cd-price-line-1">ALL OF THE ABOVE.</div>
                <div className="cd-price-line-2">ONE SIMPLE PRICE.</div>
              </div>
              <div className="cd-price-rule" />
            </section>

            <section className="cd-cta-wrap">
              <button
                type="button"
                className="cd-cta-btn"
                onClick={() => setStep('form')}
              >
                BOOK YOUR CONTENT DAY
                <ArrowRight size={16} strokeWidth={2.5} />
              </button>
            </section>

            <BandFooter clickable onClick={() => setStep('form')} />
          </>
        )}

        {/* =========================================
            LEAD FORM
            ========================================= */}
        {step === 'form' && (
          <>
            <section className="cd-step-hero">
              <div className="cd-rule" />
              <h1 className="cd-title cd-title-step">
                <span className="cd-title-line cd-black">RESERVE</span>
                <span className="cd-title-line cd-tiffany">YOUR</span>
                <span className="cd-title-line cd-black">CONTENT</span>
                <span className="cd-title-line cd-tiffany">DAY</span>
              </h1>
              <div className="cd-rule" />
              <div className="cd-hero-sub">
                <p className="cd-hero-sub-lead">STEP 01 / 02. TELL US ABOUT YOU</p>
                <p className="cd-hero-sub-tag">
                  TELL US ABOUT YOU AND YOUR BRAND SO WE CAN PREPARE FOR YOUR CALL.
                </p>
              </div>
            </section>

            <section className="cd-form-section">
              <form onSubmit={submitForm} autoComplete="off" className="cd-form">
                <FormGroup num="01" label="YOUR INFORMATION">
                  <Row>
                    <Field label="First Name" required>
                      <input
                        className="cd-input"
                        required
                        value={form.first_name}
                        onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                      />
                    </Field>
                    <Field label="Last Name" required>
                      <input
                        className="cd-input"
                        required
                        value={form.last_name}
                        onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                      />
                    </Field>
                  </Row>
                  <Row>
                    <Field label="Email" required>
                      <input
                        className="cd-input"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </Field>
                    <Field label="Phone" required>
                      <input
                        className="cd-input"
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </Field>
                  </Row>
                </FormGroup>

                <FormGroup num="02" label="BRAND + SOCIALS">
                  <Field label="Business or Brand Name" required>
                    <input
                      className="cd-input"
                      required
                      value={form.business_name}
                      onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                    />
                  </Field>
                  <Row>
                    <Field label="Instagram Handle" required>
                      <input
                        className="cd-input"
                        required
                        placeholder="@yourhandle"
                        value={form.instagram_handle}
                        onChange={(e) => setForm({ ...form, instagram_handle: e.target.value })}
                      />
                    </Field>
                    <Field label="TikTok Handle" optional>
                      <input
                        className="cd-input"
                        placeholder="@yourhandle"
                        value={form.tiktok_handle}
                        onChange={(e) => setForm({ ...form, tiktok_handle: e.target.value })}
                      />
                    </Field>
                  </Row>
                </FormGroup>

                <FormGroup num="03" label="SHOOT DETAILS">
                  <Field label="Preferred Shoot City" required>
                    <div className="cd-chips">
                      {CITY_OPTIONS.map((opt) => (
                        <button
                          type="button"
                          key={opt}
                          className={`cd-chip ${form.preferred_shoot_city === opt ? 'active' : ''}`}
                          onClick={() => setForm({ ...form, preferred_shoot_city: opt })}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field
                    label="Preferred Shoot Date"
                    hint="approximate is fine. We'll confirm on the call"
                  >
                    <input
                      className="cd-input"
                      type="date"
                      min={today}
                      value={form.preferred_date}
                      onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
                    />
                  </Field>
                  <Field label="Are you ready to book your Content Day?" required>
                    <div className="cd-chips cd-chips-stack">
                      {READY_OPTIONS.map((opt) => (
                        <button
                          type="button"
                          key={opt.value}
                          className={`cd-chip cd-chip-wide ${form.ready_to_book === opt.value ? 'active' : ''}`}
                          onClick={() => setForm({ ...form, ready_to_book: opt.value })}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="How did you hear about CJE Media?" optional>
                    <input
                      className="cd-input"
                      placeholder="Instagram, TikTok, a friend, etc."
                      value={form.how_heard}
                      onChange={(e) => setForm({ ...form, how_heard: e.target.value })}
                    />
                  </Field>
                </FormGroup>

                <div className="cd-submit-wrap">
                  <button type="submit" className="cd-submit-btn" disabled={submitting}>
                    {submitting ? 'SUBMITTING...' : 'CONTINUE TO SCHEDULING'}
                    {!submitting && <ArrowRight size={16} strokeWidth={2.5} />}
                  </button>
                  <p className="cd-submit-note">
                    Next: pick a quick call to confirm your shoot date.
                  </p>
                </div>
              </form>
            </section>

            <BandFooter />
          </>
        )}

        {/* =========================================
            SCHEDULING
            ========================================= */}
        {step === 'schedule' && (
          <>
            <section className="cd-step-hero">
              <div className="cd-rule" />
              <h1 className="cd-title cd-title-step">
                <span className="cd-title-line cd-black">LOCK</span>
                <span className="cd-title-line cd-tiffany">IN</span>
                <span className="cd-title-line cd-black">YOUR</span>
                <span className="cd-title-line cd-tiffany">DATE</span>
              </h1>
              <div className="cd-rule" />
              <div className="cd-hero-sub">
                <p className="cd-hero-sub-lead">STEP 02 / 02. SCHEDULE YOUR CALL</p>
                <p className="cd-hero-sub-tag">
                  AVAILABILITY: MONDAY-SATURDAY · 8 AM-7 PM CENTRAL
                </p>
              </div>
            </section>

            <section className="cd-form-section">
              <div className="cd-callout">
                <span className="cd-callout-mark">!</span>
                <div>
                  <strong>YOUR CALL TIME IS NOT YOUR SHOOT TIME.</strong>
                  <br />
                  We use this call to talk through your vision and confirm your shoot date.
                  Shoot time is locked in after the call.
                </div>
              </div>

              <form onSubmit={bookCall} autoComplete="off" className="cd-form">
                <FormGroup num="01" label="PICK A DATE">
                  <Field label="Choose your call date">
                    <input
                      className="cd-input"
                      type="date"
                      min={today}
                      required
                      value={callDate}
                      onChange={(e) => setCallDate(e.target.value)}
                    />
                  </Field>
                </FormGroup>

                {callDate && (
                  <FormGroup num="02" label="PICK A TIME">
                    {loadingSlots ? (
                      <div className="cd-loading">LOADING AVAILABLE TIMES...</div>
                    ) : slotsError ? (
                      <div className="cd-error-msg">{slotsError}</div>
                    ) : (
                      <div className="cd-time-grid">
                        {slots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            className={`cd-time-btn ${callTime === slot ? 'active' : ''}`}
                            onClick={() => setCallTime(slot)}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </FormGroup>
                )}

                <div className="cd-submit-wrap">
                  <button
                    type="submit"
                    className="cd-submit-btn"
                    disabled={submitting || !callDate || !callTime}
                  >
                    {submitting ? 'BOOKING...' : 'CONFIRM MY CALL'}
                    {!submitting && <ArrowRight size={16} strokeWidth={2.5} />}
                  </button>
                  <p className="cd-submit-note">
                    You'll receive a calendar invite and Google Meet link by email.
                  </p>
                </div>
              </form>
            </section>

            <BandFooter />
          </>
        )}

        {/* =========================================
            CONFIRMED
            ========================================= */}
        {step === 'confirmed' && (
          <>
            <section className="cd-confirmed-section">
              <div className="cd-rule" />
              <div className="cd-check-mark">
                <Check strokeWidth={3} />
              </div>
              <h1 className="cd-title cd-title-step">
                <span className="cd-title-line cd-black">YOU'RE</span>
                <span className="cd-title-line cd-tiffany">ALMOST</span>
                <span className="cd-title-line cd-black">BOOKED.</span>
              </h1>
              <div className="cd-rule" />

              {friendlyConfirmedDate && confirmedCallTime && (
                <div className="cd-confirmed-block">
                  <div className="cd-confirmed-eyebrow">YOUR CALL</div>
                  <div className="cd-confirmed-when">{friendlyConfirmedDate.toUpperCase()}</div>
                  <div className="cd-confirmed-time">{confirmedCallTime} CENTRAL</div>
                </div>
              )}

              <p className="cd-confirmed-body">
                Thank you for your interest in CJE Content Days. We'll use this call to
                confirm your shoot date, talk through your vision, and secure your spot.
              </p>

              <div className="cd-confirmed-note">
                <strong>CHECK YOUR INBOX</strong>. Your calendar invite and Google Meet
                link are on the way.
              </div>

              <div className="cd-confirmed-sig">CIARA J.</div>
            </section>

            <BandFooter />
          </>
        )}
      </div>
    </>
  )
}

// ============== Helper components ==============

function FeatureRow({
  variant,
  icon,
  title,
  tagline,
}: {
  variant: 'black' | 'tiffany'
  icon: React.ReactNode
  title: string
  tagline: string
}) {
  return (
    <div className="cd-feature-row">
      <div className={`cd-feature-icon cd-feature-icon-${variant}`}>{icon}</div>
      <div className="cd-feature-text">
        <div className="cd-feature-title">{title}</div>
        <div className="cd-feature-tagline">{tagline}</div>
      </div>
    </div>
  )
}

/**
 * Custom "48H" icon. Circular arrow with "48H" text inside.
 * Built inline so we don't need a custom icon library.
 */
function FortyEightHourIcon() {
  return (
    <div className="cd-48h">
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path
          d="M40 24a16 16 0 1 1-4.7-11.3"
          strokeLinecap="round"
        />
        <path d="M40 6v8h-8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="cd-48h-text">48H</span>
    </div>
  )
}

function BandFooter({
  clickable,
  onClick,
}: {
  clickable?: boolean
  onClick?: () => void
}) {
  if (clickable) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="cd-band cd-band-clickable"
      >
        <span className="cd-band-line-1">LIMITED SPOTS AVAILABLE</span>
        <span className="cd-band-line-2">BOOK YOUR CONTENT DAY TODAY!</span>
      </button>
    )
  }
  return (
    <div className="cd-band">
      <span className="cd-band-line-1">LIMITED SPOTS AVAILABLE</span>
      <span className="cd-band-line-2">BOOK YOUR CONTENT DAY TODAY!</span>
    </div>
  )
}

function FormGroup({
  num,
  label,
  children,
}: {
  num: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="cd-form-group">
      <div className="cd-form-group-title">
        <span className="cd-form-group-num">{num}</span>
        <span className="cd-form-group-label">{label}</span>
      </div>
      {children}
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="cd-field-row">{children}</div>
}

function Field({
  label,
  required,
  optional,
  hint,
  children,
}: {
  label: string
  required?: boolean
  optional?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="cd-field">
      <label className="cd-field-label">
        {label}
        {required && <span className="cd-req">*</span>}
        {optional && <span className="cd-opt"> · optional</span>}
        {hint && <span className="cd-hint"> · {hint}</span>}
      </label>
      {children}
    </div>
  )
}

// ============== Styles ==============
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap');

.cd-page {
  --cd-black: #0a0a0a;
  --cd-ink: #1a1a1a;
  --cd-white: #ffffff;
  --cd-paper: #fafafa;
  --cd-tiffany: #81D8D0;
  --cd-tiffany-deep: #5FB5AD;
  --cd-tiffany-soft: #d4f0ed;
  --cd-border: #e8e8e8;
  --cd-gray-700: #4a4a4a;
  --cd-gray-500: #8a8a8a;
  --cd-gray-300: #c8c8c8;
  font-family: 'Montserrat', sans-serif;
  color: var(--cd-ink);
  font-weight: 400;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: var(--cd-white);
  min-height: 100vh;
  overflow-x: hidden;
}

* { box-sizing: border-box; }

/* ============= Topbar ============= */
.cd-topbar {
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--cd-border);
  z-index: 50;
  padding: 1.1rem 1.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.cd-topbar-mark {
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.25em;
  color: var(--cd-black);
}
.cd-topbar-mark span {
  color: var(--cd-tiffany);
  font-weight: 800;
}
.cd-topbar-back {
  background: none;
  border: none;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.7rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--cd-black);
  font-weight: 700;
  cursor: pointer;
  padding: 0.4rem 0.6rem;
  transition: color 0.2s;
}
.cd-topbar-back:hover {
  color: var(--cd-tiffany-deep);
}

/* ============= Horizontal Tiffany rule ============= */
.cd-rule {
  width: 90px;
  height: 3px;
  background: var(--cd-tiffany);
  margin: 0 auto;
}

/* ============= Hero / Stacked Title ============= */
.cd-hero {
  padding: 4rem 1.75rem 3rem;
  text-align: left;
  max-width: 720px;
  margin: 0 auto;
}
.cd-step-hero {
  padding: 3rem 1.75rem 2.5rem;
  text-align: left;
  max-width: 720px;
  margin: 0 auto;
}

.cd-title {
  margin: 1.75rem 0 1.75rem;
  font-weight: 900;
  line-height: 0.92;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  font-size: clamp(3.25rem, 14vw, 6rem);
  display: flex;
  flex-direction: column;
  gap: 0;
}
.cd-title-step {
  font-size: clamp(2.5rem, 10vw, 4.5rem);
}
.cd-title-line {
  display: block;
}
.cd-black { color: var(--cd-black); }
.cd-tiffany { color: var(--cd-tiffany); }

.cd-hero-sub {
  margin-top: 1.75rem;
}
.cd-hero-sub-lead {
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--cd-black);
  margin: 0 0 0.5rem;
  text-transform: uppercase;
}
.cd-hero-sub-tag {
  font-size: 0.8rem;
  letter-spacing: 0.2em;
  color: var(--cd-gray-700);
  font-weight: 500;
  text-transform: uppercase;
  margin: 0;
}

/* ============= Feature Rows ============= */
.cd-features {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 1.75rem 2rem;
}
.cd-feature-row {
  display: grid;
  grid-template-columns: 100px 1fr;
  align-items: stretch;
  margin-bottom: 0.5rem;
  background: var(--cd-white);
}
.cd-feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
}
.cd-feature-icon svg {
  width: 44px;
  height: 44px;
}
.cd-feature-icon-black {
  background: var(--cd-black);
  color: var(--cd-tiffany);
}
.cd-feature-icon-tiffany {
  background: var(--cd-tiffany);
  color: var(--cd-black);
}

.cd-feature-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 1.25rem;
  border-top: 1px solid var(--cd-border);
  border-right: 1px solid var(--cd-border);
  border-bottom: 1px solid var(--cd-border);
}
.cd-feature-title {
  font-size: clamp(0.95rem, 2.6vw, 1.15rem);
  font-weight: 800;
  letter-spacing: 0.05em;
  color: var(--cd-black);
  text-transform: uppercase;
  margin-bottom: 0.35rem;
  line-height: 1.2;
}
.cd-feature-tagline {
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  color: var(--cd-gray-700);
  font-weight: 500;
  text-transform: uppercase;
  line-height: 1.4;
}

/* 48H custom icon */
.cd-48h {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cd-48h svg {
  width: 48px !important;
  height: 48px !important;
  position: absolute;
  inset: 0;
}
.cd-48h-text {
  position: absolute;
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.05em;
  color: currentColor;
}

/* ============= Price Block ============= */
.cd-price-section {
  max-width: 720px;
  margin: 1.5rem auto 0;
  padding: 0 1.75rem;
}
.cd-price-rule {
  height: 3px;
  background: var(--cd-tiffany);
  width: 100%;
}
.cd-price-block {
  background: var(--cd-black);
  padding: 3rem 1.5rem;
  text-align: center;
}
.cd-price-num {
  font-size: clamp(5rem, 18vw, 9rem);
  font-weight: 900;
  color: var(--cd-tiffany);
  line-height: 1;
  letter-spacing: -0.04em;
  margin-bottom: 1rem;
}
.cd-price-currency {
  font-size: 0.55em;
  vertical-align: top;
  display: inline-block;
  margin-right: 0.05em;
  margin-top: 0.15em;
  font-weight: 800;
}
.cd-price-line-1 {
  font-size: clamp(0.95rem, 3vw, 1.25rem);
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--cd-white);
  text-transform: uppercase;
  margin-bottom: 0.4rem;
}
.cd-price-line-2 {
  font-size: clamp(0.95rem, 3vw, 1.25rem);
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--cd-tiffany);
  text-transform: uppercase;
}

/* ============= Big black CTA button ============= */
.cd-cta-wrap {
  max-width: 720px;
  margin: 2.5rem auto 0;
  padding: 0 1.75rem;
  text-align: center;
}
.cd-cta-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: var(--cd-black);
  color: var(--cd-white);
  border: none;
  padding: 1.25rem 2.5rem;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.25s ease;
  width: auto;
  min-width: 280px;
}
.cd-cta-btn:hover {
  background: var(--cd-tiffany);
  color: var(--cd-black);
}
.cd-cta-btn svg,
.cd-submit-btn svg {
  display: inline-block;
  transition: transform 0.25s;
}
.cd-cta-btn:hover svg,
.cd-submit-btn:hover svg {
  transform: translateX(4px);
}

/* ============= Band Footer (Tiffany band) ============= */
.cd-band {
  background: var(--cd-tiffany);
  color: var(--cd-black);
  padding: 1.75rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  margin-top: 3.5rem;
  border: none;
  width: 100%;
  font-family: 'Montserrat', sans-serif;
}
.cd-band-clickable {
  cursor: pointer;
  transition: background 0.25s;
}
.cd-band-clickable:hover {
  background: var(--cd-tiffany-deep);
  color: var(--cd-white);
}
.cd-band-line-1 {
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}
.cd-band-line-2 {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

/* ============= Form ============= */
.cd-form-section {
  max-width: 720px;
  margin: 0 auto;
  padding: 1rem 1.75rem 3rem;
}
.cd-form {
  margin-top: 1rem;
}

/* Callout (on scheduling step) */
.cd-callout {
  display: flex;
  gap: 1rem;
  background: var(--cd-tiffany-soft);
  border-left: 4px solid var(--cd-tiffany);
  padding: 1.25rem 1.5rem;
  margin: 0 0 3rem;
  font-size: 0.85rem;
  color: var(--cd-ink);
  line-height: 1.6;
}
.cd-callout-mark {
  background: var(--cd-tiffany);
  color: var(--cd-black);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 1rem;
  flex-shrink: 0;
}
.cd-callout strong {
  color: var(--cd-black);
  font-weight: 800;
  letter-spacing: 0.05em;
}

.cd-form-group {
  margin-bottom: 3rem;
}
.cd-form-group-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--cd-black);
}
.cd-form-group-num {
  background: var(--cd-tiffany);
  color: var(--cd-black);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 0.8rem;
  letter-spacing: 0;
  flex-shrink: 0;
}
.cd-form-group-label {
  font-size: 0.85rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-weight: 800;
  color: var(--cd-black);
}

.cd-field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}
.cd-field {
  margin-bottom: 1.25rem;
}
.cd-field-label {
  display: block;
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--cd-black);
  margin-bottom: 0.55rem;
  font-weight: 700;
}
.cd-req {
  color: var(--cd-tiffany-deep);
  font-weight: 900;
  margin-left: 0.15em;
}
.cd-opt,
.cd-hint {
  color: var(--cd-gray-500);
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.05em;
  font-size: 0.95em;
}

.cd-input {
  width: 100%;
  background: var(--cd-white);
  border: 1.5px solid var(--cd-black);
  padding: 0.95rem 1rem;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--cd-black);
  outline: none;
  transition: all 0.2s;
}
.cd-input:focus {
  border-color: var(--cd-tiffany);
  background: var(--cd-tiffany-soft);
}
.cd-input::placeholder {
  color: var(--cd-gray-500);
  font-weight: 400;
}

/* Chips */
.cd-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.cd-chips-stack {
  flex-direction: column;
}
.cd-chip {
  background: var(--cd-white);
  border: 1.5px solid var(--cd-black);
  padding: 0.85rem 1.5rem;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--cd-black);
  cursor: pointer;
  transition: all 0.15s;
}
.cd-chip-wide {
  width: 100%;
  text-align: left;
  padding: 1.1rem 1.25rem;
}
.cd-chip:hover {
  background: var(--cd-tiffany-soft);
}
.cd-chip.active {
  background: var(--cd-black);
  color: var(--cd-white);
  border-color: var(--cd-black);
}

/* Time slot grid */
.cd-time-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(105px, 1fr));
  gap: 0.5rem;
}
.cd-time-btn {
  background: var(--cd-white);
  border: 1.5px solid var(--cd-black);
  padding: 0.9rem 0.5rem;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--cd-black);
  cursor: pointer;
  transition: all 0.15s;
}
.cd-time-btn:hover {
  background: var(--cd-tiffany-soft);
}
.cd-time-btn.active {
  background: var(--cd-tiffany);
  color: var(--cd-black);
  border-color: var(--cd-tiffany);
}
.cd-loading,
.cd-error-msg {
  text-align: center;
  padding: 2rem 1rem;
  font-size: 0.8rem;
  letter-spacing: 0.15em;
  font-weight: 600;
  text-transform: uppercase;
  border: 1.5px dashed var(--cd-border);
  color: var(--cd-gray-500);
}
.cd-error-msg {
  color: var(--cd-tiffany-deep);
  border-color: var(--cd-tiffany);
}

/* Submit */
.cd-submit-wrap {
  text-align: center;
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 2px solid var(--cd-black);
}
.cd-submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: var(--cd-black);
  color: var(--cd-white);
  border: none;
  padding: 1.25rem 2.5rem;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.25s;
  min-width: 280px;
}
.cd-submit-btn:hover:not(:disabled) {
  background: var(--cd-tiffany);
  color: var(--cd-black);
}
.cd-submit-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.cd-submit-note {
  font-size: 0.7rem;
  color: var(--cd-gray-500);
  margin-top: 1.25rem;
  letter-spacing: 0.05em;
}

/* ============= Confirmed ============= */
.cd-confirmed-section {
  max-width: 720px;
  margin: 0 auto;
  padding: 4rem 1.75rem 2rem;
  text-align: left;
}
.cd-check-mark {
  width: 64px;
  height: 64px;
  background: var(--cd-tiffany);
  color: var(--cd-black);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 2rem 0;
}
.cd-check-mark svg {
  width: 36px;
  height: 36px;
}

.cd-confirmed-block {
  background: var(--cd-black);
  color: var(--cd-white);
  padding: 2rem 1.75rem;
  margin: 2.5rem 0;
  border-left: 4px solid var(--cd-tiffany);
}
.cd-confirmed-eyebrow {
  font-size: 0.7rem;
  letter-spacing: 0.3em;
  font-weight: 700;
  color: var(--cd-tiffany);
  text-transform: uppercase;
  margin-bottom: 0.75rem;
}
.cd-confirmed-when {
  font-size: clamp(1.1rem, 3.5vw, 1.5rem);
  font-weight: 800;
  letter-spacing: 0.05em;
  color: var(--cd-white);
  margin-bottom: 0.4rem;
  text-transform: uppercase;
}
.cd-confirmed-time {
  font-size: 0.85rem;
  letter-spacing: 0.2em;
  font-weight: 600;
  color: var(--cd-tiffany);
  text-transform: uppercase;
}

.cd-confirmed-body {
  font-size: 0.95rem;
  color: var(--cd-gray-700);
  line-height: 1.7;
  margin-bottom: 2rem;
}
.cd-confirmed-note {
  background: var(--cd-tiffany-soft);
  padding: 1.25rem 1.5rem;
  font-size: 0.85rem;
  color: var(--cd-ink);
  border-left: 4px solid var(--cd-tiffany);
  margin-bottom: 2rem;
  letter-spacing: 0.02em;
}
.cd-confirmed-note strong {
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--cd-black);
}
.cd-confirmed-sig {
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.3em;
  color: var(--cd-tiffany-deep);
  text-transform: uppercase;
  margin-top: 1rem;
}

/* ============= Mobile ============= */
@media (max-width: 640px) {
  .cd-hero {
    padding: 3rem 1.25rem 2.5rem;
  }
  .cd-step-hero {
    padding: 2.5rem 1.25rem 2rem;
  }
  .cd-features {
    padding: 0 1.25rem 1.5rem;
  }
  .cd-price-section {
    padding: 0 1.25rem;
  }
  .cd-cta-wrap {
    padding: 0 1.25rem;
  }
  .cd-form-section {
    padding: 0.5rem 1.25rem 2.5rem;
  }
  .cd-confirmed-section {
    padding: 3rem 1.25rem 1.5rem;
  }
  .cd-topbar {
    padding: 1rem 1.25rem;
  }

  /* Stacked feature rows: smaller icon, tighter spacing */
  .cd-feature-row {
    grid-template-columns: 78px 1fr;
  }
  .cd-feature-icon {
    width: 78px;
    height: 78px;
  }
  .cd-feature-icon svg {
    width: 34px;
    height: 34px;
  }
  .cd-48h svg {
    width: 38px !important;
    height: 38px !important;
  }
  .cd-48h-text {
    font-size: 0.55rem;
  }
  .cd-feature-text {
    padding: 0 1rem;
  }

  /* Form: single column rows on mobile */
  .cd-field-row {
    grid-template-columns: 1fr;
    gap: 0;
    margin-bottom: 0;
  }

  /* Buttons full width */
  .cd-cta-btn,
  .cd-submit-btn {
    width: 100%;
    min-width: 0;
    padding: 1.1rem 1.25rem;
    font-size: 0.75rem;
    letter-spacing: 0.2em;
  }

  /* Time grid: tighter */
  .cd-time-grid {
    grid-template-columns: repeat(auto-fill, minmax(95px, 1fr));
  }

  /* Band footer: tighten spacing */
  .cd-band {
    padding: 1.5rem 1.25rem;
    margin-top: 2.5rem;
  }
  .cd-band-line-1 {
    font-size: 0.75rem;
    letter-spacing: 0.25em;
  }
  .cd-band-line-2 {
    font-size: 0.65rem;
    letter-spacing: 0.15em;
  }
}
`
