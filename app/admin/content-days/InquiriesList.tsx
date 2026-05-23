'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Video,
  Link2,
  Copy,
  Check,
  MessageSquareShare,
  Mail,
  Phone,
  Instagram,
} from 'lucide-react'

type Inquiry = {
  id: string
  created_at: string
  first_name: string
  last_name: string
  email: string
  phone: string
  instagram_handle: string
  tiktok_handle: string | null
  business_name: string
  preferred_shoot_city: string
  preferred_date: string | null
  ready_to_book: string
  how_heard: string | null
  call_date: string | null
  call_time: string | null
  status: string
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  call_scheduled: {
    label: 'Call Scheduled',
    color: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  call_completed: {
    label: 'Call Completed',
    color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  },
  booked: {
    label: 'Booked',
    color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  completed: {
    label: 'Completed',
    color: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  },
  archived: {
    label: 'Archived',
    color: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  },
}

const READY_LABELS: Record<string, string> = {
  ready: 'Ready to book',
  questions_first: 'Has questions',
}

export default function InquiriesList({ portalUrl }: { portalUrl: string }) {
  const [items, setItems] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('content_days_inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setItems((data as Inquiry[]) || [])
        setLoading(false)
      })
  }, [])

  const filtered =
    filter === 'all' ? items : items.filter((i) => i.status === filter)

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  async function updateStatus(id: string, newStatus: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('content_days_inquiries')
      .update({ status: newStatus })
      .eq('id', id)
    if (!error) {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
      )
    }
  }

  // Ready-to-send DM/text message Ciara can paste into IG/SMS
  const dmMessage = `Hi! 🩵 Thank you so much for reaching out about our CJE Content Days!

To get started, click the link below, fill out the quick form, and book a time for your vision call ✨ During our call, we'll talk through your content goals, lock in your shoot date, and start building the perfect shot list for your brand.

${portalUrl}

Spots are limited and dates are filling quickly, so secure yours soon ☺️

Speak with you soon,
Ciara J.`

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* ============= Header ============= */}
        <div className="flex items-start gap-3 mb-2">
          <Video size={28} className="text-[#81D8D0] flex-shrink-0 mt-1" />
          <div>
            <h1 className="text-2xl md:text-3xl font-light">Content Days Inquiries</h1>
            <p className="text-sm text-[#a1a1a1] mt-1">
              Public funnel at{' '}
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#81D8D0] hover:underline"
              >
                /content-days
              </a>
            </p>
          </div>
        </div>

        {/* ============= Share With Clients box ============= */}
        <div className="border border-[#81D8D0]/30 bg-[#81D8D0]/5 p-5 mt-6">
          <div className="text-xs uppercase tracking-widest text-[#81D8D0] mb-4 flex items-center gap-2">
            <Link2 size={14} /> Share With Clients
          </div>

          <div className="space-y-2.5 mb-4">
            {/* URL row */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-sm flex items-center gap-3 min-w-0 flex-1">
                <span className="text-white/40 text-xs uppercase tracking-wider w-20 shrink-0">
                  URL
                </span>
                <code className="text-white font-mono text-xs sm:text-sm truncate">
                  {portalUrl}
                </code>
              </div>
              <button
                onClick={() => copyToClipboard(portalUrl, 'url')}
                className="flex items-center gap-1.5 text-xs uppercase tracking-widest border border-white/15 hover:border-[#81D8D0] hover:text-[#81D8D0] px-3 py-1.5 transition shrink-0"
              >
                {copied === 'url' ? (
                  <>
                    <Check size={12} /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={12} /> Copy
                  </>
                )}
              </button>
            </div>
          </div>

          <button
            onClick={() => copyToClipboard(dmMessage, 'msg')}
            className="w-full flex items-center justify-center gap-2 bg-[#81D8D0] hover:bg-[#5FB5AD] text-black font-semibold text-xs uppercase tracking-widest py-3 transition"
          >
            {copied === 'msg' ? (
              <>
                <Check size={14} /> Message Copied · Paste Into DM Or Text
              </>
            ) : (
              <>
                <MessageSquareShare size={14} /> Copy Ready-To-Send DM Message
              </>
            )}
          </button>
        </div>

        {/* ============= Status filter buttons ============= */}
        <div className="mt-8 flex flex-wrap gap-2">
          {[
            'all',
            'new',
            'call_scheduled',
            'call_completed',
            'booked',
            'completed',
            'archived',
          ].map((key) => {
            const count =
              key === 'all' ? items.length : items.filter((i) => i.status === key).length
            const label = key === 'all' ? 'All' : STATUS_LABELS[key]?.label || key
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider rounded border transition-colors ${
                  filter === key
                    ? 'bg-[#81D8D0]/15 text-[#81D8D0] border-[#81D8D0]/40'
                    : 'bg-transparent text-[#a1a1a1] border-[#333] hover:border-[#555]'
                }`}
              >
                {label} ({count})
              </button>
            )
          })}
        </div>

        {/* ============= Inquiry list ============= */}
        {loading ? (
          <div className="mt-12 text-center text-[#a1a1a1] text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="mt-12 text-center text-[#a1a1a1] text-sm py-12 border border-dashed border-[#333] rounded-lg">
            No inquiries{' '}
            {filter !== 'all'
              ? `with status "${STATUS_LABELS[filter]?.label}"`
              : 'yet'}
            .
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {filtered.map((i) => {
              const status = STATUS_LABELS[i.status] || STATUS_LABELS.new
              const created = new Date(i.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })
              const callDate =
                i.call_date && i.call_time
                  ? `${new Date(i.call_date + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })} · ${i.call_time}`
                  : null
              return (
                <div
                  key={i.id}
                  className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4 md:p-5"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-medium text-white">
                          {i.first_name} {i.last_name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-[10px] uppercase tracking-wider rounded border ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-[#a1a1a1] italic mt-0.5">
                        {i.business_name}
                      </p>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-[#c0c0c0]">
                        <div className="flex items-center gap-2">
                          <Mail size={13} className="text-[#777]" />
                          <a
                            href={`mailto:${i.email}`}
                            className="text-[#81D8D0] hover:underline truncate"
                          >
                            {i.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={13} className="text-[#777]" />
                          <a
                            href={`tel:${i.phone}`}
                            className="text-[#c0c0c0] hover:text-white"
                          >
                            {i.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Instagram size={13} className="text-[#777]" />
                          <span>{i.instagram_handle}</span>
                        </div>
                        {i.tiktok_handle && (
                          <div>
                            <span className="text-[#777]">TikTok:</span> {i.tiktok_handle}
                          </div>
                        )}
                        <div>
                          <span className="text-[#777]">City:</span>{' '}
                          {i.preferred_shoot_city}
                        </div>
                        <div>
                          <span className="text-[#777]">Intent:</span>{' '}
                          {READY_LABELS[i.ready_to_book] || i.ready_to_book}
                        </div>
                        {i.preferred_date && (
                          <div>
                            <span className="text-[#777]">Pref. Shoot:</span>{' '}
                            {new Date(i.preferred_date + 'T00:00:00').toLocaleDateString(
                              'en-US',
                              { month: 'short', day: 'numeric' }
                            )}
                          </div>
                        )}
                        {callDate && (
                          <div className="text-[#81D8D0]">
                            <span className="text-[#777]">Call:</span> {callDate}
                          </div>
                        )}
                        {i.how_heard && (
                          <div className="sm:col-span-2">
                            <span className="text-[#777]">Heard from:</span>{' '}
                            {i.how_heard}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-[#777] uppercase tracking-wider">
                      {created}
                    </div>
                  </div>

                  {/* Status quick actions */}
                  <div className="mt-4 pt-4 border-t border-[#2a2a2a] flex flex-wrap gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-[#777] mr-2 self-center">
                      Move to:
                    </span>
                    {Object.keys(STATUS_LABELS)
                      .filter((s) => s !== i.status)
                      .map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(i.id, s)}
                          className="px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#a1a1a1] hover:text-[#81D8D0] hover:bg-[#81D8D0]/10 rounded transition-colors"
                        >
                          {STATUS_LABELS[s].label}
                        </button>
                      ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
