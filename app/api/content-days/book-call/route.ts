import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendEmail } from '@/lib/resend'
import {
  getContentDaysAvailableSlots,
  createContentDayCallEvent,
  slotToTimeColumn,
} from '@/lib/content-days-availability'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a minute.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { inquiry_id, call_date, call_time } = body

    // Validate
    if (!inquiry_id || !call_date || !call_time) {
      return NextResponse.json(
        { error: 'Missing required fields (inquiry_id, call_date, call_time)' },
        { status: 400 }
      )
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(call_date)) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Pull the inquiry to get client info
    const { data: inquiry, error: lookupError } = await supabase
      .from('content_days_inquiries')
      .select('*')
      .eq('id', inquiry_id)
      .maybeSingle()

    if (lookupError) {
      console.error('Inquiry lookup error:', lookupError)
      return NextResponse.json({ error: 'Could not load inquiry' }, { status: 500 })
    }
    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    // If they already booked a call, don't allow double-booking through this endpoint
    if (inquiry.call_booking_id || inquiry.google_event_id) {
      return NextResponse.json(
        { error: 'A call is already scheduled for this inquiry.' },
        { status: 409 }
      )
    }

    // Verify the chosen slot is still available
    const slots = await getContentDaysAvailableSlots(call_date)
    if (!slots.includes(call_time)) {
      return NextResponse.json(
        { error: 'That time is no longer available. Please pick another.' },
        { status: 409 }
      )
    }

    const clientName = `${inquiry.first_name} ${inquiry.last_name}`

    // 1) Create the Google Calendar event
    let calendarEvent: { eventId?: string | null; htmlLink?: string | null; hangoutLink?: string | null } = {}
    try {
      calendarEvent = await createContentDayCallEvent({
        name: clientName,
        email: inquiry.email,
        date: call_date,
        time: call_time,
        shootCity: inquiry.preferred_shoot_city,
        businessName: inquiry.business_name,
        notes: inquiry.how_heard ? `Heard from: ${inquiry.how_heard}` : undefined,
      })
    } catch (calErr: any) {
      console.error('[ERROR] Content Days calendar event creation failed:', calErr?.message)
      // Continue. We still want to capture the booking even if Google Calendar is down.
    }

    // 2) Also drop a row into bookings so it appears in /admin/bookings alongside other calls
    let bookingId: string | null = null
    try {
      const timeColumn = slotToTimeColumn(call_time)
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          name: clientName,
          email: inquiry.email,
          phone: inquiry.phone,
          company: inquiry.business_name,
          booking_date: call_date,
          booking_time: call_time,
          inquiry_type: 'CJE Content Days. Vision Call',
          google_event_id: calendarEvent.eventId || null,
          type: 'meeting', // satisfies legacy CHECK constraint
          date: call_date,
          time: timeColumn,
          duration: 30,
          notes: [
            `Content Days inquiry: ${inquiry.id}`,
            `Shoot city: ${inquiry.preferred_shoot_city}`,
            inquiry.preferred_date ? `Preferred shoot date: ${inquiry.preferred_date}` : '',
            `Ready: ${inquiry.ready_to_book}`,
          ]
            .filter(Boolean)
            .join('\n'),
          status: 'confirmed',
        })
        .select('id')
        .single()
      if (bookingError) {
        console.error('Content Days bookings insert error (non-fatal):', bookingError)
      } else {
        bookingId = booking?.id || null
      }
    } catch (bookingErr) {
      console.error('Content Days bookings insert threw:', bookingErr)
    }

    // 3) Update the inquiry record
    const { error: updateError } = await supabase
      .from('content_days_inquiries')
      .update({
        call_date,
        call_time,
        call_booking_id: bookingId,
        google_event_id: calendarEvent.eventId || null,
        status: 'call_scheduled',
      })
      .eq('id', inquiry_id)

    if (updateError) {
      console.error('Inquiry update error:', updateError)
      // Already created the calendar event and possibly the booking. Don't bail.
    }

    // Format the call date for emails
    const friendlyDate = formatFriendlyDate(call_date)

    // 4) Client confirmation email
    try {
      await sendEmail({
        to: inquiry.email,
        subject: "You're almost booked. CJE Content Days",
        from: 'The CJE Experience <booking@ciarajevans.com>',
        replyTo: 'media@ciarajevans.com',
        html: buildClientEmail({
          firstName: inquiry.first_name,
          friendlyDate,
          callTime: call_time,
          hangoutLink: calendarEvent.hangoutLink || null,
          shootCity: inquiry.preferred_shoot_city,
        }),
      })
    } catch (emailErr) {
      console.error('Content Days client confirmation email failed:', emailErr)
    }

    // 5) Admin notification email (call scheduled)
    try {
      await sendEmail({
        to: 'media@ciarajevans.com',
        subject: `Content Days call scheduled: ${clientName}. ${friendlyDate} at ${call_time}`,
        from: 'The CJE Experience <booking@ciarajevans.com>',
        replyTo: inquiry.email,
        html: buildAdminCallScheduledEmail({
          name: clientName,
          businessName: inquiry.business_name,
          email: inquiry.email,
          phone: inquiry.phone,
          friendlyDate,
          callTime: call_time,
          shootCity: inquiry.preferred_shoot_city,
          hangoutLink: calendarEvent.hangoutLink || null,
          baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://ciarajevans.com',
        }),
      })
    } catch (emailErr) {
      console.error('Content Days admin scheduled email failed:', emailErr)
    }

    return NextResponse.json({
      success: true,
      booking_id: bookingId,
      google_event_id: calendarEvent.eventId || null,
      hangout_link: calendarEvent.hangoutLink || null,
    })
  } catch (err) {
    console.error('Content Days book-call error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatFriendlyDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// ---------------------------------------------------------------------------
// Email templates
// ---------------------------------------------------------------------------

function buildClientEmail(d: {
  firstName: string
  friendlyDate: string
  callTime: string
  hangoutLink: string | null
  shootCity: string
}): string {
  return `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #ffffff; color: #1a1a1a;">
  <div style="text-align: center; padding: 3rem 1.5rem 0;">
    <div style="font-size: 0.95rem; font-weight: 300; letter-spacing: 0.3em; color: #0a0a0a;">
      CJE <span style="color: #81D8D0; font-weight: 600;">MEDIA</span>
    </div>
    <div style="font-size: 0.65rem; letter-spacing: 0.35em; text-transform: uppercase; color: #8a8a8a; margin-top: 0.5rem; font-weight: 500;">
      Content Days
    </div>
    <div style="width: 24px; height: 1px; background: #81D8D0; margin: 1.25rem auto 0;"></div>
  </div>

  <div style="padding: 2.5rem 2rem 1rem;">
    <p style="font-size: 0.7rem; letter-spacing: 0.3em; text-transform: uppercase; color: #81D8D0; font-weight: 600; margin: 0 0 1rem;">
      You're Almost Booked
    </p>
    <p style="font-size: 1.4rem; font-weight: 300; line-height: 1.4; color: #0a0a0a; margin: 0 0 1.5rem;">
      Hi ${escapeHtml(d.firstName)},
    </p>
    <p style="font-size: 0.95rem; line-height: 1.7; color: #4a4a4a; margin: 0 0 1.5rem;">
      Thank you for your interest in CJE Content Days. We'll use this call to confirm
      your shoot date, talk through your vision, and secure your spot.
    </p>

    <div style="background: #fafaf7; border-left: 2px solid #81D8D0; padding: 1.25rem 1.5rem; margin: 1.5rem 0;">
      <div style="font-size: 0.65rem; letter-spacing: 0.3em; text-transform: uppercase; color: #8a8a8a; font-weight: 600; margin-bottom: 0.5rem;">
        Your Call
      </div>
      <div style="font-size: 1rem; color: #0a0a0a; font-weight: 500; margin-bottom: 0.25rem;">
        ${escapeHtml(d.friendlyDate)}
      </div>
      <div style="font-size: 0.95rem; color: #4a4a4a;">
        ${escapeHtml(d.callTime)} (Central Time)
      </div>
      <div style="font-size: 0.85rem; color: #8a8a8a; margin-top: 0.75rem;">
        Preferred shoot city: ${escapeHtml(d.shootCity)}
      </div>
    </div>

    ${
      d.hangoutLink
        ? `
    <div style="text-align: center; margin: 2rem 0 1rem;">
      <a href="${d.hangoutLink}"
         style="display: inline-block; background: #0a0a0a; color: #ffffff; padding: 0.95rem 2.25rem; text-decoration: none; letter-spacing: 0.25em; font-size: 0.7rem; text-transform: uppercase; font-weight: 600;">
        Join Google Meet
      </a>
    </div>
    `
        : ''
    }

    <div style="background: #fafaf7; padding: 1.25rem 1.5rem; margin: 2rem 0 1rem; font-size: 0.85rem; color: #4a4a4a; line-height: 1.6;">
      <strong style="color: #0a0a0a;">A quick note:</strong> your call time is not your
      shoot time. Shoot time will be confirmed on this call.
    </div>

    <p style="font-size: 0.85rem; color: #8a8a8a; line-height: 1.7; margin-top: 2rem;">
      A calendar invite is on its way to your inbox. Can't wait to connect.
    </p>

    <p style="font-family: 'Georgia', serif; font-style: italic; color: #81D8D0; font-size: 1.1rem; margin-top: 1.5rem;">
     . Ciara, CJE Media
    </p>
  </div>

  <div style="padding: 1.5rem; border-top: 1px solid #f0f0f0; text-align: center; font-size: 0.7rem; color: #8a8a8a; letter-spacing: 0.05em;">
    <a href="mailto:media@ciarajevans.com" style="color: #81D8D0; text-decoration: none;">media@ciarajevans.com</a>
    &nbsp;·&nbsp;
    <a href="https://ciarajevans.com" style="color: #81D8D0; text-decoration: none;">ciarajevans.com</a>
  </div>
</div>
`
}

function buildAdminCallScheduledEmail(d: {
  name: string
  businessName: string
  email: string
  phone: string
  friendlyDate: string
  callTime: string
  shootCity: string
  hangoutLink: string | null
  baseUrl: string
}): string {
  return `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; color: #1a1a1a;">
  <div style="text-align: center; padding: 2.5rem 1.5rem 0;">
    <div style="font-size: 0.95rem; font-weight: 300; letter-spacing: 0.3em; color: #0a0a0a;">
      CJE <span style="color: #81D8D0; font-weight: 600;">MEDIA</span>
    </div>
    <div style="font-size: 0.65rem; letter-spacing: 0.35em; text-transform: uppercase; color: #8a8a8a; margin-top: 0.5rem; font-weight: 500;">
      Content Days · Call Scheduled
    </div>
    <div style="width: 24px; height: 1px; background: #81D8D0; margin: 1rem auto 0;"></div>
  </div>

  <div style="padding: 2.5rem 2rem 1rem;">
    <p style="font-size: 0.7rem; letter-spacing: 0.3em; text-transform: uppercase; color: #81D8D0; font-weight: 600; margin: 0 0 1rem;">
      Call Locked In
    </p>
    <p style="font-size: 1.4rem; font-weight: 300; line-height: 1.3; color: #0a0a0a; margin: 0 0 0.25rem;">
      ${escapeHtml(d.name)}
    </p>
    <p style="font-size: 0.85rem; color: #4a4a4a; margin: 0 0 1.5rem; font-style: italic;">
      ${escapeHtml(d.businessName)}
    </p>

    <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; color: #4a4a4a;">
      ${rowAdmin('When', `${escapeHtml(d.friendlyDate)}<br/>${escapeHtml(d.callTime)} CT`)}
      ${rowAdmin('Shoot City', escapeHtml(d.shootCity))}
      ${rowAdmin('Email', `<a href="mailto:${escapeHtml(d.email)}" style="color: #81D8D0; text-decoration: none;">${escapeHtml(d.email)}</a>`)}
      ${rowAdmin('Phone', escapeHtml(d.phone))}
    </table>

    ${
      d.hangoutLink
        ? `
    <div style="text-align: center; margin: 2.5rem 0 0.5rem;">
      <a href="${d.hangoutLink}"
         style="display: inline-block; background: #0a0a0a; color: #ffffff; padding: 0.95rem 2.25rem; text-decoration: none; letter-spacing: 0.25em; font-size: 0.7rem; text-transform: uppercase; font-weight: 600;">
        Join Google Meet
      </a>
    </div>
    `
        : ''
    }
    <div style="text-align: center; margin-top: 0.75rem;">
      <a href="${d.baseUrl}/admin/content-days"
         style="font-size: 0.7rem; color: #81D8D0; text-decoration: none; letter-spacing: 0.15em; text-transform: uppercase;">
        View in Admin
      </a>
    </div>
  </div>

  <div style="padding: 1.5rem; border-top: 1px solid #f0f0f0; text-align: center; font-size: 0.7rem; color: #8a8a8a; letter-spacing: 0.05em;">
    CJE Media · Internal
  </div>
</div>
`
}

function rowAdmin(label: string, value: string): string {
  return `
    <tr>
      <td style="padding: 0.5rem 0; width: 100px; color: #8a8a8a; font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; vertical-align: top;">${label}</td>
      <td style="padding: 0.5rem 0; color: #1a1a1a;">${value}</td>
    </tr>
  `
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
