'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useHubUser } from '@/components/hub/HubUserProvider'
import { StatusBadge } from '@/components/StatusBadge'
import { format } from 'date-fns'
import { CheckCircle, Download, Send, X, Link as LinkIcon } from 'lucide-react'

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
  const [messages, setMessages] = useState<any[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [deliverables, setDeliverables] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])

  const [responseDrafts, setResponseDrafts] = useState<Record<string, any>>({})

  useEffect(() => {
    if (!projectId || !user) return
    const load = async () => {
      setLoading(true)
      await Promise.all([
        loadProject(),
        loadIntake(),
        loadProposals(),
        loadBookings(),
        loadMessages(),
        loadDeliverables(),
        loadInvoices(),
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

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !user) return
    await fetch('/api/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        sender_type: 'client',
        content: messageInput.trim(),
        project_id: projectId,
      }),
    })
    setMessageInput('')
    await loadMessages()
  }

  const intakePending = intakeResponses.some((r) => !r.submitted_at)
  const proposalSent = proposals.find((p) => p.status === 'sent')
  const invoicePending = invoices.find((inv) => inv.status !== 'paid')

  const stepsTotal = 3
  const stepsDone =
    (intakePending ? 0 : 1) +
    (proposalSent ? 0 : 1) +
    (invoicePending ? 0 : 1)
  const progress = Math.round((stepsDone / stepsTotal) * 100)

  const actionItems = [
    intakePending && {
      label: 'Complete intake form',
      target: 'intake',
    },
    proposalSent && {
      label: 'Review proposal',
      target: 'proposals',
    },
    invoicePending && {
      label: 'Pay invoice',
      target: 'invoices',
    },
  ].filter(Boolean) as { label: string; target: string }[]

  const sectionRefs: Record<string, React.RefObject<HTMLDivElement>> = {
    overview: useRef(null),
    intake: useRef(null),
    proposals: useRef(null),
    bookings: useRef(null),
    messages: useRef(null),
    resources: useRef(null),
    invoices: useRef(null),
  }

  const scrollTo = (key: string) => {
    const ref = sectionRefs[key]
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (loading || !project) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8">
        <div className="min-h-[60vh] flex items-center justify-center text-[#a1a1a1]">
          Loading project...
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
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl sm:text-4xl font-semibold text-white">{project.name}</h1>
          <StatusBadge status={project.status} />
        </div>
        {project.service_type && <p className="text-[#81D8D0] text-sm">{project.service_type}</p>}
        <div className="space-y-2">
          <p className="text-[#a1a1a1] text-sm">Step {Math.min(stepsDone + 1, stepsTotal)} of {stepsTotal}</p>
          <div className="h-2 bg-[#1a1a1a] rounded-full border border-[#333333] overflow-hidden">
            <div className="h-full bg-[#81D8D0]" style={{ width: `${progress}%` }} />
          </div>
        </div>
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
                  key={item.target}
                  onClick={() => scrollTo(item.target)}
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
          <p className="text-[#a1a1a1]">Status: {project.status}</p>
          <p className="text-[#a1a1a1]">Service: {project.service_type || 'N/A'}</p>
          <p className="text-[#a1a1a1]">Start: {project.start_date ? format(new Date(project.start_date), 'MMM d, yyyy') : 'N/A'}</p>
          <p className="text-[#a1a1a1]">End: {project.end_date ? format(new Date(project.end_date), 'MMM d, yyyy') : 'N/A'}</p>
          <p className="text-[#a1a1a1]">{project.description || 'No description provided.'}</p>
        </section>

        {/* Intake */}
        <section ref={sectionRefs.intake} className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-lg">Intake Forms</h2>
            {intakePending ? <span className="text-xs px-2 py-1 rounded-full border border-[#333333] text-[#81D8D0]">Pending</span> : <span className="text-xs px-2 py-1 rounded-full border border-[#333333] text-green-300">Completed</span>}
          </div>
          {intakeResponses.length === 0 ? (
            <p className="text-[#a1a1a1] text-sm">No intake forms assigned yet.</p>
          ) : (
            intakeResponses.map((r) => {
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
            })
          )}
        </section>

        {/* Proposals */}
        <section ref={sectionRefs.proposals} className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-lg">Proposals</h2>
          </div>
          {proposals.length === 0 ? (
            <p className="text-[#a1a1a1] text-sm">No proposals yet.</p>
          ) : (
            proposals.map((p) => (
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
            ))
          )}
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

        {/* Messages */}
        <section ref={sectionRefs.messages} className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-semibold text-lg">Messages</h2>
              <p className="text-[#a1a1a1] text-sm">Latest updates from the team</p>
            </div>
          </div>
          <SimpleList
            title=""
            items={messages.slice(0, 5)}
            render={(m) => (
              <div>
                <p className="text-white">{m.content}</p>
                <p className="text-xs text-[#a1a1a1]">{format(new Date(m.created_at), 'MMM d, yyyy p')}</p>
              </div>
            )}
          />
          <div className="bg-[#0a0a0a] border border-[#333333] rounded-xl p-3 space-y-2">
            <textarea
              className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white resize-none"
              rows={3}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90"
              >
                Send
              </button>
            </div>
          </div>
          <Link href="/hub/messages" className="text-sm text-[#81D8D0] hover:underline">
            View all messages
          </Link>
        </section>

        {/* Resources */}
        <section ref={sectionRefs.resources} className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 sm:p-5 space-y-3">
          <h2 className="text-white font-semibold text-lg">Resources</h2>
          <SimpleList
            title=""
            items={deliverables}
            render={(d) => (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{d.name}</p>
                  <p className="text-xs text-[#a1a1a1]">{d.description}</p>
                </div>
                <a href={d.file_url} className="text-[#81D8D0] hover:underline flex items-center gap-1" target="_blank" rel="noreferrer">
                  <Download size={14} /> Download
                </a>
              </div>
            )}
          />
          {deliverables.length === 0 && <p className="text-[#a1a1a1] text-sm">No resources yet.</p>}
        </section>

        {/* Invoices */}
        <section ref={sectionRefs.invoices} className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 sm:p-5 space-y-3">
          <h2 className="text-white font-semibold text-lg">Invoices</h2>
          <SimpleList
            title="Outstanding"
            items={invoices.filter((inv) => inv.status !== 'paid')}
            render={(inv) => (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">${Number(inv.amount || 0).toFixed(2)}</p>
                  <p className="text-xs text-[#a1a1a1]">Due {inv.due_date || 'N/A'} — {inv.status}</p>
                </div>
              </div>
            )}
          />
          <SimpleList
            title="Paid"
            items={invoices.filter((inv) => inv.status === 'paid')}
            render={(inv) => (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">${Number(inv.amount || 0).toFixed(2)}</p>
                  <p className="text-xs text-[#a1a1a1]">Paid {inv.paid_at ? format(new Date(inv.paid_at), 'MMM d, yyyy') : ''}</p>
                </div>
              </div>
            )}
          />
        </section>
      </div>
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

