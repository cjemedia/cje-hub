'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Download, Users } from 'lucide-react'

type Lead = {
  id: string
  tag: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  how_heard: string | null
  grade_level: string | null
  high_school: string | null
  extra_data: Record<string, unknown> | null
  created_at: string
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function exportToCSV(leads: Lead[], tag: string) {
  const headers = [
    'First Name', 'Last Name', 'Email', 'Phone',
    'Grade Level', 'High School', 'How They Heard', 'Tag', 'Date Submitted',
  ]
  const rows = leads.map((l) => [
    l.first_name, l.last_name, l.email, l.phone ?? '',
    l.grade_level ?? '', l.high_school ?? '', l.how_heard ?? '',
    l.tag, formatDate(l.created_at),
  ])
  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `leads-${tag === 'all' ? 'all' : tag}-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [activeTag, setActiveTag] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const supabase = createClient()

  useEffect(() => {
    async function fetchTags() {
      const { data } = await supabase.from('leads').select('tag')
      if (data) {
        const tags = Array.from(new Set(data.map((l: { tag: string }) => l.tag))) as string[]
        setAllTags(tags)
      }
    }
    fetchTags()
  }, [supabase])

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('leads').select('*').order('created_at', { ascending: false })
    if (activeTag !== 'all') query = query.eq('tag', activeTag)
    const { data, error } = await query
    if (!error && data) setLeads(data)
    setLoading(false)
  }, [activeTag, supabase])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const filtered = leads.filter((l) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      l.first_name.toLowerCase().includes(q) ||
      l.last_name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      (l.high_school ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-[#81D8D0]" />
              <span className="text-[#81D8D0] text-sm font-medium uppercase tracking-wider">Admin</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-semibold text-white">Leads</h1>
            <p className="text-[#a1a1a1]">All contacts collected from your public forms.</p>
          </div>
          <button
            onClick={() => exportToCSV(filtered, activeTag)}
            disabled={filtered.length === 0}
            className="flex items-center justify-center gap-2 bg-[#81D8D0] text-[#0a0a0a] text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#81D8D0]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed self-start sm:self-auto whitespace-nowrap"
          >
            <Download size={16} />
            Export {activeTag === 'all' ? 'All' : activeTag} (.csv)
          </button>
        </div>

        {/* Stats Row - scrollable on mobile */}
        <div className="flex gap-4 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-5">
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-5 flex-shrink-0 w-36 sm:w-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[#a1a1a1] text-sm">Total</div>
              <Users className="text-[#81D8D0]" size={18} />
            </div>
            <div className="text-3xl font-semibold text-white">{leads.length}</div>
          </div>
          {allTags.map((tag) => (
            <div key={tag} className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-5 flex-shrink-0 w-36 sm:w-auto">
              <div className="text-[#a1a1a1] text-sm capitalize mb-3 truncate">{tag}</div>
              <div className="text-3xl font-semibold text-white">
                {leads.filter((l) => l.tag === tag).length}
              </div>
            </div>
          ))}
        </div>

        {/* Filters + Search */}
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTag('all')}
              className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wide rounded-lg transition-colors ${
                activeTag === 'all'
                  ? 'bg-[#81D8D0] text-[#0a0a0a]'
                  : 'bg-[#0a0a0a] border border-[#333333] text-[#a1a1a1] hover:border-[#81D8D0]/50'
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wide rounded-lg transition-colors capitalize ${
                  activeTag === tag
                    ? 'bg-[#81D8D0] text-[#0a0a0a]'
                    : 'bg-[#0a0a0a] border border-[#333333] text-[#a1a1a1] hover:border-[#81D8D0]/50'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or school..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:max-w-sm bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-[#a1a1a1] focus:outline-none focus:border-[#81D8D0]/50 transition-colors"
          />
        </div>

        {/* Desktop Table / Mobile Cards */}
        {loading ? (
          <div className="text-center py-16 text-[#a1a1a1] text-sm">Loading leads...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-[#a1a1a1] text-sm">No leads found.</div>
        ) : (
          <>
            {/* Desktop table — hidden on mobile */}
            <div className="hidden md:block bg-[#1a1a1a] border border-[#333333] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="border-b border-[#333333]">
                    <tr>
                      {['Name', 'Email', 'Phone', 'Grade', 'School', 'How They Heard', 'Tag', 'Date'].map((h) => (
                        <th key={h} className="px-4 py-3 text-xs font-medium text-[#a1a1a1] uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#333333]">
                    {filtered.map((lead) => (
                      <tr key={lead.id} className="hover:bg-[#0a0a0a] transition-colors">
                        <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                          {lead.first_name} {lead.last_name}
                        </td>
                        <td className="px-4 py-3 text-[#a1a1a1]">{lead.email}</td>
                        <td className="px-4 py-3 text-[#a1a1a1] whitespace-nowrap">
                          {lead.phone ?? <span className="text-[#555]">—</span>}
                        </td>
                        <td className="px-4 py-3 text-[#a1a1a1] whitespace-nowrap">
                          {lead.grade_level ?? <span className="text-[#555]">—</span>}
                        </td>
                        <td className="px-4 py-3 text-[#a1a1a1]">
                          {lead.high_school ?? <span className="text-[#555]">—</span>}
                        </td>
                        <td className="px-4 py-3 text-[#a1a1a1]">
                          {lead.how_heard ?? <span className="text-[#555]">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-0.5 text-xs font-medium uppercase tracking-wide rounded bg-[#81D8D0]/10 text-[#81D8D0] capitalize">
                            {lead.tag}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#a1a1a1] whitespace-nowrap text-xs">
                          {formatDate(lead.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards — shown only on mobile */}
            <div className="md:hidden space-y-3">
              {filtered.map((lead) => (
                <div key={lead.id} className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 space-y-3">
                  {/* Name + tag + date */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-white font-medium">
                        {lead.first_name} {lead.last_name}
                      </p>
                      <p className="text-[#555] text-xs mt-0.5">{formatDate(lead.created_at)}</p>
                    </div>
                    <span className="inline-block px-2 py-0.5 text-xs font-medium uppercase tracking-wide rounded bg-[#81D8D0]/10 text-[#81D8D0] capitalize flex-shrink-0">
                      {lead.tag}
                    </span>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-1 gap-2 text-sm border-t border-[#333333] pt-3">
                    <div className="flex gap-2">
                      <span className="text-[#555] w-16 flex-shrink-0 text-xs">Email</span>
                      <span className="text-[#a1a1a1] break-all text-xs">{lead.email}</span>
                    </div>
                    {lead.phone && (
                      <div className="flex gap-2">
                        <span className="text-[#555] w-16 flex-shrink-0 text-xs">Phone</span>
                        <span className="text-[#a1a1a1] text-xs">{lead.phone}</span>
                      </div>
                    )}
                    {lead.grade_level && (
                      <div className="flex gap-2">
                        <span className="text-[#555] w-16 flex-shrink-0 text-xs">Grade</span>
                        <span className="text-[#a1a1a1] text-xs">{lead.grade_level}</span>
                      </div>
                    )}
                    {lead.high_school && (
                      <div className="flex gap-2">
                        <span className="text-[#555] w-16 flex-shrink-0 text-xs">School</span>
                        <span className="text-[#a1a1a1] text-xs">{lead.high_school}</span>
                      </div>
                    )}
                    {lead.how_heard && (
                      <div className="flex gap-2">
                        <span className="text-[#555] w-16 flex-shrink-0 text-xs">Heard</span>
                        <span className="text-[#a1a1a1] text-xs">{lead.how_heard}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}