'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Lock, CheckCircle, ArrowLeft } from 'lucide-react'
import Button from '@/components/Button'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if we have a valid reset token
    const checkToken = async () => {
      try {
        const supabase = createClient()
        
        // Check for code parameter in URL (Supabase password reset uses ?code=...)
        const code = searchParams.get('code') || new URLSearchParams(window.location.search).get('code')
        
        // Also check hash fragment for access_token (alternative flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        if (code) {
          // Exchange the code for a session (Supabase password reset flow)
          console.log('Exchanging code for session...')
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            console.error('Code exchange error:', exchangeError)
            setIsValidToken(false)
            setError('Invalid or expired reset link. Please request a new password reset.')
            return
          }
          
          if (data.session) {
            console.log('Session established from code')
            setIsValidToken(true)
            // Clear the code from URL for security
            window.history.replaceState({}, '', '/hub/reset-password')
          } else {
            setIsValidToken(false)
            setError('Invalid or expired reset link. Please request a new password reset.')
          }
        } else if (accessToken && refreshToken) {
          // Alternative flow: set session from tokens in hash
          console.log('Setting session from tokens...')
          const { error: setError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          
          if (setError) {
            console.error('Session set error:', setError)
            setIsValidToken(false)
            setError('Invalid or expired reset link. Please request a new password reset.')
          } else {
            setIsValidToken(true)
            // Clear the hash from URL for security
            window.history.replaceState({}, '', '/hub/reset-password')
          }
        } else {
          // Check if we already have a valid session
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            setIsValidToken(true)
          } else {
            setIsValidToken(false)
            setError('Invalid or expired reset link. Please request a new password reset.')
          }
        }
      } catch (err) {
        console.error('Token check error:', err)
        setIsValidToken(false)
        setError('Invalid or expired reset link. Please request a new password reset.')
      }
    }

    checkToken()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setIsLoading(true)

    try {
      console.log('Resetting password...')
      const supabase = createClient()
      
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        console.error('Update error:', updateError)
        setError(updateError.message || 'Failed to update password. Please try again.')
        setIsLoading(false)
        return
      }

      console.log('Password reset successful')
      setSuccess(true)
      setIsLoading(false)

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/hub/login')
      }, 2000)
    } catch (err: any) {
      console.error('Reset error:', err)
      setError(err.message || 'An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  if (isValidToken === null) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-primary-white via-primary-white to-primary-charcoal/5 flex items-center justify-center p-4">
        <div className="text-primary-charcoal/70">Loading...</div>
      </main>
    )
  }

  if (isValidToken === false) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-primary-white via-primary-white to-primary-charcoal/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-primary-white rounded-lg shadow-xl p-8 border border-primary-charcoal/10 text-center">
            <h1 className="text-2xl font-serif font-bold text-primary-black mb-4">
              Invalid Reset Link
            </h1>
            <p className="text-primary-charcoal/70 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Button href="/hub/forgot-password" className="w-full">
              Request New Reset Link
            </Button>
            <Link
              href="/hub/login"
              className="inline-flex items-center space-x-2 text-sm text-primary-charcoal/70 hover:text-primary-tiffany transition-colors mt-4"
            >
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>
          </div>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-white via-primary-white to-primary-charcoal/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-primary-white rounded-lg shadow-xl p-8 border border-primary-charcoal/10">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className="text-3xl font-serif font-bold text-primary-black">
                CJE
              </span>
              <span className="text-sm font-sans text-primary-charcoal">HUB</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-primary-black mb-2">
              Set New Password
            </h1>
            <p className="text-primary-charcoal/70">
              Enter your new password below.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {success ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <CheckCircle size={48} className="text-primary-tiffany mx-auto mb-3" />
              <h3 className="font-semibold text-primary-black mb-2">
                Password Updated!
              </h3>
              <p className="text-sm text-primary-charcoal/70">
                Your password has been successfully updated. Redirecting to login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-primary-charcoal mb-2"
                >
                  New Password
                </label>
                <div className="relative">
                  <Lock
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-charcoal/40"
                  />
                  <input
                    type="password"
                    id="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-transparent"
                    placeholder="Enter new password"
                  />
                </div>
                <p className="mt-1 text-xs text-primary-charcoal/60">
                  Must be at least 6 characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-primary-charcoal mb-2"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-charcoal/40"
                  />
                  <input
                    type="password"
                    id="confirmPassword"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/hub/login"
              className="inline-flex items-center space-x-2 text-sm text-primary-charcoal/70 hover:text-primary-tiffany transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  )
}

