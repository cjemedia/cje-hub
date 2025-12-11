'use client'

import { useEffect, useState } from 'react'
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

  useEffect(() => {
    const loadProjects = async () => {
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
    }

    loadProjects()
  }, [statusFilter])

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
    </div>
  )
}

