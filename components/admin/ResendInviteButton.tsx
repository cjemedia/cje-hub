'use client'

import { useState } from 'react'

export function ResendInviteButton({ clientId }: { clientId: string }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleClick = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/invite`, {
        method: 'POST',
      })
      const json = await res.json()
      if (!res.ok) {
        setMessage(json?.error || 'Failed to resend invite')
      } else {
        setMessage('Invite email sent')
      }
    } catch (err: any) {
      setMessage(err?.message || 'Failed to resend invite')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-4 py-2 rounded-lg border border-[#81D8D0] text-[#81D8D0] hover:bg-[#81D8D0]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending...' : 'Resend Invite'}
      </button>
      {message && <p className="text-xs text-[#a1a1a1]">{message}</p>}
    </div>
  )
}


