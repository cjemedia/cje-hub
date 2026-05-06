'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Sparkles } from 'lucide-react'

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

export default function MarketingInquiriesPage() {
  const [items, setItems] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

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
        <p className="text-white/50 text-sm mb-8">Review submissions and send payment links.</p>

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
