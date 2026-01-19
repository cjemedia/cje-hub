'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import Button from '@/components/Button'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
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

      if (data?.user && data?.session) {
        // Check if user must change password
        const { data: userData } = await supabase
          .from('users')
          .select('role, must_change_password')
          .eq('id', data.user.id)
          .single()


        if (userData?.must_change_password) {
          router.push('/set-password')
          return
        }

        // Redirect based on role or redirectTo param
        const role = (userData?.role as 'client' | 'admin') ?? 'client'
        if (redirectTo) {
          window.location.href = redirectTo
        } else if (role === 'admin') {
          window.location.href = '/admin'
        } else {
          window.location.href = '/hub/dashboard'
        }
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
    <main className="min-h-screen bg-dark flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-dark-light rounded-xl shadow-2xl p-8 border border-white/10">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <Link href="/" aria-label="Return to homepage">
                <img
                  src="/images/cje-logo.png"
                  alt="The CJE Experience"
                  className="h-auto w-[240px] brightness-0 invert"
                />
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-white/70">
              Sign in to access your client portal
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white/80 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40"
                />
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-dark border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white/80 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40"
                />
                <input
                  type="password"
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-dark border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
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
                href="/forgot-password"
                className="text-accent hover:text-accent/80 hover:underline transition-colors"
              >
                Forgot your password?
              </Link>
            </p>
            <p className="text-white/60">
              Need access?{' '}
              <a
                href="mailto:media@ciarajevans.com"
                className="text-accent hover:text-accent/80 hover:underline transition-colors"
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


export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <LoginForm />
    </Suspense>
  )
}
