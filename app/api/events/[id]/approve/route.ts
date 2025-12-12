import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendEmail } from '@/lib/resend'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient()
    const eventId = params.id

    // Get event
    const { data: event, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (fetchError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Get user info
    let userInfo = null
    if (event.user_id) {
      const { data: userData } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', event.user_id)
        .single()
      userInfo = userData
    }

    // Update event status
    const { error: updateError } = await supabase
      .from('events')
      .update({ status: 'approved' })
      .eq('id', eventId)

    if (updateError) {
      console.error('Error approving event:', updateError)
      return NextResponse.json(
        { error: 'Failed to approve event' },
        { status: 500 }
      )
    }

    // Send approval email
    if (userInfo?.email) {
      const eventDate = new Date(event.date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })

      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>Your event has been approved!</title>
</head>
<body style="background-color: #0a0a0a; margin: 0; padding: 40px 20px; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 40px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <img src="https://ciarajevans.com/images/cje-logo.png" alt="The CJE Experience" width="240" height="auto" style="max-width: 240px; width: 240px; height: auto; display: block; margin: 0 auto 24px; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
    </div>
    <div style="text-align: center; margin-bottom: 32px;">
      <h2 style="color: #ffffff; margin: 0 0 8px; font-size: 30px; font-weight: 700; text-align: center;">Your event has been approved!</h2>
    </div>
    <p style="color: #ffffff; line-height: 1.6; margin-bottom: 16px;">Hi ${userInfo.name || 'there'},</p>
    <p style="color: #ffffff; line-height: 1.6; margin-bottom: 16px;">Great news! Your event submission has been approved and is now live on the public site.</p>
    <div style="background-color: #0a0a0a; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 20px; margin: 24px 0;">
      <p style="color: #ffffff; margin: 0 0 8px; font-weight: 600;">${event.title}</p>
      <p style="color: rgba(255, 255, 255, 0.7); margin: 0; font-size: 14px;">${eventDate} • ${event.location}</p>
    </div>
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://www.ciarajevans.com/events/${event.slug || eventId}" style="display: inline-block; background-color: #ffffff; color: #0a0a0a; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Event Page</a>
    </div>
    <p style="color: rgba(255, 255, 255, 0.7); line-height: 1.6; margin-top: 24px; font-size: 14px;">Best regards,<br>The CJE Experience Team</p>
  </div>
</body>
</html>
      `

      await sendEmail({
        to: userInfo.email,
        subject: 'Your event has been approved!',
        html: emailHtml,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in approve route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

