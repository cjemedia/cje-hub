import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, sender_type, content } = body || {}

    if (!user_id || !sender_type || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Insert message
    const { data: message, error: insertError } = await supabase
      .from('messages')
      .insert({
        user_id,
        sender_type,
        sender_id: null,
        content,
        read: false,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Message insert error:', insertError)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // Fetch user info for notifications
    const { data: userProfile } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', user_id)
      .maybeSingle()

    // Send email notification
    try {
      if (sender_type === 'admin') {
        if (userProfile?.email) {
          await sendEmail({
            to: userProfile.email,
            subject: 'New message from The CJE Experience',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px;">
                <p>You have a new message from The CJE Experience team.</p>
                <p style="background:#f4f4f4;padding:12px;border-radius:8px;">${content}</p>
                <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || ''}/hub/messages">View messages</a></p>
              </div>
            `,
          })
        }
      } else {
        await sendEmail({
          to: 'media@ciarajevans.com',
          subject: `New message from ${userProfile?.name || 'a client'}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px;">
              <p>New client message:</p>
              <p style="background:#f4f4f4;padding:12px;border-radius:8px;">${content}</p>
              <p>Client: ${userProfile?.name || 'Unknown'} (${userProfile?.email || 'no email'})</p>
              <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || ''}/admin/messages">View in admin</a></p>
            </div>
          `,
        })
      }
    } catch (emailErr) {
      console.error('Email send error:', emailErr)
      // continue; do not fail request
    }

    return NextResponse.json({ success: true, message })
  } catch (error) {
    console.error('Messages send route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

