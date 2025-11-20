import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { HubUserProvider } from '@/components/hub/HubUserProvider'

export default async function HubLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/hub/login')
  }

  const { data: profile } = await supabase
    .from('clients')
    .select('id, name, role, email')
    .eq('id', user.id)
    .maybeSingle()

  const role = (profile?.role as 'client' | 'admin') ?? 'client'

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
      {children}
    </HubUserProvider>
  )
}

