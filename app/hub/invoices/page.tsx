'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Receipt } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useHubUser } from '@/components/hub/HubUserProvider'
import { format } from 'date-fns'
import { formatDate } from '@/lib/utils/date'
import { getUserProjectIds } from '@/lib/utils'

type Invoice = {
  id: string
  project_id: string | null
  amount: number
  status: string
  description: string | null
  stripe_link: string | null
  receipt_url: string | null
  due_date: string | null
  paid_at: string | null
  created_at: string
  projects: { name: string } | { name: string }[] | null
}

export default function InvoicesPage() {
  const { user } = useHubUser()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadInvoices = async () => {
      if (!user?.id) return
      const supabase = createClient()

      const projectIds = await getUserProjectIds(supabase, user.id)

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          id,
          project_id,
          amount,
          status,
          description,
          stripe_link,
          receipt_url,
          due_date,
          paid_at,
          created_at,
          projects:project_id (
            name
          )
        `)
        .or("user_id.eq." + user.id + ",project_id.in.(" + projectIds.join(",") + ")")
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading invoices:', error)
        setInvoices([])
      } else {
        console.log('Invoices data:', data)
        setInvoices(data || [])
      }
      setLoading(false)
    }

    loadInvoices()
  }, [user?.id])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatInvoiceId = (id: string) => {
    return id.substring(0, 8).toUpperCase()
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      paid: 'bg-green-500/20 text-green-400 border-green-500/30',
      overdue: 'bg-red-500/20 text-red-400 border-red-500/30',
      cancelled: 'bg-[#333333] text-[#a1a1a1] border-[#333333]',
    }
    return styles[status as keyof typeof styles] || styles.pending
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8">
        <div className="min-h-[60vh] flex items-center justify-center text-[#a1a1a1]">
          Loading invoices...
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
          Invoices
        </h1>
        <p className="text-[#a1a1a1]">
          View and manage your invoices
        </p>
      </motion.div>

      {invoices.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-12 text-center"
        >
          <Receipt className="w-16 h-16 text-[#a1a1a1]/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No invoices yet</h2>
          <p className="text-[#a1a1a1]">
            Your invoices will appear here when they are created.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 hover:border-[#81D8D0]/50 transition-colors"
            >
              <div className="flex flex-col gap-3">
                {/* Amount + Status */}
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-white font-semibold text-lg">
                    {formatCurrency(invoice.amount)}
                  </p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(invoice.status)}`}
                  >
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </div>

                {/* Description */}
                {invoice.description && (
                  <p className="text-[#a1a1a1] text-sm">{invoice.description}</p>
                )}

                {/* Project + Links + Created Date */}
                <div className="flex flex-wrap gap-3 text-sm items-center border-t border-[#333333] pt-3">
                  <span className="text-[#a1a1a1]">
                    Project:{' '}
                    <span className="text-white">
                      {invoice.projects && !Array.isArray(invoice.projects)
                        ? invoice.projects.name
                        : (invoice.projects as { name: string }[] | null)?.[0]?.name || 'No project'}
                    </span>
                  </span>
                  {invoice.stripe_link && (
                    <a
                      href={invoice.stripe_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#81D8D0] hover:underline"
                    >
                      Stripe Link →
                    </a>
                )}
                  {invoice.receipt_url && (
                    <a
                      href={invoice.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#81D8D0] hover:underline"
                    >
                      Receipt →
                    </a>
                  )}
                  <span className="text-[#a1a1a1]">
                    Created {format(new Date(invoice.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
