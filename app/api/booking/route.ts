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

    // Get client info
    const { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('id', user.id)
      .single()

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        client_id: user.id,
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0ABAB5;">New Booking Request</h2>
        <p><strong>Type:</strong> ${bookingTypeLabel}</p>
        <p><strong>Client:</strong> ${client?.name || user.email}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Duration:</strong> ${duration} minutes</p>
        ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
      </div>
    `

    await sendEmail({
      to: 'media@ciarajevans.com',
      subject: `New ${bookingTypeLabel} Booking Request`,
      html: adminEmailHtml,
    })

    // Confirmation email to client
    const clientEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0ABAB5;">Booking Request Received</h2>
        <p>Hi ${client?.name || 'there'},</p>
        <p>We've received your ${bookingTypeLabel.toLowerCase()} booking request for:</p>
        <ul>
          <li><strong>Date:</strong> ${date}</li>
          <li><strong>Time:</strong> ${time}</li>
          <li><strong>Duration:</strong> ${duration} minutes</li>
        </ul>
        <p>We'll confirm your appointment soon!</p>
        <p>Best regards,<br>The CJE Experience Team</p>
      </div>
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

