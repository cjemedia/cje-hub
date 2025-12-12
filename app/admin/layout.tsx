import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { HubUserProvider } from '@/components/hub/HubUserProvider'
import AdminSidebarWrapper from '@/components/hub/AdminSidebarWrapper'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('id, name, role, email, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  const role = (profile?.role as 'client' | 'admin') ?? 'client'

  // Only admins can access
  if (role !== 'admin') {
    redirect('/hub/dashboard')
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
      <AdminSidebarWrapper>
        {children}
      </AdminSidebarWrapper>
    </HubUserProvider>
  )
}

