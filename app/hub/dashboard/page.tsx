'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Calendar,
  FolderKanban,
  Download,
  MessageSquare,
  Clock,
  Package,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useHubUser } from '@/components/hub/HubUserProvider'
import { StatusBadge } from '@/components/StatusBadge'
import { format } from 'date-fns'
import type { Booking } from '@/types/database'

export default function DashboardPage() {
  const router = useRouter()
  const { user, role } = useHubUser()
  const [stats, setStats] = useState({
    upcomingSessions: 0,
    activeProjects: 0,
    resourcesAvailable: 0,
  })
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!user) return
      const supabase = createClient()

      // Get upcoming bookings (matching by email)
      const today = new Date().toISOString().split('T')[0]
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .eq('email', user.email || '')
        .gte('booking_date', today)
        .in('status', ['pending', 'confirmed'])
        .order('booking_date', { ascending: true })
        .order('booking_time', { ascending: true })
        .limit(5)

      setUpcomingBookings(bookingsData || [])

      // Count upcoming sessions
      const { count: sessionsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('email', user.email || '')
        .gte('booking_date', today)
        .in('status', ['pending', 'confirmed'])

      // Count active projects
      const { count: projectsCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', user.id)
        .in('status', ['confirmed', 'in_progress'])

      // Count deliverables/resources
      const { data: deliverablesData } = await supabase
        .from('deliverables')
        .select('id', { count: 'exact', head: true })
        .eq('client_id', user.id)

      setStats({
        upcomingSessions: sessionsCount || 0,
        activeProjects: projectsCount || 0,
        resourcesAvailable: deliverablesData?.length || 0,
      })
      setLoading(false)
    }

    loadData()
  }, [user])

  const quickLinks = [
    { href: '/hub/projects', icon: FolderKanban, label: 'My Projects' },
    { href: '/hub/bookings', icon: Calendar, label: 'My Bookings' },
    { href: '/hub/deliverables', icon: Download, label: 'Resources' },
    { href: '/hub/messages', icon: MessageSquare, label: 'Messages' },
  ]

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
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl lg:text-4xl font-semibold text-white mb-2">
          Welcome back, {user?.name || 'there'}!
        </h1>
        <p className="text-[#a1a1a1]">
          Here's what's happening with your projects and bookings.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard
          label="Upcoming Sessions"
          value={stats.upcomingSessions}
          icon={Clock}
        />
        <StatCard
          label="Active Projects"
          value={stats.activeProjects}
          icon={Package}
        />
        <StatCard
          label="Resources Available"
          value={stats.resourcesAvailable}
          icon={Download}
        />
      </div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 hover:border-[#81D8D0]/50 transition-colors group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="bg-[#81D8D0]/10 text-[#81D8D0] w-12 h-12 rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#81D8D0]/20 transition-colors">
                    <Icon size={24} />
                  </div>
                  <span className="text-sm font-medium text-white">{link.label}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </motion.div>

      {/* Upcoming Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Upcoming Sessions</h2>
          <Link
            href="/hub/bookings"
            className="text-sm text-[#81D8D0] hover:text-[#81D8D0]/80 flex items-center gap-2"
          >
            View All
            <ArrowRight size={16} />
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-[#a1a1a1]/30 mx-auto mb-4" />
            <p className="text-[#a1a1a1] mb-2">No upcoming sessions</p>
            <Link
              href="/booking"
              className="text-sm text-[#81D8D0] hover:text-[#81D8D0]/80"
            >
              Book a session →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: any
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-[#a1a1a1] text-sm">{label}</div>
        <Icon size={20} className="text-[#81D8D0]" />
      </div>
      <div className="text-3xl font-semibold text-white">{value}</div>
    </motion.div>
  )
}

function BookingCard({ booking }: { booking: Booking }) {
  const inquiryTypeLabels: Record<string, string> = {
    speaking: 'Speaking Engagement',
    workshop: 'Workshop / Training',
    hosting: 'Event Hosting / Emcee',
    coaching: '1:1 Coaching',
    accelerator: 'Purpose Accelerator Cohort',
    website: 'Custom Website',
    portal: 'Client Portal',
    tools: 'Business Tools',
    brand: 'Brand Identity Consulting',
    creative: 'Creative Direction',
    organization: 'Organization / Corporate',
  }

  const formattedDate = booking.booking_date
    ? format(new Date(booking.booking_date), 'MMM d, yyyy')
    : 'TBD'

  return (
    <div className="bg-[#0a0a0a] border border-[#333333] rounded-lg p-4 hover:border-[#81D8D0]/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-white font-medium">
              {inquiryTypeLabels[booking.inquiry_type] || booking.inquiry_type}
            </h3>
            <StatusBadge status={booking.status} />
          </div>
          <div className="flex items-center gap-4 text-sm text-[#a1a1a1]">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {booking.booking_time}
            </span>
          </div>
          {booking.notes && (
            <p className="text-sm text-[#a1a1a1] mt-2 line-clamp-2">{booking.notes}</p>
          )}
        </div>
      </div>
    </div>
  )
}
