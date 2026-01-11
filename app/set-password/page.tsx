'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Lock, ArrowRight } from 'lucide-react'
import Button from '@/components/Button'

export default function SetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Check if user is logged in and needs to change password
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('must_change_password')
        .eq('id', user.id)
        .single()

      if (!userData?.must_change_password) {
        // Already changed password, redirect to dashboard
        router.push('/hub/dashboard')
        return
      }

      setChecking(false)
    }

    checkUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // Update password in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        setError(updateError.message)
        setIsLoading(false)
        return
      }

      // Update must_change_password flag
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('users')
          .update({ must_change_password: false })
          .eq('id', user.id)
      }

      // Redirect to dashboard
      router.push('/hub/dashboard')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setIsLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white/70">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-white mb-2">Set Your Password</h1>
          <p className="text-[#a1a1a1]">Please create a new password for your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333333] rounded-lg pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#81D8D0] transition-colors"
              required
              minLength={8}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333333] rounded-lg pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#81D8D0] transition-colors"
              required
              minLength={8}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Setting Password...' : 'Set Password'}
            <ArrowRight size={18} />
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
