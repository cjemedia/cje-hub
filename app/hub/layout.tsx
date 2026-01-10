import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { HubUserProvider } from '@/components/hub/HubUserProvider'
import SidebarWrapper from '@/components/hub/SidebarWrapper'

export default async function HubLayout({ children }: { children: React.ReactNode }) {
  // This layout only applies to protected routes
  // Public routes (login, forgot-password, reset-password) use (public)/layout.tsx
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, name, role, email, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  const role = (profile?.role as 'client' | 'admin') ?? 'client'

  // Redirect admins to admin dashboard
  if (role === 'admin') {
    redirect('/admin')
  }

  return (
    <HubUserProvider
      value={{
        user: {
          id: user.id,
          email: user.email,
          name: profile?.name || user.user_metadata?.full_name || '',
          avatar_url: profile?.avatar_url || null,
        },
        role,
      }}
    >
      <SidebarWrapper>
        {children}
      </SidebarWrapper>
    </HubUserProvider>
  )
}