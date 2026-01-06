'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AddClientButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    sendInvite: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json?.error || 'Failed to create client')
        return
      }
      setOpen(false)
      setForm({ name: '', email: '', company: '', phone: '', sendInvite: true })
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'Failed to create client')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 transition-opacity"
      >
        + Add Client
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Add Client</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-[#a1a1a1] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/60 mb-1">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/60 mb-1">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/60 mb-1">
                  Company
                </label>
                <input
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                  value={form.company}
                  onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/60 mb-1">
                  Phone
                </label>
                <input
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="sendInvite"
                  type="checkbox"
                  checked={form.sendInvite}
                  onChange={(e) => setForm((p) => ({ ...p, sendInvite: e.target.checked }))}
                  className="h-4 w-4 rounded border-[#333333] bg-[#0a0a0a]"
                />
                <label htmlFor="sendInvite" className="text-sm text-white/80">
                  Send portal invite email
                </label>
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#333333] text-white hover:border-white/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !form.name || !form.email}
                  className="px-4 py-2 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}


