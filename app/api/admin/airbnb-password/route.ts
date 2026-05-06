import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!password || typeof password !== 'string' || !password.trim()) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 400 })
    }

    // Verify caller is an admin user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update via service role
    const service = createServiceClient()
    const { error } = await service
      .from('app_settings')
      .upsert({
        key: 'airbnb_marketing_password',
        value: password.trim(),
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      }, { onConflict: 'key' })

    if (error) {
      console.error('Update password error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Password update exception:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
