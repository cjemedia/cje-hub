'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { Mail, MessageSquare, Send, Loader2, CheckCircle, Circle, Plus, X } from 'lucide-react'

type TabType = 'contact' | 'conversations'

type Conversation = {
  user_id: string
  user: { name?: string | null; email?: string | null }
  lastMessage?: any
  unreadCount: number
}

export default function AdminMessagesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('contact')
  const [contactMessages, setContactMessages] = useState<any[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [userMessages, setUserMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showNewModal, setShowNewModal] = useState(false)
  const [creatingClientId, setCreatingClientId] = useState<string | null>(null)
  const supabase = createClient()

  const selectedUserInfo = useMemo(
    () => clients.find((c) => c.id === selectedUser),
    [clients, selectedUser]
  )

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedUser) {
      loadClientMessages(selectedUser)
    } else {
      setUserMessages([])
    }
  }, [selectedUser])

  const loadData = async () => {
    setLoading(true)
    // Load contact form submissions
    const [{ data: contacts }, { data: messages }, { data: clientList }] = await Promise.all([
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
      supabase
        .from('messages')
        .select('*, users(name, email)')
        .order('created_at', { ascending: false }),
      supabase.from('users').select('id, name, email').eq('role', 'client').order('name', { ascending: true }),
    ])

    setContactMessages(contacts || [])
    setClients(clientList || [])

    const grouped = (messages || []).reduce((acc: Record<string, Conversation>, msg: any) => {
      const userId = msg.user_id
      if (!acc[userId]) {
        acc[userId] = {
          user: msg.users || {},
          user_id: userId,
          lastMessage: msg,
          unreadCount: 0,
        }
      }
      // Track latest message
      if (
        acc[userId].lastMessage &&
        new Date(msg.created_at).getTime() > new Date(acc[userId].lastMessage.created_at).getTime()
      ) {
        acc[userId].lastMessage = msg
      }
      if (!msg.read && msg.sender_type === 'client') {
        acc[userId].unreadCount++
      }
      return acc
    }, {})

    // Ensure clients with no messages still appear
    const merged: Conversation[] = (clientList || []).map((client) => {
      const existing = grouped[client.id]
      return (
        existing || {
          user_id: client.id,
          user: { name: client.name, email: client.email },
          lastMessage: undefined,
          unreadCount: 0,
        }
      )
    })

    setConversations(merged)
    setLoading(false)
  }

  const updateContactStatus = async (id: string, updates: Record<string, any>) => {
    const { data, error } = await supabase
      .from('contact_messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating contact status:', error)
      alert('Could not update status. Please try again.')
      return
    }

    setContactMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, ...data } : msg)))
  }

  const handleCreateClient = async (message: any) => {
    if (!message.email && !message.sender_email) {
      alert('Cannot create client without an email address')
      return
    }

    setCreatingClientId(message.id)

    try {
      const response = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: message.name || message.sender_name || 'Website Visitor',
          email: message.email || message.sender_email,
          phone: message.phone || null,
          company: null,
          sendInvite: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create client')
      }

      alert('Client created successfully! An invitation email has been sent.')
      await loadData() // Refresh to update client list
    } catch (error: any) {
      console.error('Error creating client:', error)
      alert(error.message || 'Failed to create client')
    } finally {
      setCreatingClientId(null)
    }
  }

  const isExistingClient = (email: string) => {
    return clients.some((client) => client.email?.toLowerCase() === email?.toLowerCase())
  }

  const unreadContactCount = contactMessages.filter((m) => !m.read).length

  const loadClientMessages = async (userId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    setUserMessages(data || [])
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedUser || sending) return

    setSending(true)
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUser,
          sender_type: 'admin',
          content: newMessage.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to send message')
      }

      setNewMessage('')
      await loadClientMessages(selectedUser)
      await loadData()
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white/70">Loading messages...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex flex-col h-screen">
        {/* Header */}
        <div className="p-8 border-b border-[#333333]">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1 w-1 rounded-full bg-[#81D8D0]"></div>
            <span className="text-[#81D8D0] text-sm font-medium uppercase tracking-wider">Admin</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-semibold text-white mb-2">All Messages</h1>
          <p className="text-[#a1a1a1]">View contact submissions and client conversations</p>
        </div>

        {/* Tabs */}
        <div className="px-8 border-b border-[#333333]">
          <div className="flex gap-4">
            <button
              onClick={() => {
                setActiveTab('contact')
                setSelectedUser(null)
              }}
              className={`px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'contact'
                  ? 'border-[#81D8D0] text-white'
                  : 'border-transparent text-[#a1a1a1] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Mail size={18} />
                <span>Contact Submissions</span>
                {contactMessages.length > 0 && (
                  <span className="bg-[#81D8D0]/20 text-[#81D8D0] px-2 py-0.5 rounded text-xs">
                    {contactMessages.length}
                  </span>
                )}
                {unreadContactCount > 0 && (
                  <span className="bg-[#81D8D0] text-dark px-2 py-0.5 rounded text-xs font-semibold">
                    {unreadContactCount}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('conversations')
                setSelectedUser(null)
              }}
              className={`px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'conversations'
                  ? 'border-[#81D8D0] text-white'
                  : 'border-transparent text-[#a1a1a1] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare size={18} />
                <span>Client Conversations</span>
                {conversations.length > 0 && (
                  <span className="bg-[#81D8D0]/20 text-[#81D8D0] px-2 py-0.5 rounded text-xs">
                    {conversations.length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {activeTab === 'contact' ? (
            /* Contact Submissions */
            <div className="flex-1 overflow-y-auto p-8">
              <div className="space-y-4">
                {contactMessages.length === 0 ? (
                  <div className="text-center py-12 text-[#a1a1a1]">No contact submissions yet</div>
                ) : (
                  contactMessages.map((message) => {
                    const inquiryTypes =
                      message.inquiry_types ||
                      message.inquiry_type ||
                      (message.inquiryType ? [message.inquiryType] : [])
                    const name = message.name || message.sender_name || 'Website Visitor'
                    const email = message.email || message.sender_email
                    return (
                      <div
                        key={message.id}
                        className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 space-y-4 hover:border-[#81D8D0]/50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-white">{name}</p>
                              {email && !isExistingClient(email) ? (
                                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs">
                                  Website Visitor
                                </span>
                              ) : email && isExistingClient(email) ? (
                                <span className="px-2 py-0.5 bg-[#81D8D0]/20 text-[#81D8D0] rounded text-xs">
                                  Client
                                </span>
                              ) : null}
                            </div>
                            {email && <p className="text-sm text-[#a1a1a1]">{email}</p>}
                            {message.phone && <p className="text-sm text-[#a1a1a1]">{message.phone}</p>}
                          </div>
                          <span className="text-[#a1a1a1] text-sm">
                            {format(new Date(message.created_at), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                        {message.subject && (
                          <p className="text-sm font-semibold text-white/80">Subject: {message.subject}</p>
                        )}
                        {inquiryTypes && inquiryTypes.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {inquiryTypes.map((type: string) => (
                              <span
                                key={type}
                                className="px-3 py-1 bg-[#81D8D0]/20 text-[#81D8D0] rounded-full text-xs font-semibold"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-white/80 whitespace-pre-wrap">{message.message}</p>

                        <div className="flex items-center gap-3 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                              message.read ? 'bg-[#81D8D0]/20 text-[#81D8D0]' : 'bg-[#333333] text-white'
                            }`}
                          >
                            {message.read ? <CheckCircle size={14} /> : <Circle size={14} />}
                            {message.read ? 'Read' : 'Unread'}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                              message.responded
                                ? 'bg-[#81D8D0]/20 text-[#81D8D0]'
                                : 'bg-[#333333] text-white'
                            }`}
                          >
                            {message.responded ? <CheckCircle size={14} /> : <Circle size={14} />}
                            {message.responded ? 'Responded' : 'Awaiting response'}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateContactStatus(message.id, { read: !message.read })}
                              className="text-sm text-[#81D8D0] hover:text-[#81D8D0]/80 transition-colors"
                            >
                              {message.read ? 'Mark as Unread' : 'Mark as Read'}
                            </button>
                            <span className="text-[#333333]">|</span>
                            <button
                              onClick={() => updateContactStatus(message.id, { responded: !message.responded })}
                              className="text-sm text-[#81D8D0] hover:text-[#81D8D0]/80 transition-colors"
                            >
                              {message.responded ? 'Mark as Not Responded' : 'Mark as Responded'}
                            </button>
                          </div>
                        </div>
                        {/* Create Client Button */}
                        {email && !isExistingClient(email) && (
                          <div className="pt-3 border-t border-[#333333]">
                            <button
                              onClick={() => handleCreateClient(message)}
                              disabled={creatingClientId === message.id}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-[#81D8D0]/20 text-[#81D8D0] rounded-lg text-sm font-medium hover:bg-[#81D8D0]/30 transition-colors disabled:opacity-50"
                            >
                              {creatingClientId === message.id ? (
                                <>
                                  <Loader2 size={16} className="animate-spin" />
                                  Creating...
                                </>
                              ) : (
                                <>
                                  <Plus size={16} />
                                  Create Client
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          ) : (
            /* Conversations area */
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar */}
              <div className="w-80 border-r border-[#333333] flex flex-col">
                <div className="p-4 border-b border-[#333333] flex items-center justify-between">
                  <h3 className="text-white font-semibold">Clients</h3>
                  <button
                    onClick={() => setShowNewModal(true)}
                    className="text-[#81D8D0] hover:text-[#81D8D0]/80 flex items-center gap-1 text-sm"
                  >
                    <Plus size={16} />
                    New
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {conversations.length === 0 ? (
                    <div className="text-center text-[#a1a1a1] p-6">No clients yet</div>
                  ) : (
                    conversations.map((conv) => (
                      <button
                        key={conv.user_id}
                        onClick={() => {
                          setSelectedUser(conv.user_id)
                          setShowNewModal(false)
                        }}
                        className={`w-full text-left px-4 py-3 border-b border-[#333333] hover:bg-[#1a1a1a] transition-colors ${
                          selectedUser === conv.user_id ? 'bg-[#1a1a1a]' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-white font-semibold truncate">
                            {conv.user?.name || conv.user?.email || 'Unknown Client'}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="bg-[#81D8D0] text-dark px-2 py-0.5 rounded-full text-xs font-semibold">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-[#a1a1a1] text-xs truncate">
                          {conv.lastMessage?.content || 'Start a conversation'}
                        </p>
                        {conv.lastMessage && (
                          <p className="text-[#666] text-[11px] mt-1">
                            {format(new Date(conv.lastMessage.created_at), 'MMM d, h:mm a')}
                          </p>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Thread */}
              <div className="flex-1 flex flex-col">
                {selectedUser ? (
                  <>
                    <div className="p-4 border-b border-[#333333]">
                      <p className="text-white font-semibold">
                        {selectedUserInfo?.name || selectedUserInfo?.email || 'Client'}
                      </p>
                      <p className="text-[#a1a1a1] text-sm">{selectedUserInfo?.email}</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {userMessages.length === 0 ? (
                        <div className="text-center text-[#a1a1a1] py-12">No messages yet</div>
                      ) : (
                        userMessages.map((message) => {
                          const isAdmin = message.sender_type === 'admin'
                          return (
                            <div
                              key={message.id}
                              className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[70%] flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                                <div
                                  className={`rounded-lg px-4 py-2 ${
                                    isAdmin
                                      ? 'bg-[#81D8D0] text-[#0a0a0a]'
                                      : 'bg-[#1a1a1a] text-white border border-[#333333]'
                                  }`}
                                >
                                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                                </div>
                                <p className="text-white/40 text-xs mt-1">
                                  {format(new Date(message.created_at), 'MMM d, h:mm a')}
                                </p>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                    <div className="p-4 border-t border-[#333333]">
                      <form onSubmit={handleSendMessage} className="flex gap-3">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 bg-[#1a1a1a] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#81D8D0] transition-colors"
                          disabled={sending}
                        />
                        <button
                          type="submit"
                          disabled={!newMessage.trim() || sending}
                          className="bg-[#81D8D0] text-dark px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                        >
                          {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-[#a1a1a1]">
                    Select a client to view messages
                  </div>
                )}
              </div>

              {/* New Conversation Modal */}
              {showNewModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                  <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl w-full max-w-md p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold">Start a conversation</h3>
                      <button onClick={() => setShowNewModal(false)} className="text-white/60 hover:text-white">
                        <X size={18} />
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {clients.length === 0 ? (
                        <p className="text-[#a1a1a1] text-sm">No clients found.</p>
                      ) : (
                        clients.map((client) => (
                          <button
                            key={client.id}
                            onClick={() => {
                              setSelectedUser(client.id)
                              setShowNewModal(false)
                            }}
                            className="w-full text-left px-4 py-3 rounded-lg border border-[#333333] hover:border-[#81D8D0]/50 hover:bg-[#0f0f0f] transition-colors"
                          >
                            <p className="text-white font-semibold">{client.name || 'Unknown Client'}</p>
                            <p className="text-[#a1a1a1] text-sm">{client.email}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

