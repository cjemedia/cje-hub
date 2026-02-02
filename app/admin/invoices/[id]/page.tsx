'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { StatusBadge } from '@/components/StatusBadge'
import { format } from 'date-fns'
import { ArrowLeft, Trash, Send } from 'lucide-react'

export default function AdminInvoiceDetailPage() {
  const params = useParams()
  const invoiceId = params?.id as string
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [invoice, setInvoice] = useState<any>(null)
  const [project, setProject] = useState<any>(null)
  const [client, setClient] = useState<any>(null)

  const [editForm, setEditForm] = useState({
    amount: '',
    description: '',
    stripe_link: '',
    receipt_url: '',
    status: 'pending',
    due_date: '',
  })

  useEffect(() => {
    if (!invoiceId) return
    loadInvoice()
  }, [invoiceId])

  const loadInvoice = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('invoices')
      .select('*, users(id, name, email, company), projects(id, name)')
      .eq('id', invoiceId)
      .single()

    if (data) {
      setInvoice(data)
      setClient(data.users)
      setProject(data.projects)
      setEditForm({
        amount: data.amount?.toString() || '',
        description: data.description || '',
        stripe_link: data.stripe_link || '',
        receipt_url: data.receipt_url || '',
        status: data.status || 'pending',
        due_date: data.due_date || '',
      })
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    await supabase
      .from('invoices')
      .update({
        amount: parseFloat(editForm.amount) || 0,
        description: editForm.description,
        stripe_link: editForm.stripe_link,
        receipt_url: editForm.receipt_url,
        status: editForm.status,
        due_date: editForm.due_date || null,
        paid_at: editForm.status === 'paid' && !invoice.paid_at ? new Date().toISOString() : invoice.paid_at,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoiceId)

    await loadInvoice()

    // Send email notification about update
    try {
      await fetch('/api/invoices/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId, isUpdate: true }),
      })
    } catch {}

    router.refresh()
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this invoice? This cannot be undone.')) return
    await supabase.from('invoices').delete().eq('id', invoiceId)
    router.push('/admin/invoices')
  }

  const handleSendEmail = async () => {
    setSending(true)
    try {
      const res = await fetch('/api/invoices/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      })
      if (res.ok) {
        alert('Invoice email sent!')
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to send email')
      }
    } catch {
      alert('Failed to send email')
    }
    setSending(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/70">
        Loading invoice...
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/70">
        Invoice not found
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              href="/admin/invoices"
              className="inline-flex items-center gap-2 text-[#81D8D0] hover:text-[#81D8D0]/80 transition-colors mb-4"
            >
              <ArrowLeft size={16} />
              Back to Invoices
            </Link>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1 w-1 rounded-full bg-[#81D8D0]"></div>
              <span className="text-[#81D8D0] text-sm font-medium uppercase tracking-wider">Admin</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-semibold text-white mb-2">
              Invoice #{invoiceId.slice(0, 8)}
            </h1>
            <div className="flex items-center gap-3 text-sm text-[#a1a1a1]">
              {client && (
                <Link href={`/admin/clients/${client.id}`} className="text-[#81D8D0] hover:underline">
                  {client.name || client.email}
                </Link>
              )}
              <StatusBadge status={invoice.status} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSendEmail}
              disabled={sending}
              className="px-4 py-2 rounded-lg border border-[#81D8D0] text-[#81D8D0] hover:bg-[#81D8D0]/10 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={16} />
              {sending ? 'Sending...' : 'Send Email'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash size={16} />
            </button>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Invoice Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/60 uppercase tracking-wider mb-1 block">Amount</label>
              <input
                type="number"
                step="0.01"
                value={editForm.amount}
                onChange={(e) => setEditForm((p) => ({ ...p, amount: e.target.value }))}
                className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="text-xs text-white/60 uppercase tracking-wider mb-1 block">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-white/60 uppercase tracking-wider mb-1 block">Due Date</label>
              <input
                type="date"
                value={editForm.due_date || ''}
                onChange={(e) => setEditForm((p) => ({ ...p, due_date: e.target.value }))}
                className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-xs text-white/60 uppercase tracking-wider mb-1 block">Project</label>
              <div className="bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white">
                {project ? (
                  <Link href={`/admin/projects/${project.id}`} className="text-[#81D8D0] hover:underline">
                    {project.name}
                  </Link>
                ) : (
                  <span className="text-[#a1a1a1]">No project linked</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-white/60 uppercase tracking-wider mb-1 block">Description</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white resize-none"
              rows={2}
              placeholder="e.g., Deposit, Final Payment, etc."
            />
          </div>

          <div>
            <label className="text-xs text-white/60 uppercase tracking-wider mb-1 block">Stripe Invoice Link</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={editForm.stripe_link}
                onChange={(e) => setEditForm((p) => ({ ...p, stripe_link: e.target.value }))}
                className="flex-1 bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                placeholder="https://invoice.stripe.com/..."
              />
              {editForm.stripe_link && (
                <a
                  href={editForm.stripe_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg border border-[#81D8D0] text-[#81D8D0] hover:bg-[#81D8D0]/10 transition-colors whitespace-nowrap"
                >
                  Open Link
                </a>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs text-white/60 uppercase tracking-wider mb-1 block">Receipt URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={editForm.receipt_url}
                onChange={(e) => setEditForm((p) => ({ ...p, receipt_url: e.target.value }))}
                className="flex-1 bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                placeholder="https://..."
              />
              {editForm.receipt_url && (
                <a
                  href={editForm.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg border border-[#81D8D0] text-[#81D8D0] hover:bg-[#81D8D0]/10 transition-colors whitespace-nowrap"
                >
                  View Receipt
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Additional Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-xs text-white/60 uppercase tracking-wider mb-1 block">Client</label>
              <p className="text-white">{client?.name || 'N/A'}</p>
              <p className="text-[#a1a1a1]">{client?.email || ''}</p>
              {client?.company && <p className="text-[#a1a1a1]">{client.company}</p>}
            </div>
            <div>
              <label className="text-xs text-white/60 uppercase tracking-wider mb-1 block">Created</label>
              <p className="text-white">
                {invoice.created_at ? format(new Date(invoice.created_at), 'MMM d, yyyy h:mm a') : 'N/A'}
              </p>
            </div>
            {invoice.paid_at && (
              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider mb-1 block">Paid At</label>
                <p className="text-white">
                  {format(new Date(invoice.paid_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
