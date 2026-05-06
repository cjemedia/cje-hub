'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, Link2, Copy, Check, MessageSquareShare, Eye, EyeOff, Save, Loader2 } from 'lucide-react'

type Inquiry = {
  id: string
  created_at: string
  first_name: string
  last_name: string
  email: string
  property_location: string
  status: string
  payment_amount: number | null
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  payment_sent: { label: 'Payment Sent', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  paid: { label: 'Paid', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  completed: { label: 'Completed', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  archived: { label: 'Archived', color: 'bg-gray-500/15 text-gray-400 border-gray-500/30' },
}

export default function InquiriesList({
  portalUrl,
  portalPassword,
}: {
  portalUrl: string
  portalPassword: string
}) {
  const router = useRouter()
  const [items, setItems] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [copied, setCopied] = useState<string | null>(null)

  // Password editor state
  const [pwInput, setPwInput] = useState(portalPassword)
  const [pwSaving, setPwSaving] = useState(false)
  const [showPw, setShowPw] = useState(true)

  // Sync local input when prop changes (e.g. after router.refresh)
  useEffect(() => {
    setPwInput(portalPassword)
  }, [portalPassword])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('marketing_inquiries')
      .select('id, created_at, first_name, last_name, email, property_location, status, payment_amount')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setItems((data as Inquiry[]) || [])
        setLoading(false)
      })
  }, [])

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  async function savePassword() {
    const trimmed = pwInput.trim()
    if (!trimmed) {
      alert('Password cannot be empty.')
      return
    }
    if (trimmed === portalPassword) return

    setPwSaving(true)
    try {
      const res = await fetch('/api/admin/airbnb-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: trimmed }),
      })
      if (!res.ok) throw new Error('Save failed')
      // Refresh server component to pick up new password
      router.refresh()
    } catch (err) {
      alert('Failed to save password. Please try again.')
    } finally {
      setPwSaving(false)
    }
  }

  const isDirty = pwInput.trim() !== portalPassword && pwInput.trim().length > 0

  const readyMessage = `Hi! Here's your CJE Airbnb Marketing portal:

${portalUrl}
Password: ${portalPassword}

Fill out the Property Vision Form and I'll send you a $350 deposit link to secure your filming dates.

— Ciara`

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter)
  const counts = items.reduce<Record<string, number>>((acc, i) => {
    acc[i.status] = (acc[i.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="text-[#0ABAB5]" size={20} />
          <h1 className="text-2xl font-light tracking-wide">Airbnb Marketing Inquiries</h1>
        </div>
        <p className="text-white/50 text-sm mb-6">Review submissions and send payment links.</p>

        {/* Share With Clients box */}
        <div className="border border-[#0ABAB5]/30 bg-[#0ABAB5]/5 p-5 mb-8">
          <div className="text-xs uppercase tracking-widest text-[#0ABAB5] mb-4 flex items-center gap-2">
            <Link2 size={14} /> Share With Clients
          </div>

          <div className="space-y-2.5 mb-4">
            {/* URL row */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-sm flex items-center gap-3 min-w-0 flex-1">
                <span className="text-white/40 text-xs uppercase tracking-wider w-20 shrink-0">URL</span>
                <code className="text-white font-mono text-xs sm:text-sm truncate">{portalUrl}</code>
              </div>
              <button
                onClick={() => copyToClipboard(portalUrl, 'url')}
                className="flex items-center gap-1.5 text-xs uppercase tracking-widest border border-white/15 hover:border-[#0ABAB5] hover:text-[#0ABAB5] px-3 py-1.5 transition shrink-0"
              >
                {copied === 'url' ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>

            {/* Editable password row */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-sm flex items-center gap-3 min-w-0 flex-1">
                <span className="text-white/40 text-xs uppercase tracking-wider w-20 shrink-0">Password</span>
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={pwInput}
                    onChange={e => setPwInput(e.target.value)}
                    className="bg-black/40 border border-white/15 focus:border-[#0ABAB5] outline-none px-3 py-1.5 text-white font-mono text-xs sm:text-sm flex-1 min-w-0 transition"
                    placeholder="Enter password"
                    spellCheck={false}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="text-white/40 hover:text-white p-1.5 transition"
                    title={showPw ? 'Hide' : 'Show'}
                  >
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {isDirty && (
                  <button
                    onClick={savePassword}
                    disabled={pwSaving}
                    className="flex items-center gap-1.5 text-xs uppercase tracking-widest bg-[#0ABAB5] hover:bg-[#089690] text-black font-semibold px-3 py-1.5 transition disabled:opacity-50"
                  >
                    {pwSaving ? <><Loader2 size={12} className="animate-spin" /> Saving</> : <><Save size={12} /> Save</>}
                  </button>
                )}
                {!isDirty && (
                  <button
                    onClick={() => portalPassword && copyToClipboard(portalPassword, 'pw')}
                    disabled={!portalPassword}
                    className="flex items-center gap-1.5 text-xs uppercase tracking-widest border border-white/15 hover:border-[#0ABAB5] hover:text-[#0ABAB5] px-3 py-1.5 transition disabled:opacity-30"
                  >
                    {copied === 'pw' ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                  </button>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => copyToClipboard(readyMessage, 'msg')}
            disabled={!portalPassword || isDirty}
            className="w-full flex items-center justify-center gap-2 bg-[#0ABAB5] hover:bg-[#089690] text-black font-semibold text-xs uppercase tracking-widest py-3 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {copied === 'msg' ? (
              <><Check size={14} /> Message Copied — Paste Into Text or Email</>
            ) : (
              <><MessageSquareShare size={14} /> Copy Ready-to-Send Message</>
            )}
          </button>

          {isDirty && (
            <p className="text-amber-300/80 text-xs mt-3">
              Save your new password before copying the share message.
            </p>
          )}
          {!portalPassword && !isDirty && (
            <p className="text-amber-300/80 text-xs mt-3">
              ⚠️ Set a password above to enable client sharing.
            </p>
          )}
        </div>

        {/* Status filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'new', 'payment_sent', 'paid', 'completed'].map(s => {
            const isActive = filter === s
            const count = s === 'all' ? items.length : counts[s] || 0
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 text-xs uppercase tracking-widest border transition ${
                  isActive
                    ? 'bg-[#0ABAB5] text-black border-[#0ABAB5]'
                    : 'border-white/15 text-white/60 hover:border-white/30'
                }`}
              >
                {s === 'all' ? 'All' : STATUS_LABELS[s]?.label || s}
                <span className="ml-2 opacity-70">{count}</span>
              </button>
            )
          })}
        </div>

        {loading && <div className="text-white/50 text-sm">Loading...</div>}

        {!loading && filtered.length === 0 && (
          <div className="border border-white/10 p-12 text-center text-white/40 text-sm">
            No inquiries {filter !== 'all' ? `with status "${STATUS_LABELS[filter]?.label}"` : 'yet'}.
          </div>
        )}

        <div className="space-y-2">
          {filtered.map(item => {
            const status = STATUS_LABELS[item.status] || STATUS_LABELS.new
            return (
              <Link
                key={item.id}
                href={`/admin/marketing-inquiries/${item.id}`}
                className="block border border-white/10 hover:border-[#0ABAB5] transition p-5 group"
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-base font-medium group-hover:text-[#0ABAB5] transition">
                      {item.first_name} {item.last_name}
                    </div>
                    <div className="text-sm text-white/50 mt-1">
                      {item.property_location} · {item.email}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.payment_amount && (
                      <span className="text-sm text-white/70 font-light">
                        ${Number(item.payment_amount).toFixed(0)}
                      </span>
                    )}
                    <span className={`text-xs uppercase tracking-widest px-3 py-1 border ${status.color}`}>
                      {status.label}
                    </span>
                    <span className="text-xs text-white/30">
                      {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
