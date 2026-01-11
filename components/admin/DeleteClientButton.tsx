'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'

export function DeleteClientButton({ clientId, clientName }: { clientId: string; clientName: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (!res.ok) {
        alert(json?.error || 'Failed to delete client')
        setLoading(false)
        return
      }
      router.push('/admin/clients')
      router.refresh()
    } catch (err: any) {
      alert(err?.message || 'Failed to delete client')
      setLoading(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-red-400 text-sm">Delete {clientName}?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50 text-sm"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : 'Yes, Delete'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg border border-[#333333] text-white/70 hover:bg-white/5 transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
    >
      <Trash2 size={16} />
      Delete Client
    </button>
  )
}
