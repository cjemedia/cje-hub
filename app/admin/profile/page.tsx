'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Upload, Loader2, CheckCircle, Eye, EyeOff, Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useHubUser } from '@/components/hub/HubUserProvider'
import { useRouter } from 'next/navigation'

export default function AdminProfilePage() {
  const { user } = useHubUser()
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Profile data
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    bio: '',
    avatar_url: '',
  })

  // Password fields
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return

      const { data, error } = await supabase
        .from('users')
        .select('name, email, phone, company, bio, avatar_url')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
      } else if (data) {
        setProfileData({
          name: data.name || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          company: data.company || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
        })
      }
      setLoading(false)
    }

    loadProfile()
  }, [user?.id, user?.email, supabase])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be less than 10MB')
      return
    }

    setUploading(true)
    try {
      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Delete old avatar if exists
      if (profileData.avatar_url) {
        const oldPath = profileData.avatar_url.split('/').slice(-2).join('/')
        await supabase.storage.from('avatars').remove([oldPath]).catch(() => {
          // Ignore errors deleting old file
        })
      }

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const avatarUrl = urlData.publicUrl

      // Update user record
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      setProfileData(prev => ({ ...prev, avatar_url: avatarUrl }))
      setSuccessMessage('Profile photo updated successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
      
      // Refresh page to update sidebar
      router.refresh()
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      alert(error.message || 'Failed to upload photo. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSaveProfile = async () => {
    if (!user?.id) return

    setSaving(true)
    setSuccessMessage(null)

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: profileData.name,
          phone: profileData.phone || null,
          company: profileData.company || null,
          bio: profileData.bio || null,
        })
        .eq('id', user.id)

      if (error) {
        throw error
      }

      setSuccessMessage('Profile updated successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
      
      // Refresh page to update sidebar
      router.refresh()
    } catch (error: any) {
      console.error('Error updating profile:', error)
      alert(error.message || 'Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Please fill in all password fields')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }

    setChangingPassword(true)
    setPasswordError(null)
    setPasswordSuccess(false)

    try {
      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profileData.email,
        password: passwordData.currentPassword,
      })

      if (signInError) {
        setPasswordError('Current password is incorrect')
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (updateError) {
        throw updateError
      }

      setPasswordSuccess(true)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (error: any) {
      console.error('Error changing password:', error)
      setPasswordError(error.message || 'Failed to change password. Please try again.')
    } finally {
      setChangingPassword(false)
    }
  }

  const avatarInitial = profileData.name?.charAt(0)?.toUpperCase() || profileData.email?.charAt(0)?.toUpperCase() || 'U'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8">
        <div className="min-h-[60vh] flex items-center justify-center text-[#a1a1a1]">
          Loading profile...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-[#a1a1a1] hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl lg:text-4xl font-semibold text-white mb-2">
          Profile Settings
        </h1>
        <p className="text-[#a1a1a1]">
          Manage your account information and preferences
        </p>
      </motion.div>

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-[#81D8D0]/10 border border-[#81D8D0]/50 rounded-lg p-4 flex items-center gap-3"
        >
          <CheckCircle className="text-[#81D8D0] flex-shrink-0" size={20} />
          <p className="text-[#81D8D0] text-sm">{successMessage}</p>
        </motion.div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Photo Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Profile Photo</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              {profileData.avatar_url ? (
                <img
                  src={profileData.avatar_url}
                  alt="User profile photo"
                  className="w-24 h-24 rounded-full object-cover border-2 border-[#333333]"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#81D8D0]/10 border-2 border-[#333333] flex items-center justify-center">
                  <span className="text-3xl font-semibold text-[#81D8D0]">
                    {avatarInitial}
                  </span>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <Loader2 className="animate-spin text-[#81D8D0]" size={24} />
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploading}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] border border-[#333333] text-white text-sm font-medium rounded-lg hover:border-[#81D8D0]/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Camera size={16} />
                    Change Photo
                  </>
                )}
              </button>
              <p className="text-[#a1a1a1] text-xs mt-2">
                JPG, PNG or GIF. Max size 10MB
              </p>
            </div>
          </div>
        </motion.div>

        {/* Personal Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-2">
                Name
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#81D8D0] transition-colors"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                value={profileData.email}
                disabled
                className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 text-white/50 cursor-not-allowed"
              />
              <p className="text-[#a1a1a1] text-xs mt-1">
                Email cannot be changed. Contact support to update your email address.
              </p>
            </div>

            <div>
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#81D8D0] transition-colors"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-2">
                Company
              </label>
              <input
                type="text"
                value={profileData.company}
                onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#81D8D0] transition-colors"
                placeholder="Your company"
              />
            </div>

            <div>
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-2">
                Bio
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#81D8D0] transition-colors resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="pt-4">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="inline-flex items-center gap-2 bg-[#81D8D0] text-[#0a0a0a] px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Change Password Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Change Password</h2>
          
          {passwordSuccess && (
            <div className="mb-4 bg-[#81D8D0]/10 border border-[#81D8D0]/50 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="text-[#81D8D0] flex-shrink-0" size={20} />
              <p className="text-[#81D8D0] text-sm">Password updated successfully</p>
            </div>
          )}

          {passwordError && (
            <div className="mb-4 bg-red-500/10 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400 text-sm">{passwordError}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 pr-10 text-white placeholder-white/40 focus:outline-none focus:border-[#81D8D0] transition-colors"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 pr-10 text-white placeholder-white/40 focus:outline-none focus:border-[#81D8D0] transition-colors"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 pr-10 text-white placeholder-white/40 focus:outline-none focus:border-[#81D8D0] transition-colors"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleChangePassword}
                disabled={changingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className="inline-flex items-center gap-2 bg-[#81D8D0] text-[#0a0a0a] px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

