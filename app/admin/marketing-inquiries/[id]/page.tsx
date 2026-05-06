'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Send, CheckCircle2, ExternalLink, Mail, Phone } from 'lucide-react'

type Inquiry = {
  id: string
  created_at: string
  first_name: string
  last_name: string
  email: string
  phone: string
  social_handles: string | null
  property_location: string
  airbnb_link: string | null
  ideal_guest: string[]
  highlights: string | null
  special_features: string | null
  vibe: string[]
  music_preference: string | null
  preferred_start_date: string | null
  availability: string | null
  access_method: string | null
  other_notes: string | null
  status: string
  payment_amount: number | null
  stripe_payment_link_url: string | null
  payment_sent_at: string | null
  paid_at: string | null
  completed_at: string | null
}

export default function InquiryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [inquiry, setInquiry] = useState<Inquiry | null>(null)
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState('350')
  const [sending, setSending] = useState(false)
  const [marking, setMarking] = useState(false)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('marketing_inquiries')
      .select('*')
      .eq('id', id)
      .single()
    setInquiry(data as Inquiry)
    setLoading(false)
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function sendPayment() {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      alert('Enter a valid amount.')
      return
    }
    if (!confirm(`Send a $${parseFloat(amount).toFixed(2)} payment link to ${inquiry?.first_name}?`)) return
    setSending(true)
    try {
      const res = await fetch(`/api/marketing-inquiries/${id}/send-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed')
      await load()
    } catch (err: any) {
      alert(err.message || 'Failed to send payment link')
    } finally {
      setSending(false)
    }
  }

  async function markPaid() {
    if (!confirm('Mark this inquiry as paid?\n\nOnly do this after confirming the Stripe payment came through (check your Stripe email or dashboard).')) return
    setMarking(true)
    try {
      const res = await fetch(`/api/marketing-inquiries/${id}/mark-paid`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed')
      await load()
    } catch {
      alert('Failed to mark paid')
    } finally {
      setMarking(false)
    }
  }

  async function markCompleted() {
    if (!confirm('Mark this inquiry as completed?')) return
    const supabase = createClient()
    const now = new Date().toISOString()
    await supabase
      .from('marketing_inquiries')
      .update({ status: 'completed', completed_at: now, updated_at: now })
      .eq('id', id)
    await load()
  }

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] text-white/50 p-10">Loading...</div>
  }
  if (!inquiry) {
    return <div className="min-h-screen bg-[#0a0a0a] text-white p-10">Not found</div>
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.push('/admin/marketing-inquiries')}
          className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-8 transition"
        >
          <ArrowLeft size={16} /> Back to Inquiries
        </button>

        <div className="mb-8">
          <div className="text-xs uppercase tracking-widest text-[#0ABAB5] mb-2">Marketing Inquiry</div>
          <h1 className="text-3xl md:text-4xl font-light">
            {inquiry.first_name} {inquiry.last_name}
          </h1>
          <div className="text-white/50 text-sm mt-2">
            Submitted {new Date(inquiry.created_at).toLocaleString()}
          </div>
        </div>

        {/* Status & Action box */}
        <div className="border border-[#0ABAB5]/30 bg-[#0ABAB5]/5 p-6 mb-10">
          <div className="text-xs uppercase tracking-widest text-[#0ABAB5] mb-4">Action</div>

          {inquiry.status === 'new' && (
            <>
              <p className="text-white/80 text-sm mb-4">
                Set the amount and send the payment link to {inquiry.first_name}.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center bg-black/40 border border-white/15 px-4 flex-1 max-w-[220px]">
                  <span className="text-white/40 mr-2">$</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="bg-transparent outline-none flex-1 py-3 text-white"
                  />
                </div>
                <button
                  onClick={sendPayment}
                  disabled={sending}
                  className="flex items-center justify-center gap-2 bg-[#0ABAB5] hover:bg-[#089690] text-black px-6 py-3 text-xs uppercase tracking-widest font-semibold transition disabled:opacity-50"
                >
                  <Send size={14} />
                  {sending ? 'Creating...' : 'Create & Send'}
                </button>
              </div>
            </>
          )}

          {inquiry.status === 'payment_sent' && (
            <>
              <div className="flex items-center gap-2 text-amber-300 mb-3">
                <span className="text-xs uppercase tracking-widest">Payment Link Sent</span>
              </div>
              <p className="text-sm text-white/70 mb-2">
                ${Number(inquiry.payment_amount).toFixed(2)} ·
                sent {inquiry.payment_sent_at && new Date(inquiry.payment_sent_at).toLocaleString()}
              </p>
              {inquiry.stripe_payment_link_url && (
                <a
                  href={inquiry.stripe_payment_link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#0ABAB5] text-sm hover:underline mb-4"
                >
                  View payment link <ExternalLink size={12} />
                </a>
              )}
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-white/50 mb-3">
                  Once Stripe confirms the payment came through:
                </p>
                <button
                  onClick={markPaid}
                  disabled={marking}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 text-xs uppercase tracking-widest font-semibold transition disabled:opacity-50"
                >
                  <CheckCircle2 size={14} />
                  {marking ? 'Marking...' : 'Mark as Paid'}
                </button>
              </div>
            </>
          )}

          {inquiry.status === 'paid' && (
            <>
              <div className="flex items-center gap-2 text-emerald-300 mb-3">
                <CheckCircle2 size={18} />
                <span className="text-xs uppercase tracking-widest">
                  Paid · ${Number(inquiry.payment_amount).toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-white/70 mb-4">
                Paid {inquiry.paid_at && new Date(inquiry.paid_at).toLocaleString()}
              </p>
              <button
                onClick={markCompleted}
                className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-2.5 text-xs uppercase tracking-widest font-semibold transition"
              >
                Mark Completed
              </button>
            </>
          )}

          {inquiry.status === 'completed' && (
            <div className="flex items-center gap-2 text-purple-300">
              <CheckCircle2 size={18} />
              <span className="text-xs uppercase tracking-widest">
                Project Completed{inquiry.completed_at && ` · ${new Date(inquiry.completed_at).toLocaleDateString()}`}
              </span>
            </div>
          )}
        </div>

        {/* Form details */}
        <Section title="Contact">
          <Detail
            label="Email"
            value={
              <a href={`mailto:${inquiry.email}`} className="text-[#0ABAB5] hover:underline inline-flex items-center gap-1.5">
                <Mail size={12} /> {inquiry.email}
              </a>
            }
          />
          <Detail
            label="Phone"
            value={
              <a href={`tel:${inquiry.phone}`} className="text-[#0ABAB5] hover:underline inline-flex items-center gap-1.5">
                <Phone size={12} /> {inquiry.phone}
              </a>
            }
          />
          {inquiry.social_handles && <Detail label="Social" value={inquiry.social_handles} />}
        </Section>

        <Section title="Property">
          <Detail label="Location" value={inquiry.property_location} />
          {inquiry.airbnb_link && (
            <Detail
              label="Airbnb"
              value={
                <a
                  href={inquiry.airbnb_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0ABAB5] hover:underline inline-flex items-center gap-1"
                >
                  View listing <ExternalLink size={12} />
                </a>
              }
            />
          )}
        </Section>

        <Section title="Content Direction">
          {inquiry.ideal_guest && inquiry.ideal_guest.length > 0 && (
            <Detail label="Ideal Guest" value={inquiry.ideal_guest.join(', ')} />
          )}
          {inquiry.highlights && <Detail label="Areas to Highlight" value={inquiry.highlights} />}
          {inquiry.special_features && <Detail label="Special Features" value={inquiry.special_features} />}
          {inquiry.vibe && inquiry.vibe.length > 0 && (
            <Detail label="Vibe" value={inquiry.vibe.join(', ')} />
          )}
          {inquiry.music_preference && <Detail label="Music" value={inquiry.music_preference} />}
        </Section>

        <Section title="Filming">
          {inquiry.preferred_start_date && (
            <Detail label="Preferred Start" value={inquiry.preferred_start_date} />
          )}
          {inquiry.availability && <Detail label="Availability" value={inquiry.availability} />}
          {inquiry.access_method && <Detail label="Access" value={inquiry.access_method} />}
          {inquiry.other_notes && <Detail label="Notes" value={inquiry.other_notes} />}
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-xs uppercase tracking-widest text-white/40 mb-4 pb-2 border-b border-white/10">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-4">
      <div className="text-xs uppercase tracking-wider text-white/40 sm:pt-0.5">{label}</div>
      <div className="text-sm text-white/85 whitespace-pre-wrap">{value}</div>
    </div>
  )
}
