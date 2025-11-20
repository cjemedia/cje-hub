'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import Button from '@/components/Button'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      console.log('Sending password reset for:', email)
      const supabase = createClient()
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/hub/reset-password`,
      })

      if (resetError) {
        console.error('Reset error:', resetError)
        setError(resetError.message || 'Failed to send reset email. Please try again.')
        setIsLoading(false)
        return
      }

      console.log('Password reset email sent successfully')
      setSuccess(true)
      setIsLoading(false)
    } catch (err: any) {
      console.error('Reset error:', err)
      setError(err.message || 'An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
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
              Reset Password
            </h1>
            <p className="text-primary-charcoal/70">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {success ? (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <CheckCircle size={48} className="text-primary-tiffany mx-auto mb-3" />
                <h3 className="font-semibold text-primary-black mb-2">
                  Check Your Email
                </h3>
                <p className="text-sm text-primary-charcoal/70 mb-4">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-xs text-primary-charcoal/60">
                  Click the link in the email to reset your password. The link will expire in 1 hour.
                </p>
              </div>
              <div className="flex flex-col space-y-3">
                <Button
                  onClick={() => router.push('/hub/login')}
                  variant="outline"
                  className="w-full"
                >
                  Back to Login
                </Button>
                <button
                  onClick={() => {
                    setSuccess(false)
                    setEmail('')
                  }}
                  className="text-sm text-primary-tiffany hover:underline"
                >
                  Send another email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-primary-charcoal mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-charcoal/40"
                  />
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
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

