'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  ClipboardList,
  FileText,
  Package,
  Video,
  Smartphone,
  Mail,
  MessageCircle,
  Users,
} from 'lucide-react'
import HubHeader from '@/components/HubHeader'
import { createClient } from '@/lib/supabase/client'
import { useHubUser } from '@/components/hub/HubUserProvider'

type BookingModalType = 'vision' | 'strategy' | null

const bookingLinks: Record<'vision' | 'strategy', string> = {
  vision: 'https://calendly.com/media-ciarajevans/30min',
  strategy: 'https://calendly.com/media-ciarajevans/strategy-session-cje-media-clients-only',
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, role } = useHubUser()
  const [stats, setStats] = useState({ activeProjects: 0, upcomingBookings: 0, completed: 0 })
  const [loading, setLoading] = useState(true)
  const [bookingModal, setBookingModal] = useState<BookingModalType>(null)
  const [showRequestModal, setShowRequestModal] = useState(false)

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return
      const supabase = createClient()

      const { count: bookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', user.id)
        .in('status', ['pending', 'confirmed'])

      const { count: projectsCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', user.id)
        .eq('status', 'active')

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

    loadStats()
  }, [user])

  const handleActionNavigation = (href?: string) => {
    if (href) router.push(href)
  }

  const clientActions = [
    {
      id: 'vision',
      label: 'Vision Mapping Session',
      icon: Video,
      color: 'bg-primary-tiffany/10 text-primary-tiffany',
      onClick: () => setBookingModal('vision'),
    },
    {
      id: 'strategy',
      label: 'Strategy Session (Clients)',
      icon: Smartphone,
      color: 'bg-primary-charcoal/10 text-primary-charcoal',
      onClick: () => setBookingModal('strategy'),
    },
    {
      id: 'request',
      label: 'Request Services',
      icon: ClipboardList,
      color: 'bg-primary-tiffany/10 text-primary-tiffany',
      onClick: () => setShowRequestModal(true),
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: FileText,
      color: 'bg-primary-charcoal/10 text-primary-charcoal',
      href: '/hub/projects',
    },
    {
      id: 'deliverables',
      label: 'Deliverables',
      icon: Package,
      color: 'bg-primary-tiffany/10 text-primary-tiffany',
      href: '/hub/projects?view=deliverables',
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      color: 'bg-primary-charcoal/10 text-primary-charcoal',
      href: '/hub/messages',
    },
  ]

  const adminActions = [
    {
      id: 'book',
      label: 'Book Meeting',
      icon: Calendar,
      color: 'bg-primary-tiffany/10 text-primary-tiffany',
      onClick: () => setBookingModal('vision'),
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      color: 'bg-primary-charcoal/10 text-primary-charcoal',
      href: '/hub/calendar',
    },
    {
      id: 'projects',
      label: 'Manage Projects',
      icon: FileText,
      color: 'bg-primary-tiffany/10 text-primary-tiffany',
      href: '/hub/projects?mode=admin',
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      color: 'bg-primary-charcoal/10 text-primary-charcoal',
      href: '/hub/messages',
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: Users,
      color: 'bg-primary-tiffany/10 text-primary-tiffany',
      href: '/hub/clients',
    },
    {
      id: 'responses',
      label: 'Contact Forms',
      icon: Mail,
      color: 'bg-primary-charcoal/10 text-primary-charcoal',
      href: '/hub/messages',
    },
  ]

  const actions = role === 'admin' ? adminActions : clientActions

  if (loading) {
    return (
      <main className="min-h-screen bg-primary-white">
        <HubHeader title="Dashboard" />
        <div className="min-h-[60vh] flex items-center justify-center text-primary-charcoal/70">
          Loading your workspace...
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-primary-white">
      <HubHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-primary-black mb-2">
            {role === 'admin' ? 'Welcome, Ciara!' : 'Welcome back!'}
          </h1>
          <p className="text-sm sm:text-base text-primary-charcoal/70">
            {role === 'admin'
              ? 'Oversee bookings, clients, and projects from one place.'
              : 'Manage your projects, bookings, and deliverables all in one place.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8 lg:mb-12">
          {actions.map((action, index) => (
            <motion.button
              type="button"
              key={action.id}
              onClick={() => (action.onClick ? action.onClick() : handleActionNavigation(action.href))}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-primary-white border-2 border-primary-charcoal/10 rounded-lg p-3 sm:p-4 lg:p-6 text-center hover:border-primary-tiffany transition-all duration-300"
            >
              <div
                className={`${action.color} w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3`}
              >
                <action.icon size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div className="text-xs sm:text-sm font-medium text-primary-charcoal leading-tight">{action.label}</div>
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 lg:mb-12">
          <StatCard label="Active Projects" value={stats.activeProjects} icon={Package} />
          <StatCard label="Upcoming Bookings" value={stats.upcomingBookings} icon={Clock} />
          <StatCard label="Completed" value={stats.completed} icon={CheckCircle} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-white border-2 border-primary-charcoal/10 rounded-lg p-4 sm:p-6 lg:p-8"
        >
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary-black mb-4 sm:mb-6">Recent Activity</h2>
          <div className="text-center py-8 sm:py-12 text-primary-charcoal/50">
            <p className="text-sm sm:text-base">No recent activity to display</p>
            <p className="text-xs sm:text-sm mt-2">Your projects and bookings will appear here</p>
          </div>
        </motion.div>
      </div>

      {bookingModal && (
        <BookingModal type={bookingModal} onClose={() => setBookingModal(null)} />
      )}

      {showRequestModal && <RequestServicesModal onClose={() => setShowRequestModal(false)} />}
    </main>
  )
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-primary-white border-2 border-primary-charcoal/10 rounded-lg p-4 sm:p-6"
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="text-primary-charcoal/70 text-xs sm:text-sm">{label}</div>
        <Icon size={18} className="sm:w-5 sm:h-5 text-primary-tiffany flex-shrink-0" />
      </div>
      <div className="text-2xl sm:text-3xl font-serif font-bold text-primary-black">{value}</div>
    </motion.div>
  )
}

function BookingModal({ type, onClose }: { type: 'vision' | 'strategy'; onClose: () => void }) {
  return (
    <ModalShell title="Schedule Time" onClose={onClose}>
      <iframe
        src={bookingLinks[type]}
        width="100%"
        height="720"
        frameBorder="0"
        scrolling="no"
        title="Schedule with Calendly"
      />
    </ModalShell>
  )
}

function RequestServicesModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    from: '',
    phone: '',
    subject: 'Service Request',
    inquiryTypes: [] as string[],
    preferredContact: 'email',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitting, setSubmitting] = useState(false)

  const handleCheckboxChange = (value: string) => {
    setForm((prev) => {
      const exists = prev.inquiryTypes.includes(value)
      return {
        ...prev,
        inquiryTypes: exists
          ? prev.inquiryTypes.filter((item) => item !== value)
          : [...prev.inquiryTypes, value],
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setStatus('idle')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Client Hub Request',
          from: form.from,
          phone: form.phone,
          subject: form.subject,
          inquiryType: form.inquiryTypes,
          preferredContact: form.preferredContact,
          message: form.message,
        }),
      })
      if (!res.ok) throw new Error('Failed to send')
      setStatus('success')
      setForm({
        from: '',
        phone: '',
        subject: 'Service Request',
        inquiryTypes: [],
        preferredContact: 'email',
        message: '',
      })
    } catch (error) {
      console.error(error)
      setStatus('error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalShell title="Request Services" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-primary-charcoal mb-2">From *</label>
          <input
            type="email"
            required
            value={form.from}
            onChange={(e) => setForm((prev) => ({ ...prev, from: e.target.value }))}
            placeholder="you@example.com"
            className="w-full px-4 py-3 border-2 border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-primary-tiffany"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary-charcoal mb-2">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
            placeholder="(555) 123-4567"
            className="w-full px-4 py-3 border-2 border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-primary-tiffany"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary-charcoal mb-2">Subject</label>
          <input
            type="text"
            value={form.subject}
            onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
            className="w-full px-4 py-3 border-2 border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-primary-tiffany"
          />
        </div>

        <div>
          <span className="block text-sm font-semibold text-primary-charcoal mb-2">Inquiry Type</span>
          <div className="flex flex-col gap-2 text-sm text-primary-charcoal/80">
            {['Marketing', 'Events', 'Business Services'].map((type) => (
              <label key={type} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.inquiryTypes.includes(type)}
                  onChange={() => handleCheckboxChange(type)}
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        <div>
          <span className="block text-sm font-semibold text-primary-charcoal mb-2">
            Preferred Contact
          </span>
          <div className="flex gap-6 text-sm text-primary-charcoal/80">
            {['email', 'call'].map((method) => (
              <label key={method} className="flex items-center gap-2">
                <input
                  type="radio"
                  value={method}
                  checked={form.preferredContact === method}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, preferredContact: e.target.value }))
                  }
                />
                {method === 'email' ? 'Email' : 'Call'}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary-charcoal mb-2">Message *</label>
          <textarea
            required
            rows={4}
            value={form.message}
            onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
            placeholder="Tell us about your project, goals, or any specific requirements..."
            className="w-full px-4 py-3 border-2 border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-primary-tiffany"
          />
        </div>

        {status === 'success' && (
          <p className="text-sm text-green-600">
            Thank you for contacting us. We will reply within 24 business hours. Have a great day!
          </p>
        )}
        {status === 'error' && (
          <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full h-[56px]"
        >
          {submitting ? 'Sending...' : 'Send'}
        </button>
      </form>
    </ModalShell>
  )
}

function ModalShell({
  children,
  title,
  onClose,
}: {
  children: React.ReactNode
  title: string
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-primary-charcoal/60 hover:text-primary-charcoal text-2xl"
          aria-label="Close modal"
        >
          ×
        </button>
        <h3 className="text-3xl font-serif font-semibold text-primary-charcoal mb-6 text-center">
          {title}
        </h3>
        {children}
      </div>
    </div>
  )
}

