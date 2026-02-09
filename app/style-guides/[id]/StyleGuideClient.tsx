'use client'

import { useState } from 'react'

type Props = {
  project: { id: string; name: string; styleGuideHtml: string }
  alreadyAccepted: boolean
}

export default function StyleGuideClient({ project, alreadyAccepted }: Props) {
  const [clientName, setClientName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [accepted, setAccepted] = useState(alreadyAccepted)
  const [error, setError] = useState('')

  const handleAccept = async () => {
    if (!clientName.trim()) {
      setError('Please type your full name to confirm.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/style-guides/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: project.id, client_name: clientName.trim() }),
      })
      if (res.ok) {
        setAccepted(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Something went wrong.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-white">
      <div dangerouslySetInnerHTML={{ __html: project.styleGuideHtml }} />
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <section className="max-w-xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          {accepted ? (
            <div>
              <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Style Guide Approved</h2>
              <p className="text-gray-500">Thank you for confirming. We will proceed with this direction.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <p className="text-xs sm:texsm tracking-[0.2em] uppercase text-gray-400 mb-2">Confirm</p>
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">Approve This Style Guide</h2>
              </div>
              <div className="max-w-sm mx-auto">
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Type your full name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 text-base sm:text-lg focus:outline-none focus:border-gray-900 transition-colors"
                />
              </div>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl max-w-sm mx-auto">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              <button
                onClick={handleAccept}
                disabled={submitting || !clientName.trim()}
                className="px-8 py-3 rounded-xl text-white font-semibold text-sm sm:text-base tracking-wider uppercase transition-all disabled:opacity-40"
                style={{ background: submitting ? '#666' : '#1a1a1a', letterSpacing: '0.15em' }}
              >
                {submitting ? 'Saving...' : 'Approve Style Guide'}
              </button>
            </div>
          )}
        </section>
        <footer className="text-center py-8 border-t border-gray-100">
          <p className="text-xs text-gray-400 tracking-wider">✦ The CJE Experience ✦ CJE Media Tech Solutions</p>
        </footer>
      </div>
    </div>
  )
}
