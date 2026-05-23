import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendEmail } from '@/lib/resend'

export const dynamic = 'force-dynamic'

const ALLOWED_CITIES = ['Houston', 'Chicago', 'Other'] as const
const ALLOWED_READY = ['ready', 'questions_first'] as const

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    const required = [
      'first_name',
      'last_name',
      'email',
      'phone',
      'instagram_handle',
      'business_name',
      'preferred_shoot_city',
      'ready_to_book',
    ]
    for (const f of required) {
      if (!body[f] || typeof body[f] !== 'string') {
        return NextResponse.json(
          { error: `Missing required field: ${f}` },
          { status: 400 }
        )
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Validate enums
    if (!ALLOWED_CITIES.includes(body.preferred_shoot_city)) {
      return NextResponse.json({ error: 'Invalid shoot city' }, { status: 400 })
    }
    if (!ALLOWED_READY.includes(body.ready_to_book)) {
      return NextResponse.json({ error: 'Invalid ready_to_book value' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const insertData = {
      first_name: body.first_name.trim(),
      last_name: body.last_name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
      instagram_handle: body.instagram_handle.trim(),
      tiktok_handle: body.tiktok_handle?.trim() || null,
      business_name: body.business_name.trim(),
      preferred_shoot_city: body.preferred_shoot_city,
      preferred_date: body.preferred_date || null,
      ready_to_book: body.ready_to_book,
      how_heard: body.how_heard?.trim() || null,
      status: 'new',
    }

    const { data: inquiry, error } = await supabase
      .from('content_days_inquiries')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Content Days insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Notify admin (Ciara + tech-support fan-out)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ciarajevans.com'
    const readyLabel =
      body.ready_to_book === 'ready'
        ? "Yes. Ready to secure date"
        : "Has questions first"
    const preferredDateLabel = body.preferred_date
      ? new Date(body.preferred_date + 'T00:00:00').toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : 'Not specified'

    try {
      await sendEmail({
        to: ['media@ciarajevans.com'],
        subject: `New Content Days inquiry: ${body.first_name} ${body.last_name}`,
        replyTo: body.email,
        html: buildAdminEmail({
          firstName: body.first_name,
          lastName: body.last_name,
          email: body.email,
          phone: body.phone,
          instagramHandle: body.instagram_handle,
          tiktokHandle: body.tiktok_handle || null,
          businessName: body.business_name,
          shootCity: body.preferred_shoot_city,
          preferredDate: preferredDateLabel,
          readyLabel,
          howHeard: body.how_heard || null,
          inquiryId: inquiry.id,
          baseUrl,
        }),
      })
    } catch (emailErr) {
      console.error('Content Days email notification failed (inquiry still saved):', emailErr)
    }

    return NextResponse.json({ success: true, id: inquiry.id })
  } catch (err) {
    console.error('Content Days submission error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// Email template. Kept inline so this route has no extra dependencies
// ---------------------------------------------------------------------------

function buildAdminEmail(d: {
  firstName: string
  lastName: string
  email: string
  phone: string
  instagramHandle: string
  tiktokHandle: string | null
  businessName: string
  shootCity: string
  preferredDate: string
  readyLabel: string
  howHeard: string | null
  inquiryId: string
  baseUrl: string
}): string {
  return `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; color: #1a1a1a;">
  <div style="text-align: center; padding: 2.5rem 1.5rem 0;">
    <div style="font-size: 0.95rem; font-weight: 300; letter-spacing: 0.3em; color: #0a0a0a;">
      CJE <span style="color: #81D8D0; font-weight: 600;">MEDIA</span>
    </div>
    <div style="font-size: 0.65rem; letter-spacing: 0.35em; text-transform: uppercase; color: #8a8a8a; margin-top: 0.5rem; font-weight: 500;">
      Content Days
    </div>
    <div style="width: 24px; height: 1px; background: #81D8D0; margin: 1rem auto 0;"></div>
  </div>

  <div style="padding: 2.5rem 2rem 1rem;">
    <p style="font-size: 0.7rem; letter-spacing: 0.3em; text-transform: uppercase; color: #81D8D0; font-weight: 600; margin: 0 0 1rem;">
      New Inquiry
    </p>
    <p style="font-size: 1.4rem; font-weight: 300; line-height: 1.3; color: #0a0a0a; margin: 0 0 0.25rem;">
      ${escapeHtml(d.firstName)} ${escapeHtml(d.lastName)}
    </p>
    <p style="font-size: 0.85rem; color: #4a4a4a; margin: 0 0 1.5rem; font-style: italic;">
      ${escapeHtml(d.businessName)}
    </p>

    <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; color: #4a4a4a;">
      ${row('Email', `<a href="mailto:${escapeHtml(d.email)}" style="color: #81D8D0; text-decoration: none;">${escapeHtml(d.email)}</a>`)}
      ${row('Phone', escapeHtml(d.phone))}
      ${row('Instagram', escapeHtml(d.instagramHandle))}
      ${d.tiktokHandle ? row('TikTok', escapeHtml(d.tiktokHandle)) : ''}
      ${row('Shoot City', escapeHtml(d.shootCity))}
      ${row('Preferred Date', escapeHtml(d.preferredDate))}
      ${row('Status', escapeHtml(d.readyLabel))}
      ${d.howHeard ? row('Heard From', escapeHtml(d.howHeard)) : ''}
    </table>

    <div style="text-align: center; margin: 2.5rem 0 1rem;">
      <a href="${d.baseUrl}/admin/content-days"
         style="display: inline-block; background: #0a0a0a; color: #ffffff; padding: 0.95rem 2.25rem; text-decoration: none; letter-spacing: 0.25em; font-size: 0.7rem; text-transform: uppercase; font-weight: 600;">
        View in Admin
      </a>
    </div>
    <p style="font-size: 0.75rem; color: #8a8a8a; text-align: center; margin: 1rem 0 0;">
      They're picking a call time next. You'll get a Google Calendar invite when they do.
    </p>
  </div>

  <div style="padding: 1.5rem; border-top: 1px solid #f0f0f0; text-align: center; font-size: 0.7rem; color: #8a8a8a; letter-spacing: 0.05em;">
    CJE Media · Internal
  </div>
</div>
`
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding: 0.5rem 0; width: 110px; color: #8a8a8a; font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; vertical-align: top;">${label}</td>
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
