import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'
import { formatDate } from '@/lib/utils/date'
import { StatusBadge } from '@/components/StatusBadge'
import { DollarSign } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getInvoices() {
  const supabase = await createClient()

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*, users(name, email), projects(name)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching invoices:', error)
    return []
  }

  return invoices || []
}

async function getInvoiceStats() {
  const supabase = await createClient()

  // Total Revenue (sum of paid invoices)
  const { data: paidInvoices } = await supabase
    .from('invoices')
    .select('amount')
    .eq('status', 'paid')

  const totalRevenue = paidInvoices?.reduce((sum, inv) => sum + Number(inv.amount || 0), 0) || 0

  // Pending (sum of pending invoices)
  const { data: pendingInvoices } = await supabase
    .from('invoices')
    .select('amount')
    .eq('status', 'pending')

  const totalPending = pendingInvoices?.reduce((sum, inv) => sum + Number(inv.amount || 0), 0) || 0

  // Overdue (sum of overdue invoices)
  const { data: overdueInvoices } = await supabase
    .from('invoices')
    .select('amount')
    .eq('status', 'overdue')

  const totalOverdue = overdueInvoices?.reduce((sum, inv) => sum + Number(inv.amount || 0), 0) || 0

  return {
    totalRevenue,
    totalPending,
    totalOverdue,
  }
}

export default async function AdminInvoicesPage() {
  const invoices = await getInvoices()
  const stats = await getInvoiceStats()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1 w-1 rounded-full bg-[#81D8D0]"></div>
            <span className="text-[#81D8D0] text-sm font-medium uppercase tracking-wider">Admin</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-semibold text-white mb-2">All Invoices</h1>
          <p className="text-[#a1a1a1]">View and manage all client invoices</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="text-green-400" size={24} />
              <p className="text-[#a1a1a1] text-sm">Total Revenue</p>
            </div>
            <p className="text-3xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="text-yellow-400" size={24} />
              <p className="text-[#a1a1a1] text-sm">Pending</p>
            </div>
            <p className="text-3xl font-bold text-white">{formatCurrency(stats.totalPending)}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="text-red-400" size={24} />
              <p className="text-[#a1a1a1] text-sm">Overdue</p>
            </div>
            <p className="text-3xl font-bold text-white">{formatCurrency(stats.totalOverdue)}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'paid', 'overdue'].map((status) => (
            <button
              key={status}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[#1a1a1a] border border-[#333333] text-white/70 hover:text-white transition-colors"
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Invoice Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {invoices.length === 0 ? (
            <div className="col-span-full bg-[#1a1a1a] border border-[#333333] rounded-xl p-8 text-center text-[#a1a1a1]">
              No invoices found
            </div>
          ) : (
            invoices.map((invoice: any) => (
              <Link
                key={invoice.id}
                href={`/admin/invoices/${invoice.id}`}
                className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-5 hover:border-[#81D8D0]/50 transition-colors flex flex-col"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-lg truncate">
                      Invoice #{invoice.id.slice(0, 8)}...
                    </h3>
                    <p className="text-[#a1a1a1] text-sm truncate">
                      {invoice.users?.name || invoice.users?.email || 'N/A'}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <StatusBadge status={invoice.status} />
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="text-sm">
                    <span className="text-[#a1a1a1]">Project: </span>
                    <span className="text-white">{invoice.projects?.name || 'N/A'}</span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    {formatCurrency(Number(invoice.amount || 0))}
                  </div>
                </div>

                <div className="mt-auto pt-3 border-t border-[#333333] space-y-1 text-xs text-[#a1a1a1]">
                  <div>
                    <span className="text-white/60">Due: </span>
                    {formatDate(invoice.due_date)}
                  </div>
                  {invoice.paid_at && (
                    <div>
                      <span className="text-white/60">Paid: </span>
                      {format(new Date(invoice.paid_at), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

