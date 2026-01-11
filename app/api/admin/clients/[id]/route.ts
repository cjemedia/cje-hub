import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminCheck } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (adminCheck?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const clientId = params.id
    const serviceClient = createServiceClient()

    // Delete from users table first
    const { error: dbError } = await serviceClient
      .from('users')
      .delete()
      .eq('id', clientId)

    if (dbError) {
      console.error('Error deleting from users table:', dbError)
      return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 })
    }

    // Delete from Supabase Auth
    const { error: authError } = await serviceClient.auth.admin.deleteUser(clientId)

    if (authError) {
      console.error('Error deleting auth user:', authError)
      // Don't fail completely - user is already removed from users table
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting client:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
