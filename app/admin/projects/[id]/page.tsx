'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { StatusBadge } from '@/components/StatusBadge'
import { format } from 'date-fns'
import { Loader2, Pencil, Trash, Upload, FileText, Calendar, MessageSquare, Paperclip, CheckCircle, Send, StickyNote, Link as LinkIcon, Percent } from 'lucide-react'

type Project = any
type Proposal = any
type IntakeForm = any
type IntakeResponse = any
type Deliverable = any
type Invoice = any
type Activity = any
type Booking = any
type Message = any

const projectStatuses = ['inquiry', 'confirmed', 'in_progress', 'completed', 'cancelled']

export default function AdminProjectDetailPage() {
  const params = useParams()
  const projectId = params?.id as string
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [projectData, setProjectData] = useState<Project | null>(null)
  const [stats, setStats] = useState<any>({})
  const [tab, setTab] = useState('overview')

  // Collections
  const [intakeForms, setIntakeForms] = useState<IntakeForm[]>([])
  const [intakeResponses, setIntakeResponses] = useState<IntakeResponse[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [expandedProposal, setExpandedProposal] = useState<string | null>(null)
  const [activeProposal, setActiveProposal] = useState<Proposal | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [messageDraft, setMessageDraft] = useState('')
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [activity, setActivity] = useState<Activity[]>([])
  const [adminNote, setAdminNote] = useState('')

  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    status: '',
    service_type: '',
    start_date: '',
    end_date: '',
    dropbox_link: '',
  })

  const [proposalForm, setProposalForm] = useState({
    title: '',
    description: '',
    valid_until: '',
    discount: '',
    items: [{ title: '', description: '', price: '' }],
  })
  const [creatingProposal, setCreatingProposal] = useState(false)

  const [intakeAssign, setIntakeAssign] = useState({ form_id: '' })
  const [uploading, setUploading] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [invoiceForm, setInvoiceForm] = useState({
    amount: '',
    description: '',
    stripe_link: '',
    status: 'pending',
  })
  const [invoiceReceiptFile, setInvoiceReceiptFile] = useState<File | null>(null)
  const [creatingInvoice, setCreatingInvoice] = useState(false)

  useEffect(() => {
    if (!projectId) return
    const load = async () => {
      setLoading(true)
      await Promise.all([
        loadProject(),
        loadIntakeForms(),
        loadProposals(),
        loadBookings(),
        loadMessages(),
        loadDeliverables(),
        loadInvoices(),
        loadActivity(),
        loadIntakeResponses(),
      ])
      setLoading(false)
    }
    load()
  }, [projectId])

  const loadProject = async () => {
    const res = await fetch(`/api/projects/${projectId}`)
    if (res.ok) {
      const json = await res.json()
      setProjectData(json.project)
      setStats(json.stats || {})
      setEditForm({
        name: json.project.name || '',
        description: json.project.description || '',
        status: json.project.status || '',
        service_type: json.project.service_type || '',
        start_date: json.project.start_date || '',
        end_date: json.project.end_date || '',
        dropbox_link: json.project.dropbox_link || '',
      })
    }
  }

  const loadIntakeForms = async () => {
    const res = await fetch('/api/intake-forms')
    if (res.ok) setIntakeForms(await res.json())
  }

  const loadIntakeResponses = async () => {
    const { data } = await supabase
      .from('intake_responses')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    setIntakeResponses(data || [])
  }

  const loadProposals = async () => {
    const res = await fetch('/api/proposals')
    if (res.ok) {
      const all = await res.json()
      setProposals((all || []).filter((p: any) => p.project_id === projectId))
    }
  }

  const loadBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('project_id', projectId)
      .order('booking_date', { ascending: false })
    setBookings(data || [])
  }

  const loadMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    setMessages(data || [])
  }

  const loadDeliverables = async () => {
    const { data } = await supabase
      .from('deliverables')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    setDeliverables(data || [])
  }

  const loadInvoices = async () => {
    const { data } = await supabase
      .from('invoices')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    setInvoices(data || [])
  }

  const loadActivity = async () => {
    const res = await fetch(`/api/projects/${projectId}/activity`)
    if (res.ok) setActivity(await res.json())
  }

  const handleSaveProject = async () => {
    setSaving(true)
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    if (res.ok) {
      await loadProject()
      router.refresh()
    }
    setSaving(false)
  }

  const handleDeleteProject = async () => {
    const ok = confirm('Delete this project? This cannot be undone.')
    if (!ok) return
    const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/admin/projects')
    }
  }

  const handleAssignIntake = async () => {
    if (!intakeAssign.form_id || !projectData) return
    await fetch('/api/intake-responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        form_id: intakeAssign.form_id,
        project_id: projectId,
        user_id: projectData.user_id,
      }),
    })
    setIntakeAssign({ form_id: '' })
    await loadIntakeResponses()
    await loadActivity()
  }

  const handleCreateProposal = async () => {
    if (!projectData) return
    setCreatingProposal(true)
    const items = proposalForm.items
      .filter((i) => i.title || i.price)
      .map((i) => ({ ...i, price: Number(i.price || 0) }))
    const discountValue = Number(proposalForm.discount || 0)
    if (discountValue > 0) {
      items.push({
        title: 'Discount',
        description: '',
        price: -Math.abs(discountValue),
      })
    }
    const total_amount = items.reduce((sum, i) => sum + Number(i.price || 0), 0)
    await fetch('/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: projectId,
        user_id: projectData.user_id,
        title: proposalForm.title,
        description: proposalForm.description,
        items,
        total_amount,
        valid_until: proposalForm.valid_until || null,
        status: 'draft',
      }),
    })
    setCreatingProposal(false)
    setProposalForm({
      title: '',
      description: '',
      valid_until: '',
      discount: '',
      items: [{ title: '', description: '', price: '' }],
    })
    await loadProposals()
    await loadActivity()
  }

  const handleSendProposal = async (id: string) => {
    await fetch(`/api/proposals/${id}/send`, { method: 'POST' })
    await loadProposals()
    await loadActivity()
  }

  const handleSendMessage = async () => {
    if (!projectData || !messageDraft.trim()) return
    await fetch('/api/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: projectData.user_id,
        sender_type: 'admin',
        content: messageDraft.trim(),
        project_id: projectId,
      }),
    })
    setMessageDraft('')
    await loadMessages()
    await loadActivity()
  }

  const handleUploadDeliverable = async (file: File, name?: string, description?: string) => {
    const form = new FormData()
    form.append('file', file)
    form.append('project_id', projectId)
    form.append('name', name || file.name)
    if (description) form.append('description', description)
    setUploading(true)
    const res = await fetch('/api/deliverables', { method: 'POST', body: form })
    setUploading(false)
    if (res.ok) {
      await loadDeliverables()
      await loadActivity()
      router.refresh()
    }
  }

  const handleDeleteDeliverable = async (id: string) => {
    const ok = confirm('Delete this resource?')
    if (!ok) return
    const res = await fetch(`/api/deliverables/${id}`, { method: 'DELETE' })
    if (res.ok) {
      await loadDeliverables()
      await loadActivity()
      router.refresh()
    }
  }

  const handleCreateInvoice = async () => {
    if (!projectData || !invoiceForm.amount || !invoiceForm.stripe_link) return
    setCreatingInvoice(true)
    try {
      const formData = new FormData()
      formData.append('project_id', projectId)
      formData.append('user_id', projectData.user_id)
      formData.append('amount', invoiceForm.amount)
      formData.append('description', invoiceForm.description)
      formData.append('stripe_link', invoiceForm.stripe_link)
      formData.append('status', invoiceForm.status)
      if (invoiceReceiptFile) {
        formData.append('receipt', invoiceReceiptFile)
      }

      const res = await fetch('/api/invoices', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        await loadInvoices()
        await loadActivity()
        router.refresh()
        setShowInvoiceModal(false)
        setInvoiceForm({ amount: '', description: '', stripe_link: '', status: 'pending' })
        setInvoiceReceiptFile(null)
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
    } finally {
      setCreatingInvoice(false)
    }
  }

  const handleUpdateInvoice = async () => {
    if (!editingInvoice) return
    setCreatingInvoice(true)
    try {
      const formData = new FormData()
      formData.append('amount', invoiceForm.amount)
      formData.append('description', invoiceForm.description)
      formData.append('stripe_link', invoiceForm.stripe_link)
      formData.append('status', invoiceForm.status)
      if (invoiceReceiptFile) {
        formData.append('receipt', invoiceReceiptFile)
      }

      const res = await fetch(`/api/invoices/${editingInvoice.id}`, {
        method: 'PUT',
        body: formData,
      })

      if (res.ok) {
        await loadInvoices()
        await loadActivity()
        router.refresh()
        setShowInvoiceModal(false)
        setEditingInvoice(null)
        setInvoiceForm({ amount: '', description: '', stripe_link: '', status: 'pending' })
        setInvoiceReceiptFile(null)
      }
    } catch (error) {
      console.error('Error updating invoice:', error)
    } finally {
      setCreatingInvoice(false)
    }
  }

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm('Delete this invoice?')) return
    const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
    if (res.ok) {
      await loadInvoices()
      await loadActivity()
      router.refresh()
    }
  }

  const openEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice)
    setInvoiceForm({
      amount: invoice.amount?.toString() || '',
      description: invoice.description || '',
      stripe_link: invoice.stripe_link || '',
      status: invoice.status || 'pending',
    })
    setInvoiceReceiptFile(null)
    setShowInvoiceModal(true)
  }

  const handleSaveAdminNote = async () => {
    if (!adminNote.trim()) return
    await fetch(`/api/projects/${projectId}/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: projectData?.user_id,
        action: 'admin_note',
        details: { note: adminNote.trim() },
      }),
    })
    setAdminNote('')
    await loadActivity()
  }

  if (loading || !projectData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/70">
        Loading project...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1 w-1 rounded-full bg-[#81D8D0]"></div>
              <span className="text-[#81D8D0] text-sm font-medium uppercase tracking-wider">Admin</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-semibold text-white mb-2">{projectData.name}</h1>
            <div className="flex items-center gap-3 text-sm text-[#a1a1a1]">
              <Link href={`/admin/clients/${projectData.user_id || ''}`} className="text-[#81D8D0] hover:underline">
                {projectData.users?.name || projectData.users?.email || 'Client'}
              </Link>
              <StatusBadge status={projectData.status} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveProject}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleDeleteProject}
              className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash size={16} />
            </button>
          </div>
        </div>

        {/* Editable fields */}
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/60 uppercase tracking-wider">Name</label>
              <input
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 uppercase tracking-wider">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
              >
                {projectStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/60 uppercase tracking-wider">Service Type</label>
              <input
                value={editForm.service_type}
                onChange={(e) => setEditForm((p) => ({ ...p, service_type: e.target.value }))}
                className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider">Start Date</label>
                <input
                  type="date"
                  value={editForm.start_date || ''}
                  onChange={(e) => setEditForm((p) => ({ ...p, start_date: e.target.value }))}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider">End Date</label>
                <input
                  type="date"
                  value={editForm.end_date || ''}
                  onChange={(e) => setEditForm((p) => ({ ...p, end_date: e.target.value }))}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs text-white/60 uppercase tracking-wider">Description</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white resize-none"
              rows={3}
            />
          </div>
          <div>
            <label className="text-xs text-white/60 uppercase tracking-wider">Client Asset Upload Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={editForm.dropbox_link || ''}
                onChange={(e) => setEditForm((p) => ({ ...p, dropbox_link: e.target.value }))}
                className="flex-1 bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                placeholder="https://dropbox.com/request/..."
              />
              {editForm.dropbox_link && (
                <a
                  href={editForm.dropbox_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg border border-[#81D8D0] text-[#81D8D0] hover:bg-[#81D8D0]/10 transition-colors whitespace-nowrap"
                >
                  Test Link
                </a>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-white">
            <StatCard label="Total Invoiced" value={`$${Number(stats.totalInvoiced || 0).toFixed(2)}`} />
            <StatCard label="Total Paid" value={`$${Number(stats.totalPaid || 0).toFixed(2)}`} />
            <StatCard label="Bookings" value={stats.bookingsCount || 0} />
            <StatCard label="Messages" value={stats.messagesCount || 0} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 border-b border-[#333333] pb-2">
            {['overview','intake','proposals','bookings','messages','resources','invoices','activity'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 pb-2 text-sm font-medium border-b-2 ${
                  tab === t ? 'border-[#81D8D0] text-[#81D8D0]' : 'border-transparent text-[#a1a1a1]'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 text-[#a1a1a1]">
              <p className="text-white mb-2">Created: {projectData.created_at ? format(new Date(projectData.created_at), 'MMM d, yyyy') : 'N/A'}</p>
              <p>{projectData.description || 'No description provided.'}</p>
            </div>
          )}

          {tab === 'intake' && (
            <div className="space-y-4">
              <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 space-y-3">
                <h3 className="text-white font-semibold">Send Intake Form</h3>
                <div className="flex flex-col md:flex-row gap-3">
                  <select
                    value={intakeAssign.form_id}
                    onChange={(e) => setIntakeAssign({ form_id: e.target.value })}
                    className="flex-1 bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">Select template</option>
                    {intakeForms.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignIntake}
                    disabled={!intakeAssign.form_id}
                    className="px-4 py-2 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 disabled:opacity-50"
                  >
                    Send to Client
                  </button>
                </div>
              </div>
              <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 space-y-3">
                <h3 className="text-white font-semibold">Responses</h3>
                {intakeResponses.length === 0 ? (
                  <p className="text-[#a1a1a1] text-sm">No intake responses yet.</p>
                ) : (
                  <div className="space-y-2">
                    {intakeResponses.map((r) => (
                      <div key={r.id} className="p-3 border border-[#333333] rounded-lg text-white flex items-center justify-between">
                        <div>
                          <p className="font-medium">Response</p>
                          <p className="text-xs text-[#a1a1a1]">
                            {r.submitted_at ? `Submitted ${format(new Date(r.submitted_at), 'MMM d, yyyy')}` : 'Pending'}
                          </p>
                        </div>
                        {r.submitted_at && <CheckCircle className="text-[#81D8D0]" size={18} />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'proposals' && (
            <div className="space-y-4">
              <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 space-y-3">
                <h3 className="text-white font-semibold">Create Proposal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    className="bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                    placeholder="Title"
                    value={proposalForm.title}
                    onChange={(e) => setProposalForm((p) => ({ ...p, title: e.target.value }))}
                  />
                  <input
                    type="date"
                    className="bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                    value={proposalForm.valid_until}
                    onChange={(e) => setProposalForm((p) => ({ ...p, valid_until: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60 uppercase tracking-wider mb-1 block">Discount (optional)</label>
                  <div className="flex items-center gap-2">
                    <Percent size={14} className="text-[#a1a1a1]" />
                    <input
                      type="number"
                      className="flex-1 bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                      placeholder="Discount amount"
                      value={proposalForm.discount}
                      onChange={(e) => setProposalForm((p) => ({ ...p, discount: e.target.value }))}
                    />
                  </div>
                </div>
                <textarea
                  className="bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white resize-none"
                  rows={3}
                  placeholder="Description"
                  value={proposalForm.description}
                  onChange={(e) => setProposalForm((p) => ({ ...p, description: e.target.value }))}
                />
                <div className="space-y-2">
                  {proposalForm.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        className="bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                        placeholder="Line item title"
                        value={item.title}
                        onChange={(e) => {
                          const copy = [...proposalForm.items]
                          copy[idx].title = e.target.value
                          setProposalForm((p) => ({ ...p, items: copy }))
                        }}
                      />
                      <input
                        className="bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => {
                          const copy = [...proposalForm.items]
                          copy[idx].description = e.target.value
                          setProposalForm((p) => ({ ...p, items: copy }))
                        }}
                      />
                      <input
                        className="bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                        placeholder="Price"
                        type="number"
                        value={item.price}
                        onChange={(e) => {
                          const copy = [...proposalForm.items]
                          copy[idx].price = e.target.value
                          setProposalForm((p) => ({ ...p, items: copy }))
                        }}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => setProposalForm((p) => ({ ...p, items: [...p.items, { title: '', description: '', price: '' }] }))}
                    className="text-sm text-[#81D8D0] hover:underline"
                  >
                    + Add line item
                  </button>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleCreateProposal}
                    disabled={creatingProposal || !proposalForm.title}
                    className="px-4 py-2 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 disabled:opacity-50"
                  >
                    {creatingProposal ? 'Saving...' : 'Save Proposal'}
                  </button>
                </div>
              </div>

              <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 space-y-3">
                <h3 className="text-white font-semibold">Proposals</h3>
                {proposals.length === 0 ? (
                  <p className="text-[#a1a1a1] text-sm">No proposals yet.</p>
                ) : (
                  <div className="space-y-2">
                    {proposals.map((p) => {
                      const isExpanded = expandedProposal === p.id
                      return (
                        <div key={p.id} className="p-3 border border-[#333333] rounded-lg text-white space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{p.title}</p>
                              <p className="text-xs text-[#a1a1a1]">Status: {p.status}</p>
                              <p className="text-xs text-[#a1a1a1]">Total: ${Number(p.total_amount || 0).toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setActiveProposal(p)}
                                className="px-3 py-1 rounded-lg border border-[#333333] text-white hover:border-[#81D8D0]/60 text-sm"
                              >
                                Full View
                              </button>
                              <button
                                onClick={() => setExpandedProposal(isExpanded ? null : p.id)}
                                className="px-3 py-1 rounded-lg border border-[#333333] text-white hover:border-[#81D8D0]/60 text-sm"
                              >
                                {isExpanded ? 'Hide' : 'View'}
                              </button>
                              <button
                                onClick={() => handleSendProposal(p.id)}
                                className="px-3 py-1 rounded-lg border border-[#333333] text-white hover:border-[#81D8D0]/60 flex items-center gap-1 text-sm"
                              >
                                <Send size={14} /> Send
                              </button>
                            </div>
                          </div>
                          {isExpanded && p.items && (
                            <div className="space-y-1 text-sm text-[#a1a1a1] border-t border-[#333333] pt-2">
                              {p.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between">
                                  <span>{item.title}</span>
                                  <span>${Number(item.price || 0).toFixed(2)}</span>
                                </div>
                              ))}
                              <div className="flex justify-between text-white font-semibold pt-1">
                                <span>Total</span>
                                <span>${Number(p.total_amount || 0).toFixed(2)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'bookings' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-semibold">Bookings</h3>
                <Link
                  href={`/hub/booking?project=${projectId}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#333333] text-sm text-white hover:border-[#81D8D0]/60"
                >
                  <LinkIcon size={14} /> Schedule Call
                </Link>
              </div>
              <SimpleList title="" items={bookings} render={(b) => (
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-[#a1a1a1]" />
                  <div>
                    <p className="text-white font-medium">{b.booking_date} {b.booking_time}</p>
                    <p className="text-xs text-[#a1a1a1]">{b.inquiry_type}</p>
                  </div>
                </div>
              )} />
            </div>
          )}

          {tab === 'messages' && (
            <div className="space-y-3">
              <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 space-y-3">
                <h3 className="text-white font-semibold">Messages</h3>
                {messages.length === 0 ? (
                  <p className="text-[#a1a1a1] text-sm">No messages yet.</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {messages.map((m) => (
                      <div key={m.id} className="p-3 border border-[#333333] rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-[#a1a1a1]">{format(new Date(m.created_at), 'MMM d, yyyy p')}</p>
                          <span className="text-xs px-2 py-1 rounded-full border border-[#333333] text-white/80">
                            {m.sender_type}
                          </span>
                        </div>
                        <p className="text-white whitespace-pre-wrap">{m.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 space-y-2">
                <textarea
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white resize-none"
                  rows={3}
                  placeholder="Send a message"
                  value={messageDraft}
                  onChange={(e) => setMessageDraft(e.target.value)}
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageDraft.trim()}
                    className="px-4 py-2 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'resources' && (
            <div className="space-y-3">
              <label className="inline-flex items-center gap-2 px-3 py-2 border border-[#333333] rounded-lg text-white hover:border-[#81D8D0]/60 cursor-pointer w-fit">
                <Upload size={16} />
                {uploading ? 'Uploading...' : 'Upload Resource'}
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUploadDeliverable(file)
                  }}
                  disabled={uploading}
                />
              </label>
              <SimpleList title="Deliverables" items={deliverables} render={(d) => (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <a
                      href={d.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#81D8D0] hover:underline font-medium"
                    >
                      {d.name}
                    </a>
                    {d.description && (
                      <p className="text-xs text-[#a1a1a1] mt-1">{d.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteDeliverable(d.id)}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              )} />
            </div>
          )}

          {tab === 'invoices' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Invoices</h3>
                <button
                  onClick={() => {
                    setEditingInvoice(null)
                    setInvoiceForm({ amount: '', description: '', stripe_link: '', status: 'pending' })
                    setInvoiceReceiptFile(null)
                    setShowInvoiceModal(true)
                  }}
                  className="px-4 py-2 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 transition-opacity"
                >
                  Add Invoice
                </button>
              </div>
              {invoices.length === 0 ? (
                <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-8 text-center">
                  <p className="text-[#a1a1a1] text-sm">No invoices yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invoices.map((inv: any) => (
                    <div key={inv.id} className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <p className="text-white font-semibold text-lg">
                              ${Number(inv.amount || 0).toFixed(2)}
                            </p>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                inv.status === 'paid'
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              }`}
                            >
                              {inv.status === 'paid' ? 'Paid' : 'Pending'}
                            </span>
                          </div>
                          {inv.description && (
                            <p className="text-[#a1a1a1] text-sm">{inv.description}</p>
                          )}
                          <div className="flex items-center gap-4 flex-wrap text-sm">
                            {inv.stripe_link && (
                              <a
                                href={inv.stripe_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#81D8D0] hover:underline flex items-center gap-1"
                              >
                                Stripe Link →
                              </a>
                            )}
                            {inv.receipt_url && (
                              <a
                                href={inv.receipt_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#81D8D0] hover:underline flex items-center gap-1"
                              >
                                Receipt →
                              </a>
                            )}
                            {inv.created_at && (
                              <span className="text-[#a1a1a1]">
                                Created {format(new Date(inv.created_at), 'MMM d, yyyy')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditInvoice(inv)}
                            className="px-3 py-1.5 rounded-lg border border-[#333333] text-white hover:border-[#81D8D0]/60 text-sm transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(inv.id)}
                            className="px-3 py-1.5 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 text-sm transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'activity' && (
            <div className="space-y-4">
              <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 space-y-3">
                <h3 className="text-white font-semibold flex items-center gap-2"><StickyNote size={16} /> Admin Notes</h3>
                <div className="space-y-2">
                  <textarea
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white resize-none"
                    rows={3}
                    placeholder="Add an internal note (visible to admins only)"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveAdminNote}
                      disabled={!adminNote.trim()}
                      className="px-4 py-2 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {activity.filter((a) => a.action === 'admin_note').length === 0 ? (
                    <p className="text-[#a1a1a1] text-sm">No notes yet.</p>
                  ) : (
                    activity
                      .filter((a) => a.action === 'admin_note')
                      .map((a) => (
                        <div key={a.id} className="p-3 border border-[#333333] rounded-lg">
                          <p className="text-white text-sm whitespace-pre-wrap">{a.details?.note || ''}</p>
                          <p className="text-xs text-[#a1a1a1] mt-1">{format(new Date(a.created_at), 'MMM d, yyyy p')}</p>
                        </div>
                      ))
                  )}
                </div>
              </div>
              <SimpleList title="Activity" items={activity} render={(a) => (
                <div>
                  <p className="text-white font-medium">{a.action}</p>
                  <p className="text-xs text-[#a1a1a1]">{format(new Date(a.created_at), 'MMM d, yyyy p')}</p>
                </div>
              )} />
            </div>
          )}
        </div>
      </div>

      {activeProposal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/images/cje-logo.png" alt="The CJE Experience" className="h-8 w-auto brightness-0 invert" />
                <h3 className="text-white text-xl font-semibold">{activeProposal.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full border border-[#333333] text-white/80">{activeProposal.status}</span>
                <button
                  onClick={() => setActiveProposal(null)}
                  className="text-[#a1a1a1] hover:text-white"
                  aria-label="Close proposal"
                >
                  ✕
                </button>
              </div>
            </div>
            <p className="text-sm text-[#a1a1a1]">{activeProposal.description}</p>
            {activeProposal.valid_until && (
              <p className="text-xs text-[#a1a1a1]">Valid until {format(new Date(activeProposal.valid_until), 'MMM d, yyyy')}</p>
            )}
            <div className="border border-[#333333] rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 bg-[#0a0a0a] border-b border-[#333333] px-4 py-2 text-sm text-white/70">
                <div className="col-span-5">Title</div>
                <div className="col-span-5">Description</div>
                <div className="col-span-2 text-right">Price</div>
              </div>
              {activeProposal.items?.map((item: any, idx: number) => (
                <div key={idx} className="grid grid-cols-12 px-4 py-2 border-b border-[#333333] text-sm text-white">
                  <div className="col-span-5">{item.title}</div>
                  <div className="col-span-5 text-[#a1a1a1]">{item.description}</div>
                  <div className="col-span-2 text-right">${Number(item.price || 0).toFixed(2)}</div>
                </div>
              ))}
              <div className="grid grid-cols-12 px-4 py-3 text-sm text-white font-semibold">
                <div className="col-span-10 text-right">Total</div>
                <div className="col-span-2 text-right">${Number(activeProposal.total_amount || 0).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl w-full max-w-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg font-semibold">
                {editingInvoice ? 'Edit Invoice' : 'Add Invoice'}
              </h3>
              <button
                onClick={() => {
                  setShowInvoiceModal(false)
                  setEditingInvoice(null)
                  setInvoiceForm({ amount: '', description: '', stripe_link: '', status: 'pending' })
                  setInvoiceReceiptFile(null)
                }}
                className="text-[#a1a1a1] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/60 mb-1">
                  Amount <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={invoiceForm.amount}
                  onChange={(e) => setInvoiceForm((prev) => ({ ...prev, amount: e.target.value }))}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-white/60 mb-1">
                  Description
                </label>
                <textarea
                  value={invoiceForm.description}
                  onChange={(e) => setInvoiceForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white resize-none"
                  rows={2}
                  placeholder="Optional description"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-white/60 mb-1">
                  Stripe Invoice Link <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={invoiceForm.stripe_link}
                  onChange={(e) => setInvoiceForm((prev) => ({ ...prev, stripe_link: e.target.value }))}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-white/60 mb-1">
                  Status
                </label>
                <select
                  value={invoiceForm.status}
                  onChange={(e) => setInvoiceForm((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-white/60 mb-1">
                  Receipt PDF {editingInvoice?.receipt_url && '(Current receipt exists)'}
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setInvoiceReceiptFile(e.target.files?.[0] || null)}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm"
                />
                {editingInvoice?.receipt_url && (
                  <a
                    href={editingInvoice.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#81D8D0] hover:underline text-sm mt-1 inline-block"
                  >
                    View current receipt →
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowInvoiceModal(false)
                  setEditingInvoice(null)
                  setInvoiceForm({ amount: '', description: '', stripe_link: '', status: 'pending' })
                  setInvoiceReceiptFile(null)
                }}
                className="px-4 py-2 rounded-lg border border-[#333333] text-white hover:border-white/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingInvoice ? handleUpdateInvoice : handleCreateInvoice}
                disabled={creatingInvoice || !invoiceForm.amount || !invoiceForm.stripe_link}
                className="px-4 py-2 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingInvoice ? 'Saving...' : editingInvoice ? 'Update Invoice' : 'Create Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-[#0a0a0a] border border-[#333333] rounded-lg p-3">
      <p className="text-xs text-[#a1a1a1] mb-1">{label}</p>
      <p className="text-white text-lg font-semibold">{value}</p>
    </div>
  )
}

function SimpleList({ title, items, render }: { title: string; items: any[]; render: (item: any) => React.ReactNode }) {
  return (
    <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 space-y-3">
      <h3 className="text-white font-semibold">{title}</h3>
      {items.length === 0 ? (
        <p className="text-[#a1a1a1] text-sm">No records.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="p-3 border border-[#333333] rounded-lg">
              {render(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

