'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useHubUser } from '@/components/hub/HubUserProvider'
import { Send, Loader2 } from 'lucide-react'
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

export default function MessagesPage() {
  const { user } = useHubUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Fetch messages
  const loadMessages = async () => {
    if (!user?.id) return

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error loading messages:', error)
      setMessages([])
    } else {
      setMessages(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!user?.id) return

    loadMessages()

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
  }, [user?.id, supabase])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user?.id || sending) return

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
      // Refetch messages to show the new message
      await loadMessages()
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
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
          <p className="text-[#a1a1a1]">
            Chat with The CJE Experience team
          </p>
        </div>

        {/* Messages Area */}
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
              className="bg-[#81D8D0] text-dark px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
      </div>
    </div>
  )
}
