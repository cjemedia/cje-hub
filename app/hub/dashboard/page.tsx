'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import {
  Calendar,
  Camera,
  FileText,
  LogOut,
  Package,
  Clock,
  CheckCircle,
  Mail,
} from 'lucide-react'
import Button from '@/components/Button'
import HubHeader from '@/components/HubHeader'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    activeProjects: 0,
    upcomingBookings: 0,
    completed: 0,
  })

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/hub/login')
        return
      }

      setUser(user)

      // Fetch bookings count
      const { count: bookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', user.id)
        .in('status', ['pending', 'confirmed'])

      // Fetch projects count
      const { count: projectsCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', user.id)
        .eq('status', 'active')

      // Fetch completed count
      const { count: completedCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', user.id)
        .eq('status', 'completed')

      setStats({
        activeProjects: projectsCount || 0,
        upcomingBookings: bookingsCount || 0,
        completed: completedCount || 0,
      })
      setLoading(false)
    }

    getUser()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/hub/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary-charcoal/70">Loading...</div>
      </div>
    )
  }

  const quickActions = [
    {
      icon: Calendar,
      label: 'Book Meeting',
      href: '/hub/booking',
      color: 'bg-primary-tiffany/10 text-primary-tiffany',
    },
    {
      icon: Camera,
      label: 'Schedule Shoot',
      href: '/hub/booking?type=content-shoot',
      color: 'bg-primary-charcoal/10 text-primary-charcoal',
    },
    {
      icon: FileText,
      label: 'View Projects',
      href: '/hub/projects',
      color: 'bg-primary-tiffany/10 text-primary-tiffany',
    },
    {
      icon: Package,
      label: 'Deliverables',
      href: '/hub/projects',
      color: 'bg-primary-charcoal/10 text-primary-charcoal',
    },
    {
      icon: Mail,
      label: 'Contact Responses',
      href: '/hub/inquiries',
      color: 'bg-primary-tiffany/10 text-primary-tiffany',
    },
  ]

  return (
    <main className="min-h-screen bg-primary-white">
      <HubHeader user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-serif font-bold text-primary-black mb-2">
            Welcome back!
          </h1>
          <p className="text-primary-charcoal/70">
            Manage your projects, bookings, and deliverables all in one place.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          {quickActions.map((action, index) => (
            <motion.a
              key={action.label}
              href={action.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-primary-white border-2 border-primary-charcoal/10 rounded-lg p-6 hover:border-primary-tiffany transition-all duration-300 text-center"
            >
              <div
                className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3`}
              >
                <action.icon size={24} />
              </div>
              <div className="text-sm font-medium text-primary-charcoal">
                {action.label}
              </div>
            </motion.a>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-primary-white border-2 border-primary-charcoal/10 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-primary-charcoal/70 text-sm">Active Projects</div>
              <Package size={20} className="text-primary-tiffany" />
            </div>
            <div className="text-3xl font-serif font-bold text-primary-black">
              {stats.activeProjects}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary-white border-2 border-primary-charcoal/10 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-primary-charcoal/70 text-sm">Upcoming Bookings</div>
              <Clock size={20} className="text-primary-tiffany" />
            </div>
            <div className="text-3xl font-serif font-bold text-primary-black">
              {stats.upcomingBookings}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-primary-white border-2 border-primary-charcoal/10 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-primary-charcoal/70 text-sm">Completed</div>
              <CheckCircle size={20} className="text-primary-tiffany" />
            </div>
            <div className="text-3xl font-serif font-bold text-primary-black">
              {stats.completed}
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-white border-2 border-primary-charcoal/10 rounded-lg p-8"
        >
          <h2 className="text-2xl font-serif font-bold text-primary-black mb-6">
            Recent Activity
          </h2>
          <div className="text-center py-12 text-primary-charcoal/50">
            <p>No recent activity to display</p>
            <p className="text-sm mt-2">
              Your projects and bookings will appear here
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  )
}

