'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/Button'
import Link from 'next/link'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isValidating, setIsValidating] = useState(true)
  const [tokenError, setTokenError] = useState('')

  // Validate token on mount
  useEffect(() => {
    const token = searchParams.get('token')
    const type = searchParams.get('type')

    if (!token || type !== 'recovery') {
      setTokenError('Invalid or missing reset token. Please request a new password reset link.')
      setIsValidating(false)
      return
    }

    // Verify token by attempting to exchange it for a session
    const verifyToken = async () => {
      const supabase = createClient()
      
      // Try to verify the OTP token
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery',
      })

      if (verifyError) {
        // If OTP verification fails, try exchanging code for session
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(token)
        
        if (exchangeError) {
          setTokenError('This reset link is invalid or has expired. Please request a new one.')
          setIsValidating(false)
          return
        }
      }

      setIsValidating(false)
    }

    verifyToken()
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      
      // Update password - user should be authenticated from token exchange
      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) {
        setError(updateError.message || 'Failed to update password. The link may have expired.')
        setIsLoading(false)
        return
      }

      router.push('/login?message=Password%20updated%20successfully')
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
      setIsLoading(false)
    }
  }

  if (isValidating) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl shadow-2xl p-8">
          <p className="text-white">Validating reset link...</p>
        </div>
      </main>
    )
  }

  if (tokenError) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Invalid Reset Link</h1>
          <p className="text-white/70 mb-6">{tokenError}</p>
          <Link href="/forgot-password" className="text-[#81D8D0] hover:text-[#81D8D0]/80">
            Request a new reset link
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/login" className="text-[#81D8D0] hover:text-[#81D8D0]/80 text-sm flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to login
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Set New Password</h1>
          <p className="text-white/70 mb-6">Enter and confirm your new password.</p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                <input
                  type="password"
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-[#333333] rounded-lg text-white placeholder:text-white/40 focus:ring-2 focus:ring-[#81D8D0] focus:border-[#81D8D0] transition-colors"
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-white/80 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                <input
                  type="password"
                  id="confirm"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-[#333333] rounded-lg text-white placeholder:text-white/40 focus:ring-2 focus:ring-[#81D8D0] focus:border-[#81D8D0] transition-colors"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </div>
      </motion.div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl shadow-2xl p-8">
            <p className="text-white">Loading...</p>
          </div>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}

