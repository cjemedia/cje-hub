import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendEmail } from '@/lib/resend'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const required = ['first_name', 'last_name', 'email', 'phone', 'property_location']
    for (const f of required) {
      if (!body[f] || typeof body[f] !== 'string') {
        return NextResponse.json({ error: `Missing required field: ${f}` }, { status: 400 })
      }
    }

    const supabase = createServiceClient()

    const insertData = {
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      phone: body.phone,
      social_handles: body.social_handles || null,
      property_location: body.property_location,
      airbnb_link: body.airbnb_link || null,
      ideal_guest: Array.isArray(body.ideal_guest) ? body.ideal_guest : [],
      highlights: body.highlights || null,
      special_features: body.special_features || null,
      vibe: Array.isArray(body.vibe) ? body.vibe : [],
      music_preference: body.music_preference || null,
      preferred_start_date: body.preferred_start_date || null,
      availability: body.availability || null,
      access_method: body.access_method || null,
      other_notes: body.other_notes || null,
      status: 'new',
    }

    const { data: inquiry, error } = await supabase
      .from('marketing_inquiries')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Notify Ciara — soft branded internal email
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ciarajevans.com'
    try {
      await sendEmail({
        to: 'media@ciarajevans.com',
        subject: `New inquiry — ${body.first_name} ${body.last_name}`,
        replyTo: body.email,
        html: `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #ffffff; color: #1a1a1a;">
  <div style="text-align: center; padding: 2.5rem 1.5rem 0;">
    <div style="font-size: 0.95rem; font-weight: 300; letter-spacing: 0.3em; color: #0a0a0a;">
      CJE <span style="color: #0ABAB5; font-weight: 600;">MEDIA</span>
    </div>
    <div style="font-size: 0.65rem; letter-spacing: 0.35em; text-transform: uppercase; color: #8a8a8a; margin-top: 0.5rem; font-weight: 500;">
      Airbnb Marketing
    </div>
    <div style="width: 24px; height: 1px; background: #0ABAB5; margin: 1rem auto 0;"></div>
  </div>
  <div style="padding: 2.5rem 2rem 1rem;">
    <p style="font-size: 0.7rem; letter-spacing: 0.3em; text-transform: uppercase; color: #0ABAB5; font-weight: 600; margin: 0 0 1rem;">
      New Inquiry
    </p>
    <p style="font-size: 1.25rem; font-weight: 300; line-height: 1.4; color: #0a0a0a; margin: 0 0 1.5rem;">
      ${body.first_name} ${body.last_name}
    </p>
    <div style="font-size: 0.9rem; line-height: 2; color: #4a4a4a;">
      ${body.property_location}<br/>
      <a href="mailto:${body.email}" style="color: #0ABAB5; text-decoration: none;">${body.email}</a><br/>
      ${body.phone}
    </div>
    <div style="text-align: center; margin: 2.5rem 0 1rem;">
      <a href="${baseUrl}/admin/marketing-inquiries/${inquiry.id}"
         style="display: inline-block; background: #0a0a0a; color: #ffffff; padding: 0.95rem 2.25rem; text-decoration: none; letter-spacing: 0.25em; font-size: 0.7rem; text-transform: uppercase; font-weight: 600;">
        Open Inquiry
      </a>
    </div>
  </div>
  <div style="padding: 1.5rem; border-top: 1px solid #f0f0f0; text-align: center; font-size: 0.7rem; color: #8a8a8a; letter-spacing: 0.05em;">
    CJE Media · Internal
  </div>
</div>
        `,
      })
    } catch (emailErr) {
      console.error('Email notification failed (inquiry still saved):', emailErr)
    }

    return NextResponse.json({ success: true, id: inquiry.id })
  } catch (err) {
    console.error('Submission error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
