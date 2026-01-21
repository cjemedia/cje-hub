'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { format } from 'date-fns'
import { StatusBadge } from '@/components/StatusBadge'
import {
  Mic,
  BookOpen,
  PartyPopper,
  MessageCircle,
  Users,
  Globe,
  Monitor,
  Settings,
  Sparkles,
  Palette,
  type LucideIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

const serviceTypeConfig: Record<string, { icon: LucideIcon; label: string; color: string }> = {
  speaking_engagement: { icon: Mic, label: 'Speaking', color: '#81D8D0' },
  workshop: { icon: BookOpen, label: 'Workshop', color: '#81D8D0' },
  event_hosting: { icon: PartyPopper, label: 'Event Hosting', color: '#81D8D0' },
  coaching_1on1: { icon: MessageCircle, label: '1:1 Coaching', color: '#81D8D0' },
  coaching_cohort: { icon: Users, label: 'Cohort Program', color: '#81D8D0' },
  website: { icon: Globe, label: 'Website', color: '#81D8D0' },
  client_portal: { icon: Monitor, label: 'Portal', color: '#81D8D0' },
  business_tools: { icon: Settings, label: 'Tools', color: '#81D8D0' },
  brand_consulting: { icon: Sparkles, label: 'Branding', color: '#81D8D0' },
  creative_direction: { icon: Palette, label: 'Creative', color: '#81D8D0' },
}

type StatusFilter = 'all' | 'inquiry' | 'consultation' | 'proposal' | 'confirmed' | 'asset_collection' | 'in_progress' | 'active' | 'completed' | 'cancelled'

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [clients, setClients] = useState<{ id: string; name: string; email: string }[]>([])
  const [showNewClientFields, setShowNewClientFields] = useState(false)
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    sendInvite: true,
  })
  const [form, setForm] = useState({
    user_ids: [] as string[],
    name: '',
    description: '',
    service_type: '',
    status: 'inquiry',
    start_date: '',
    end_date: '',
    notes: '',
    proposal_url: '',
    style_guide_url: '',
    dropbox_link: '',
    assets_folder_url: '',
  })
  const [showLinksSection, setShowLinksSection] = useState(false)
  const [showInvoiceSection, setShowInvoiceSection] = useState(false)
  const [showResourceSection, setShowResourceSection] = useState(false)
  const [invoice, setInvoice] = useState({
    amount: '',
    description: '',
    due_date: '',
    stripe_link: '',
  })
  const [resource, setResource] = useState({
    name: '',
    description: '',
    file_url: '',
  })
  const [statusMenuOpen, setStatusMenuOpen] = useState<string | null>(null)
  const router = useRouter()

  const loadProjects = useCallback(async () => {
    const supabase = createClient()

    let query = supabase
      .from('projects')
      .select('*, project_clients(user_id, role, users(id, name, email))')
      .order('created_at', { ascending: false })

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error loading projects:', error)
      setProjects([])
    } else {
      setProjects(data || [])
    }
    setLoading(false)
  }, [statusFilter])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  useEffect(() => {
    const loadClients = async () => {
      try {
        const supabase = createClient()
        const { data: clients } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('role', 'client')
          .order('name')
        setClients(clients || [])
      } catch (error) {
        console.error('Error loading clients:', error)
      }
    }
    loadClients()
  }, [])

  const handleCreate = async () => {
    let clientIds = [...form.user_ids]

    if (showNewClientFields) {
      if (!newClient.name || !newClient.email) {
        alert('Please fill in client name and email')
        return
      }
      
      try {
        const clientRes = await fetch('/api/admin/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newClient),
        })
        
        if (!clientRes.ok) {
          const err = await clientRes.json()
          alert(err?.error || 'Failed to create client')
          return
        }
        
        const clientData = await clientRes.json()
        clientIds = [clientData.id, ...clientIds]
        
        const supabase = createClient()
        const { data: updatedClients } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('role', 'client')
          .order('name')
        setClients(updatedClients || [])
      } catch (error) {
        console.error('Error creating client:', error)
        alert('Failed to create client')
        return
      }
    }

    if (clientIds.length === 0 || !form.name || !form.service_type || !form.status) {
      alert('Please fill in all required fields (at least one client)')
      return
    }

    setCreating(true)
    try {
      const projectPayload = {
        name: form.name,
        description: form.description,
        service_type: form.service_type,
        status: form.status,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        notes: form.notes,
        proposal_url: form.proposal_url,
        style_guide_url: form.style_guide_url,
        dropbox_link: form.dropbox_link,
        assets_folder_url: form.assets_folder_url,
        user_id: clientIds[0],
      }
      
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectPayload),
      })
      if (!res.ok) {
        throw new Error('Failed to create project')
      }
      const projectData = await res.json()
      const projectId = projectData.id

      const supabase = createClient()
      const projectClientsData = clientIds.map((clientId, index) => ({
        project_id: projectId,
        user_id: clientId,
        role: index === 0 ? 'primary' : 'stakeholder',
      }))
      
      const { error: junctionError } = await supabase
        .from('project_clients')
        .insert(projectClientsData)
      
      if (junctionError) {
        console.error('Error inserting project_clients:', junctionError)
      }

      if (showInvoiceSection && invoice.amount) {
        await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...invoice,
            project_id: projectId,
            user_id: clientIds[0],
            status: 'pending',
          }),
        })
      }

      if (showResourceSection && resource.name && resource.file_url) {
        await supabase.from('deliverables').insert({
          project_id: projectId,
          name: resource.name,
          description: resource.description || null,
          file_url: resource.file_url,
        })
      }

      await loadProjects()
      setShowCreateModal(false)
      resetForm()
    } catch (error) {
      console.error(error)
      alert('Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  const resetForm = () => {
    setShowNewClientFields(false)
    setShowLinksSection(false)
    setShowInvoiceSection(false)
    setShowResourceSection(false)
    setForm({
      user_ids: [],
      name: '',
      description: '',
      service_type: '',
      status: 'inquiry',
      start_date: '',
      end_date: '',
      notes: '',
      proposal_url: '',
      style_guide_url: '',
      dropbox_link: '',
      assets_folder_url: '',
    })
    setNewClient({ name: '', email: '', company: '', phone: '', sendInvite: true })
    setInvoice({ amount: '', description: '', due_date: '', stripe_link: '' })
    setResource({ name: '', description: '', file_url: '' })
  }

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Failed to update status' }))
        throw new Error(error.error || 'Failed to update status')
      }
      
      await loadProjects()
    } catch (error) {
      console.error('Error updating status:', error)
      alert(error instanceof Error ? error.message : 'Failed to update status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white/70">Loading projects...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1 w-1 rounded-full bg-[#81D8D0]"></div>
            <span className="text-[#81D8D0] text-sm font-medium uppercase tracking-wider">Admin</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-semibold text-white mb-2">All Projects</h1>
          <p className="text-[#a1a1a1]">View and manage all client projects</p>
          <div className="mt-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-[#81D8D0] text-[#0a0a0a] px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl"
            >
              New Project
            </button>
          </div>
        </div>

        <div className="mb-6 md:hidden">
          <label className="block text-sm font-medium text-white mb-2">Filter by status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm"
          >
            {(['all', 'inquiry', 'consultation', 'proposal', 'confirmed', 'asset_collection', 'in_progress', 'active', 'completed', 'cancelled'] as const).map((status) => (
              <option key={status} value={status}>
                {status === 'all' ? 'All statuses' : status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6 hidden md:flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {(['all', 'inquiry', 'consultation', 'proposal', 'confirmed', 'asset_collection', 'in_progress', 'active', 'completed', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-[#81D8D0] text-[#0a0a0a]'
                  : 'bg-[#1a1a1a] text-white border border-[#333333] hover:border-[#81D8D0]/50'
              }`}
            >
              {status === 'all' ? 'All' : status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.length === 0 ? (
            <div className="col-span-full bg-[#1a1a1a] border border-[#333333] rounded-xl p-8 text-center text-[#a1a1a1]">
              No projects found
            </div>
          ) : (
            projects.map((project: any) => (
              <div
                key={project.id}
                onClick={() => router.push(`/admin/projects/${project.id}`)}
                className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-5 cursor-pointer hover:border-[#81D8D0]/50 transition-colors flex flex-col"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-lg truncate">{project.name}</h3>
                    <p className="text-[#a1a1a1] text-sm truncate">
                      {project.project_clients?.length > 0
                        ? project.project_clients.map((pc: any) => pc.users?.name || pc.users?.email).join(', ')
                        : project.users?.name || project.users?.email || 'No client'}
                    </p>
                  </div>
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setStatusMenuOpen(statusMenuOpen === project.id ? null : project.id)
                      }}
                      className="hover:opacity-80 transition-opacity"
                    >
                      <StatusBadge status={project.status} />
                    </button>
                    {statusMenuOpen === project.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={(e) => {
                            e.stopPropagation()
                            setStatusMenuOpen(null)
                          }}
                        />
                        <div className="absolute right-0 top-full mt-1 bg-[#1a1a1a] border border-[#333333] rounded-lg shadow-xl z-50 py-1 min-w-[160px]">
                          {['inquiry', 'consultation', 'proposal', 'confirmed', 'asset_collection', 'in_progress', 'active', 'completed', 'cancelled'].map((status) => (
                            <button
                              key={status}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusChange(project.id, status)
                                setStatusMenuOpen(null)
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-[#333333] transition-colors ${
                                project.status === status ? 'text-[#81D8D0]' : 'text-white'
                              }`}
                            >
                              {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              {project.status === status && <span className="ml-auto">✓</span>}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  {project.service_type && serviceTypeConfig[project.service_type] && (
                    <div className="flex items-center gap-1.5 text-[#81D8D0] text-sm">
                      {(() => {
                        const Icon = serviceTypeConfig[project.service_type].icon
                        return <Icon size={14} />
                      })()}
                      <span>{serviceTypeConfig[project.service_type].label}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-auto pt-3 border-t border-[#333333] flex justify-between text-xs text-[#a1a1a1]">
                  <span>
                    {project.start_date 
                      ? `Start: ${format(new Date(project.start_date + 'T00:00:00'), 'MMM d, yyyy')}`
                      : 'No start date'}
                  </span>
                  <span>
                    {project.end_date 
                      ? `End: ${format(new Date(project.end_date + 'T00:00:00'), 'MMM d, yyyy')}`
                      : ''}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#1a1a1a] border-b border-[#333333] px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Create Project</h2>
              <button
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="text-[#a1a1a1] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* CLIENT SECTION */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#81D8D0] text-[#0a0a0a] text-xs flex items-center justify-center font-bold">1</span>
                  Client(s)
                </h3>
                
                {form.user_ids.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.user_ids.map((id, index) => {
                      const client = clients.find(c => c.id === id)
                      return (
                        <div key={id} className="flex items-center gap-2 bg-[#0a0a0a] border border-[#333333] rounded-full px-3 py-1">
                          <span className="text-white text-sm">{client?.name || client?.email}</span>
                          {index === 0 && <span className="text-[#81D8D0] text-xs">(Primary)</span>}
                          <button
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, user_ids: prev.user_ids.filter(uid => uid !== id) }))}
                            className="text-[#a1a1a1] hover:text-white text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}

                {!showNewClientFields ? (
                  <div className="space-y-2">
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value && !form.user_ids.includes(e.target.value)) {
                          setForm(prev => ({ ...prev, user_ids: [...prev.user_ids, e.target.value] }))
                        }
                      }}
                      className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                    >
                      <option value="">Add a client...</option>
                      {clients
                        .filter(c => !form.user_ids.includes(c.id))
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name || c.email} ({c.email})
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewClientFields(true)}
                      className="text-[#81D8D0] text-sm hover:underline"
                    >
                      + Create new client instead
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 p-4 bg-[#0a0a0a] border border-[#333333] rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#81D8D0] font-medium">New Client</span>
                      <button
                        type="button"
                        onClick={() => { setShowNewClientFields(false); setNewClient({ name: '', email: '', company: '', phone: '', sendInvite: true }); }}
                        className="text-[#a1a1a1] text-xs hover:text-white"
                      >
                        ← Select existing instead
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        placeholder="Name *"
                        value={newClient.name}
                        onChange={(e) => setNewClient((p) => ({ ...p, name: e.target.value }))}
                        className="bg-[#1a1a1a] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm"
                      />
                      <input
                        type="email"
                        placeholder="Email *"
                        value={newClient.email}
                        onChange={(e) => setNewClient((p) => ({ ...p, email: e.target.value }))}
                        className="bg-[#1a1a1a] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm"
                      />
                      <input
                        placeholder="Company"
                        value={newClient.company}
                        onChange={(e) => setNewClient((p) => ({ ...p, company: e.target.value }))}
                        className="bg-[#1a1a1a] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm"
                      />
                      <input
                        placeholder="Phone"
                        value={newClient.phone}
                        onChange={(e) => setNewClient((p) => ({ ...p, phone: e.target.value }))}
                        className="bg-[#1a1a1a] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-white/80">
                      <input
                        type="checkbox"
                        checked={newClient.sendInvite}
                        onChange={(e) => setNewClient((p) => ({ ...p, sendInvite: e.target.checked }))}
                        className="h-4 w-4 rounded border-[#333333] bg-[#1a1a1a]"
                      />
                      Send portal invite email
                    </label>
                  </div>
                )}
              </div>

              {/* PROJECT BASICS */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#81D8D0] text-[#0a0a0a] text-xs flex items-center justify-center font-bold">2</span>
                  Project Details
                </h3>
                <div className="space-y-3">
                  <input
                    placeholder="Project Name *"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white resize-none"
                    rows={2}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={form.service_type}
                      onChange={(e) => setForm((prev) => ({ ...prev, service_type: e.target.value }))}
                      className="bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                    >
                      <option value="">Service Type *</option>
                      <option value="speaking_engagement">Speaking</option>
                      <option value="workshop">Workshop</option>
                      <option value="event_hosting">Event Hosting</option>
                      <option value="coaching_1on1">1:1 Coaching</option>
                      <option value="coaching_cohort">Cohort Program</option>
                      <option value="website">Website</option>
                      <option value="client_portal">Portal</option>
                      <option value="business_tools">Business Tools</option>
                      <option value="brand_consulting">Brand Consulting</option>
                      <option value="creative_direction">Creative Direction</option>
                    </select>
                    <select
                      value={form.status}
                      onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                      className="bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                    >
                      <option value="inquiry">Inquiry</option>
                      <option value="consultation">Consultation</option>
                      <option value="proposal">Proposal</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="asset_collection">Asset Collection</option>
                      <option value="in_progress">In Progress</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-white/60 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={form.start_date}
                        onChange={(e) => setForm((prev) => ({ ...prev, start_date: e.target.value }))}
                        className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/60 mb-1">End Date</label>
                      <input
                        type="date"
                        value={form.end_date}
                        onChange={(e) => setForm((prev) => ({ ...prev, end_date: e.target.value }))}
                        className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                  <textarea
                    placeholder="Internal notes (optional, client won't see)"
                    value={form.notes}
                    onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white resize-none text-sm"
                    rows={2}
                  />
                </div>
              </div>

              {/* RESOURCE SECTION */}
              <div className="border border-[#333333] rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowResourceSection(!showResourceSection)}
                  className="w-full px-4 py-3 flex items-center justify-between bg-[#0a0a0a] hover:bg-[#111] transition-colors"
                >
                  <span className="text-sm font-medium text-white">Add Resource (optional)</span>
                  <span className="text-[#a1a1a1]">{showResourceSection ? '−' : '+'}</span>
                </button>
                {showResourceSection && (
                  <div className="p-4 space-y-3 border-t border-[#333333]">
                    <input
                      placeholder="Resource name *"
                      value={resource.name}
                      onChange={(e) => setResource((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm"
                    />
                    <input
                      placeholder="File URL *"
                      value={resource.file_url}
                      onChange={(e) => setResource((prev) => ({ ...prev, file_url: e.target.value }))}
                      className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm"
                    />
                    <input
                      placeholder="Description (optional)"
                      value={resource.description}
                      onChange={(e) => setResource((prev) => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </div>
                )}
              </div>

              {/* LINKS SECTION */}
              <div className="border border-[#333333] rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowLinksSection(!showLinksSection)}
                  className="w-full px-4 py-3 flex items-center justify-between bg-[#0a0a0a] hover:bg-[#111] transition-colors"
                >
                  <span className="text-sm font-medium text-white">Links & Assets (optional)</span>
                  <span className="text-[#a1a1a1]">{showLinksSection ? '−' : '+'}</span>
                </button>
                {showLinksSection && (
                  <div className="p-4 space-y-3 border-t border-[#333333]">
                    <input
                      placeholder="Proposal URL"
                      value={form.proposal_url}
                      onChange={(e) => setForm((prev) => ({ ...prev, proposal_url: e.target.value }))}
                      className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm"
                    />
                    <input
                      placeholder="Style Guide URL"
                      value={form.style_guide_url}
                      onChange={(e) => setForm((prev) => ({ ...prev, style_guide_url: e.target.value }))}
                      className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm"
                    />
                    <input
                      placeholder="Client Asset Upload Link (Dropbox/Google Drive request)"
                      value={form.dropbox_link}
                      onChange={(e) => setForm((prev) => ({ ...prev, dropbox_link: e.target.value }))}
                      className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm"
                    />
                    <input
                      placeholder="Assets Folder URL (admin view)"
                      value={form.assets_folder_url}
                      onChange={(e) => setForm((prev) => ({ ...prev, assets_folder_url: e.target.value }))}
                      className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </div>
                )}
              </div>

              {/* INVOICE SECTION */}
              <div className="border border-[#333333] rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowInvoiceSection(!showInvoiceSection)}
                  className="w-full px-4 py-3 flex items-center justify-between bg-[#0a0a0a] hover:bg-[#111] transition-colors"
                >
                  <span className="text-sm font-medium text-white">Add Invoice (optional)</span>
                  <span className="text-[#a1a1a1]">{showInvoiceSection ? '−' : '+'}</span>
                </button>
                {showInvoiceSection && (
                  <div className="p-4 space-y-3 border-t border-[#333333]">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Amount *"
                        value={invoice.amount}
                        onChange={(e) => setInvoice((prev) => ({ ...prev, amount: e.target.value }))}
                        className="bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm"
                      />
                      <input
                        type="date"
                        value={invoice.due_date}
                        onChange={(e) => setInvoice((prev) => ({ ...prev, due_date: e.target.value }))}
                        className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <input
                      placeholder="Invoice description"
                      value={invoice.description}
                      onChange={(e) => setInvoice((prev) => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm"
                    />
                    <input
                      placeholder="Stripe Payment Link"
                      value={invoice.stripe_link}
                      onChange={(e) => setInvoice((prev) => ({ ...prev, stripe_link: e.target.value }))}
                      className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-[#1a1a1a] border-t border-[#333333] px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="px-4 py-2 rounded-lg border border-[#333333] text-white hover:border-white/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || (form.user_ids.length === 0 && !showNewClientFields) || (showNewClientFields && (!newClient.name || !newClient.email)) || !form.name || !form.service_type}
                className="px-6 py-2 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
