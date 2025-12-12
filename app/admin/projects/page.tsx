'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { format } from 'date-fns'
import { StatusBadge } from '@/components/StatusBadge'
import {
  Mic,
  BookOpen,
  PartyPopper,
  MessageCircle,
  Users,
  Globe,
  Monitor,
  Settings,
  Sparkles,
  Palette,
  type LucideIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

const serviceTypeConfig: Record<
  string,
  { icon: LucideIcon; label: string; color: string }
> = {
  speaking_engagement: { icon: Mic, label: 'Speaking', color: '#81D8D0' },
  workshop: { icon: BookOpen, label: 'Workshop', color: '#81D8D0' },
  event_hosting: { icon: PartyPopper, label: 'Event Hosting', color: '#81D8D0' },
  coaching_1on1: { icon: MessageCircle, label: '1:1 Coaching', color: '#81D8D0' },
  coaching_cohort: { icon: Users, label: 'Cohort Program', color: '#81D8D0' },
  website: { icon: Globe, label: 'Website', color: '#81D8D0' },
  client_portal: { icon: Monitor, label: 'Portal', color: '#81D8D0' },
  business_tools: { icon: Settings, label: 'Tools', color: '#81D8D0' },
  brand_consulting: { icon: Sparkles, label: 'Branding', color: '#81D8D0' },
  creative_direction: { icon: Palette, label: 'Creative', color: '#81D8D0' },
}

type StatusFilter = 'all' | 'inquiry' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [clients, setClients] = useState<{ id: string; name: string; email: string }[]>([])
  const [form, setForm] = useState({
    user_id: '',
    name: '',
    description: '',
    service_type: '',
    status: 'inquiry' as StatusFilter,
    start_date: '',
    end_date: '',
  })
  const router = useRouter()

  const loadProjects = useCallback(async () => {
    const supabase = createClient()

    let query = supabase
      .from('projects')
      .select('*, users(name, email)')
      .order('created_at', { ascending: false })

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error loading projects:', error)
      setProjects([])
    } else {
      setProjects(data || [])
    }
    setLoading(false)
  }, [statusFilter])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  useEffect(() => {
    const loadClients = async () => {
      try {
        const res = await fetch('/api/clients')
        if (!res.ok) throw new Error('Failed to load clients')
        const data = await res.json()
        setClients(data || [])
      } catch (error) {
        console.error('Error loading clients:', error)
      }
    }
    loadClients()
  }, [])

  const handleCreate = async () => {
    if (!form.user_id || !form.name || !form.service_type || !form.status) return
    setCreating(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        throw new Error('Failed to create project')
      }
      await loadProjects()
      setShowCreateModal(false)
      setForm({
        user_id: '',
        name: '',
        description: '',
        service_type: '',
        status: 'inquiry',
        start_date: '',
        end_date: '',
      })
    } catch (error) {
      console.error(error)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white/70">Loading projects...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1 w-1 rounded-full bg-[#81D8D0]"></div>
            <span className="text-[#81D8D0] text-sm font-medium uppercase tracking-wider">Admin</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-semibold text-white mb-2">All Projects</h1>
          <p className="text-[#a1a1a1]">View and manage all client projects</p>
        <div className="mt-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-[#81D8D0] text-[#0a0a0a] px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl"
          >
            New Project
          </button>
        </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'inquiry', 'confirmed', 'in_progress', 'completed', 'cancelled'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-[#81D8D0] text-dark'
                  : 'bg-[#1a1a1a] border border-[#333333] text-white/70 hover:text-white'
              }`}
            >
              {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Projects Table */}
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0a0a0a] border-b border-[#333333]">
                <tr>
                  <th className="text-left px-6 py-4 text-white/80 text-sm font-semibold">Project Name</th>
                  <th className="text-left px-6 py-4 text-white/80 text-sm font-semibold">Client</th>
                  <th className="text-left px-6 py-4 text-white/80 text-sm font-semibold">Service Type</th>
                  <th className="text-left px-6 py-4 text-white/80 text-sm font-semibold">Status</th>
                  <th className="text-left px-6 py-4 text-white/80 text-sm font-semibold">Start Date</th>
                  <th className="text-left px-6 py-4 text-white/80 text-sm font-semibold">End Date</th>
                </tr>
              </thead>
              <tbody>
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#a1a1a1]">
                      No projects found
                    </td>
                  </tr>
                ) : (
                  projects.map((project: any) => {
                    const serviceConfig = serviceTypeConfig[project.service_type] || {
                      icon: Settings,
                      label: project.service_type || 'N/A',
                      color: '#81D8D0',
                    }
                    const Icon = serviceConfig.icon

                    return (
                      <tr
                        key={project.id}
                        className="border-b border-[#333333] hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <Link href={`/admin/projects/${project.id}`} className="text-white hover:text-[#81D8D0] transition-colors">
                            {project.name || 'Untitled Project'}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-white">{project.users?.name || project.users?.email || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-[#81D8D0]">
                            <Icon size={16} />
                            <span className="text-sm">{serviceConfig.label}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={project.status} />
                        </td>
                        <td className="px-6 py-4 text-[#a1a1a1] text-sm">
                          {project.start_date ? format(new Date(project.start_date), 'MMM d, yyyy') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-[#a1a1a1] text-sm">
                          {project.end_date ? format(new Date(project.end_date), 'MMM d, yyyy') : 'N/A'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl w-full max-w-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Create Project</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#a1a1a1] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/60 mb-1">Client</label>
                <select
                  value={form.user_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, user_id: e.target.value }))}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Select client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name || c.email} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-white/60 mb-1">Project Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                  placeholder="Project name"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-white/60 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white resize-none"
                  rows={3}
                  placeholder="Optional description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/60 mb-1">Service Type</label>
                  <select
                    value={form.service_type}
                    onChange={(e) => setForm((prev) => ({ ...prev, service_type: e.target.value }))}
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">Select service</option>
                    <option value="speaking_engagement">Speaking</option>
                    <option value="workshop">Workshop</option>
                    <option value="event_hosting">Event Hosting</option>
                    <option value="coaching_1on1">1:1 Coaching</option>
                    <option value="coaching_cohort">Cohort Program</option>
                    <option value="website">Website</option>
                    <option value="client_portal">Portal</option>
                    <option value="business_tools">Business Tools</option>
                    <option value="brand_consulting">Brand Consulting</option>
                    <option value="creative_direction">Creative Direction</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/60 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as StatusFilter }))}
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                  >
                    <option value="inquiry">Inquiry</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/60 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm((prev) => ({ ...prev, start_date: e.target.value }))}
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/60 mb-1">End Date</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm((prev) => ({ ...prev, end_date: e.target.value }))}
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg border border-[#333333] text-white hover:border-white/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !form.user_id || !form.name || !form.service_type}
                className="px-4 py-2 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {creating ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

