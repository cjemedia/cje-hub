import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, date, time, duration, notes } = body

    if (!type || !date || !time || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user info
    const { data: client } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        type,
        date,
        time,
        duration: parseInt(duration),
        notes: notes || null,
        status: 'pending',
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Booking creation error:', bookingError)
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      )
    }

    // Send notification emails
    const bookingTypeLabel =
      type === 'meeting' ? 'Strategy Meeting' : 'Content Shoot'

    // Email to The CJE Experience
    const adminEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>New Booking Request</title>
</head>
<body style="background-color: #0a0a0a; margin: 0; padding: 40px 20px; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 40px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <img src="https://ciarajevans.com/images/cje-logo.png" alt="The CJE Experience" width="240" height="auto" style="max-width: 240px; width: 240px; height: auto; display: block; margin: 0 auto 24px; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
    </div>
    <div style="text-align: center; margin-bottom: 32px;">
      <h2 style="color: #ffffff; margin: 0 0 8px; font-size: 30px; font-weight: 700; text-align: center;">New Booking Request</h2>
      <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; margin: 0; text-align: center;">${bookingTypeLabel}</p>
    </div>
    <div style="background-color: #0a0a0a; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 20px; margin: 24px 0;">
      <p style="color: #ffffff; line-height: 1.6; margin-bottom: 8px;"><strong>Client:</strong> ${client?.name || user.email}</p>
      <p style="color: #ffffff; line-height: 1.6; margin-bottom: 8px;"><strong>Email:</strong> ${user.email}</p>
      <p style="color: #ffffff; line-height: 1.6; margin-bottom: 8px;"><strong>Date:</strong> ${date}</p>
      <p style="color: #ffffff; line-height: 1.6; margin-bottom: 8px;"><strong>Time:</strong> ${time}</p>
      <p style="color: #ffffff; line-height: 1.6; margin-bottom: 0;"><strong>Duration:</strong> ${duration} minutes</p>
      ${notes ? `<div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.2);"><p style="color: #ffffff; line-height: 1.6; margin-bottom: 8px;"><strong>Notes:</strong></p><p style="color: rgba(255, 255, 255, 0.7); line-height: 1.6; margin: 0; white-space: pre-wrap;">${notes}</p></div>` : ''}
    </div>
  </div>
</body>
</html>
    `

    await sendEmail({
      to: 'media@ciarajevans.com',
      subject: `New ${bookingTypeLabel} Booking Request`,
      html: adminEmailHtml,
    })

    // Confirmation email to client
    const clientEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>Booking Request Received</title>
</head>
<body style="background-color: #0a0a0a; margin: 0; padding: 40px 20px; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 40px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <img src="https://ciarajevans.com/images/cje-logo.png" alt="The CJE Experience" width="240" height="auto" style="max-width: 240px; width: 240px; height: auto; display: block; margin: 0 auto 24px; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
    </div>
    <div style="text-align: center; margin-bottom: 32px;">
      <h2 style="color: #ffffff; margin: 0 0 8px; font-size: 30px; font-weight: 700; text-align: center;">Booking Request Received</h2>
    </div>
    <p style="color: #ffffff; line-height: 1.6; margin-bottom: 16px;">Hi ${client?.name || 'there'},</p>
    <p style="color: #ffffff; line-height: 1.6; margin-bottom: 16px;">We've received your ${bookingTypeLabel.toLowerCase()} booking request for:</p>
    <div style="background-color: #0a0a0a; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 20px; margin: 24px 0;">
      <p style="color: #ffffff; line-height: 1.6; margin-bottom: 8px;"><strong>Date:</strong> ${date}</p>
      <p style="color: #ffffff; line-height: 1.6; margin-bottom: 8px;"><strong>Time:</strong> ${time}</p>
      <p style="color: #ffffff; line-height: 1.6; margin-bottom: 0;"><strong>Duration:</strong> ${duration} minutes</p>
    </div>
    <p style="color: #ffffff; line-height: 1.6; margin-bottom: 16px;">We'll confirm your appointment soon!</p>
    <p style="color: rgba(255, 255, 255, 0.7); line-height: 1.6; margin-top: 24px; font-size: 14px;">Best regards,<br>The CJE Experience Team</p>
  </div>
</body>
</html>
    `

    await sendEmail({
      to: user.email!,
      subject: `Booking Request Confirmation - ${bookingTypeLabel}`,
      html: clientEmailHtml,
    })

    return NextResponse.json({ success: true, booking })
  } catch (error) {
    console.error('Booking API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

