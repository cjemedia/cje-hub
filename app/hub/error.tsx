'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function HubError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Hub error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">
          Portal Error
        </h2>
        <p className="text-white/70 mb-6">
          Something went wrong loading this page. Please try again or return to the dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="bg-accent text-dark px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
          >
            Try Again
          </button>
          <Link
            href="/hub/dashboard"
            className="border border-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/5 transition-all"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}