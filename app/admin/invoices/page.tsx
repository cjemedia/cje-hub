import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'
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
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-7xl mx-auto">
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

        {/* Invoices Table */}
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0a0a0a] border-b border-[#333333]">
                <tr>
                  <th className="text-left px-6 py-4 text-white/80 text-sm font-semibold">Invoice #</th>
                  <th className="text-left px-6 py-4 text-white/80 text-sm font-semibold">Client</th>
                  <th className="text-left px-6 py-4 text-white/80 text-sm font-semibold">Project</th>
                  <th className="text-left px-6 py-4 text-white/80 text-sm font-semibold">Amount</th>
                  <th className="text-left px-6 py-4 text-white/80 text-sm font-semibold">Status</th>
                  <th className="text-left px-6 py-4 text-white/80 text-sm font-semibold">Due Date</th>
                  <th className="text-left px-6 py-4 text-white/80 text-sm font-semibold">Paid Date</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[#a1a1a1]">
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice: any) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-[#333333] hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <Link href={`/admin/invoices/${invoice.id}`} className="text-white hover:text-[#81D8D0] transition-colors">
                          {invoice.id.slice(0, 8)}...
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-white">
                        {invoice.users?.name || invoice.users?.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-[#a1a1a1]">
                        {invoice.projects?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-white font-semibold">
                        {formatCurrency(Number(invoice.amount || 0))}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={invoice.status} />
                      </td>
                      <td className="px-6 py-4 text-[#a1a1a1] text-sm">
                        {invoice.due_date ? format(new Date(invoice.due_date), 'MMM d, yyyy') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-[#a1a1a1] text-sm">
                        {invoice.paid_at ? format(new Date(invoice.paid_at), 'MMM d, yyyy') : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

