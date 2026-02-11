'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Trash, Pencil, X, Plus, Upload } from 'lucide-react'
import { formatMessageWithLinks } from '@/lib/utils/message-formatting'

type Service = {
  name: string
  price: number
  description: string
  required: boolean
}

type MaintenancePlan = {
  name: string
  price: number
  features: string[]
  recommended: boolean
}

const DEFAULT_TERMS = `<h3>1. Project Scope</h3>
<p>Provider will design and develop a custom website including initial design concepts, development, revisions, and deployment to a live hosting environment.</p>

<h3>2. Payment Terms</h3>
<p>A non-refundable deposit is required to begin work. The remaining balance is due upon project completion, before the website is deployed to its final domain.</p>

<h3>3. Timeline</h3>
<p>Estimated timeline is 4-6 weeks from receipt of deposit and all required assets. Mockups will be presented within 7 business days. First draft within 3 weeks.</p>

<h3>4. Client Responsibilities</h3>
<p>Client agrees to provide all necessary content, images, branding assets, and feedback in a timely manner. Delays in providing materials may extend the project timeline.</p>

<h3>5. Revisions</h3>
<p>Two rounds of revisions are included. Additional revisions beyond the included rounds will be billed at $50/hour.</p>

<h3>6. Ownership & Rights</h3>
<p>Upon final payment, the client will own the completed website. The provider retains the right to display the work in their portfolio and marketing materials.</p>

<h3>7. Cancellation</h3>
<p>If the client cancels the project after work has begun, the deposit is non-refundable. Any additional work completed beyond the deposit amount will be billed.</p>`

const DEFAULT_MAINTENANCE_PLANS: MaintenancePlan[] = [
  {
    name: 'Hosting Only',
    price: 25,
    features: ['Website hosting', 'Security monitoring', 'SSL certificate', 'Changes billed as needed'],
    recommended: false,
  },
  {
    name: 'Standard',
    price: 49,
    features: ['Everything in Hosting Only', 'Technical support', 'Quarterly content updates', 'Seasonal homepage refresh'],
    recommended: true,
  },
  {
    name: 'Growth',
    price: 99,
    features: ['Everything in Standard', 'Monthly analytics report', 'Unlimited minor updates', 'Priority support'],
    recommended: false,
  },
]

type Message = {
  id: string
  content: string
  sender_type: string
  created_at: string
  user_id: string
}

type Props = {
  projectId: string
  projectData: any
  projectClients: any[]
  onReload: () => Promise<void>
  // Message system
  messages: Message[]
  messageDraft: string
  setMessageDraft: (v: string) => void
  selectedRecipientId: string | null
  setSelectedRecipientId: (v: string | null) => void
  sendToAllClients: boolean
  setSendToAllClients: (v: boolean) => void
  onSendMessage: () => Promise<void>
  onLoadMessages: () => Promise<void>
  // Message editing
  editingMessageId: string | null
  editingMessageContent: string
  onEditMessage: (m: any) => void
  onSaveMessage: (id: string) => Promise<void>
  onCancelEdit: () => void
  onDeleteMessage: (id: string) => void
  deletingMessageId: string | null
  onConfirmDeleteMessage: (id: string) => Promise<void>
  onCancelDeleteMessage: () => void
  // Supabase for auth
  supabase: any
}

export default function ProposalTab({ 
  projectId, projectData, projectClients, onReload,
  messages, messageDraft, setMessageDraft, selectedRecipientId, setSelectedRecipientId,
  sendToAllClients, setSendToAllClients, onSendMessage, onLoadMessages,
  editingMessageId, editingMessageContent, onEditMessage, onSaveMessage, onCancelEdit,
  onDeleteMessage, deletingMessageId, onConfirmDeleteMessage, onCancelDeleteMessage,
  supabase
}: Props) {
  // Mode: 'link' (old URL) or 'html' (new full proposal)
  const hasHtml = !!projectData?.proposal_html
  const hasUrl = !!projectData?.proposal_url
  const [mode, setMode] = useState<'link' | 'html'>(hasHtml ? 'html' : 'link')

  // Link mode state
  const [linkForm, setLinkForm] = useState({ url: '', message: '' })
  const [sendingLink, setSendingLink] = useState(false)
  const [editingLink, setEditingLink] = useState(false)

  // HTML mode state
  const [htmlContent, setHtmlContent] = useState(projectData?.proposal_html || '')
  const [services, setServices] = useState<Service[]>(projectData?.proposal_services || [])
  const [terms, setTerms] = useState(projectData?.proposal_terms || DEFAULT_TERMS)
  const [maintenancePlans, setMaintenancePlans] = useState<MaintenancePlan[]>(
    projectData?.proposal_maintenance_plans || DEFAULT_MAINTENANCE_PLANS
  )
  const [depositPct, setDepositPct] = useState(projectData?.deposit_percentage || 50)
  const [savingHtml, setSavingHtml] = useState(false)
  const [sendingHtml, setSendingHtml] = useState(false)
  const [htmlSaved, setHtmlSaved] = useState(false)

  // Service editing
  const [editingServiceIdx, setEditingServiceIdx] = useState<number | null>(null)
  const [serviceForm, setServiceForm] = useState<Service>({ name: '', price: 0, description: '', required: false })

  // Plan editing
  const [editingPlanIdx, setEditingPlanIdx] = useState<number | null>(null)
  const [planForm, setPlanForm] = useState<MaintenancePlan>({ name: '', price: 0, features: [''], recommended: false })

  // Acceptance info
  const [acceptance, setAcceptance] = useState<any>(null)
  const [loadingAcceptance, setLoadingAcceptance] = useState(false)

  useEffect(() => {
    if (hasHtml) {
      loadAcceptance()
    }
  }, [hasHtml])

  const loadAcceptance = async () => {
    setLoadingAcceptance(true)
    try {
      const res = await fetch(`/api/proposals/track?project_id=${projectId}`)
      if (res.ok) {
        const data = await res.json()
        setAcceptance(data.acceptance || null)
      }
    } catch {}
    setLoadingAcceptance(false)
  }

  // === LINK MODE HANDLERS (existing logic) ===
  const normalizeUrl = (url: string) => {
    if (!url) return ''
    if (!url.startsWith('http://') && !url.startsWith('https://')) return `https://${url}`
    return url
  }

  const handleSendLink = async () => {
    if (!linkForm.url.trim()) return
    setSendingLink(true)
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposal_url: normalizeUrl(linkForm.url.trim()),
          proposal_sent_at: new Date().toISOString(),
        }),
      })
      setLinkForm({ url: '', message: '' })
      await onReload()
    } catch (error) {
      alert('Failed to send proposal')
    }
    setSendingLink(false)
  }

  const handleDeleteLink = async () => {
    if (!confirm('Delete this proposal link? The client will no longer see it.')) return
    await fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposal_url: null, proposal_sent_at: null }),
    })
    await onReload()
  }

  // === HTML MODE HANDLERS ===
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setHtmlContent(ev.target?.result as string)
      setHtmlSaved(false)
    }
    reader.readAsText(file)
  }

  const handleSaveProposal = async () => {
    if (!htmlContent.trim()) {
      alert('Please upload an HTML file first.')
      return
    }
    if (services.length === 0) {
      alert('Please add at least one service.')
      return
    }
    setSavingHtml(true)
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposal_html: htmlContent,
          proposal_services: services,
          proposal_terms: terms,
          proposal_maintenance_plans: maintenancePlans,
          deposit_percentage: depositPct,
          proposal_status: projectData?.proposal_status || 'draft',
        }),
      })
      setHtmlSaved(true)
      await onReload()
    } catch {
      alert('Failed to save proposal.')
    }
    setSavingHtml(false)
  }

  const handleSendProposal = async () => {
    if (!htmlContent.trim() || services.length === 0) {
      alert('Save the proposal first.')
      return
    }
    if (!confirm('Send this proposal to the client? They will receive an email with the link.')) return
    setSendingHtml(true)
    try {
      // Save first
      await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposal_html: htmlContent,
          proposal_services: services,
          proposal_terms: terms,
          proposal_maintenance_plans: maintenancePlans,
          deposit_percentage: depositPct,
          proposal_status: 'sent',
          proposal_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      })

      // Send email notification
      const baseUrl = window.location.origin
      const proposalUrl = `${baseUrl}/proposals/${projectId}`

      // Send email to ALL project clients
      const clientEmails = projectClients
        .map(pc => pc.users?.email)
        .filter(Boolean)

      // Fallback to projectData.users if no projectClients
      if (clientEmails.length === 0 && projectData?.users?.email) {
        clientEmails.push(projectData.users.email)
      }

      for (const email of clientEmails) {
        const clientInfo = projectClients.find(pc => pc.users?.email === email)
        await fetch('/api/proposals/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: projectId,
            client_email: email,
            client_name: clientInfo?.users?.name || 'Client',
            proposal_url: proposalUrl,
            project_name: projectData.name,
          }),
        })
      }

      await onReload()
    } catch {
      alert('Failed to send proposal.')
    }
    setSendingHtml(false)
  }

  const handleDeleteHtmlProposal = async () => {
    if (!confirm('Delete this proposal? All services, terms, and acceptance data will be removed.')) return
    await fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proposal_html: null,
        proposal_services: null,
        proposal_terms: null,
        proposal_maintenance_plans: null,
        proposal_status: null,
        proposal_expires_at: null,
        proposal_sent_at: null,
        proposal_viewed_at: null,
        proposal_message_id: null,
        proposal_url: null,
        deposit_percentage: 50,
      }),
    })
    setHtmlContent('')
    setServices([])
    setTerms(DEFAULT_TERMS)
    setMaintenancePlans(DEFAULT_MAINTENANCE_PLANS)
    setDepositPct(50)
    setAcceptance(null)
    await onReload()
  }

  // Service CRUD
  const openAddService = () => {
    setServiceForm({ name: '', price: 0, description: '', required: false })
    setEditingServiceIdx(-1)
  }
  const openEditService = (idx: number) => {
    setServiceForm({ ...services[idx] })
    setEditingServiceIdx(idx)
  }
  const saveService = () => {
    if (!serviceForm.name.trim() || serviceForm.price <= 0) return
    const updated = [...services]
    if (editingServiceIdx === -1) {
      updated.push({ ...serviceForm })
    } else if (editingServiceIdx !== null) {
      updated[editingServiceIdx] = { ...serviceForm }
    }
    setServices(updated)
    setEditingServiceIdx(null)
    setHtmlSaved(false)
  }
  const deleteService = (idx: number) => {
    setServices(services.filter((_, i) => i !== idx))
    setHtmlSaved(false)
  }

  // Plan CRUD
  const openAddPlan = () => {
    setPlanForm({ name: '', price: 0, features: [''], recommended: false })
    setEditingPlanIdx(-1)
  }
  const openEditPlan = (idx: number) => {
    setPlanForm({ ...maintenancePlans[idx], features: [...maintenancePlans[idx].features] })
    setEditingPlanIdx(idx)
  }
  const savePlan = () => {
    if (!planForm.name.trim() || planForm.price <= 0) return
    const cleaned = { ...planForm, features: planForm.features.filter(f => f.trim()) }
    const updated = [...maintenancePlans]
    if (editingPlanIdx === -1) {
      updated.push(cleaned)
    } else if (editingPlanIdx !== null) {
      updated[editingPlanIdx] = cleaned
    }
    setMaintenancePlans(updated)
    setEditingPlanIdx(null)
    setHtmlSaved(false)
  }
  const deletePlan = (idx: number) => {
    setMaintenancePlans(maintenancePlans.filter((_, i) => i !== idx))
    setHtmlSaved(false)
  }

  const proposalLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/proposals/${projectId}`

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      {!hasHtml && !hasUrl && (
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4">
          <p className="text-white font-semibold mb-3">Create Proposal</p>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('link')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'link' ? 'bg-[#81D8D0] text-[#0a0a0a]' : 'border border-[#333] text-white hover:border-[#81D8D0]/60'
              }`}
            >
              Paste Link
            </button>
            <button
              onClick={() => setMode('html')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'html' ? 'bg-[#81D8D0] text-[#0a0a0a]' : 'border border-[#333] text-white hover:border-[#81D8D0]/60'
              }`}
            >
              Full Proposal
            </button>
          </div>
        </div>
      )}

      {/* LINK MODE */}
      {mode === 'link' && !hasHtml && (
        <>
          {hasUrl && !editingLink ? (
            <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 space-y-3">
              <h3 className="text-white font-semibold">Proposal Link</h3>
              <a href={projectData.proposal_url} target="_blank" rel="noopener noreferrer" className="text-[#81D8D0] hover:underline break-all">
                {projectData.proposal_url}
              </a>
              {projectData.proposal_sent_at && (
                <p className="text-[#a1a1a1] text-sm">Sent: {format(new Date(projectData.proposal_sent_at), 'MMM d, yyyy p')}</p>
              )}
              <div className="flex gap-2 pt-2 border-t border-[#333]">
                <button onClick={() => { setEditingLink(true); setLinkForm({ url: projectData.proposal_url || '', message: '' }) }} className="px-4 py-2 rounded-lg border border-[#333] text-white hover:border-[#81D8D0]/60">Update</button>
                <button onClick={handleDeleteLink} className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 hover:border-red-500/80 flex items-center gap-2"><Trash size={16} />Delete</button>
              </div>
            </div>
          ) : (
            <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 space-y-3">
              <h3 className="text-white font-semibold">{editingLink ? 'Update Link' : 'Proposal Link'}</h3>
              <input
                type="url"
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white"
                placeholder="https://your-proposal.vercel.app"
                value={linkForm.url}
                onChange={(e) => setLinkForm(p => ({ ...p, url: e.target.value }))}
              />
              <textarea
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white resize-none"
                rows={3}
                placeholder="Message to client (optional)..."
                value={linkForm.message}
                onChange={(e) => setLinkForm(p => ({ ...p, message: e.target.value }))}
              />
              <div className="flex justify-end gap-2">
                {editingLink && (
                  <button onClick={() => { setEditingLink(false); setLinkForm({ url: '', message: '' }) }} className="px-4 py-2 rounded-lg border border-[#333] text-white">Cancel</button>
                )}
                <button onClick={handleSendLink} disabled={sendingLink || !linkForm.url.trim()} className="px-4 py-2 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 disabled:opacity-50">
                  {sendingLink ? 'Saving...' : editingLink ? 'Save' : 'Send'}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* HTML MODE */}
      {(mode === 'html' || hasHtml) && (
        <>
          {/* Status Banner */}
          {projectData?.proposal_status && (
            <div className={`rounded-xl p-4 border ${
              projectData.proposal_status === 'paid' ? 'bg-green-500/10 border-green-500/30' :
              projectData.proposal_status === 'accepted' ? 'bg-blue-500/10 border-blue-500/30' :
              projectData.proposal_status === 'viewed' ? 'bg-yellow-500/10 border-yellow-500/30' :
              projectData.proposal_status === 'sent' ? 'bg-[#81D8D0]/10 border-[#81D8D0]/30' :
              'bg-[#1a1a1a] border-[#333]'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">
                    Status: <span className="capitalize">{projectData.proposal_status}</span>
                  </p>
                  {projectData.proposal_status !== 'draft' && (
                    <p className="text-[#a1a1a1] text-sm mt-1">
                      <span className="flex items-center gap-2 flex-wrap">
                        <a href={proposalLink} target="_blank" rel="noopener noreferrer" className="text-[#81D8D0] hover:underline break-all">{proposalLink}</a>
                        <button
                          onClick={() => { navigator.clipboard.writeText(proposalLink); }}
                          className="px-2 py-1 rounded bg-[#333] text-white text-xs hover:bg-[#444] flex-shrink-0"
                        >
                          Copy
                        </button>
                      </span>
                    </p>
                  )}
                  {acceptance && (
                    <div className="mt-2 text-sm text-[#a1a1a1]">
                      <p>Accepted by: <span className="text-white">{acceptance.client_name}</span></p>
                      <p>Deposit: <span className="text-white">${acceptance.deposit_amount}</span> ({acceptance.payment_status})</p>
                    </div>
                  )}
                </div>
                <button onClick={handleDeleteHtmlProposal} className="px-3 py-1.5 rounded-lg border border-red-500/50 text-red-400 hover:border-red-500/80 text-sm flex items-center gap-1">
                  <Trash size={14} /> Delete
                </button>
              </div>
            </div>
          )}

          {/* HTML Upload */}
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 space-y-3">
            <h3 className="text-white font-semibold">Proposal HTML</h3>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3 py-2 border border-[#333] rounded-lg text-white hover:border-[#81D8D0]/60 cursor-pointer">
                <Upload size={16} />
                {htmlContent ? 'Replace File' : 'Upload HTML File'}
                <input type="file" accept=".html,.htm" className="hidden" onChange={handleFileUpload} />
              </label>
              {htmlContent && (
                <span className="text-green-400 text-sm">✓ HTML loaded ({Math.round(htmlContent.length / 1024)}KB)</span>
              )}
            </div>
            <details className="text-sm">
              <summary className="text-[#81D8D0] cursor-pointer">{htmlContent ? 'Edit HTML' : 'Or paste HTML directly'}</summary>
              <textarea
                className="mt-2 w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm resize-none font-mono"
                rows={12}
                placeholder="Paste your HTML here..."
                value={htmlContent}
                onChange={(e) => { setHtmlContent(e.target.value); setHtmlSaved(false) }}
              />
            </details>
            {htmlContent && (
              <details className="text-sm">
                <summary className="text-[#81D8D0] cursor-pointer">Preview</summary>
                <iframe
                  srcDoc={htmlContent}
                  className="mt-2 w-full rounded-lg border border-[#333]"
                  style={{ height: '500px', background: '#fff' }}
                  sandbox="allow-same-origin"
                  title="Preview"
                />
              </details>
            )}
          </div>

          {/* Services */}
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Services</h3>
              <button onClick={openAddService} className="px-3 py-1.5 rounded-lg border border-[#333] text-white hover:border-[#81D8D0]/60 text-sm flex items-center gap-1">
                <Plus size={14} /> Add
              </button>
            </div>
            {services.length === 0 ? (
              <p className="text-[#a1a1a1] text-sm">No services added yet.</p>
            ) : (
              <div className="space-y-2">
                {services.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-[#333] rounded-lg">
                    <div>
                      <p className="text-white font-medium">{s.name} {s.required && <span className="text-xs text-[#81D8D0]">(Required)</span>}</p>
                      {s.description && <p className="text-[#a1a1a1] text-xs mt-0.5">{s.description}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-semibold">${s.price.toLocaleString()}</span>
                      <button onClick={() => openEditService(i)} className="text-white/60 hover:text-white"><Pencil size={14} /></button>
                      <button onClick={() => deleteService(i)} className="text-white/60 hover:text-red-400"><Trash size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Service Form Modal */}
            {editingServiceIdx !== null && (
              <div className="bg-[#0a0a0a] border border-[#333] rounded-lg p-3 space-y-2">
                <input className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm" placeholder="Service name" value={serviceForm.name} onChange={(e) => setServiceForm(p => ({ ...p, name: e.target.value }))} />
                <input className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm" placeholder="Description (optional)" value={serviceForm.description} onChange={(e) => setServiceForm(p => ({ ...p, description: e.target.value }))} />
                <div className="flex gap-2">
                  <input type="number" className="w-32 bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm" placeholder="Price" value={serviceForm.price || ''} onChange={(e) => setServiceForm(p => ({ ...p, price: Number(e.target.value) }))} />
                  <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                    <input type="checkbox" checked={serviceForm.required} onChange={(e) => setServiceForm(p => ({ ...p, required: e.target.checked }))} className="w-4 h-4 rounded" />
                    Required
                  </label>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditingServiceIdx(null)} className="px-3 py-1.5 rounded-lg border border-[#333] text-white text-sm">Cancel</button>
                  <button onClick={saveService} disabled={!serviceForm.name.trim() || serviceForm.price <= 0} className="px-3 py-1.5 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold text-sm disabled:opacity-50">Save</button>
                </div>
              </div>
            )}
          </div>

          {/* Deposit */}
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 space-y-2">
            <h3 className="text-white font-semibold">Deposit Percentage</h3>
            <div className="flex items-center gap-3">
              <input type="number" min="0" max="100" value={depositPct} onChange={(e) => { setDepositPct(Number(e.target.value)); setHtmlSaved(false) }} className="w-24 bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white" />
              <span className="text-[#a1a1a1] text-sm">%</span>
              {services.length > 0 && (
                <span className="text-[#a1a1a1] text-sm">
                  (${Math.round(services.reduce((s, sv) => s + sv.price, 0) * depositPct / 100)} of ${services.reduce((s, sv) => s + sv.price, 0).toLocaleString()} total)
                </span>
              )}
            </div>
          </div>

          {/* Maintenance Plans */}
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Maintenance Plans</h3>
              <button onClick={openAddPlan} className="px-3 py-1.5 rounded-lg border border-[#333] text-white hover:border-[#81D8D0]/60 text-sm flex items-center gap-1">
                <Plus size={14} /> Add
              </button>
            </div>
            {maintenancePlans.length === 0 ? (
              <p className="text-[#a1a1a1] text-sm">No plans. Client will skip this step.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {maintenancePlans.map((p, i) => (
                  <div key={i} className={`p-3 border rounded-lg ${p.recommended ? 'border-[#81D8D0]/50' : 'border-[#333]'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white font-medium text-sm">{p.name} {p.recommended && <span className="text-xs text-[#81D8D0]">★</span>}</p>
                        <p className="text-white font-bold">${p.price}/mo</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openEditPlan(i)} className="text-white/60 hover:text-white"><Pencil size={12} /></button>
                        <button onClick={() => deletePlan(i)} className="text-white/60 hover:text-red-400"><Trash size={12} /></button>
                      </div>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {p.features.map((f, fi) => (
                        <li key={fi} className="text-xs text-[#a1a1a1]">✦ {f}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {editingPlanIdx !== null && (
              <div className="bg-[#0a0a0a] border border-[#333] rounded-lg p-3 space-y-2">
                <input className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm" placeholder="Plan name" value={planForm.name} onChange={(e) => setPlanForm(p => ({ ...p, name: e.target.value }))} />
                <div className="flex gap-2">
                  <input type="number" className="w-24 bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm" placeholder="$/mo" value={planForm.price || ''} onChange={(e) => setPlanForm(p => ({ ...p, price: Number(e.target.value) }))} />
                  <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                    <input type="checkbox" checked={planForm.recommended} onChange={(e) => setPlanForm(p => ({ ...p, recommended: e.target.checked }))} className="w-4 h-4 rounded" />
                    Recommended
                  </label>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/60">Features:</p>
                  {planForm.features.map((f, fi) => (
                    <div key={fi} className="flex gap-2">
                      <input className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-1.5 text-white text-sm" value={f} onChange={(e) => { const updated = [...planForm.features]; updated[fi] = e.target.value; setPlanForm(p => ({ ...p, features: updated })) }} />
                      <button onClick={() => setPlanForm(p => ({ ...p, features: p.features.filter((_, i) => i !== fi) }))} className="text-red-400 text-sm">✕</button>
                    </div>
                  ))}
                  <button onClick={() => setPlanForm(p => ({ ...p, features: [...p.features, ''] }))} className="text-[#81D8D0] text-xs">+ Add feature</button>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditingPlanIdx(null)} className="px-3 py-1.5 rounded-lg border border-[#333] text-white text-sm">Cancel</button>
                  <button onClick={savePlan} disabled={!planForm.name.trim() || planForm.price <= 0} className="px-3 py-1.5 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold text-sm disabled:opacity-50">Save</button>
                </div>
              </div>
            )}
          </div>

          {/* Terms */}
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 space-y-3">
            <h3 className="text-white font-semibold">Terms & Conditions</h3>
            <textarea
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm resize-none font-mono"
              rows={12}
              value={terms}
              onChange={(e) => { setTerms(e.target.value); setHtmlSaved(false) }}
              placeholder="HTML terms content..."
            />
            <p className="text-xs text-[#a1a1a1]">Supports HTML formatting. The default template is pre-loaded.</p>
          </div>

          {/* Message Thread */}
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 space-y-3">
            <h3 className="text-white font-semibold">Message History</h3>
            {messages.length === 0 ? (
              <p className="text-[#a1a1a1] text-sm">No messages yet.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {messages.map((m) => (
                  <div key={m.id} className="p-3 border border-[#333] rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-[#a1a1a1]">
                        {m.sender_type === 'admin' ? 'You' : projectClients.find(pc => pc.user_id === m.user_id)?.users?.name || 'Client'} • {new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </p>
                      {m.sender_type === 'admin' && (
                        <div className="flex items-center gap-1">
                          <button onClick={() => onEditMessage(m)} className="text-white/60 hover:text-white"><Pencil size={14} /></button>
                          <button onClick={() => onDeleteMessage(m.id)} className="text-white/60 hover:text-red-400"><Trash size={14} /></button>
                        </div>
                      )}
                    </div>
                    {editingMessageId === m.id ? (
                      <div className="space-y-2">
                        <textarea className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white resize-none" rows={3} value={editingMessageContent} onChange={(e) => {}} />
                        <div className="flex justify-end gap-2">
                          <button onClick={onCancelEdit} className="px-3 py-1.5 rounded-lg border border-[#333] text-white text-sm">Cancel</button>
                          <button onClick={() => onSaveMessage(m.id)} className="px-3 py-1.5 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold text-sm">Save</button>
                        </div>
                      </div>
                    ) : deletingMessageId === m.id ? (
                      <div className="space-y-2">
                        <p className="text-red-400 text-sm">Delete this message?</p>
                        <div className="flex gap-2">
                          <button onClick={() => onConfirmDeleteMessage(m.id)} className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-sm">Delete</button>
                          <button onClick={onCancelDeleteMessage} className="px-3 py-1.5 rounded-lg border border-[#333] text-white text-sm">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-white whitespace-pre-wrap">{m.content}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* New Message */}
            <div className="border-t border-[#333] pt-3 space-y-2">
              {projectClients.length > 1 && (
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                    <input type="checkbox" checked={sendToAllClients} onChange={(e) => { setSendToAllClients(e.target.checked); if (e.target.checked) setSelectedRecipientId(null) }} className="w-4 h-4 rounded" />
                    Send to all clients
                  </label>
                  {!sendToAllClients && (
                    <select
                      className="bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-1.5 text-white text-sm"
                      value={selectedRecipientId || ''}
                      onChange={(e) => setSelectedRecipientId(e.target.value || null)}
                    >
                      <option value="">Select recipient...</option>
                      {projectClients.map(pc => (
                        <option key={pc.user_id} value={pc.user_id}>{pc.users?.name || pc.users?.email}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}
              <textarea
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white resize-none"
                rows={3}
                placeholder="Reply about this proposal..."
                value={messageDraft}
                onChange={(e) => setMessageDraft(e.target.value)}
              />
              <div className="flex justify-end">
                <button
                  onClick={onSendMessage}
                  disabled={!messageDraft.trim()}
                  className="px-4 py-2 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 disabled:opacity-50 text-sm"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleSaveProposal}
              disabled={savingHtml || !htmlContent.trim()}
              className="px-4 py-2 rounded-lg border border-[#81D8D0] text-[#81D8D0] hover:bg-[#81D8D0]/10 font-semibold disabled:opacity-50"
            >
              {savingHtml ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={handleSendProposal}
              disabled={sendingHtml || !htmlContent.trim() || services.length === 0}
              className="px-4 py-2 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {sendingHtml ? 'Sending...' : projectData?.proposal_status === 'sent' ? 'Resend to Client' : 'Send to Client'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}