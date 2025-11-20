'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import Button from '@/components/Button'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('Attempting login for:', email)
      const supabase = createClient()
      
      // Attempt login with timeout protection
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      // Create a timeout promise
      const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolve) => {
        setTimeout(() => {
          resolve({
            data: null,
            error: { message: 'Login request timed out. Please check your connection and try again.' }
          })
        }, 15000) // 15 second timeout
      })

      // Race between login and timeout
      const result = await Promise.race([loginPromise, timeoutPromise])
      const { data, error: authError } = result

      if (authError) {
        console.error('Auth error:', authError)
        setError(authError.message || 'Invalid email or password. Please try again.')
        setIsLoading(false)
        return
      }

      console.log('Login successful, user:', data?.user?.id)
      
      if (data?.user && data?.session) {
        console.log('Session established, redirecting...')
        // Simple redirect - let middleware handle auth check
        window.location.href = '/hub/dashboard'
      } else {
        console.error('No user or session in response:', data)
        setError('Login failed. No session was created.')
        setIsLoading(false)
      }
    } catch (err: any) {
      console.error('Login error:', err)
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
            <div className="flex items-center justify-center mb-6">
              <img
                src="/images/cje-media-logo.png"
                alt="CJE Media"
                className="h-auto w-[240px]"
              />
            </div>
            <h1 className="text-3xl font-serif font-bold text-primary-black mb-2">
              Welcome Back
            </h1>
            <p className="text-primary-charcoal/70">
              Sign in to access your client portal
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-primary-charcoal mb-2"
              >
                Email
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

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-primary-charcoal mb-2"
              >
                Password
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              icon={ArrowRight}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 space-y-3 text-center text-sm">
            <p>
              <Link
                href="/hub/forgot-password"
                className="text-primary-tiffany hover:underline"
              >
                Forgot your password?
              </Link>
            </p>
            <p className="text-primary-charcoal/60">
              Need access?{' '}
              <a
                href="mailto:media@ciarajevans.com"
                className="text-primary-tiffany hover:underline"
              >
                Contact us
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  )
}

