'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { StatusBadge } from '@/components/StatusBadge'
import { format } from 'date-fns'
import { Loader2, Pencil, Trash, Upload, FileText, Calendar, MessageSquare, Paperclip, CheckCircle, Send, StickyNote, Link as LinkIcon, Percent, X } from 'lucide-react'
import { formatMessageWithLinks } from '@/lib/utils/message-formatting'

type Project = any
type Proposal = any
type IntakeForm = any
type IntakeResponse = any
type Deliverable = any
type Invoice = any
type Activity = any
type Booking = any
type Message = any

const projectStatuses = ['inquiry', 'consultation', 'proposal', 'confirmed', 'asset_collection', 'in_progress', 'active', 'completed', 'cancelled']

export default function AdminProjectDetailPage() {
  const params = useParams()
  const projectId = params?.id as string
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [projectData, setProjectData] = useState<Project | null>(null)
  const [stats, setStats] = useState<any>({})
  const [projectClients, setProjectClients] = useState<any[]>([])
  const [tab, setTab] = useState('overview')

  // Collections
  const [intakeForms, setIntakeForms] = useState<IntakeForm[]>([])
  const [intakeResponses, setIntakeResponses] = useState<IntakeResponse[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [messageDraft, setMessageDraft] = useState('')
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null)
  const [sendToAllClients, setSendToAllClients] = useState(false)
  const [proposalMessages, setProposalMessages] = useState<Message[]>([])
  const [proposalMessageDraft, setProposalMessageDraft] = useState('')
  const [proposalSelectedRecipientId, setProposalSelectedRecipientId] = useState<string | null>(null)
  const [proposalSendToAllClients, setProposalSendToAllClients] = useState(false)
  const [styleGuideMessages, setStyleGuideMessages] = useState<Message[]>([])
  const [styleGuideMessageDraft, setStyleGuideMessageDraft] = useState('')
  const [styleGuideSelectedRecipientId, setStyleGuideSelectedRecipientId] = useState<string | null>(null)
  const [styleGuideSendToAllClients, setStyleGuideSendToAllClients] = useState(false)
  const [contentCalendarMessages, setContentCalendarMessages] = useState<Message[]>([])
  const [contentCalendarMessageDraft, setContentCalendarMessageDraft] = useState('')
  const [contentCalendarSelectedRecipientId, setContentCalendarSelectedRecipientId] = useState<string | null>(null)
  const [contentCalendarSendToAllClients, setContentCalendarSendToAllClients] = useState(false)
  const [resourceMessages, setResourceMessages] = useState<Message[]>([])
  const [resourceMessageDraft, setResourceMessageDraft] = useState('')
  const [resourceSelectedRecipientId, setResourceSelectedRecipientId] = useState<string | null>(null)
  const [resourceSendToAllClients, setResourceSendToAllClients] = useState(false)
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
    assets_folder_url: '',
  })

  const [proposalForm, setProposalForm] = useState({
    url: '',
    message: '',
  })
  const [styleGuideForm, setStyleGuideForm] = useState({
    url: '',
    message: '',
  })
  const [contentCalendarForm, setContentCalendarForm] = useState({
    url: '',
    message: '',
  })
  const [sendingProposal, setSendingProposal] = useState(false)
  const [sendingStyleGuide, setSendingStyleGuide] = useState(false)
  const [sendingContentCalendar, setSendingContentCalendar] = useState(false)
  const [editingProposal, setEditingProposal] = useState(false)
  const [editingStyleGuide, setEditingStyleGuide] = useState(false)
  const [editingContentCalendar, setEditingContentCalendar] = useState(false)
  const [deletingProposal, setDeletingProposal] = useState(false)
  const [deletingStyleGuide, setDeletingStyleGuide] = useState(false)
  const [deletingContentCalendar, setDeletingContentCalendar] = useState(false)
  const [showMessagePreview, setShowMessagePreview] = useState(false)
  const [previewMessage, setPreviewMessage] = useState<{ content: string; recipient: string; onConfirm: () => void } | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingMessageContent, setEditingMessageContent] = useState('')
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null)

  const [intakeAssign, setIntakeAssign] = useState({ form_id: '' })
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
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

  useEffect(() => {
    if (projectData) {
      loadProposalMessages()
      loadStyleGuideMessages()
      loadContentCalendarMessages()
      loadResourceMessages()
      // Set default recipient to primary client
      setSelectedRecipientId(projectData.user_id)
      setProposalSelectedRecipientId(projectData.user_id)
      setStyleGuideSelectedRecipientId(projectData.user_id)
      setContentCalendarSelectedRecipientId(projectData.user_id)
      setResourceSelectedRecipientId(projectData.user_id)
    }
  }, [projectData])

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
      assets_folder_url: json.project.assets_folder_url || '',
    })
    const { data: clients } = await supabase.from('project_clients').select('*, users(id, name, email)').eq('project_id', projectId).order('role', { ascending: true })
    setProjectClients(clients || [])
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
    // No longer needed - proposals are stored in project.proposal_url
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
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    setMessages(data || [])
  }

  const loadProposalMessages = async () => {
    if (!projectData?.proposal_sent_at) {
      setProposalMessages([])
      return
    }
    // Load messages filtered by message_type = 'proposal'
    // If message_type column doesn't exist, this will show all project messages
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('project_id', projectId)
      .eq('message_type', 'proposal')
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
    
    // If message_type column doesn't exist (error code 42703 = undefined column), show all messages
    if (error && error.code === '42703') {
      const { data: allData } = await supabase
        .from('messages')
        .select('*')
        .eq('project_id', projectId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
      setProposalMessages(allData || [])
    } else if (error) {
      console.error('Error loading proposal messages:', error)
      setProposalMessages([])
    } else {
      setProposalMessages(data || [])
    }
  }

  const loadStyleGuideMessages = async () => {
    if (!projectData?.style_guide_sent_at) {
      setStyleGuideMessages([])
      return
    }
    // Load messages filtered by message_type = 'style_guide'
    // If message_type column doesn't exist, this will show all project messages
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('project_id', projectId)
      .eq('message_type', 'style_guide')
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
    
    // If message_type column doesn't exist (error code 42703 = undefined column), show all messages
    if (error && error.code === '42703') {
      const { data: allData } = await supabase
        .from('messages')
        .select('*')
        .eq('project_id', projectId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
      setStyleGuideMessages(allData || [])
    } else if (error) {
      console.error('Error loading style guide messages:', error)
      setStyleGuideMessages([])
    } else {
      setStyleGuideMessages(data || [])
    }
  }

  const loadResourceMessages = async () => {
    // Load messages filtered by message_type = 'resource'
    // If message_type column doesn't exist, this will show all project messages
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('project_id', projectId)
      .eq('message_type', 'resource')
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
    
    // If message_type column doesn't exist (error code 42703 = undefined column), show all messages
    if (error && error.code === '42703') {
      const { data: allData } = await supabase
        .from('messages')
        .select('*')
        .eq('project_id', projectId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
      setResourceMessages(allData || [])
    } else if (error) {
      console.error('Error loading resource messages:', error)
      setResourceMessages([])
    } else {
      setResourceMessages(data || [])
    }
  }

  const loadDeliverables = async () => {
    try {
      const res = await fetch(`/api/deliverables?project_id=${projectId}`)
      if (res.ok) {
        const data = await res.json()
        setDeliverables(data || [])
      } else {
        console.error('Error loading deliverables:', await res.text())
        setDeliverables([])
      }
    } catch (error) {
      console.error('Error loading deliverables:', error)
      setDeliverables([])
    }
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

  const normalizeUrl = (url: string) => {
    if (!url) return ''
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`
    }
    return url
  }

  const handleSendProposal = async () => {
    if (!projectData || !proposalForm.url.trim()) return
    setSendingProposal(true)
    try {
      const normalizedUrl = normalizeUrl(proposalForm.url.trim())
      
      // Update project with proposal URL and sent date
      const updateRes = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposal_url: normalizedUrl,
          proposal_sent_at: new Date().toISOString(),
        }),
      })
      
      if (!updateRes.ok) {
        alert('Failed to save proposal URL')
        setSendingProposal(false)
        return
      }

      // Create message if there's a message
      if (proposalForm.message.trim()) {
        const { data: { user } } = await supabase.auth.getUser()
        const sendMessage = async () => {
          const messageRes = await fetch('/api/messages/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: projectData.user_id,
              sender_type: 'admin',
              sender_id: user?.id || null,
              content: proposalForm.message.trim(),
              project_id: projectId,
            }),
          })
          
          if (messageRes.ok) {
            const { message } = await messageRes.json()
            // Update project with message ID
            await fetch(`/api/projects/${projectId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                proposal_message_id: message.id,
              }),
            })
          }
        }
        
        setPreviewMessage({
          content: proposalForm.message.trim(),
          recipient: projectData.users?.name || projectData.users?.email || 'Client',
          onConfirm: async () => {
            await sendMessage()
            setProposalForm({ url: '', message: '' })
            setShowMessagePreview(false)
            setPreviewMessage(null)
            setSendingProposal(false)
            await loadProject()
            await loadMessages()
            await loadProposalMessages()
            await loadActivity()
          },
        })
        setShowMessagePreview(true)
        setSendingProposal(false)
        return
      }

      setProposalForm({ url: '', message: '' })
      await loadProject()
      await loadMessages()
      await loadProposalMessages()
      await loadActivity()
    } catch (error) {
      console.error('Error sending proposal:', error)
      alert('Failed to send proposal')
    } finally {
      setSendingProposal(false)
    }
  }

  const handleUpdateProposal = async () => {
    if (!projectData || !proposalForm.url.trim()) return
    setSendingProposal(true)
    try {
      const normalizedUrl = normalizeUrl(proposalForm.url.trim())
      
      // Update project URL
      await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposal_url: normalizedUrl,
        }),
      })

      // Create message if there's a message
      if (proposalForm.message.trim()) {
        const { data: { user } } = await supabase.auth.getUser()
        const sendMessage = async () => {
          await fetch('/api/messages/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: projectData.user_id,
              sender_type: 'admin',
              sender_id: user?.id || null,
              content: proposalForm.message.trim(),
              project_id: projectId,
            }),
          })
        }
        
        setPreviewMessage({
          content: proposalForm.message.trim(),
          recipient: projectData.users?.name || projectData.users?.email || 'Client',
          onConfirm: async () => {
            await sendMessage()
            setProposalForm({ url: '', message: '' })
            setEditingProposal(false)
            setShowMessagePreview(false)
            setPreviewMessage(null)
            setSendingProposal(false)
            await loadProject()
            await loadMessages()
            await loadActivity()
          },
        })
        setShowMessagePreview(true)
        setSendingProposal(false)
        return
      }

      setProposalForm({ url: '', message: '' })
      setEditingProposal(false)
      await loadProject()
      await loadMessages()
      await loadActivity()
    } catch (error) {
      console.error('Error updating proposal:', error)
      alert('Failed to update proposal')
    } finally {
      setSendingProposal(false)
    }
  }

  const handleDeleteProposal = async () => {
    if (!confirm('Are you sure you want to delete this proposal? The client will no longer see it.')) return
    setDeletingProposal(true)
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposal_url: null,
          proposal_sent_at: null,
          proposal_message_id: null,
        }),
      })
      await loadProject()
      await loadActivity()
    } catch (error) {
      console.error('Error deleting proposal:', error)
      alert('Failed to delete proposal')
    } finally {
      setDeletingProposal(false)
    }
  }

  const handleSendStyleGuide = async () => {
    if (!projectData || !styleGuideForm.url.trim()) return
    setSendingStyleGuide(true)
    try {
      const normalizedUrl = normalizeUrl(styleGuideForm.url.trim())
      
      // Update project with style guide URL and sent date
      const updateRes = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style_guide_url: normalizedUrl,
          style_guide_sent_at: new Date().toISOString(),
        }),
      })
      
      if (!updateRes.ok) {
        alert('Failed to save style guide URL')
        setSendingStyleGuide(false)
        return
      }

      // Create message if there's a message
      if (styleGuideForm.message.trim()) {
        const { data: { user } } = await supabase.auth.getUser()
        const sendMessage = async () => {
          const messageRes = await fetch('/api/messages/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: projectData.user_id,
              sender_type: 'admin',
              sender_id: user?.id || null,
              content: styleGuideForm.message.trim(),
              project_id: projectId,
            }),
          })
          
          if (messageRes.ok) {
            const { message } = await messageRes.json()
            // Update project with message ID
            await fetch(`/api/projects/${projectId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                style_guide_message_id: message.id,
              }),
            })
          }
        }
        
        setPreviewMessage({
          content: styleGuideForm.message.trim(),
          recipient: projectData.users?.name || projectData.users?.email || 'Client',
          onConfirm: async () => {
            await sendMessage()
            setStyleGuideForm({ url: '', message: '' })
            setShowMessagePreview(false)
            setPreviewMessage(null)
            setSendingStyleGuide(false)
            await loadProject()
            await loadMessages()
            await loadStyleGuideMessages()
            await loadActivity()
          },
        })
        setShowMessagePreview(true)
        setSendingStyleGuide(false)
        return
      }

      setStyleGuideForm({ url: '', message: '' })
      await loadProject()
      await loadMessages()
      await loadStyleGuideMessages()
      await loadActivity()
    } catch (error) {
      console.error('Error sending style guide:', error)
      alert('Failed to send style guide')
    } finally {
      setSendingStyleGuide(false)
    }
  }

  const handleUpdateStyleGuide = async () => {
    if (!projectData || !styleGuideForm.url.trim()) return
    setSendingStyleGuide(true)
    try {
      const normalizedUrl = normalizeUrl(styleGuideForm.url.trim())
      
      // Update project URL
      await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style_guide_url: normalizedUrl,
        }),
      })

      // Create message if there's a message
      if (styleGuideForm.message.trim()) {
        const { data: { user } } = await supabase.auth.getUser()
        const sendMessage = async () => {
          await fetch('/api/messages/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: projectData.user_id,
              sender_type: 'admin',
              sender_id: user?.id || null,
              content: styleGuideForm.message.trim(),
              project_id: projectId,
            }),
          })
        }
        
        setPreviewMessage({
          content: styleGuideForm.message.trim(),
          recipient: projectData.users?.name || projectData.users?.email || 'Client',
          onConfirm: async () => {
            await sendMessage()
            setStyleGuideForm({ url: '', message: '' })
            setEditingStyleGuide(false)
            setShowMessagePreview(false)
            setPreviewMessage(null)
            setSendingStyleGuide(false)
            await loadProject()
            await loadMessages()
            await loadActivity()
          },
        })
        setShowMessagePreview(true)
        setSendingStyleGuide(false)
        return
      }

      setStyleGuideForm({ url: '', message: '' })
      setEditingStyleGuide(false)
      await loadProject()
      await loadMessages()
      await loadActivity()
    } catch (error) {
      console.error('Error updating style guide:', error)
      alert('Failed to update style guide')
    } finally {
      setSendingStyleGuide(false)
    }
  }

  const handleDeleteStyleGuide = async () => {
    if (!confirm('Are you sure you want to delete this style guide? The client will no longer see it.')) return
    setDeletingStyleGuide(true)
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style_guide_url: null,
          style_guide_sent_at: null,
          style_guide_message_id: null,
        }),
      })
      await loadProject()
      await loadActivity()
    } catch (error) {
      console.error('Error deleting style guide:', error)
      alert('Failed to delete style guide')
    } finally {
      setDeletingStyleGuide(false)
    }
  }

  const loadContentCalendarMessages = async () => {
    if (!projectData?.content_calendar_sent_at) {
      setContentCalendarMessages([])
      return
    }
    // Load messages filtered by message_type = 'content_calendar'
    // If message_type column doesn't exist, this will show all project messages
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('project_id', projectId)
      .eq('message_type', 'content_calendar')
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
    
    // If message_type column doesn't exist (error code 42703 = undefined column), show all messages
    if (error && error.code === '42703') {
      const { data: allData } = await supabase
        .from('messages')
        .select('*')
        .eq('project_id', projectId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
      setContentCalendarMessages(allData || [])
    } else if (error) {
      console.error('Error loading content calendar messages:', error)
      setContentCalendarMessages([])
    } else {
      setContentCalendarMessages(data || [])
    }
  }

  const handleSendContentCalendar = async () => {
    if (!projectData || !contentCalendarForm.url.trim()) return
    setSendingContentCalendar(true)
    try {
      const normalizedUrl = normalizeUrl(contentCalendarForm.url.trim())
      
      // Update project with content calendar URL and sent date
      const updateRes = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_calendar_url: normalizedUrl,
          content_calendar_sent_at: new Date().toISOString(),
        }),
      })
      
      if (!updateRes.ok) {
        alert('Failed to save content calendar URL')
        setSendingContentCalendar(false)
        return
      }

      // Create message if there's a message
      if (contentCalendarForm.message.trim()) {
        const { data: { user } } = await supabase.auth.getUser()
        const sendMessage = async () => {
          const messageRes = await fetch('/api/messages/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: projectData.user_id,
              sender_type: 'admin',
              sender_id: user?.id || null,
              content: contentCalendarForm.message.trim(),
              project_id: projectId,
            }),
          })
          
          if (messageRes.ok) {
            const { message } = await messageRes.json()
            // Update project with message ID
            await fetch(`/api/projects/${projectId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                content_calendar_message_id: message.id,
              }),
            })
          }
        }
        
        setPreviewMessage({
          content: contentCalendarForm.message.trim(),
          recipient: projectData.users?.name || projectData.users?.email || 'Client',
          onConfirm: async () => {
            await sendMessage()
            setContentCalendarForm({ url: '', message: '' })
            setShowMessagePreview(false)
            setPreviewMessage(null)
            setSendingContentCalendar(false)
            await loadProject()
            await loadMessages()
            await loadContentCalendarMessages()
            await loadActivity()
          },
        })
        setShowMessagePreview(true)
        setSendingContentCalendar(false)
        return
      }

      setContentCalendarForm({ url: '', message: '' })
      await loadProject()
      await loadMessages()
      await loadContentCalendarMessages()
      await loadActivity()
    } catch (error) {
      console.error('Error sending content calendar:', error)
      alert('Failed to send content calendar')
    } finally {
      setSendingContentCalendar(false)
    }
  }

  const handleUpdateContentCalendar = async () => {
    if (!projectData || !contentCalendarForm.url.trim()) return
    setSendingContentCalendar(true)
    try {
      const normalizedUrl = normalizeUrl(contentCalendarForm.url.trim())
      
      // Update project URL
      await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_calendar_url: normalizedUrl,
        }),
      })

      // Create message if there's a message
      if (contentCalendarForm.message.trim()) {
        const { data: { user } } = await supabase.auth.getUser()
        const sendMessage = async () => {
          await fetch('/api/messages/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: projectData.user_id,
              sender_type: 'admin',
              sender_id: user?.id || null,
              content: contentCalendarForm.message.trim(),
              project_id: projectId,
            }),
          })
        }
        
        setPreviewMessage({
          content: contentCalendarForm.message.trim(),
          recipient: projectData.users?.name || projectData.users?.email || 'Client',
          onConfirm: async () => {
            await sendMessage()
            setContentCalendarForm({ url: '', message: '' })
            setEditingContentCalendar(false)
            setShowMessagePreview(false)
            setPreviewMessage(null)
            setSendingContentCalendar(false)
            await loadProject()
            await loadMessages()
            await loadActivity()
          },
        })
        setShowMessagePreview(true)
        setSendingContentCalendar(false)
        return
      }

      setContentCalendarForm({ url: '', message: '' })
      setEditingContentCalendar(false)
      await loadProject()
      await loadMessages()
      await loadActivity()
    } catch (error) {
      console.error('Error updating content calendar:', error)
      alert('Failed to update content calendar')
    } finally {
      setSendingContentCalendar(false)
    }
  }

  const handleDeleteContentCalendar = async () => {
    if (!confirm('Are you sure you want to delete this content calendar? The client will no longer see it.')) return
    setDeletingContentCalendar(true)
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_calendar_url: null,
          content_calendar_sent_at: null,
          content_calendar_message_id: null,
        }),
      })
      await loadProject()
      await loadActivity()
    } catch (error) {
      console.error('Error deleting content calendar:', error)
      alert('Failed to delete content calendar')
    } finally {
      setDeletingContentCalendar(false)
    }
  }

  const handleSendContentCalendarMessage = async () => {
    if (!contentCalendarMessageDraft.trim() || !projectData) return
    if (!contentCalendarSendToAllClients && !contentCalendarSelectedRecipientId) return
    
    const recipientNames = contentCalendarSendToAllClients 
      ? projectClients.map(pc => pc.users?.name || pc.users?.email || 'Client').join(', ')
      : (projectClients.find(pc => pc.user_id === contentCalendarSelectedRecipientId)?.users || projectData.users)?.name || 
        (projectClients.find(pc => pc.user_id === contentCalendarSelectedRecipientId)?.users || projectData.users)?.email || 
        'Client'
    
    setPreviewMessage({
      content: contentCalendarMessageDraft.trim(),
      recipient: contentCalendarSendToAllClients ? `All clients (${projectClients.length})` : recipientNames,
      onConfirm: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          
          if (contentCalendarSendToAllClients) {
            // Send to all clients
            const sendPromises = projectClients.map(pc =>
              fetch('/api/messages/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  project_id: projectId,
                  user_id: pc.user_id,
                  sender_type: 'admin',
                  sender_id: user?.id || null,
                  content: contentCalendarMessageDraft.trim(),
                  message_type: 'content_calendar',
                }),
              })
            )
            await Promise.all(sendPromises)
          } else {
            // Send to single client
            const response = await fetch('/api/messages/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                project_id: projectId,
                user_id: contentCalendarSelectedRecipientId,
                sender_type: 'admin',
                sender_id: user?.id || null,
                content: contentCalendarMessageDraft.trim(),
                message_type: 'content_calendar',
              }),
            })
          
            if (!response.ok) {
              const error = await response.json()
              console.error('Error sending message:', error)
              alert(`Failed to send message: ${error.error || 'Unknown error'}`)
              return
            }
          }
          
          setContentCalendarMessageDraft('')
          setShowMessagePreview(false)
          setPreviewMessage(null)
          await loadMessages()
          await loadContentCalendarMessages()
          await loadActivity()
        } catch (error) {
          console.error('Error sending content calendar message:', error)
          alert('Failed to send message. Please try again.')
        }
      },
    })
    setShowMessagePreview(true)
  }

  const handleSendMessage = async () => {
    if (!projectData || !messageDraft.trim()) return
    if (!sendToAllClients && !selectedRecipientId) return
    
    const recipientNames = sendToAllClients 
      ? projectClients.map(pc => pc.users?.name || pc.users?.email || 'Client').join(', ')
      : (projectClients.find(pc => pc.user_id === selectedRecipientId)?.users || projectData.users)?.name || 
        (projectClients.find(pc => pc.user_id === selectedRecipientId)?.users || projectData.users)?.email || 
        'Client'
    
    setPreviewMessage({
      content: messageDraft.trim(),
      recipient: sendToAllClients ? `All clients (${projectClients.length})` : recipientNames,
      onConfirm: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          
          if (sendToAllClients) {
            // Send to all clients
            const sendPromises = projectClients.map(pc =>
              fetch('/api/messages/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  user_id: pc.user_id,
                  sender_type: 'admin',
                  sender_id: user?.id || null,
                  content: messageDraft.trim(),
                  project_id: projectId,
                }),
              })
            )
            await Promise.all(sendPromises)
          } else {
            // Send to single client
            await fetch('/api/messages/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: selectedRecipientId,
                sender_type: 'admin',
                sender_id: user?.id || null,
                content: messageDraft.trim(),
                project_id: projectId,
              }),
            })
          }
          
          setMessageDraft('')
          setShowMessagePreview(false)
          setPreviewMessage(null)
          await loadMessages()
          await loadActivity()
        } catch (error) {
          console.error('Error sending message:', error)
          alert('Failed to send message. Please try again.')
        }
      },
    })
    setShowMessagePreview(true)
  }

  const handleEditMessage = (message: any) => {
    setEditingMessageId(message.id)
    setEditingMessageContent(message.content)
  }

  const handleSaveMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editingMessageContent }),
      })
      if (response.ok) {
        setEditingMessageId(null)
        setEditingMessageContent('')
        await Promise.all([
          loadMessages(),
          loadProposalMessages(),
          loadStyleGuideMessages(),
          loadResourceMessages(),
        ])
      }
    } catch (error) {
      console.error('Error saving message:', error)
    }
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditingMessageContent('')
  }

  const handleSendProposalMessage = async () => {
    if (!proposalMessageDraft.trim() || !projectData) return
    if (!proposalSendToAllClients && !proposalSelectedRecipientId) return
    
    const recipientNames = proposalSendToAllClients 
      ? projectClients.map(pc => pc.users?.name || pc.users?.email || 'Client').join(', ')
      : (projectClients.find(pc => pc.user_id === proposalSelectedRecipientId)?.users || projectData.users)?.name || 
        (projectClients.find(pc => pc.user_id === proposalSelectedRecipientId)?.users || projectData.users)?.email || 
        'Client'
    
    setPreviewMessage({
      content: proposalMessageDraft.trim(),
      recipient: proposalSendToAllClients ? `All clients (${projectClients.length})` : recipientNames,
      onConfirm: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          
          if (proposalSendToAllClients) {
            // Send to all clients
            const sendPromises = projectClients.map(pc =>
              fetch('/api/messages/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  project_id: projectId,
                  user_id: pc.user_id,
                  sender_type: 'admin',
                  sender_id: user?.id || null,
                  content: proposalMessageDraft.trim(),
                  message_type: 'proposal',
                }),
              })
            )
            await Promise.all(sendPromises)
          } else {
            // Send to single client
            const response = await fetch('/api/messages/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                project_id: projectId,
                user_id: proposalSelectedRecipientId,
                sender_type: 'admin',
                sender_id: user?.id || null,
                content: proposalMessageDraft.trim(),
                message_type: 'proposal',
              }),
            })
          
            if (!response.ok) {
              const error = await response.json()
              console.error('Error sending message:', error)
              alert(`Failed to send message: ${error.error || 'Unknown error'}`)
              return
            }
          }
          
          setProposalMessageDraft('')
          setShowMessagePreview(false)
          setPreviewMessage(null)
          await loadMessages()
          await loadProposalMessages()
          await loadActivity()
        } catch (error) {
          console.error('Error sending proposal message:', error)
          alert('Failed to send message. Please try again.')
        }
      },
    })
    setShowMessagePreview(true)
  }

  const handleSendStyleGuideMessage = async () => {
    if (!styleGuideMessageDraft.trim() || !projectData) return
    if (!styleGuideSendToAllClients && !styleGuideSelectedRecipientId) return
    
    const recipientNames = styleGuideSendToAllClients 
      ? projectClients.map(pc => pc.users?.name || pc.users?.email || 'Client').join(', ')
      : (projectClients.find(pc => pc.user_id === styleGuideSelectedRecipientId)?.users || projectData.users)?.name || 
        (projectClients.find(pc => pc.user_id === styleGuideSelectedRecipientId)?.users || projectData.users)?.email || 
        'Client'
    
    setPreviewMessage({
      content: styleGuideMessageDraft.trim(),
      recipient: styleGuideSendToAllClients ? `All clients (${projectClients.length})` : recipientNames,
      onConfirm: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          
          if (styleGuideSendToAllClients) {
            // Send to all clients
            const sendPromises = projectClients.map(pc =>
              fetch('/api/messages/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  project_id: projectId,
                  user_id: pc.user_id,
                  sender_type: 'admin',
                  sender_id: user?.id || null,
                  content: styleGuideMessageDraft.trim(),
                  message_type: 'style_guide',
                }),
              })
            )
            await Promise.all(sendPromises)
          } else {
            // Send to single client
            const response = await fetch('/api/messages/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                project_id: projectId,
                user_id: styleGuideSelectedRecipientId,
                sender_type: 'admin',
                sender_id: user?.id || null,
                content: styleGuideMessageDraft.trim(),
                message_type: 'style_guide',
              }),
            })
          
            if (!response.ok) {
              const error = await response.json()
              console.error('Error sending message:', error)
              alert(`Failed to send message: ${error.error || 'Unknown error'}`)
              return
            }
          }
          
          setStyleGuideMessageDraft('')
          setShowMessagePreview(false)
          setPreviewMessage(null)
          await loadMessages()
          await loadStyleGuideMessages()
          await loadActivity()
        } catch (error) {
          console.error('Error sending style guide message:', error)
          alert('Failed to send message. Please try again.')
        }
      },
    })
    setShowMessagePreview(true)
  }

  const handleSendResourceMessage = async () => {
    if (!resourceMessageDraft.trim() || !projectData) return
    if (!resourceSendToAllClients && !resourceSelectedRecipientId) return
    
    const recipientNames = resourceSendToAllClients 
      ? projectClients.map(pc => pc.users?.name || pc.users?.email || 'Client').join(', ')
      : (projectClients.find(pc => pc.user_id === resourceSelectedRecipientId)?.users || projectData.users)?.name || 
        (projectClients.find(pc => pc.user_id === resourceSelectedRecipientId)?.users || projectData.users)?.email || 
        'Client'
    
    setPreviewMessage({
      content: resourceMessageDraft.trim(),
      recipient: resourceSendToAllClients ? `All clients (${projectClients.length})` : recipientNames,
      onConfirm: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          
          if (resourceSendToAllClients) {
            // Send to all clients
            const sendPromises = projectClients.map(pc =>
              fetch('/api/messages/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  project_id: projectId,
                  user_id: pc.user_id,
                  sender_type: 'admin',
                  sender_id: user?.id || null,
                  content: resourceMessageDraft.trim(),
                  message_type: 'resource',
                }),
              })
            )
            await Promise.all(sendPromises)
          } else {
            // Send to single client
            const response = await fetch('/api/messages/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                project_id: projectId,
                user_id: resourceSelectedRecipientId,
                sender_type: 'admin',
                sender_id: user?.id || null,
                content: resourceMessageDraft.trim(),
                message_type: 'resource',
              }),
            })
          
            if (!response.ok) {
              const error = await response.json()
              console.error('Error sending message:', error)
              alert(`Failed to send message: ${error.error || 'Unknown error'}`)
              return
            }
          }
          
          setResourceMessageDraft('')
          setShowMessagePreview(false)
          setPreviewMessage(null)
          await loadMessages()
          await loadResourceMessages()
          await loadActivity()
        } catch (error) {
          console.error('Error sending resource message:', error)
          alert('Failed to send message. Please try again.')
        }
      },
    })
    setShowMessagePreview(true)
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setDeletingMessageId(null)
        await Promise.all([
          loadMessages(),
          loadProposalMessages(),
          loadStyleGuideMessages(),
          loadResourceMessages(),
        ])
      } else {
        setDeletingMessageId(null)
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      setDeletingMessageId(null)
    }
  }

  const handleUploadDeliverable = async (file: File, name?: string, description?: string, message?: string) => {
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
      
      // If message is provided, create a message and send notification
      if (message && message.trim() && projectData) {
        const { data: { user } } = await supabase.auth.getUser()
        await fetch('/api/messages/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: projectId,
            user_id: projectData.user_id,
            sender_type: 'admin',
            sender_id: user?.id || null,
            content: message.trim(),
            message_type: 'resource',
          }),
        })
        await loadResourceMessages()
        await loadMessages()
      }
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
           
          <div className="flex items-center gap-3 text-sm text-[#a1a1a1] flex-wrap">
  {projectClients.length > 0 ? (
    projectClients.map((pc, index) => (
      <span key={pc.id} className="flex items-center gap-1">
        <Link href={`/admin/clients/${pc.user_id}`} className="text-[#81D8D0] hover:underline">{pc.users?.name || pc.users?.email || 'Client'}</Link>
        {pc.role === 'primary' && <span className="text-xs text-[#81D8D0]/60">(Primary)</span>}
        {index < projectClients.length - 1 && <span className="text-[#333]">•</span>}
      </span>
    ))
  ) : (
    <Link href={`/admin/clients/${projectData.user_id || ''}`} className="text-[#81D8D0] hover:underline">{projectData.users?.name || projectData.users?.email || 'Client'}</Link>
  )}
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
          <div>
            <label className="text-xs text-white/60 uppercase tracking-wider">Assets Folder (Admin Only)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={editForm.assets_folder_url || ''}
                onChange={(e) => setEditForm((p) => ({ ...p, assets_folder_url: e.target.value }))}
                className="flex-1 bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                placeholder="https://dropbox.com/folder/..."
              />
              {editForm.assets_folder_url && (
                <a
                  href={editForm.assets_folder_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg border border-[#81D8D0] text-[#81D8D0] hover:bg-[#81D8D0]/10 transition-colors whitespace-nowrap"
                >
                  View Folder
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
            {['overview','proposals','style-guide','content-calendar','bookings','messages','resources','invoices','activity'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 pb-2 text-sm font-medium border-b-2 ${
                  tab === t ? 'border-[#81D8D0] text-[#81D8D0]' : 'border-transparent text-[#a1a1a1]'
                }`}
              >
                {t === 'style-guide' ? 'Style Guide' : t === 'content-calendar' ? 'Content Calendar' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 text-[#a1a1a1]">
              <p className="text-white mb-2">Created: {projectData.created_at ? format(new Date(projectData.created_at), 'MMM d, yyyy') : 'N/A'}</p>
              <p>{projectData.description || 'No description provided.'}</p>
            </div>
          )}

          {/* INTAKE FORMS - HIDDEN FOR NOW, MAY RE-ENABLE LATER */}
          {/* {tab === 'intake' && (
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
          )} */}

          {tab === 'proposals' && (
            <div className="space-y-4">
              {projectData?.proposal_url && !editingProposal ? (
                <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 space-y-3">
                  <h3 className="text-white font-semibold">Proposal</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Proposal URL</p>
                      <a
                        href={projectData.proposal_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#81D8D0] hover:underline break-all"
                      >
                        {projectData.proposal_url}
                      </a>
                    </div>
                    {projectData.proposal_sent_at && (
                      <div>
                        <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Sent</p>
                        <p className="text-white">{format(new Date(projectData.proposal_sent_at), 'MMM d, yyyy p')}</p>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2 border-t border-[#333333]">
                      <button
                        onClick={() => {
                          setEditingProposal(true)
                          setProposalForm({ url: projectData.proposal_url || '', message: '' })
                        }}
                        className="px-4 py-2 rounded-lg border border-[#333333] text-white hover:border-[#81D8D0]/60"
                      >
                        Update
                      </button>
                      <button
                        onClick={handleDeleteProposal}
                        disabled={deletingProposal}
                        className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 hover:border-red-500/80 flex items-center gap-2"
                      >
                        <Trash size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 space-y-3">
                  <h3 className="text-white font-semibold">{editingProposal ? 'Update Proposal' : 'Send Proposal'}</h3>
                  <div>
                    <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">Proposal URL</label>
                    <input
                      type="url"
                      className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                      placeholder="https://your-proposal.vercel.app"
                      value={proposalForm.url}
                      onChange={(e) => setProposalForm((p) => ({ ...p, url: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">Message to Client</label>
                    <textarea
                      className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white resize-none"
                      rows={4}
                      placeholder="Add a message about this proposal..."
                      value={proposalForm.message}
                      onChange={(e) => setProposalForm((p) => ({ ...p, message: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    {editingProposal && (
                      <button
                        onClick={() => {
                          setEditingProposal(false)
                          setProposalForm({ url: '', message: '' })
                        }}
                        className="px-4 py-2 rounded-lg border border-[#333333] text-white hover:border-[#81D8D0]/60"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={editingProposal ? handleUpdateProposal : handleSendProposal}
                      disabled={sendingProposal || !proposalForm.url.trim()}
                      className="px-4 py-2 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                      {sendingProposal ? 'Sending...' : editingProposal ? 'Save' : 'Send Proposal'}
                    </button>
                  </div>
                </div>
              )}

              {/* Proposal Message Thread */}
              {projectData?.proposal_url && (
                <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 space-y-3">
                  <h3 className="text-white font-semibold">Message History</h3>
                  {proposalMessages.length === 0 ? (
                    <p className="text-[#a1a1a1] text-sm">No messages yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {proposalMessages.map((m) => (
                        <div key={m.id} className="p-3 border border-[#333333] rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-[#a1a1a1]">
                              {m.sender_type === 'admin' ? 'You' : projectData.users?.name || projectData.users?.email || 'Client'} • {format(new Date(m.created_at), 'MMM d, yyyy p')}
                            </p>
                            {m.sender_type === 'admin' && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEditMessage(m)}
                                  className="text-white/60 hover:text-white transition-colors"
                                  title="Edit message"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => setDeletingMessageId(m.id)}
                                  className="text-white/60 hover:text-red-400 transition-colors"
                                  title="Delete message"
                                >
                                  <Trash size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                          {editingMessageId === m.id ? (
                            <div className="space-y-2">
                              <textarea
                                className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white resize-none"
                                rows={3}
                                value={editingMessageContent}
                                onChange={(e) => setEditingMessageContent(e.target.value)}
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-3 py-1.5 rounded-lg border border-[#333333] text-white hover:border-[#81D8D0]/60 text-sm"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveMessage(m.id)}
                                  disabled={!editingMessageContent.trim()}
                                  className="px-3 py-1.5 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 disabled:opacity-50 text-sm"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-white whitespace-pre-wrap">{formatMessageWithLinks(m.content)}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="bg-[#0a0a0a] border border-[#333333] rounded-xl p-3 space-y-2">
                    {projectClients.length > 1 && (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">Recipient</label>
                          <select
                            value={proposalSelectedRecipientId || ''}
                            onChange={(e) => {
                              setProposalSelectedRecipientId(e.target.value)
                              setProposalSendToAllClients(false)
                            }}
                            disabled={proposalSendToAllClients}
                            className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
                          >
                            {projectClients.map((pc) => (
                              <option key={pc.user_id} value={pc.user_id}>
                                {pc.users?.name || pc.users?.email || 'Client'} {pc.role === 'primary' ? '(Primary)' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={proposalSendToAllClients}
                            onChange={(e) => {
                              setProposalSendToAllClients(e.target.checked)
                              if (e.target.checked) {
                                setProposalSelectedRecipientId(null)
                              } else {
                                setProposalSelectedRecipientId(projectData?.user_id || null)
                              }
                            }}
                            className="w-4 h-4 rounded border-[#333333] bg-[#0a0a0a] text-[#81D8D0] focus:ring-[#81D8D0]"
                          />
                          <span className="text-sm text-white">Send to all clients ({projectClients.length})</span>
                        </label>
                      </div>
                    )}
                    <textarea
                      className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white resize-none"
                      rows={3}
                      placeholder="Reply to this proposal..."
                      value={proposalMessageDraft}
                      onChange={(e) => setProposalMessageDraft(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleSendProposalMessage}
                        disabled={!proposalMessageDraft.trim() || (!proposalSendToAllClients && !proposalSelectedRecipientId)}
                        className="px-4 py-2 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 disabled:opacity-50"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'style-guide' && (
            <div className="space-y-4">
              {projectData?.style_guide_url && !editingStyleGuide ? (
                <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 space-y-3">
                  <h3 className="text-white font-semibold">Style Guide</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Style Guide URL</p>
                      <a
                        href={projectData.style_guide_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#81D8D0] hover:underline break-all"
                      >
                        {projectData.style_guide_url}
                      </a>
                    </div>
                    {projectData.style_guide_sent_at && (
                      <div>
                        <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Sent</p>
                        <p className="text-white">{format(new Date(projectData.style_guide_sent_at), 'MMM d, yyyy p')}</p>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2 border-t border-[#333333]">
                      <button
                        onClick={() => {
                          setEditingStyleGuide(true)
                          setStyleGuideForm({ url: projectData.style_guide_url || '', message: '' })
                        }}
                        className="px-4 py-2 rounded-lg border border-[#333333] text-white hover:border-[#81D8D0]/60"
                      >
                        Update
                      </button>
                      <button
                        onClick={handleDeleteStyleGuide}
                        disabled={deletingStyleGuide}
                        className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 hover:border-red-500/80 flex items-center gap-2"
                      >
                        <Trash size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Style Guide Message Thread */}
              {projectData?.style_guide_url && (
                <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 space-y-3">
                  <h3 className="text-white font-semibold">Message History</h3>
                  {styleGuideMessages.length === 0 ? (
                    <p className="text-[#a1a1a1] text-sm">No messages yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {styleGuideMessages.map((m) => (
                        <div key={m.id} className="p-3 border border-[#333333] rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-[#a1a1a1]">
                              {m.sender_type === 'admin' ? 'You' : projectData.users?.name || projectData.users?.email || 'Client'} • {format(new Date(m.created_at), 'MMM d, yyyy p')}
                            </p>
                            {m.sender_type === 'admin' && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEditMessage(m)}
                                  className="text-white/60 hover:text-white transition-colors"
                                  title="Edit message"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => setDeletingMessageId(m.id)}
                                  className="text-white/60 hover:text-red-400 transition-colors"
                                  title="Delete message"
                                >
                                  <Trash size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                          {editingMessageId === m.id ? (
                            <div className="space-y-2">
                              <textarea
                                className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white resize-none"
                                rows={3}
                                value={editingMessageContent}
                                onChange={(e) => setEditingMessageContent(e.target.value)}
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-3 py-1.5 rounded-lg border border-[#333333] text-white hover:border-[#81D8D0]/60 text-sm"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveMessage(m.id)}
                                  disabled={!editingMessageContent.trim()}
                                  className="px-3 py-1.5 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 disabled:opacity-50 text-sm"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-white whitespace-pre-wrap">{formatMessageWithLinks(m.content)}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="bg-[#0a0a0a] border border-[#333333] rounded-xl p-3 space-y-2">
                    {projectClients.length > 1 && (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">Recipient</label>
                          <select
                            value={styleGuideSelectedRecipientId || ''}
                            onChange={(e) => {
                              setStyleGuideSelectedRecipientId(e.target.value)
                              setStyleGuideSendToAllClients(false)
                            }}
                            disabled={styleGuideSendToAllClients}
                            className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
                          >
                            {projectClients.map((pc) => (
                              <option key={pc.user_id} value={pc.user_id}>
                                {pc.users?.name || pc.users?.email || 'Client'} {pc.role === 'primary' ? '(Primary)' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={styleGuideSendToAllClients}
                            onChange={(e) => {
                              setStyleGuideSendToAllClients(e.target.checked)
                              if (e.target.checked) {
                                setStyleGuideSelectedRecipientId(null)
                              } else {
                                setStyleGuideSelectedRecipientId(projectData?.user_id || null)
                              }
                            }}
                            className="w-4 h-4 rounded border-[#333333] bg-[#0a0a0a] text-[#81D8D0] focus:ring-[#81D8D0]"
                          />
                          <span className="text-sm text-white">Send to all clients ({projectClients.length})</span>
                        </label>
                      </div>
                    )}
                    <textarea
                      className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white resize-none"
                      rows={3}
                      placeholder="Reply to this style guide..."
                      value={styleGuideMessageDraft}
                      onChange={(e) => setStyleGuideMessageDraft(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleSendStyleGuideMessage}
                        disabled={!styleGuideMessageDraft.trim() || (!styleGuideSendToAllClients && !styleGuideSelectedRecipientId)}
                        className="px-4 py-2 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 disabled:opacity-50"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!projectData?.style_guide_url && (
                <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 space-y-3">
                  <h3 className="text-white font-semibold">{editingStyleGuide ? 'Update Style Guide' : 'Send Style Guide'}</h3>
                  <div>
                    <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">Style Guide URL</label>
                    <input
                      type="url"
                      className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                      placeholder="https://your-style-guide.vercel.app"
                      value={styleGuideForm.url}
                      onChange={(e) => setStyleGuideForm((p) => ({ ...p, url: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">Message to Client</label>
                    <textarea
                      className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white resize-none"
                      rows={4}
                      placeholder="Add a message about this style guide..."
                      value={styleGuideForm.message}
                      onChange={(e) => setStyleGuideForm((p) => ({ ...p, message: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    {editingStyleGuide && (
                      <button
                        onClick={() => {
                          setEditingStyleGuide(false)
                          setStyleGuideForm({ url: '', message: '' })
                        }}
                        className="px-4 py-2 rounded-lg border border-[#333333] text-white hover:border-[#81D8D0]/60"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={editingStyleGuide ? handleUpdateStyleGuide : handleSendStyleGuide}
                      disabled={sendingStyleGuide || !styleGuideForm.url.trim()}
                      className="px-4 py-2 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                      {sendingStyleGuide ? 'Sending...' : editingStyleGuide ? 'Save' : 'Send Style Guide'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'content-calendar' && (
            <div className="space-y-4">
              {projectData?.content_calendar_url && !editingContentCalendar ? (
                <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 space-y-3">
                  <h3 className="text-white font-semibold">Content Calendar</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Content Calendar URL</p>
                      <a
                        href={projectData.content_calendar_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#81D8D0] hover:underline break-all"
                      >
                        {projectData.content_calendar_url}
                      </a>
                    </div>
                    {projectData.content_calendar_sent_at && (
                      <div>
                        <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Sent</p>
                        <p className="text-white">{format(new Date(projectData.content_calendar_sent_at), 'MMM d, yyyy p')}</p>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2 border-t border-[#333333]">
                      <button
                        onClick={() => {
                          setEditingContentCalendar(true)
                          setContentCalendarForm({ url: projectData.content_calendar_url || '', message: '' })
                        }}
                        className="px-4 py-2 rounded-lg border border-[#333333] text-white hover:border-[#81D8D0]/60"
                      >
                        Update
                      </button>
                      <button
                        onClick={handleDeleteContentCalendar}
                        disabled={deletingContentCalendar}
                        className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 hover:border-red-500/80 flex items-center gap-2"
                      >
                        <Trash size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Content Calendar Message Thread */}
              {projectData?.content_calendar_url && (
                <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 space-y-3">
                  <h3 className="text-white font-semibold">Message History</h3>
                  {contentCalendarMessages.length === 0 ? (
                    <p className="text-[#a1a1a1] text-sm">No messages yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {contentCalendarMessages.map((m) => (
                        <div key={m.id} className="p-3 border border-[#333333] rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-[#a1a1a1]">
                              {m.sender_type === 'admin' ? 'You' : projectData.users?.name || projectData.users?.email || 'Client'} • {format(new Date(m.created_at), 'MMM d, yyyy p')}
                            </p>
                            {m.sender_type === 'admin' && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEditMessage(m)}
                                  className="text-white/60 hover:text-white transition-colors"
                                  title="Edit message"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => setDeletingMessageId(m.id)}
                                  className="text-white/60 hover:text-red-400 transition-colors"
                                  title="Delete message"
                                >
                                  <Trash size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                          {editingMessageId === m.id ? (
                            <div className="space-y-2">
                              <textarea
                                className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white resize-none"
                                rows={3}
                                value={editingMessageContent}
                                onChange={(e) => setEditingMessageContent(e.target.value)}
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-3 py-1.5 rounded-lg border border-[#333333] text-white hover:border-[#81D8D0]/60 text-sm"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveMessage(m.id)}
                                  disabled={!editingMessageContent.trim()}
                                  className="px-3 py-1.5 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 disabled:opacity-50 text-sm"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-white whitespace-pre-wrap">{formatMessageWithLinks(m.content)}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="bg-[#0a0a0a] border border-[#333333] rounded-xl p-3 space-y-2">
                    {projectClients.length > 1 && (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">Recipient</label>
                          <select
                            value={contentCalendarSelectedRecipientId || ''}
                            onChange={(e) => {
                              setContentCalendarSelectedRecipientId(e.target.value)
                              setContentCalendarSendToAllClients(false)
                            }}
                            disabled={contentCalendarSendToAllClients}
                            className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
                          >
                            {projectClients.map((pc) => (
                              <option key={pc.user_id} value={pc.user_id}>
                                {pc.users?.name || pc.users?.email || 'Client'} {pc.role === 'primary' ? '(Primary)' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={contentCalendarSendToAllClients}
                            onChange={(e) => {
                              setContentCalendarSendToAllClients(e.target.checked)
                              if (e.target.checked) {
                                setContentCalendarSelectedRecipientId(null)
                              } else {
                                setContentCalendarSelectedRecipientId(projectData?.user_id || null)
                              }
                            }}
                            className="w-4 h-4 rounded border-[#333333] bg-[#0a0a0a] text-[#81D8D0] focus:ring-[#81D8D0]"
                          />
                          <span className="text-sm text-white">Send to all clients ({projectClients.length})</span>
                        </label>
                      </div>
                    )}
                    <textarea
                      className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white resize-none"
                      rows={3}
                      placeholder="Reply to this content calendar..."
                      value={contentCalendarMessageDraft}
                      onChange={(e) => setContentCalendarMessageDraft(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleSendContentCalendarMessage}
                        disabled={!contentCalendarMessageDraft.trim() || (!contentCalendarSendToAllClients && !contentCalendarSelectedRecipientId)}
                        className="px-4 py-2 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 disabled:opacity-50"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!projectData?.content_calendar_url && (
                <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 space-y-3">
                  <h3 className="text-white font-semibold">{editingContentCalendar ? 'Update Content Calendar' : 'Send Content Calendar'}</h3>
                  <div>
                    <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">Content Calendar URL</label>
                    <input
                      type="url"
                      className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                      placeholder="https://your-content-calendar.vercel.app"
                      value={contentCalendarForm.url}
                      onChange={(e) => setContentCalendarForm((p) => ({ ...p, url: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">Message to Client</label>
                    <textarea
                      className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white resize-none"
                      rows={4}
                      placeholder="Add a message about this content calendar..."
                      value={contentCalendarForm.message}
                      onChange={(e) => setContentCalendarForm((p) => ({ ...p, message: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    {editingContentCalendar && (
                      <button
                        onClick={() => {
                          setEditingContentCalendar(false)
                          setContentCalendarForm({ url: '', message: '' })
                        }}
                        className="px-4 py-2 rounded-lg border border-[#333333] text-white hover:border-[#81D8D0]/60"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={editingContentCalendar ? handleUpdateContentCalendar : handleSendContentCalendar}
                      disabled={sendingContentCalendar || !contentCalendarForm.url.trim()}
                      className="px-4 py-2 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                      {sendingContentCalendar ? 'Sending...' : editingContentCalendar ? 'Save' : 'Send Content Calendar'}
                    </button>
                  </div>
                </div>
              )}
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
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 rounded-full border border-[#333333] text-white/80">
                              {m.sender_type}
                            </span>
                            {m.sender_type === 'admin' && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEditMessage(m)}
                                  className="text-white/60 hover:text-white transition-colors"
                                  title="Edit message"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => setDeletingMessageId(m.id)}
                                  className="text-white/60 hover:text-red-400 transition-colors"
                                  title="Delete message"
                                >
                                  <Trash size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        {editingMessageId === m.id ? (
                          <div className="space-y-2">
                            <textarea
                              className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white resize-none"
                              rows={3}
                              value={editingMessageContent}
                              onChange={(e) => setEditingMessageContent(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={handleCancelEdit}
                                className="px-3 py-1.5 rounded-lg border border-[#333333] text-white hover:border-[#81D8D0]/60 text-sm"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveMessage(m.id)}
                                disabled={!editingMessageContent.trim()}
                                className="px-3 py-1.5 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 disabled:opacity-50 text-sm"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-white whitespace-pre-wrap">{formatMessageWithLinks(m.content)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 space-y-2">
                {projectClients.length > 1 && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">Recipient</label>
                      <select
                        value={selectedRecipientId || ''}
                        onChange={(e) => {
                          setSelectedRecipientId(e.target.value)
                          setSendToAllClients(false)
                        }}
                        disabled={sendToAllClients}
                        className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
                      >
                        {projectClients.map((pc) => (
                          <option key={pc.user_id} value={pc.user_id}>
                            {pc.users?.name || pc.users?.email || 'Client'} {pc.role === 'primary' ? '(Primary)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sendToAllClients}
                        onChange={(e) => {
                          setSendToAllClients(e.target.checked)
                          if (e.target.checked) {
                            setSelectedRecipientId(null)
                          } else {
                            setSelectedRecipientId(projectData?.user_id || null)
                          }
                        }}
                        className="w-4 h-4 rounded border-[#333333] bg-[#0a0a0a] text-[#81D8D0] focus:ring-[#81D8D0]"
                      />
                      <span className="text-sm text-white">Send to all clients ({projectClients.length})</span>
                    </label>
                  </div>
                )}
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
                    disabled={!messageDraft.trim() || (!sendToAllClients && !selectedRecipientId)}
                    className="px-4 py-2 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'resources' && (
            <div className="space-y-4">
              <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 space-y-3">
                <h3 className="text-white font-semibold">Upload Resource</h3>
                <div className="space-y-3">
                  <label className="inline-flex items-center gap-2 px-3 py-2 border border-[#333333] rounded-lg text-white hover:border-[#81D8D0]/60 cursor-pointer w-fit">
                    <Upload size={16} />
                    {selectedFile ? selectedFile.name : 'Choose File'}
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setSelectedFile(file)
                        }
                      }}
                      disabled={uploading}
                    />
                  </label>
                  {selectedFile && (
                    <div>
                      <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">Message to Client (optional)</label>
                      <textarea
                        className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white resize-none"
                        rows={3}
                        placeholder="Let the client know about this resource..."
                        value={uploadMessage}
                        onChange={(e) => setUploadMessage(e.target.value)}
                      />
                    </div>
                  )}
                  {selectedFile && (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedFile(null)
                          setUploadMessage('')
                        }}
                        className="px-4 py-2 rounded-lg border border-[#333333] text-white hover:border-[#81D8D0]/60"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          if (selectedFile) {
                            await handleUploadDeliverable(selectedFile, undefined, undefined, uploadMessage)
                            setSelectedFile(null)
                            setUploadMessage('')
                          }
                        }}
                        disabled={uploading}
                        className="px-4 py-2 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 disabled:opacity-50"
                      >
                        {uploading ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 space-y-3">
                <h3 className="text-white font-semibold">Uploaded Resources</h3>
                {deliverables.length === 0 ? (
                  <p className="text-[#a1a1a1] text-sm">No resources uploaded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {deliverables.map((d) => (
                      <div key={d.id} className="flex items-center justify-between gap-3 p-3 border border-[#333333] rounded-lg">
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
                    ))}
                  </div>
                )}
              </div>

              {/* Resource Message Thread */}
              <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 space-y-3">
                <h3 className="text-white font-semibold">Message History</h3>
                {resourceMessages.length === 0 ? (
                  <p className="text-[#a1a1a1] text-sm">No messages yet.</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {resourceMessages.map((m) => (
                      <div key={m.id} className="p-3 border border-[#333333] rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-[#a1a1a1]">
                            {m.sender_type === 'admin' ? 'You' : projectData.users?.name || projectData.users?.email || 'Client'} • {format(new Date(m.created_at), 'MMM d, yyyy p')}
                          </p>
                          {m.sender_type === 'admin' && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEditMessage(m)}
                                className="text-white/60 hover:text-white transition-colors"
                                title="Edit message"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => setDeletingMessageId(m.id)}
                                className="text-white/60 hover:text-red-400 transition-colors"
                                title="Delete message"
                              >
                                <Trash size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                        {editingMessageId === m.id ? (
                          <div className="space-y-2">
                            <textarea
                              className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white resize-none"
                              rows={3}
                              value={editingMessageContent}
                              onChange={(e) => setEditingMessageContent(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={handleCancelEdit}
                                className="px-3 py-1.5 rounded-lg border border-[#333333] text-white hover:border-[#81D8D0]/60 text-sm"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveMessage(m.id)}
                                disabled={!editingMessageContent.trim()}
                                className="px-3 py-1.5 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 disabled:opacity-50 text-sm"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-white whitespace-pre-wrap">{formatMessageWithLinks(m.content)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="bg-[#0a0a0a] border border-[#333333] rounded-xl p-3 space-y-2">
                  {projectClients.length > 1 && (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">Recipient</label>
                        <select
                          value={resourceSelectedRecipientId || ''}
                          onChange={(e) => {
                            setResourceSelectedRecipientId(e.target.value)
                            setResourceSendToAllClients(false)
                          }}
                          disabled={resourceSendToAllClients}
                          className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
                        >
                          {projectClients.map((pc) => (
                            <option key={pc.user_id} value={pc.user_id}>
                              {pc.users?.name || pc.users?.email || 'Client'} {pc.role === 'primary' ? '(Primary)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={resourceSendToAllClients}
                          onChange={(e) => {
                            setResourceSendToAllClients(e.target.checked)
                            if (e.target.checked) {
                              setResourceSelectedRecipientId(null)
                            } else {
                              setResourceSelectedRecipientId(projectData?.user_id || null)
                            }
                          }}
                          className="w-4 h-4 rounded border-[#333333] bg-[#0a0a0a] text-[#81D8D0] focus:ring-[#81D8D0]"
                        />
                        <span className="text-sm text-white">Send to all clients ({projectClients.length})</span>
                      </label>
                    </div>
                  )}
                  <textarea
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white resize-none"
                    rows={3}
                    placeholder="Reply about resources..."
                    value={resourceMessageDraft}
                    onChange={(e) => setResourceMessageDraft(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSendResourceMessage}
                      disabled={!resourceMessageDraft.trim() || (!resourceSendToAllClients && !resourceSelectedRecipientId)}
                      className="px-4 py-2 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
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

      {/* Message Preview Modal */}
      {showMessagePreview && previewMessage && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl w-full max-w-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-xl font-semibold">Preview Message</h3>
              <button
                onClick={() => {
                  setShowMessagePreview(false)
                  setPreviewMessage(null)
                }}
                className="text-[#a1a1a1] hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-white/60 uppercase tracking-wider mb-1">To</p>
                <p className="text-white">{previewMessage.recipient}</p>
              </div>
              <div>
                <p className="text-xs text-white/60 uppercase tracking-wider mb-2">Message</p>
                <div className="bg-[#0a0a0a] border border-[#333333] rounded-lg p-4 min-h-[100px]">
                  <p className="text-white whitespace-pre-wrap break-words">
                    {formatMessageWithLinks(previewMessage.content)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[#333333]">
              <button
                onClick={() => {
                  setShowMessagePreview(false)
                  setPreviewMessage(null)
                }}
                className="px-4 py-2 rounded-lg border border-[#333333] text-white hover:border-[#81D8D0]/60"
              >
                Edit
              </button>
              <button
                onClick={previewMessage.onConfirm}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#81D8D0] to-[#5fb3ad] text-[#0a0a0a] font-semibold hover:opacity-90"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Message Confirmation Modal */}
      {deletingMessageId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 max-w-md w-full mx-4 space-y-4">
            <h3 className="text-white text-xl font-semibold">Delete Message</h3>
            <p className="text-[#a1a1a1]">
              Are you sure you want to delete this message? The client will no longer see it.
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setDeletingMessageId(null)}
                className="px-4 py-2 rounded-lg border border-[#333333] text-white hover:border-white/50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMessage(deletingMessageId)}
                className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30"
              >
                Delete
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

