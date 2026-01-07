'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Calendar,
  Download,
  MessageSquare,
  Package,
  DollarSign,
  Upload,
  FileText,
  CheckCircle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useHubUser } from '@/components/hub/HubUserProvider'
import { StatusBadge } from '@/components/StatusBadge'
import { format } from 'date-fns'
import { formatDate } from '@/lib/utils/date'
import { formatTime12Hour } from '@/lib/time-format'

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useHubUser()
  const [stats, setStats] = useState({
    outstandingBalance: 0,
    activeProjects: 0,
    unreadMessages: 0,
    resources: 0,
  })
  const [actionItems, setActionItems] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!user) return
      const supabase = createClient()

      // Outstanding Balance - sum of unpaid invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('amount, status')
        .eq('user_id', user.id)
        .neq('status', 'paid')

      const outstandingBalance = (invoices || []).reduce(
        (sum, inv) => sum + Number(inv.amount || 0),
        0
      )

      // Active Projects count
      const { count: projectsCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Unread Messages count (messages where sender_type = 'admin' and read = false)
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', user.id)
        .eq('sender_type', 'admin')
        .eq('read', false)

      // Resources count
      const { data: userProjects } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id)

      const projectIds = userProjects?.map(p => p.id) || []
      const { count: resourcesCount } = await supabase
        .from('deliverables')
        .select('*', { count: 'exact', head: true })
        .in('project_id', projectIds)

      setStats({
        outstandingBalance,
        activeProjects: projectsCount || 0,
        unreadMessages: messagesCount || 0,
        resources: resourcesCount || 0,
      })

      // Action Items
      const actions: any[] = []

      // Unpaid invoices
      const unpaidInvoices = (invoices || []).filter(inv => inv.status !== 'paid')
      if (unpaidInvoices.length > 0) {
        const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0)
        actions.push({
          type: 'invoice',
          label: `Pay Invoice - $${totalUnpaid.toFixed(2)}`,
          href: '/hub/invoices',
          urgent: true,
        })
      }

      // Projects with dropbox_link
      const { data: projectsWithDropbox } = await supabase
        .from('projects')
        .select('id, dropbox_link')
        .eq('user_id', user.id)
        .not('dropbox_link', 'is', null)

      if (projectsWithDropbox && projectsWithDropbox.length > 0) {
        const firstDropbox = projectsWithDropbox[0]
        actions.push({
          type: 'dropbox',
          label: 'Upload Your Assets',
          href: firstDropbox.dropbox_link,
          external: true,
        })
      }

      // Pending intake forms
      const { data: intakeResponses } = await supabase
        .from('intake_responses')
        .select('id, project_id')
        .is('submitted_at', null)

      if (intakeResponses && intakeResponses.length > 0) {
        const firstIntake = intakeResponses[0]
        actions.push({
          type: 'intake',
          label: 'Complete Intake Form',
          href: `/hub/projects/${firstIntake.project_id}#intake`,
        })
      }

      // Proposals with status 'sent'
      const { data: proposals } = await supabase
        .from('proposals')
        .select('id, project_id, status')
        .eq('status', 'sent')

      if (proposals && proposals.length > 0) {
        const firstProposal = proposals[0]
        actions.push({
          type: 'proposal',
          label: 'Review Proposal',
          href: `/hub/projects/${firstProposal.project_id}#proposals`,
        })
      }

      setActionItems(actions)

      // Current Projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)

      setProjects(projectsData || [])

      // Recent Activity (last 5 items)
      const activities: any[] = []

      // Recent messages
      const { data: recentMessages } = await supabase
        .from('messages')
        .select('id, content, created_at, project_id')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)

      recentMessages?.forEach(msg => {
        activities.push({
          type: 'message',
          label: 'New message received',
          timestamp: msg.created_at,
          href: msg.project_id ? `/hub/projects/${msg.project_id}#messages` : '/hub/messages',
        })
      })

      // Recent deliverables
      const { data: recentDeliverables } = await supabase
        .from('deliverables')
        .select('id, name, created_at, project_id')
        .in('project_id', projectIds)
        .order('created_at', { ascending: false })
        .limit(3)

      recentDeliverables?.forEach(del => {
        activities.push({
          type: 'resource',
          label: `New resource: ${del.name}`,
          timestamp: del.created_at,
          href: del.project_id ? `/hub/projects/${del.project_id}#resources` : '/hub/deliverables',
        })
      })

      // Recent invoice status changes (paid invoices)
      const { data: recentInvoices } = await supabase
        .from('invoices')
        .select('id, amount, status, paid_at, created_at')
        .eq('user_id', user.id)
        .eq('status', 'paid')
        .order('paid_at', { ascending: false })
        .limit(3)

      recentInvoices?.forEach(inv => {
        if (inv.paid_at) {
          activities.push({
            type: 'invoice',
            label: `Invoice paid - $${Number(inv.amount || 0).toFixed(2)}`,
            timestamp: inv.paid_at,
            href: '/hub/invoices',
          })
        }
      })

      // Sort activities by timestamp and take last 5
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setRecentActivity(activities.slice(0, 5))

      // Upcoming Bookings (next 3)
      const today = new Date().toISOString().split('T')[0]
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .gte('booking_date', today)
        .in('status', ['pending', 'confirmed'])
        .order('booking_date', { ascending: true })
        .order('booking_time', { ascending: true })
        .limit(3)

      setUpcomingBookings(bookingsData || [])

      // Upcoming Community Events (next 3 approved events)
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'approved')
        .neq('user_id', user.id)
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(3)

      setUpcomingEvents(eventsData || [])

      setLoading(false)
    }

    loadData()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8">
        <div className="min-h-[60vh] flex items-center justify-center text-[#a1a1a1]">
          Loading your workspace...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Welcome back, {user?.name?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-[#a1a1a1]">
          Here's what's happening with your projects
        </p>
      </motion.div>

      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Outstanding Balance"
          value={`$${stats.outstandingBalance.toFixed(2)}`}
          icon={DollarSign}
          href="/hub/invoices"
          accentColor={stats.outstandingBalance > 0 ? 'text-red-400' : 'text-green-400'}
        />
        <StatCard
          label="Active Projects"
          value={stats.activeProjects}
          icon={Package}
          href="/hub/projects"
        />
        <StatCard
          label="Unread Messages"
          value={stats.unreadMessages}
          icon={MessageSquare}
          href="/hub/messages"
        />
        <StatCard
          label="Resources"
          value={stats.resources}
          icon={Download}
          href="/hub/deliverables"
        />
      </div>

      {/* Row 2: Action Items (conditional) */}
      {actionItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-5 mb-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Action Items</h2>
          <div className="space-y-2">
            {actionItems.map((action, index) => (
              <ActionItem key={index} action={action} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Row 3: Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left: Current Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-5"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Current Projects</h2>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-[#a1a1a1]/30 mx-auto mb-4" />
              <p className="text-[#a1a1a1] mb-2">No active projects</p>
              <Link
                href="/hub/booking"
                className="text-sm text-[#81D8D0] hover:text-[#81D8D0]/80"
              >
                Book a session →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </motion.div>

        {/* Right: Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-5"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#a1a1a1]">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Row 4: Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upcoming Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-5"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Upcoming Bookings</h2>
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-[#a1a1a1]/30 mx-auto mb-4" />
              <p className="text-[#a1a1a1] mb-2">No upcoming sessions</p>
              <Link
                href="/hub/booking"
                className="text-sm text-[#81D8D0] hover:text-[#81D8D0]/80"
              >
                Book a Session →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </motion.div>

        {/* Right: Upcoming Community Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-5"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Upcoming Community Events</h2>
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-[#a1a1a1]/30 mx-auto mb-4" />
              <p className="text-[#a1a1a1] mb-2">No upcoming events</p>
              <Link
                href="/hub/events"
                className="text-sm text-[#81D8D0] hover:text-[#81D8D0]/80"
              >
                Explore Events →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  accentColor = 'text-[#81D8D0]',
}: {
  label: string
  value: string | number
  icon: any
  href: string
  accentColor?: string
}) {
  return (
    <Link
      href={href}
      className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-5 hover:border-[#81D8D0]/50 transition-colors cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-[#a1a1a1] text-sm">{label}</div>
        <Icon size={20} className={accentColor} />
      </div>
      <div className={`text-2xl font-semibold ${accentColor === 'text-[#81D8D0]' ? 'text-white' : accentColor}`}>
        {value}
      </div>
    </Link>
  )
}

function ActionItem({ action }: { action: any }) {
  const content = (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${
        action.urgent
          ? 'bg-red-500/10 border-red-500/50 hover:bg-red-500/20'
          : 'bg-[#0a0a0a] border-[#81D8D0]/50 hover:bg-[#0a0a0a]/80'
      } transition-colors`}
    >
      <span className="text-white text-sm font-medium">{action.label}</span>
      <ArrowRight size={16} className="text-[#81D8D0]" />
    </div>
  )

  if (action.external) {
    return (
      <a
        href={action.href}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {content}
      </a>
    )
  }

  return <Link href={action.href}>{content}</Link>
}

function ProjectCard({ project }: { project: any }) {
  return (
    <div className="bg-[#0a0a0a] border border-[#333333] rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-white font-medium flex-1">{project.name || 'Untitled Project'}</h3>
        {project.status && <StatusBadge status={project.status} />}
      </div>
      {project.service_type && (
        <p className="text-sm text-[#a1a1a1] mb-3">{project.service_type}</p>
      )}
      <div className="flex gap-2 flex-wrap">
        <Link
          href={`/hub/projects/${project.id}`}
          className="px-3 py-1.5 bg-[#81D8D0] text-[#0a0a0a] rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          View Project
        </Link>
        <Link
          href={`/hub/projects/${project.id}#messages`}
          className="px-3 py-1.5 border border-[#333333] text-white rounded-lg text-sm hover:bg-[#0a0a0a] transition-colors"
        >
          Send Message
        </Link>
        {project.dropbox_link && (
          <a
            href={project.dropbox_link}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 border border-[#333333] text-white rounded-lg text-sm hover:bg-[#0a0a0a] transition-colors flex items-center gap-1"
          >
            <Upload size={14} />
            Upload Assets
          </a>
        )}
      </div>
    </div>
  )
}

function ActivityItem({ activity }: { activity: any }) {
  const getIcon = () => {
    switch (activity.type) {
      case 'message':
        return <MessageSquare size={16} className="text-[#81D8D0]" />
      case 'resource':
        return <Download size={16} className="text-[#81D8D0]" />
      case 'invoice':
        return <CheckCircle size={16} className="text-green-400" />
      default:
        return <FileText size={16} className="text-[#81D8D0]" />
    }
  }

  const timeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return format(time, 'MMM d')
  }

  return (
    <Link
      href={activity.href}
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#0a0a0a] transition-colors group"
    >
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm group-hover:text-[#81D8D0] transition-colors">
          {activity.label}
        </p>
        <p className="text-xs text-[#a1a1a1] mt-1">{timeAgo(activity.timestamp)}</p>
      </div>
    </Link>
  )
}

function BookingCard({ booking }: { booking: any }) {
  const inquiryTypeLabels: Record<string, string> = {
    speaking: 'Speaking Engagement',
    workshop: 'Workshop / Training',
    hosting: 'Event Hosting / Emcee',
    coaching: '1:1 Coaching',
    accelerator: 'Purpose Accelerator Cohort',
    scholarship: 'Your Scholarship Era Course',
    website: 'Custom Website',
    portal: 'Client Portal',
    tools: 'Business Tools',
    brand: 'Brand Identity Consulting',
    creative: 'Creative Direction',
    organization: 'Organization / Corporate',
  }

  const formattedDate = booking.booking_date
    ? formatDate(booking.booking_date)
    : 'TBD'

  return (
    <div className="bg-[#0a0a0a] border border-[#333333] rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="text-white font-medium mb-1">
            {inquiryTypeLabels[booking.inquiry_type] || booking.inquiry_type}
          </h3>
          <div className="flex items-center gap-3 text-sm text-[#a1a1a1]">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              {booking.booking_time}
            </span>
          </div>
        </div>
        <StatusBadge status={booking.status} />
      </div>
      <Link
        href={`/hub/bookings`}
        className="text-sm text-[#81D8D0] hover:text-[#81D8D0]/80 inline-flex items-center gap-1 mt-2"
      >
        View Details →
      </Link>
    </div>
  )
}

function EventCard({ event }: { event: any }) {
  const getEventImage = (event: any) => {
    if (event.image_urls && Array.isArray(event.image_urls) && event.image_urls.length > 0) {
      return event.image_urls[0]
    }
    if (event.image_url) {
      return event.image_url
    }
    return null
  }

  const eventImage = getEventImage(event)
  const eventDate = new Date(event.date)

  return (
    <div className="bg-[#0a0a0a] border border-[#333333] rounded-lg overflow-hidden">
      {eventImage && (
        <div className="aspect-video w-full bg-[#1a1a1a] overflow-hidden">
          <img
            src={eventImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-white font-medium mb-2 line-clamp-2">{event.title}</h3>
        <p className="text-sm text-[#a1a1a1] mb-3">
          {format(eventDate, 'MMM d, yyyy')}
        </p>
        <a
          href={`https://ciarajevans.com/events/${event.slug || event.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[#81D8D0] hover:text-[#81D8D0]/80 inline-flex items-center gap-1"
        >
          Learn More →
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  )
}
