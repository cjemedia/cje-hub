'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  FileText,
  Download,
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
import { createClient } from '@/lib/supabase/client'
import { useHubUser } from '@/components/hub/HubUserProvider'
import { StatusBadge } from '@/components/StatusBadge'
import { format } from 'date-fns'
import type { Project, ServiceType } from '@/types/database'

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

type FilterType = 'all' | ServiceType

export default function ProjectsPage() {
  const { user } = useHubUser()
  const [projects, setProjects] = useState<Project[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProjects = async () => {
      if (!user) return
      const supabase = createClient()

      let query = supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('service_type', filter)
      }

      const { data } = await query

      setProjects(data || [])
      setLoading(false)
    }

    loadProjects()
  }, [user, filter])

  // Get unique service types for filter tabs
  const serviceTypes = Array.from(
    new Set(projects.map((p) => p.service_type).filter(Boolean) as ServiceType[])
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8">
        <div className="min-h-[60vh] flex items-center justify-center text-[#a1a1a1]">
          Loading projects...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link
          href="/hub/dashboard"
          className="inline-flex items-center gap-2 text-[#a1a1a1] hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl lg:text-4xl font-semibold text-white mb-2">
          Projects
        </h1>
        <p className="text-[#a1a1a1]">
          View and manage your active projects and deliverables.
        </p>
      </motion.div>

      {/* Filter Tabs */}
      {serviceTypes.length > 0 && (
        <div className="flex gap-2 mb-6 border-b border-[#333333] overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              filter === 'all'
                ? 'border-[#81D8D0] text-[#81D8D0]'
                : 'border-transparent text-[#a1a1a1] hover:text-white'
            }`}
          >
            All
          </button>
          {serviceTypes.map((serviceType) => {
            const config = serviceTypeConfig[serviceType]
            if (!config) return null
            const Icon = config.icon
            return (
              <button
                key={serviceType}
                onClick={() => setFilter(serviceType)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
                  filter === serviceType
                    ? 'border-[#81D8D0] text-[#81D8D0]'
                    : 'border-transparent text-[#a1a1a1] hover:text-white'
                }`}
              >
                <Icon size={16} />
                {config.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Projects List */}
      {projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-12 text-center"
        >
          <FileText className="w-16 h-16 text-[#a1a1a1]/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Projects Yet</h2>
          <p className="text-[#a1a1a1]">
            Your active projects and deliverables will appear here once they're
            assigned.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const config = project.service_type
    ? serviceTypeConfig[project.service_type]
    : null
  const Icon = config?.icon || FileText

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 hover:border-[#81D8D0]/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {config && (
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${config.color}20`, color: config.color }}
              >
                <Icon size={20} />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                {project.name}
              </h3>
              <div className="flex items-center gap-2">
                {config && (
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ backgroundColor: `${config.color}20`, color: config.color }}
                  >
                    {config.label}
                  </span>
                )}
                <StatusBadge status={project.status} />
              </div>
            </div>
          </div>

          {project.description && (
            <p className="text-sm text-[#a1a1a1] mb-4">{project.description}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-[#a1a1a1]">
            {project.start_date && (
              <span>
                Started: {format(new Date(project.start_date), 'MMM d, yyyy')}
              </span>
            )}
            {project.end_date && (
              <span>
                Ends: {format(new Date(project.end_date), 'MMM d, yyyy')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Deliverables section would go here if available */}
      {/* For now, we'll add a placeholder */}
      <div className="mt-4 pt-4 border-t border-[#333333]">
        <Link
          href={`/hub/projects/${project.id}`}
          className="text-sm text-[#81D8D0] hover:text-[#81D8D0]/80 flex items-center gap-2"
        >
          <Download size={16} />
          View Deliverables
        </Link>
      </div>
    </motion.div>
  )
}
