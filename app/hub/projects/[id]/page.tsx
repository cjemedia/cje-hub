'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useHubUser } from '@/components/hub/HubUserProvider'
import { StatusBadge } from '@/components/StatusBadge'
import { format } from 'date-fns'
import { formatDate } from '@/lib/utils/date'
import { CheckCircle, Download, Send, X, Link as LinkIcon, ExternalLink } from 'lucide-react'
import { formatMessageWithLinks } from '@/lib/utils/message-formatting'

export default function HubProjectDetailPage() {
  const { user } = useHubUser()
  const params = useParams()
  const projectId = params?.id as string
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<any>(null)
  const [intakeResponses, setIntakeResponses] = useState<any[]>([])
  const [intakeForms, setIntakeForms] = useState<Record<string, any>>({})
  const [proposals, setProposals] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [proposalReply, setProposalReply] = useState('')
  const [styleGuideReply, setStyleGuideReply] = useState('')
  const [contentCalendarReply, setContentCalendarReply] = useState('')
  const [proposalMessages, setProposalMessages] = useState<any[]>([])
  const [styleGuideMessages, setStyleGuideMessages] = useState<any[]>([])
  const [contentCalendarMessages, setContentCalendarMessages] = useState<any[]>([])
  const [resourceMessages, setResourceMessages] = useState<any[]>([])
  const [resourceMessageDraft, setResourceMessageDraft] = useState('')
  const [deliverables, setDeliverables] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [showMessagePreview, setShowMessagePreview] = useState(false)
  const [previewMessage, setPreviewMessage] = useState<{ content: string; onConfirm: () => void } | null>(null)

  const [responseDrafts, setResponseDrafts] = useState<Record<string, any>>({})

  const trackActivity = async (activityType: 'proposal' | 'style_guide' | 'content_calendar' | 'resources' | 'invoice' | 'assets') => {
    const columnMap = {
      proposal: 'last_viewed_proposal',
      style_guide: 'last_viewed_style_guide',
      content_calendar: 'last_viewed_content_calendar',
      resources: 'last_viewed_resources',
      invoice: 'last_viewed_invoice',
      assets: 'last_uploaded_assets',
    }
    
    await supabase
      .from('projects')
      .update({ [columnMap[activityType]]: new Date().toISOString() })
      .eq('id', projectId)
  }

  useEffect(() => {
    if (!projectId || !user) return
    const load = async () => {
      setLoading(true)
      await Promise.all([
        loadProject(),
        loadIntake(),
        loadProposals(),
        loadBookings(),
        loadDeliverables(),
        loadInvoices(),
        loadResourceMessages(),
        loadProposalMessages(),
        loadStyleGuideMessages(),
        loadContentCalendarMessages(),
      ])
      setLoading(false)
    }
    load()
  }, [projectId, user])

  const loadProject = async () => {
    const { data } = await supabase.from('projects').select('*').eq('id', projectId).maybeSingle()
    setProject(data)
  }

  const loadIntake = async () => {
    const { data: responses } = await supabase
      .from('intake_responses')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    setIntakeResponses(responses || [])
    // fetch related forms
    if (responses && responses.length > 0) {
      const formIds = Array.from(new Set(responses.map((r) => r.form_id).filter(Boolean)))
      if (formIds.length) {
        const { data: forms } = await supabase.from('intake_forms').select('*').in('id', formIds)
        const map: Record<string, any> = {}
        forms?.forEach((f) => (map[f.id] = f))
        setIntakeForms(map)
      }
    }
  }

  const loadProposals = async () => {
    const { data } = await supabase
      .from('proposals')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    setProposals(data || [])
  }

  const loadBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('project_id', projectId)
      .order('booking_date', { ascending: false })
    setBookings(data || [])
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

  const loadProposalMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('project_id', projectId)
        .eq('message_type', 'proposal')
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
      
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
    } catch (error) {
      console.error('Error loading proposal messages:', error)
      setProposalMessages([])
    }
  }

  const loadStyleGuideMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('project_id', projectId)
        .eq('message_type', 'style_guide')
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
      
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
    } catch (error) {
      console.error('Error loading style guide messages:', error)
      setStyleGuideMessages([])
    }
  }

  const loadContentCalendarMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('project_id', projectId)
        .eq('message_type', 'content_calendar')
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
      
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
    } catch (error) {
      console.error('Error loading content calendar messages:', error)
      setContentCalendarMessages([])
    }
  }

  const loadResourceMessages = async () => {
    try {
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
    } catch (error) {
      console.error('Error loading resource messages:', error)
      setResourceMessages([])
    }
  }

  const handleSubmitIntake = async (responseId: string) => {
    const draft = responseDrafts[responseId] || {}
    await fetch(`/api/intake-responses/${responseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        responses: draft,
        user_id: user?.id,
        project_id: projectId,
      }),
    })
    await loadIntake()
  }

  const handleProposalAction = async (proposalId: string, status: 'accepted' | 'declined') => {
    await fetch(`/api/proposals/${proposalId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, responded_at: new Date().toISOString() }),
    })
    await loadProposals()
  }

  const handleSendProposalReply = async () => {
    if (!proposalReply.trim() || !user) return
    setPreviewMessage({
      content: proposalReply.trim(),
      onConfirm: async () => {
        await fetch('/api/messages/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            sender_type: 'client',
            content: proposalReply.trim(),
            project_id: projectId,
            message_type: 'proposal',
          }),
        })
        setProposalReply('')
        setShowMessagePreview(false)
        setPreviewMessage(null)
        await loadProposalMessages()
      },
    })
    setShowMessagePreview(true)
  }

  const handleSendStyleGuideReply = async () => {
    if (!styleGuideReply.trim() || !user) return
    setPreviewMessage({
      content: styleGuideReply.trim(),
      onConfirm: async () => {
        await fetch('/api/messages/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            sender_type: 'client',
            content: styleGuideReply.trim(),
            project_id: projectId,
            message_type: 'style_guide',
          }),
        })
        setStyleGuideReply('')
        setShowMessagePreview(false)
        setPreviewMessage(null)
        await loadStyleGuideMessages()
      },
    })
    setShowMessagePreview(true)
  }

  const handleSendContentCalendarReply = async () => {
    if (!contentCalendarReply.trim() || !user) return
    setPreviewMessage({
      content: contentCalendarReply.trim(),
      onConfirm: async () => {
        await fetch('/api/messages/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            sender_type: 'client',
            content: contentCalendarReply.trim(),
            project_id: projectId,
            message_type: 'content_calendar',
          }),
        })
        setContentCalendarReply('')
        setShowMessagePreview(false)
        setPreviewMessage(null)
        await loadContentCalendarMessages()
      },
    })
    setShowMessagePreview(true)
  }

  const handleSendResourceMessage = async () => {
    if (!resourceMessageDraft.trim() || !user) return
    setPreviewMessage({
      content: resourceMessageDraft.trim(),
      onConfirm: async () => {
        try {
          const res = await fetch('/api/messages/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              project_id: projectId,
              user_id: user.id,
              sender_type: 'client',
              content: resourceMessageDraft.trim(),
              message_type: 'resource',
            }),
          })
          if (res.ok) {
            setResourceMessageDraft('')
            setShowMessagePreview(false)
            setPreviewMessage(null)
            await loadResourceMessages()
          }
        } catch (error) {
          console.error('Error sending resource message:', error)
        }
      },
    })
    setShowMessagePreview(true)
  }

  const intakePending = intakeResponses.some((r) => !r.submitted_at)
  const proposalSent = proposals.find((p) => p.status === 'sent')
  const invoicePending = invoices.find((inv) => inv.status !== 'paid')

  const actionItems = [
    intakePending && {
      label: 'Complete intake form',
      target: 'intake',
    },
    // Only show proposal if it exists AND (never viewed OR updated after last view)
    project?.proposal_url && 
    (!project.last_viewed_proposal || 
     (project.proposal_sent_at && new Date(project.proposal_sent_at) > new Date(project.last_viewed_proposal))) && {
      label: 'View proposal',
      target: 'proposal',
    },
    // Only show style guide if it exists AND (never viewed OR updated after last view)
    project?.style_guide_url && 
    (!project.last_viewed_style_guide || 
     (project.style_guide_sent_at && new Date(project.style_guide_sent_at) > new Date(project.last_viewed_style_guide))) && {
      label: 'View style guide',
      target: 'style-guide',
    },
    // Only show content calendar if it exists AND (never viewed OR updated after last view)
    project?.content_calendar_url && 
    (!project.last_viewed_content_calendar || 
     (project.content_calendar_sent_at && new Date(project.content_calendar_sent_at) > new Date(project.last_viewed_content_calendar))) && {
      label: 'View content calendar',
      target: 'content-calendar',
    },
    // Only show resources if they exist AND (never viewed OR has new resources)
    (deliverables.length > 0 || resourceMessages.length > 0) && 
    !project?.last_viewed_resources && {
      label: 'View resources',
      target: 'resources',
    },
    bookings.length > 0 && {
      label: 'View bookings',
      target: 'bookings',
    },
    // Only show invoice action if unpaid AND (never viewed OR new invoice)
    invoicePending && 
    (!project?.last_viewed_invoice || 
     invoices.some(inv => inv.status !== 'paid' && new Date(inv.created_at) > new Date(project.last_viewed_invoice))) && {
      label: 'Pay invoice',
      target: 'invoices',
    },
    project?.dropbox_link && 
    !project?.last_uploaded_assets && {
      label: 'Upload Your Assets',
      target: 'assets',
      action: () => {
        trackActivity('assets')
        window.open(project.dropbox_link, '_blank')
      },
    },
  ]
    .filter(Boolean)
    .map((item: any) => ({
      ...item,
      id: item.target,
    })) as { label: string; target: string; id: string; action?: () => void }[]

  const sectionRefs: Record<string, React.RefObject<HTMLDivElement>> = {
    overview: useRef(null),
    intake: useRef(null),
    proposals: useRef(null),
    proposal: useRef(null),
    'style-guide': useRef(null),
    'content-calendar': useRef(null),
    bookings: useRef(null),
    messages: useRef(null),
    resources: useRef(null),
    invoices: useRef(null),
  }

  const scrollTo = (key: string) => {
    const ref = sectionRefs[key]
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // Track resources view
      if (key === 'resources') {
        trackActivity('resources')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8">
        <div className="min-h-[60vh] flex items-center justify-center text-[#a1a1a1]">
          Loading project...
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8">
        <div className="min-h-[60vh] flex items-center justify-center text-[#a1a1a1]">
          Project not found
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 sm:p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8 space-y-3">
        <Link href="/hub/projects" className="inline-flex items-center gap-2 text-[#a1a1a1] hover:text-white transition-colors text-sm">
          Back to Projects
        </Link>
        <h1 className="text-3xl sm:text-4xl font-semibold text-white">{project.name}</h1>
        {project.service_type && <p className="text-[#81D8D0] text-sm">{project.service_type}</p>}
      </motion.div>

      <div className="space-y-6 sm:space-y-8">
        {/* Action Items */}
        <section className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-white font-semibold text-lg">Action Items</h2>
              <p className="text-[#a1a1a1] text-sm">Stay on track with your project</p>
            </div>
          </div>
          {actionItems.length === 0 ? (
            <div className="text-[#a1a1a1] text-sm">No action needed right now.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {actionItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.action) {
                      item.action()
                    } else {
                      scrollTo(item.target)
                    }
                  }}
                  className="px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#333333] text-white text-sm hover:border-[#81D8D0]/60"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Overview */}
        <section ref={sectionRefs.overview} className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 sm:p-5 space-y-2">
          <h2 className="text-white font-semibold text-lg">Project Overview</h2>
          <p className="text-[#a1a1a1]">Status: <span className="text-[#81D8D0] capitalize">{project.status?.replace(/_/g, ' ')}</span></p>
          <p className="text-[#a1a1a1]">Service: {project.service_type || 'N/A'}</p>
          <p className="text-[#a1a1a1]">Start: {formatDate(project.start_date)}</p>
          <p className="text-[#a1a1a1]">End: {formatDate(project.end_date)}</p>
          <p className="text-[#a1a1a1]">{project.description || 'No description provided.'}</p>
        </section>

        {/* Invoices */}
        <section ref={sectionRefs.invoices} className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 sm:p-5 space-y-3">
          <h2 className="text-white font-semibold text-lg">Invoices</h2>
          {invoices.length === 0 ? (
            <p className="text-[#a1a1a1] text-sm">No invoices yet.</p>
          ) : (
            <div className="space-y-3">
              {invoices.map((inv) => (
                <div key={inv.id} className="bg-[#0a0a0a] border border-[#333333] rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-white font-semibold text-lg">
                      ${Number(inv.amount || 0).toFixed(2)}
                    </p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        inv.status === 'paid'
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }`}
                    >
                      {inv.status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                  {inv.description && (
                    <p className="text-[#a1a1a1] text-sm">{inv.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-sm items-center border-t border-[#333333] pt-2">
                    {inv.stripe_link && (
                      <a
                        href={inv.stripe_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackActivity('invoice')}
                        className="text-[#81D8D0] hover:underline"
                      >
                        Stripe Link →
                      </a>
                    )}
                    {inv.receipt_url && (
                      <a
                        href={inv.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#81D8D0] hover:underline"
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
              ))}
            </div>
          )}
        </section>

        {/* Messages */}
        <section ref={sectionRefs.messages} className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 sm:p-5 space-y-3">
          <div>
            <h2 className="text-white font-semibold text-lg">Messages</h2>
            <p className="text-[#a1a1a1] text-sm">View all messages with The CJE Experience team</p>
          </div>
          <Link
            href="/hub/messages"
            className="inline-block px-4 py-2 rounded-lg bg-gradient-to-r from-[#81D8D0] to-[#5fb3ad] text-[#0a0a0a] font-semibold hover:opacity-90 transition-opacity"
          >
            View Messages
          </Link>
        </section>

        {/* Bookings */}
        <section ref={sectionRefs.bookings} className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-white font-semibold text-lg">Bookings</h2>
            <Link
              href={`/hub/booking?project=${projectId}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#333333] text-sm text-white hover:border-[#81D8D0]/60"
            >
              <LinkIcon size={14} /> Book a Call
            </Link>
          </div>
          <SimpleList
            title=""
            items={bookings}
            render={(b) => (
              <div>
                <p className="text-white font-medium">{b.booking_date} {b.booking_time}</p>
                <p className="text-xs text-[#a1a1a1]">{b.inquiry_type}</p>
              </div>
            )}
          />
        </section>

        {/* Resources */}
        {(deliverables.length > 0 || resourceMessages.length > 0) && (
          <section ref={sectionRefs.resources} className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-3 sm:p-4 space-y-3">
            <h2 className="text-white font-semibold text-lg">Resources</h2>
            {deliverables.length > 0 && (
              <div className="space-y-2">
                {deliverables.map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-3 border border-[#333333] rounded-lg">
                    <div>
                      <p className="text-white font-medium">{d.name}</p>
                      {d.description && <p className="text-xs text-[#a1a1a1]">{d.description}</p>}
                    </div>
                    <a href={d.file_url} className="text-[#81D8D0] hover:underline flex items-center gap-1" target="_blank" rel="noreferrer">
                      <Download size={14} /> Download
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* Resource Message History */}
            <div className="bg-[#0a0a0a] border border-[#333333] rounded-lg p-3 space-y-2">
              <h3 className="text-white font-medium text-sm">Message History</h3>
              {resourceMessages.length === 0 ? (
                <p className="text-[#a1a1a1] text-xs">No messages yet.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {resourceMessages.map((m) => (
                    <div key={m.id} className="p-2 border border-[#333333] rounded text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-[#a1a1a1]">
                          {m.sender_type === 'admin' ? 'The CJE Experience team' : 'You'} • {format(new Date(m.created_at), 'MMM d, yyyy p')}
                        </p>
                      </div>
                      <p className="text-white whitespace-pre-wrap text-sm">{formatMessageWithLinks(m.content)}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-2">
                <textarea
                  className="w-full bg-[#1a1a1a] border border-[#333333] rounded-lg px-3 py-2 text-white resize-none text-sm"
                  rows={2}
                  placeholder="Reply about resources..."
                  value={resourceMessageDraft}
                  onChange={(e) => setResourceMessageDraft(e.target.value)}
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSendResourceMessage}
                    disabled={!resourceMessageDraft.trim()}
                    className="px-3 py-1.5 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 disabled:opacity-50 text-sm"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Proposal */}
        {project?.proposal_url && (
          <section ref={sectionRefs.proposal} className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-3 sm:p-4 space-y-3">
            <div>
              <h2 className="text-white font-semibold text-lg mb-1">Proposal</h2>
              {project.proposal_sent_at && (
                <p className="text-[#a1a1a1] text-sm">
                  Sent: {format(new Date(project.proposal_sent_at), 'MMM d, yyyy h:mm a')}
                </p>
              )}
            </div>
            <a
              href={project.proposal_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackActivity('proposal')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#81D8D0] to-[#5fb3ad] text-[#0a0a0a] font-semibold hover:opacity-90 transition-opacity"
            >
              <ExternalLink size={18} />
              View Proposal
            </a>

            {/* Proposal Message History */}
            <div className="bg-[#0a0a0a] border border-[#333333] rounded-lg p-3 space-y-2">
              <h3 className="text-white font-medium text-sm">Message History</h3>
              {proposalMessages.length === 0 ? (
                <p className="text-[#a1a1a1] text-xs">No messages yet.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {proposalMessages.map((m) => (
                    <div key={m.id} className="p-2 border border-[#333333] rounded text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-[#a1a1a1]">
                          {m.sender_type === 'admin' ? 'The CJE Experience team' : 'You'} • {format(new Date(m.created_at), 'MMM d, yyyy p')}
                        </p>
                      </div>
                      <p className="text-white whitespace-pre-wrap text-sm">{formatMessageWithLinks(m.content)}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-2">
                <textarea
                  className="w-full bg-[#1a1a1a] border border-[#333333] rounded-lg px-3 py-2 text-white resize-none text-sm"
                  rows={2}
                  value={proposalReply}
                  onChange={(e) => setProposalReply(e.target.value)}
                  placeholder="Reply to this proposal..."
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSendProposalReply}
                    disabled={!proposalReply.trim()}
                    className="px-3 py-1.5 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 disabled:opacity-50 text-sm"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Style Guide */}
        {project?.style_guide_url && (
          <section ref={sectionRefs['style-guide']} className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-3 sm:p-4 space-y-3">
            <div>
              <h2 className="text-white font-semibold text-lg mb-1">Style Guide</h2>
              {project.style_guide_sent_at && (
                <p className="text-[#a1a1a1] text-sm">
                  Sent: {format(new Date(project.style_guide_sent_at), 'MMM d, yyyy h:mm a')}
                </p>
              )}
            </div>
            <a
              href={project.style_guide_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackActivity('style_guide')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#81D8D0] to-[#5fb3ad] text-[#0a0a0a] font-semibold hover:opacity-90 transition-opacity"
            >
              <ExternalLink size={18} />
              View Style Guide
            </a>

            {/* Style Guide Message History */}
            <div className="bg-[#0a0a0a] border border-[#333333] rounded-lg p-3 space-y-2">
              <h3 className="text-white font-medium text-sm">Message History</h3>
              {styleGuideMessages.length === 0 ? (
                <p className="text-[#a1a1a1] text-xs">No messages yet.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {styleGuideMessages.map((m) => (
                    <div key={m.id} className="p-2 border border-[#333333] rounded text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-[#a1a1a1]">
                          {m.sender_type === 'admin' ? 'The CJE Experience team' : 'You'} • {format(new Date(m.created_at), 'MMM d, yyyy p')}
                        </p>
                      </div>
                      <p className="text-white whitespace-pre-wrap text-sm">{formatMessageWithLinks(m.content)}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-2">
                <textarea
                  className="w-full bg-[#1a1a1a] border border-[#333333] rounded-lg px-3 py-2 text-white resize-none text-sm"
                  rows={2}
                  value={styleGuideReply}
                  onChange={(e) => setStyleGuideReply(e.target.value)}
                  placeholder="Reply to this style guide..."
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSendStyleGuideReply}
                    disabled={!styleGuideReply.trim()}
                    className="px-3 py-1.5 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 disabled:opacity-50 text-sm"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Content Calendar */}
        {project?.content_calendar_url && (
          <section ref={sectionRefs['content-calendar']} className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-3 sm:p-4 space-y-3">
            <div>
              <h2 className="text-white font-semibold text-lg mb-1">Content Calendar</h2>
              {project.content_calendar_sent_at && (
                <p className="text-[#a1a1a1] text-sm">
                  Sent: {format(new Date(project.content_calendar_sent_at), 'MMM d, yyyy h:mm a')}
                </p>
              )}
            </div>
            <a
              href={project.content_calendar_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackActivity('content_calendar')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#81D8D0] to-[#5fb3ad] text-[#0a0a0a] font-semibold hover:opacity-90 transition-opacity"
            >
              <ExternalLink size={18} />
              View Content Calendar
            </a>

            {/* Content Calendar Message History */}
            <div className="bg-[#0a0a0a] border border-[#333333] rounded-lg p-3 space-y-2">
              <h3 className="text-white font-medium text-sm">Message History</h3>
              {contentCalendarMessages.length === 0 ? (
                <p className="text-[#a1a1a1] text-xs">No messages yet.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {contentCalendarMessages.map((m) => (
                    <div key={m.id} className="p-2 border border-[#333333] rounded text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-[#a1a1a1]">
                          {m.sender_type === 'admin' ? 'The CJE Experience team' : 'You'} • {format(new Date(m.created_at), 'MMM d, yyyy p')}
                        </p>
                      </div>
                      <p className="text-white whitespace-pre-wrap text-sm">{formatMessageWithLinks(m.content)}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-2">
                <textarea
                  className="w-full bg-[#1a1a1a] border border-[#333333] rounded-lg px-3 py-2 text-white resize-none text-sm"
                  rows={2}
                  value={contentCalendarReply}
                  onChange={(e) => setContentCalendarReply(e.target.value)}
                  placeholder="Reply to this content calendar..."
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSendContentCalendarReply}
                    disabled={!contentCalendarReply.trim()}
                    className="px-3 py-1.5 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 disabled:opacity-50 text-sm"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Intake */}
        {intakeResponses && intakeResponses.length > 0 && (
          <section ref={sectionRefs.intake} className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold text-lg">Intake Forms</h2>
              {intakePending ? <span className="text-xs px-2 py-1 rounded-full border border-[#333333] text-[#81D8D0]">Pending</span> : <span className="text-xs px-2 py-1 rounded-full border border-[#333333] text-green-300">Completed</span>}
            </div>
            {intakeResponses.map((r) => {
              const form = intakeForms[r.form_id]
              const submitted = !!r.submitted_at
              const fields = form?.fields || []
              return (
                <div key={r.id} className="p-4 border border-[#333333] rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold">{form?.name || 'Intake Form'}</p>
                    {submitted && <CheckCircle size={16} className="text-[#81D8D0]" />}
                  </div>
                  <p className="text-xs text-[#a1a1a1]">{submitted ? `Submitted ${format(new Date(r.submitted_at), 'MMM d, yyyy')}` : 'Pending'}</p>
                  {!submitted && (
                    <div className="space-y-2">
                      {fields.map((f: any) => (
                        <div key={f.label}>
                          <label className="text-xs text-white/60">{f.label}{f.required ? ' *' : ''}</label>
                          {f.type === 'textarea' ? (
                            <textarea
                              className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white resize-none"
                              rows={3}
                              onChange={(e) =>
                                setResponseDrafts((prev) => ({
                                  ...prev,
                                  [r.id]: { ...(prev[r.id] || {}), [f.label]: e.target.value },
                                }))
                              }
                            />
                          ) : (
                            <input
                              className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                              onChange={(e) =>
                                setResponseDrafts((prev) => ({
                                  ...prev,
                                  [r.id]: { ...(prev[r.id] || {}), [f.label]: e.target.value },
                                }))
                              }
                            />
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => handleSubmitIntake(r.id)}
                        className="px-4 py-2 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90"
                      >
                        Submit
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </section>
        )}

        {/* Proposals */}
        {proposals && proposals.length > 0 && (
          <section ref={sectionRefs.proposals} className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold text-lg">Proposals</h2>
            </div>
            {proposals.map((p) => (
              <div key={p.id} className="p-4 border border-[#333333] rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">{p.title}</p>
                    <p className="text-xs text-[#a1a1a1]">Status: {p.status}</p>
                  </div>
                  {p.status === 'sent' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleProposalAction(p.id, 'accepted')}
                        className="px-3 py-1 rounded-lg bg-[#81D8D0] text-[#0a0a0a] text-sm font-semibold"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleProposalAction(p.id, 'declined')}
                        className="px-3 py-1 rounded-lg border border-[#333333] text-white text-sm"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
                {p.items && (
                  <div className="space-y-1 text-sm text-[#a1a1a1]">
                    {p.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between">
                        <span>{item.title}</span>
                        <span>${Number(item.price || 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-white font-semibold">Total: ${Number(p.total_amount || 0).toFixed(2)}</p>
              </div>
            ))}
          </section>
        )}
      </div>

      {/* Message Preview Modal */}
      {showMessagePreview && previewMessage && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
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
                <p className="text-white">The CJE Experience team</p>
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

