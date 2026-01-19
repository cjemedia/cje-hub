import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { content } = body || {}

    if (!content) {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get the message to verify it was sent by this admin
    const serviceClient = createServiceClient()
    const { data: message, error: fetchError } = await serviceClient
      .from('messages')
      .select('sender_id, sender_type')
      .eq('id', params.id)
      .single()

    if (fetchError || !message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    if (message.sender_type !== 'admin') {
      return NextResponse.json({ error: 'Can only edit admin messages' }, { status: 403 })
    }

    // Update message
    const { data: updatedMessage, error: updateError } = await serviceClient
      .from('messages')
      .update({
        content,
        edited_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Message update error:', updateError)
      return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: updatedMessage })
  } catch (error) {
    console.error('Messages update route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get the message to verify it was sent by this admin
    const serviceClient = createServiceClient()
    const { data: message, error: fetchError } = await serviceClient
      .from('messages')
      .select('sender_id, sender_type')
      .eq('id', params.id)
      .single()

    if (fetchError || !message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    if (message.sender_type !== 'admin') {
      return NextResponse.json({ error: 'Can only delete admin messages' }, { status: 403 })
    }

    // Set deleted_at instead of actually deleting (soft delete)
    const { error: deleteError } = await serviceClient
      .from('messages')
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    if (deleteError) {
      console.error('Message delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Messages delete route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
