import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Calendar, FolderKanban, Receipt, ArrowRight, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

async function getAdminStats() {
  const supabase = await createClient()

  // Total Clients
  const { count: totalClients } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'client')

  // Upcoming Bookings
  const today = new Date().toISOString().split('T')[0]
  const { count: upcomingBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .gte('booking_date', today)
    .in('status', ['pending', 'confirmed'])

  // Active Projects
  const { count: activeProjects } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .in('status', ['in_progress', 'confirmed'])

  // Pending Invoices
  const { count: pendingInvoices } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  // New inquiries (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const { count: newInquiries } = await supabase
    .from('contact_messages')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo.toISOString())

  return {
    totalClients: totalClients || 0,
    upcomingBookings: upcomingBookings || 0,
    activeProjects: activeProjects || 0,
    pendingInvoices: pendingInvoices || 0,
    newInquiries: newInquiries || 0,
  }
}

async function getRecentActivity() {
  const supabase = await createClient()

  // Last 5 bookings
  const { data: recentBookings } = await supabase
    .from('bookings')
    .select('*, users(name, email)')
    .order('created_at', { ascending: false })
    .limit(5)

  // Last 5 contact form submissions
  const { data: recentContacts } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  // Last 5 client messages
  const { data: recentMessages } = await supabase
    .from('messages')
    .select('*, users(name, email)')
    .order('created_at', { ascending: false })
    .limit(5)

  return {
    recentBookings: recentBookings || [],
    recentContacts: recentContacts || [],
    recentMessages: recentMessages || [],
  }
}

export default async function AdminDashboard() {
  const stats = await getAdminStats()
  const activity = await getRecentActivity()

  const statCards = [
    {
      label: 'New Inquiries (7d)',
      value: stats.newInquiries,
      icon: MessageSquare,
      href: '/admin/messages',
      color: 'text-[#81D8D0]',
    },
    {
      label: 'Total Clients',
      value: stats.totalClients,
      icon: Users,
      href: '/admin/clients',
      color: 'text-[#81D8D0]',
    },
    {
      label: 'Upcoming Bookings',
      value: stats.upcomingBookings,
      icon: Calendar,
      href: '/admin/bookings',
      color: 'text-[#81D8D0]',
    },
    {
      label: 'Active Projects',
      value: stats.activeProjects,
      icon: FolderKanban,
      href: '/admin/projects',
      color: 'text-[#81D8D0]',
    },
    {
      label: 'Pending Invoices',
      value: stats.pendingInvoices,
      icon: Receipt,
      href: '/admin/invoices',
      color: 'text-[#81D8D0]',
    },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-[#81D8D0]"></div>
            <span className="text-[#81D8D0] text-sm font-medium uppercase tracking-wider">Admin</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-semibold text-white">Admin Dashboard</h1>
          <p className="text-[#a1a1a1]">Overview of clients, bookings, projects, and messages</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={stat.label}>
                <Link
                  href={stat.href}
                  className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-5 hover:border-[#81D8D0]/50 transition-colors block"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[#a1a1a1] text-sm">{stat.label}</div>
                    <Icon className={stat.color} size={22} />
                  </div>
                  <div className="text-3xl font-semibold text-white">{stat.value}</div>
                </Link>
              </div>
            )
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Recent Bookings</h2>
              <Link href="/admin/bookings" className="text-[#81D8D0] text-sm hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {activity.recentBookings.length === 0 ? (
                <p className="text-[#a1a1a1] text-sm">No bookings yet</p>
              ) : (
                activity.recentBookings.map((booking: any) => (
                  <div key={booking.id} className="border-b border-[#333333] pb-3 last:border-0 last:pb-0">
                    <p className="text-white text-sm font-medium">
                      {booking.users?.name || booking.users?.email || booking.name || 'Unknown'}
                    </p>
                    <p className="text-[#a1a1a1] text-xs">
                      {booking.booking_date ? format(new Date(booking.booking_date), 'MMM d, yyyy') : 'TBD'} at{' '}
                      {booking.booking_time || 'TBD'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Form Submissions */}
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Recent Form Submissions</h2>
              <Link href="/admin/messages" className="text-[#81D8D0] text-sm hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {activity.recentContacts.length === 0 ? (
                <p className="text-[#a1a1a1] text-sm">No submissions yet</p>
              ) : (
                activity.recentContacts.map((contact: any) => (
                  <div key={contact.id} className="border-b border-[#333333] pb-3 last:border-0 last:pb-0">
                    <p className="text-white text-sm font-medium">
                      {contact.name || contact.sender_name || contact.sender_email || 'Website Visitor'}
                    </p>
                    <p className="text-[#a1a1a1] text-xs">{contact.email || contact.sender_email}</p>
                    <p className="text-[#a1a1a1] text-xs line-clamp-1">{contact.subject || contact.message}</p>
                    <p className="text-[#a1a1a1] text-xs mt-1">
                      {format(new Date(contact.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Client Messages</h2>
              <Link href="/admin/messages" className="text-[#81D8D0] text-sm hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {activity.recentMessages.length === 0 ? (
                <p className="text-[#a1a1a1] text-sm">No messages yet</p>
              ) : (
                activity.recentMessages.map((message: any) => (
                  <div key={message.id} className="border-b border-[#333333] pb-3 last:border-0 last:pb-0">
                    <p className="text-white text-sm font-medium">
                      {message.users?.name || message.users?.email || 'Unknown'}
                    </p>
                    <p className="text-[#a1a1a1] text-xs line-clamp-2">{message.content}</p>
                    <p className="text-[#a1a1a1] text-xs mt-1">
                      {format(new Date(message.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Quick Links</h2>
            <Link href="/admin/messages" className="text-[#81D8D0] text-sm hover:underline">
              Messages
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <QuickLink href="/admin/clients" icon={Users} label="Clients" />
            <QuickLink href="/admin/bookings" icon={Calendar} label="Bookings" />
            <QuickLink href="/admin/projects" icon={FolderKanban} label="Projects" />
            <QuickLink href="/admin/messages" icon={MessageSquare} label="Messages" />
            <QuickLink href="/admin/invoices" icon={Receipt} label="Invoices" />
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <Link
      href={href}
      className="text-center p-4 bg-[#0a0a0a] border border-[#333333] rounded-lg hover:border-[#81D8D0]/50 transition-colors group"
    >
      <div className="flex flex-col items-center text-center">
        <div className="bg-[#81D8D0]/10 text-[#81D8D0] w-12 h-12 rounded-lg flex items-center justify-center mb-3">
          <Icon size={22} />
        </div>
        <p className="text-white text-sm font-medium">{label}</p>
      </div>
    </Link>
  )
}

