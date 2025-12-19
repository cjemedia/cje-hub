'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">
          Something went wrong
        </h2>
        <p className="text-white/70 mb-6">
          We're sorry, but something unexpected happened. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="bg-accent text-dark px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}