'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useHubUser } from '@/components/hub/HubUserProvider'
import { Send, Loader2, Mail, MessageSquare, X } from 'lucide-react'
import { formatMessageWithLinks } from '@/lib/utils/message-formatting'
import { format, isToday, isYesterday, isSameDay } from 'date-fns'

type Message = {
  id: string
  user_id: string
  sender_type: 'client' | 'admin'
  sender_id: string | null
  content: string
  read: boolean
  created_at: string
}

type ContactMessage = {
  id: string
  sender_email: string
  subject: string | null
  inquiry_types: string[] | null
  message: string
  created_at: string
}

export default function MessagesPage() {
  const { user } = useHubUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'messages' | 'inquiries'>('messages')
  const [showMessagePreview, setShowMessagePreview] = useState(false)
  const [previewMessage, setPreviewMessage] = useState<{ content: string; onConfirm: () => void } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Fetch messages
  const loadMessages = async () => {
    if (!user?.id) return

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error loading messages:', error)
      setMessages([])
    } else {
      setMessages(data || [])
    }
  }

  // Fetch contact form submissions
  const loadContactMessages = async () => {
    if (!user?.email) {
      return
    }

    try {
      const res = await fetch('/api/contact/messages')
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load contact messages')
      }

      setContactMessages(data.messages || [])
    } catch (error) {
      console.error('Error loading contact messages:', error)
      setContactMessages([])
    }
  }


  useEffect(() => {
    if (!user?.id || !user?.email) return

    const loadAll = async () => {
      setLoading(true)
      await Promise.all([loadMessages(), loadContactMessages()])
      setLoading(false)
    }

    loadAll()

    // Subscribe to new messages
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, user?.email, supabase])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user?.id || sending) return

    setPreviewMessage({
      content: newMessage.trim(),
      onConfirm: async () => {
        setSending(true)
        try {
          const res = await fetch('/api/messages/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: user.id,
              sender_type: 'client',
              content: newMessage.trim(),
            }),
          })

          if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            throw new Error(data.error || 'Failed to send message')
          }

          setNewMessage('')
          setShowMessagePreview(false)
          setPreviewMessage(null)
          // Refetch messages to show the new message
          await loadMessages()
        } catch (error) {
          console.error('Error sending message:', error)
          alert('Failed to send message. Please try again.')
        } finally {
          setSending(false)
        }
      },
    })
    setShowMessagePreview(true)
  }

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`
    } else {
      return format(date, 'MMM d, yyyy h:mm a')
    }
  }

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: Date; messages: Message[] }[] = []
    let currentGroup: { date: Date; messages: Message[] } | null = null

    messages.forEach((message) => {
      const messageDate = new Date(message.created_at)
      const dateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate())

      if (!currentGroup || !isSameDay(currentGroup.date, dateOnly)) {
        currentGroup = { date: dateOnly, messages: [message] }
        groups.push(currentGroup)
      } else {
        currentGroup.messages.push(message)
      }
    })

    return groups
  }

  const formatGroupDate = (date: Date) => {
    if (isToday(date)) return 'Today'
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'MMMM d, yyyy')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white/70">Loading messages...</div>
      </div>
    )
  }

  const messageGroups = groupMessagesByDate(messages)

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex flex-col h-screen">
        {/* Header */}
        <div className="p-8 border-b border-[#333333]">
          <h1 className="text-3xl lg:text-4xl font-semibold text-white mb-2">Messages</h1>
          <p className="text-[#a1a1a1] mb-4">
            Chat with The CJE Experience team
          </p>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-[#333333] -mb-8">
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'messages'
                  ? 'border-[#81D8D0] text-[#81D8D0]'
                  : 'border-transparent text-[#a1a1a1] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare size={16} />
                Messages
              </div>
            </button>
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'inquiries'
                  ? 'border-[#81D8D0] text-[#81D8D0]'
                  : 'border-transparent text-[#a1a1a1] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Mail size={16} />
                My Inquiries
              </div>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        {activeTab === 'messages' ? (
          <>
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-white/70 text-lg mb-2">No messages yet</p>
                  <p className="text-white/50 text-sm">
                    Start a conversation with The CJE Experience team
                  </p>
                </div>
              ) : (
                messageGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="space-y-4">
                    {/* Date Header */}
                    <div className="flex items-center justify-center my-4">
                      <div className="bg-[#1a1a1a] border border-[#333333] rounded-full px-4 py-1">
                        <span className="text-white/50 text-xs">
                          {formatGroupDate(group.date)}
                        </span>
                      </div>
                    </div>

                    {/* Messages in this group */}
                    {group.messages.map((message) => {
                      const isClient = message.sender_type === 'client'
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${isClient ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div
                              className={`rounded-lg px-4 py-2 ${
                                isClient
                                  ? 'bg-[#81D8D0] text-dark'
                                  : 'bg-[#1a1a1a] text-white border border-[#333333]'
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            </div>
                            <p className="text-white/40 text-xs mt-1 px-2">
                              {formatMessageDate(message.created_at)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-8 border-t border-[#333333]">
              <form onSubmit={handleSend} className="flex gap-3">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-[#1a1a1a] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#81D8D0] transition-colors resize-none"
                  rows={3}
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="bg-[#81D8D0] text-dark px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {sending ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <Send size={18} />
                      <span className="hidden sm:inline">Send</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-8">
            {contactMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Mail className="w-16 h-16 text-[#a1a1a1]/30 mb-4" />
                <p className="text-white/70 text-lg mb-2">No inquiries yet</p>
                <p className="text-white/50 text-sm">
                  Your contact form submissions will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {contactMessages.map((contactMsg) => (
                  <div
                    key={contactMsg.id}
                    className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 hover:border-[#81D8D0]/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Mail size={16} className="text-[#81D8D0]" />
                          <span className="text-white font-semibold">
                            {contactMsg.subject || 'General Inquiry'}
                          </span>
                        </div>
                        {contactMsg.inquiry_types && contactMsg.inquiry_types.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {contactMsg.inquiry_types.map((type, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-[#81D8D0]/10 text-[#81D8D0] text-xs rounded"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-[#a1a1a1] text-sm">
                        {format(new Date(contactMsg.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="text-[#a1a1a1] text-sm line-clamp-3">
                      {contactMsg.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
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
                className="px-4 py-2 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90"
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
