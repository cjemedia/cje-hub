'use client'

import { useState, FormEvent } from 'react'

const IDEAL_GUEST_OPTIONS = ['Couples', 'Families', 'Business Travelers', 'Girls Trips', 'Content Creators', 'Not Sure']
const VIBE_OPTIONS = ['Luxury', 'Cozy', 'Modern', 'Fun / Trendy', 'Relaxing', 'I Trust Your Direction']
const MUSIC_OPTIONS = ['Trending', 'Chill', 'R&B', 'Afrobeats', 'I Trust Your Direction']

export default function AirbnbMarketingPage() {
  const [unlocked, setUnlocked] = useState(false)
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '', social_handles: '',
    property_location: '', airbnb_link: '',
    ideal_guest: [] as string[],
    highlights: '', special_features: '',
    vibe: [] as string[], music_preference: '',
    preferred_start_date: '', availability: '', access_method: '', other_notes: '',
  })

  async function checkPassword(e: FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/marketing-inquiries/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwInput.trim() }),
      })
      if (res.ok) {
        setUnlocked(true)
        setPwError('')
      } else {
        setPwError('Incorrect password')
        setPwInput('')
      }
    } catch {
      setPwError('Connection error')
    }
  }

  function toggleArray(field: 'ideal_guest' | 'vibe', value: string) {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }))
  }

  async function submitForm(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/marketing-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Submission failed')
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      alert('Something went wrong. Please try again or email media@ciarajevans.com.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {!unlocked && (
        <div className="amk-gate">
          <div className="amk-gate-bg"></div>
          <div className="amk-gate-card">
            <div className="amk-gate-mark">CJE</div>
            <div className="amk-gate-tag">Media</div>
            <div className="amk-gate-divider"></div>
            <div className="amk-gate-heading">Reserved Access</div>
            <p className="amk-gate-text">
              This page is reserved for CJE Airbnb Marketing clients. Please enter your password to continue.
            </p>
            <form onSubmit={checkPassword} className="amk-gate-input-wrap">
              <input
                type="password"
                className="amk-gate-input"
                placeholder="ENTER PASSWORD"
                value={pwInput}
                onChange={(e) => setPwInput(e.target.value)}
                autoComplete="off"
                autoFocus
              />
              <button type="submit" className="amk-gate-btn">Enter</button>
            </form>
            <div className="amk-gate-error">{pwError}</div>
          </div>
        </div>
      )}

      {unlocked && !submitted && (
        <div className="amk-page">
          <header className="amk-topbar">
            <div className="amk-topbar-mark">CJE <span>Media</span></div>
            <a href="#form" className="amk-topbar-cta">Begin</a>
          </header>

          <section className="amk-hero">
            <div className="amk-hero-tag">Spring 2026 · Airbnb Marketing</div>
            <h1>Content That Sells<br/>Experiences<span className="amk-script">,</span><br/>Not Just Stays.</h1>
            <p className="amk-hero-sub">
              Strategic content designed to elevate your property's visibility, attract the right guests, and drive consistent bookings.
            </p>
            <div className="amk-hero-pill">Limited Spring Release</div>
          </section>

          <section className="amk-offer">
            <div className="amk-offer-inner">
              <div className="amk-section-eyebrow">The Spring Package</div>
              <div className="amk-offer-name">Spring Content Package</div>
              <div className="amk-offer-price"><span className="amk-currency">$</span>350</div>
              <div className="amk-offer-meta">One-Time · Introductory Rate</div>
              <div className="amk-offer-includes">
                {['4 Reels Created', 'Property Filming', 'Edited & Ready to Post', 'Instagram & / or TikTok'].map((label, i) => (
                  <div key={label} className="amk-offer-include">
                    <div className="amk-offer-include-num">{String(i+1).padStart(2,'0')}</div>
                    <div className="amk-offer-include-label">{label}</div>
                  </div>
                ))}
              </div>
              <div className="amk-offer-fineprint">Limited-time introductory pricing</div>
            </div>
          </section>

          <section className="amk-continuation">
            <div className="amk-continuation-head">
              <div className="amk-section-eyebrow">After Your First Month</div>
              <h2>Continue the momentum.</h2>
              <p className="amk-continuation-sub">Choose the level of ongoing support that fits your property and your time.</p>
            </div>
            <div className="amk-tier-grid">
              <div className="amk-tier">
                <div className="amk-tier-name">Strategy Only</div>
                <div className="amk-tier-price">$300<span className="amk-small">/mo</span></div>
                <div className="amk-tier-tag">For self-managing hosts.</div>
                <div className="amk-tier-desc">Content direction and monthly planning to keep your listing visible.</div>
              </div>
              <div className="amk-tier">
                <div className="amk-tier-name">Strategy + Editing</div>
                <div className="amk-tier-price">$500<span className="amk-small">/mo</span></div>
                <div className="amk-tier-tag">For hosts who want a steady feed.</div>
                <div className="amk-tier-desc">Content direction plus 4–6 edited posts per month, ready to publish.</div>
              </div>
              <div className="amk-tier">
                <div className="amk-tier-name">Full Marketing</div>
                <div className="amk-tier-price">$650<span className="amk-small">+/mo</span></div>
                <div className="amk-tier-tag">Hands-off, fully managed.</div>
                <div className="amk-tier-desc">Strategy, editing, captions, and posting support — start to finish.</div>
              </div>
            </div>
          </section>

          <section className="amk-form-section" id="form">
            <div className="amk-form-inner">
              <div className="amk-form-head">
                <div className="amk-section-eyebrow">Step Into the Vision</div>
                <h2>Property Vision Form</h2>
                <p>Please complete this form so we can align on your property, content direction, and filming schedule.</p>
              </div>

              <form onSubmit={submitForm} autoComplete="off">
                <FormGroup num="01" label="Client Information">
                  <Row>
                    <Field label="First Name" required>
                      <input className="amk-input" required value={form.first_name}
                        onChange={e => setForm({...form, first_name: e.target.value})} />
                    </Field>
                    <Field label="Last Name" required>
                      <input className="amk-input" required value={form.last_name}
                        onChange={e => setForm({...form, last_name: e.target.value})} />
                    </Field>
                  </Row>
                  <Row>
                    <Field label="Email" required>
                      <input className="amk-input" type="email" required value={form.email}
                        onChange={e => setForm({...form, email: e.target.value})} />
                    </Field>
                    <Field label="Phone" required>
                      <input className="amk-input" type="tel" required value={form.phone}
                        onChange={e => setForm({...form, phone: e.target.value})} />
                    </Field>
                  </Row>
                  <Field label="Social Handles" optional>
                    <input className="amk-input" placeholder="Instagram, TikTok, Threads, Facebook, N/A"
                      value={form.social_handles}
                      onChange={e => setForm({...form, social_handles: e.target.value})} />
                  </Field>
                </FormGroup>

                <FormGroup num="02" label="Property Information">
                  <Field label="Property Location" required>
                    <input className="amk-input" required placeholder="City, State"
                      value={form.property_location}
                      onChange={e => setForm({...form, property_location: e.target.value})} />
                  </Field>
                  <Field label="Airbnb Link" optional>
                    <input className="amk-input" type="url" placeholder="https://"
                      value={form.airbnb_link}
                      onChange={e => setForm({...form, airbnb_link: e.target.value})} />
                  </Field>
                </FormGroup>

                <FormGroup num="03" label="Content Direction">
                  <Field label="Who is your ideal guest?" hint="Select all that apply">
                    <div className="amk-chips">
                      {IDEAL_GUEST_OPTIONS.map(opt => (
                        <div key={opt}
                          className={`amk-chip ${form.ideal_guest.includes(opt) ? 'active' : ''}`}
                          onClick={() => toggleArray('ideal_guest', opt)}>
                          {opt}
                        </div>
                      ))}
                    </div>
                  </Field>
                  <Field label="What areas should be highlighted?">
                    <textarea className="amk-textarea"
                      placeholder="Living room, primary suite, kitchen, outdoor space..."
                      value={form.highlights}
                      onChange={e => setForm({...form, highlights: e.target.value})} />
                  </Field>
                  <Field label="Any special features of the home?">
                    <textarea className="amk-textarea"
                      placeholder="Hot tub, theater room, view, designer details..."
                      value={form.special_features}
                      onChange={e => setForm({...form, special_features: e.target.value})} />
                  </Field>
                  <Field label="Preferred Vibe" hint="Select all that apply">
                    <div className="amk-chips">
                      {VIBE_OPTIONS.map(opt => (
                        <div key={opt}
                          className={`amk-chip ${form.vibe.includes(opt) ? 'active' : ''}`}
                          onClick={() => toggleArray('vibe', opt)}>
                          {opt}
                        </div>
                      ))}
                    </div>
                  </Field>
                  <Field label="Music Preference" optional hint="Select one">
                    <div className="amk-chips">
                      {MUSIC_OPTIONS.map(opt => (
                        <div key={opt}
                          className={`amk-chip ${form.music_preference === opt ? 'active' : ''}`}
                          onClick={() => setForm({
                            ...form,
                            music_preference: form.music_preference === opt ? '' : opt
                          })}>
                          {opt}
                        </div>
                      ))}
                    </div>
                  </Field>
                </FormGroup>

                <FormGroup num="04" label="Filming Logistics">
                  <Row>
                    <Field label="Preferred Start Date">
                      <input className="amk-input" type="date"
                        value={form.preferred_start_date}
                        onChange={e => setForm({...form, preferred_start_date: e.target.value})} />
                    </Field>
                    <Field label="Property Access">
                      <select className="amk-input"
                        value={form.access_method}
                        onChange={e => setForm({...form, access_method: e.target.value})}>
                        <option value="">Select method</option>
                        <option>Lockbox</option>
                        <option>Smart Lock</option>
                        <option>Owner Will Meet</option>
                        <option>Other</option>
                      </select>
                    </Field>
                  </Row>
                  <Field label="Availability for Filming">
                    <textarea className="amk-textarea"
                      placeholder="Please list 2–3 available dates and times"
                      value={form.availability}
                      onChange={e => setForm({...form, availability: e.target.value})} />
                  </Field>
                  <Field label="Anything Else I Should Know?" optional>
                    <textarea className="amk-textarea"
                      placeholder="Anything that would help us prepare..."
                      value={form.other_notes}
                      onChange={e => setForm({...form, other_notes: e.target.value})} />
                  </Field>
                </FormGroup>

                <div className="amk-submit-wrap">
                  <button type="submit" className="amk-submit-btn" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Vision'}
                  </button>
                  <p className="amk-submit-note">After submitting, you'll receive your $350 deposit link via email.</p>
                </div>
              </form>
            </div>
          </section>

          <footer className="amk-footer">
            <div className="amk-footer-mark">CJE <span>Media</span></div>
            <div>Tech Solutions · Strategy · Content</div>
            <div className="amk-footer-row">
              <a href="mailto:media@ciarajevans.com">media@ciarajevans.com</a>
              <span>773.727.8262</span>
              <a href="https://ciarajevans.com">ciarajevans.com</a>
            </div>
          </footer>
        </div>
      )}

      {submitted && (
        <div className="amk-thanks-wrap">
          <div className="amk-thanks-inner">
            <div className="amk-thanks-mark">✓</div>
            <h2>Thank you<span className="amk-script">.</span></h2>
            <p>
              Your Property Vision Form has been received. Ciara will review everything and send your $350 deposit link to your inbox shortly. Once payment is complete, we'll lock in your filming dates.
            </p>
            <div className="amk-thanks-meta">— Ciara, CJE Media</div>
          </div>
        </div>
      )}
    </>
  )
}

// ============== Helper components ==============
function FormGroup({ num, label, children }: { num: string; label: string; children: React.ReactNode }) {
  return (
    <div className="amk-form-group">
      <div className="amk-form-group-title">
        <span className="amk-form-group-num">{num}</span>
        <span className="amk-form-group-label">{label}</span>
      </div>
      {children}
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="amk-field-row">{children}</div>
}

function Field({ label, required, optional, hint, children }: {
  label: string; required?: boolean; optional?: boolean; hint?: string; children: React.ReactNode
}) {
  return (
    <div className="amk-field">
      <label className="amk-field-label">
        {label}
        {required && <span className="amk-req"> ·</span>}
        {optional && <span className="amk-opt">optional</span>}
        {hint && <span className="amk-hint"> — {hint}</span>}
      </label>
      {children}
    </div>
  )
}

// ============== Styles ==============
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400;500;600;700;800&family=Allura&display=swap');

.amk-gate, .amk-page, .amk-thanks-wrap {
  --amk-black: #0a0a0a; --amk-ink: #1a1a1a; --amk-white: #ffffff; --amk-paper: #fafaf7;
  --amk-tiffany: #0ABAB5; --amk-tiffany-deep: #089690;
  --amk-gray-700: #4a4a4a; --amk-gray-500: #8a8a8a; --amk-gray-300: #d4d4d4;
  --amk-gray-100: #efefef;
  font-family: 'Montserrat', sans-serif;
  color: var(--amk-ink); font-weight: 300; line-height: 1.6;
  -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
}
.amk-script { font-family: 'Allura', cursive; font-weight: 400; color: var(--amk-tiffany); }

.amk-gate { position: fixed; inset: 0; background: var(--amk-black); color: var(--amk-white); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 2rem; }
.amk-gate-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at top right, rgba(10,186,181,0.15), transparent 60%), radial-gradient(ellipse at bottom left, rgba(10,186,181,0.08), transparent 60%); pointer-events: none; }
.amk-gate-card { position: relative; max-width: 460px; width: 100%; text-align: center; }
.amk-gate-mark { font-size: 2.25rem; font-weight: 200; letter-spacing: 0.15em; margin-bottom: 0.25rem; }
.amk-gate-tag { font-family: 'Allura', cursive; color: var(--amk-tiffany); font-size: 1.5rem; line-height: 1; margin-bottom: 3rem; }
.amk-gate-divider { width: 40px; height: 1px; background: var(--amk-tiffany); margin: 0 auto 2rem; }
.amk-gate-heading { font-size: 0.75rem; letter-spacing: 0.3em; text-transform: uppercase; font-weight: 500; color: var(--amk-tiffany); margin-bottom: 1rem; }
.amk-gate-text { font-size: 0.95rem; color: rgba(255,255,255,0.7); margin-bottom: 2.5rem; line-height: 1.7; }
.amk-gate-input-wrap { display: flex; flex-direction: column; gap: 0.875rem; }
.amk-gate-input { width: 100%; background: transparent; border: 1px solid rgba(255,255,255,0.2); color: var(--amk-white); padding: 1rem 1.25rem; font-family: 'Montserrat', sans-serif; font-size: 0.9rem; letter-spacing: 0.1em; text-align: center; outline: none; transition: border-color 0.3s; }
.amk-gate-input:focus { border-color: var(--amk-tiffany); }
.amk-gate-input::placeholder { color: rgba(255,255,255,0.3); letter-spacing: 0.2em; }
.amk-gate-btn { background: var(--amk-tiffany); color: var(--amk-black); border: none; padding: 1rem 2rem; font-family: 'Montserrat', sans-serif; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.25em; text-transform: uppercase; cursor: pointer; transition: background 0.3s; }
.amk-gate-btn:hover { background: var(--amk-tiffany-deep); color: var(--amk-white); }
.amk-gate-error { color: #ff8a8a; font-size: 0.75rem; letter-spacing: 0.1em; margin-top: 1rem; min-height: 1rem; text-transform: uppercase; }

.amk-topbar { position: sticky; top: 0; background: rgba(255,255,255,0.92); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid var(--amk-gray-100); z-index: 50; padding: 1.25rem 2rem; display: flex; align-items: center; justify-content: space-between; }
.amk-topbar-mark { font-size: 1.1rem; font-weight: 300; letter-spacing: 0.2em; }
.amk-topbar-mark span { color: var(--amk-tiffany); font-weight: 600; }
.amk-topbar-cta { font-size: 0.7rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--amk-ink); text-decoration: none; border-bottom: 1px solid var(--amk-tiffany); padding-bottom: 2px; font-weight: 500; }

.amk-hero { position: relative; padding: 6rem 2rem 5rem; background: linear-gradient(180deg, var(--amk-paper) 0%, var(--amk-white) 100%); text-align: center; overflow: hidden; }
.amk-hero::before { content: ''; position: absolute; top: -200px; right: -200px; width: 500px; height: 500px; background: radial-gradient(circle, rgba(10,186,181,0.12), transparent 70%); pointer-events: none; }
.amk-hero-tag { font-size: 0.7rem; letter-spacing: 0.4em; text-transform: uppercase; color: var(--amk-tiffany); font-weight: 600; margin-bottom: 1.5rem; }
.amk-hero h1 { font-size: clamp(2.5rem, 7vw, 5rem); font-weight: 200; line-height: 1.05; letter-spacing: -0.02em; color: var(--amk-black); margin-bottom: 0.5rem; }
.amk-hero h1 .amk-script { font-size: 0.85em; line-height: 0.9; margin-left: 0.1em; }
.amk-hero-sub { font-size: clamp(0.95rem, 1.5vw, 1.1rem); color: var(--amk-gray-700); max-width: 620px; margin: 1.5rem auto 0; line-height: 1.7; }
.amk-hero-pill { display: inline-flex; align-items: center; gap: 0.6rem; margin-top: 2.5rem; padding: 0.6rem 1.25rem; background: var(--amk-black); color: var(--amk-white); font-size: 0.7rem; letter-spacing: 0.25em; text-transform: uppercase; font-weight: 500; }
.amk-hero-pill::before { content: ''; width: 6px; height: 6px; background: var(--amk-tiffany); border-radius: 50%; }

.amk-offer { padding: 6rem 2rem; background: var(--amk-black); color: var(--amk-white); text-align: center; position: relative; overflow: hidden; }
.amk-offer::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 30% 20%, rgba(10,186,181,0.15), transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(10,186,181,0.08), transparent 50%); pointer-events: none; }
.amk-offer-inner { position: relative; max-width: 720px; margin: 0 auto; }
.amk-section-eyebrow { font-size: 0.7rem; letter-spacing: 0.4em; text-transform: uppercase; color: var(--amk-tiffany); font-weight: 600; margin-bottom: 1.5rem; }
.amk-offer-name { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 300; margin-bottom: 2rem; }
.amk-offer-price { font-size: clamp(4.5rem, 12vw, 7.5rem); font-weight: 200; line-height: 1; letter-spacing: -0.04em; margin-bottom: 0.5rem; }
.amk-offer-price .amk-currency { font-size: 0.4em; vertical-align: top; margin-right: 0.1em; color: var(--amk-tiffany); font-weight: 300; }
.amk-offer-meta { font-size: 0.75rem; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,255,255,0.5); margin-bottom: 3rem; }
.amk-offer-includes { display: grid; grid-template-columns: repeat(2, 1fr); border-top: 1px solid rgba(255,255,255,0.12); border-bottom: 1px solid rgba(255,255,255,0.12); margin-bottom: 2rem; }
.amk-offer-include { padding: 1.5rem 1rem; border-right: 1px solid rgba(255,255,255,0.08); border-bottom: 1px solid rgba(255,255,255,0.08); text-align: center; }
.amk-offer-include:nth-child(2n) { border-right: none; }
.amk-offer-include:nth-last-child(-n+2) { border-bottom: none; }
.amk-offer-include-num { font-family: 'Allura', cursive; color: var(--amk-tiffany); font-size: 1.75rem; line-height: 1; margin-bottom: 0.25rem; }
.amk-offer-include-label { font-size: 0.7rem; letter-spacing: 0.25em; text-transform: uppercase; color: rgba(255,255,255,0.85); font-weight: 500; }
.amk-offer-fineprint { font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-top: 1rem; }

.amk-continuation { padding: 6rem 2rem; background: var(--amk-paper); text-align: center; }
.amk-continuation-head { max-width: 640px; margin: 0 auto 4rem; }
.amk-continuation h2 { font-size: clamp(1.75rem, 3.5vw, 2.5rem); font-weight: 300; color: var(--amk-black); line-height: 1.2; margin-bottom: 1rem; }
.amk-continuation-sub { font-size: 0.95rem; color: var(--amk-gray-700); }
.amk-tier-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; max-width: 1100px; margin: 0 auto; }
.amk-tier { background: var(--amk-white); border: 1px solid var(--amk-gray-100); padding: 2.5rem 2rem; text-align: left; transition: all 0.3s ease; }
.amk-tier:hover { border-color: var(--amk-tiffany); transform: translateY(-4px); box-shadow: 0 20px 40px -20px rgba(10,186,181,0.15); }
.amk-tier-name { font-size: 0.7rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--amk-tiffany); font-weight: 600; margin-bottom: 1rem; }
.amk-tier-price { font-size: 2.5rem; font-weight: 200; color: var(--amk-black); line-height: 1; margin-bottom: 0.25rem; }
.amk-tier-price .amk-small { font-size: 0.4em; color: var(--amk-gray-500); font-weight: 400; margin-left: 0.25em; }
.amk-tier-tag { font-size: 0.85rem; color: var(--amk-ink); font-weight: 500; margin-bottom: 1.25rem; }
.amk-tier-desc { font-size: 0.85rem; color: var(--amk-gray-700); line-height: 1.6; }

.amk-form-section { padding: 6rem 2rem 7rem; background: var(--amk-white); }
.amk-form-inner { max-width: 720px; margin: 0 auto; }
.amk-form-head { text-align: center; margin-bottom: 4rem; }
.amk-form-head h2 { font-size: clamp(2rem, 4vw, 2.75rem); font-weight: 300; color: var(--amk-black); margin-bottom: 1rem; }
.amk-form-head p { font-size: 0.95rem; color: var(--amk-gray-700); max-width: 520px; margin: 0 auto; }
.amk-form-group { margin-bottom: 4rem; }
.amk-form-group-title { display: flex; align-items: baseline; gap: 1rem; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid var(--amk-gray-100); }
.amk-form-group-num { font-family: 'Allura', cursive; color: var(--amk-tiffany); font-size: 1.75rem; line-height: 1; }
.amk-form-group-label { font-size: 0.75rem; letter-spacing: 0.3em; text-transform: uppercase; font-weight: 600; color: var(--amk-black); }
.amk-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
.amk-field { margin-bottom: 1.5rem; }
.amk-field-label { display: block; font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--amk-gray-700); margin-bottom: 0.6rem; font-weight: 500; }
.amk-req { color: var(--amk-tiffany); margin-left: 0.25em; }
.amk-opt { color: var(--amk-gray-500); font-weight: 400; text-transform: none; letter-spacing: 0.05em; margin-left: 0.5em; font-size: 0.85em; }
.amk-hint { color: var(--amk-gray-500); font-weight: 400; text-transform: none; letter-spacing: 0.05em; font-size: 0.9em; }
.amk-input, .amk-textarea { width: 100%; background: var(--amk-paper); border: 1px solid var(--amk-gray-100); padding: 0.95rem 1rem; font-family: 'Montserrat', sans-serif; font-size: 0.9rem; color: var(--amk-ink); outline: none; transition: all 0.2s; }
.amk-input:focus, .amk-textarea:focus { border-color: var(--amk-tiffany); background: var(--amk-white); }
.amk-textarea { min-height: 100px; resize: vertical; }
.amk-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.amk-chip { display: inline-flex; align-items: center; padding: 0.625rem 1.125rem; background: var(--amk-paper); border: 1px solid var(--amk-gray-100); font-size: 0.8rem; color: var(--amk-ink); cursor: pointer; transition: all 0.2s; user-select: none; }
.amk-chip:hover { border-color: var(--amk-gray-300); }
.amk-chip.active { background: var(--amk-black); border-color: var(--amk-black); color: var(--amk-white); }
.amk-chip.active::before { content: '✓'; margin-right: 0.5em; color: var(--amk-tiffany); font-weight: 600; }
.amk-submit-wrap { text-align: center; margin-top: 3rem; padding-top: 2.5rem; border-top: 1px solid var(--amk-gray-100); }
.amk-submit-btn { background: var(--amk-black); color: var(--amk-white); border: none; padding: 1.125rem 3rem; font-family: 'Montserrat', sans-serif; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.3em; text-transform: uppercase; cursor: pointer; transition: all 0.3s; }
.amk-submit-btn:hover:not(:disabled) { background: var(--amk-tiffany); color: var(--amk-black); }
.amk-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.amk-submit-note { font-size: 0.75rem; color: var(--amk-gray-500); margin-top: 1.25rem; }

.amk-thanks-wrap { display: flex; padding: 8rem 2rem; min-height: 100vh; align-items: center; justify-content: center; background: var(--amk-paper); }
.amk-thanks-inner { max-width: 540px; margin: 0 auto; text-align: center; }
.amk-thanks-mark { width: 60px; height: 60px; border: 1px solid var(--amk-tiffany); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; color: var(--amk-tiffany); font-size: 1.5rem; }
.amk-thanks-inner h2 { font-size: clamp(2rem, 4vw, 2.75rem); font-weight: 300; color: var(--amk-black); margin-bottom: 1.5rem; }
.amk-thanks-inner h2 .amk-script { font-size: 1.1em; }
.amk-thanks-inner p { color: var(--amk-gray-700); line-height: 1.7; font-size: 0.95rem; }
.amk-thanks-meta { margin-top: 2.5rem; font-size: 0.7rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--amk-gray-500); }

.amk-footer { background: var(--amk-black); color: rgba(255,255,255,0.6); padding: 3rem 2rem; text-align: center; font-size: 0.8rem; }
.amk-footer-mark { font-size: 1rem; font-weight: 300; letter-spacing: 0.2em; color: var(--amk-white); margin-bottom: 0.5rem; }
.amk-footer-mark span { color: var(--amk-tiffany); font-weight: 600; }
.amk-footer a { color: var(--amk-tiffany); text-decoration: none; }
.amk-footer-row { margin-top: 1.5rem; display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap; font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase; }

@media (max-width: 768px) {
  .amk-hero { padding: 4rem 1.5rem 3.5rem; }
  .amk-offer { padding: 4.5rem 1.5rem; }
  .amk-continuation { padding: 4.5rem 1.5rem; }
  .amk-form-section { padding: 4.5rem 1.5rem 5rem; }
  .amk-topbar { padding: 1rem 1.5rem; }
  .amk-tier-grid { grid-template-columns: 1fr; gap: 1rem; }
  .amk-field-row { grid-template-columns: 1fr; gap: 0; }
  .amk-topbar-cta { display: none; }
  .amk-offer-includes { grid-template-columns: 1fr; }
  .amk-offer-include { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.08); }
  .amk-offer-include:last-child { border-bottom: none; }
}
`
