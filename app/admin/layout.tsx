import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { HubUserProvider } from '@/components/hub/HubUserProvider'
import AdminSidebar from '@/components/hub/AdminSidebar'

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
    .select('id, name, role, email')
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
        },
        role,
      }}
    >
      <div className="flex min-h-screen bg-[#0a0a0a]">
        <AdminSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </HubUserProvider>
  )
}

