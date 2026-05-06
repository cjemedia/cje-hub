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

    // Notify Ciara
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ciarajevans.com'
    try {
      await sendEmail({
        to: 'media@ciarajevans.com',
        subject: `New Airbnb Marketing Inquiry — ${body.first_name} ${body.last_name}`,
        replyTo: body.email,
        html: `
          <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 600px; color: #1a1a1a;">
            <div style="border-bottom: 1px solid #efefef; padding-bottom: 1rem; margin-bottom: 1.5rem;">
              <div style="font-size: 0.7rem; letter-spacing: 0.3em; text-transform: uppercase; color: #0ABAB5; font-weight: 600; margin-bottom: 0.5rem;">CJE Media · New Inquiry</div>
              <h2 style="color: #0a0a0a; font-weight: 300; margin: 0; font-size: 1.5rem;">${body.first_name} ${body.last_name}</h2>
            </div>
            <table style="border-collapse: collapse; width: 100%; font-size: 0.9rem;">
              <tr><td style="padding: 0.5rem 0; color: #888; width: 100px;">Email</td><td style="padding: 0.5rem 0;"><a href="mailto:${body.email}" style="color: #0ABAB5;">${body.email}</a></td></tr>
              <tr><td style="padding: 0.5rem 0; color: #888;">Phone</td><td style="padding: 0.5rem 0;">${body.phone}</td></tr>
              <tr><td style="padding: 0.5rem 0; color: #888;">Location</td><td style="padding: 0.5rem 0;">${body.property_location}</td></tr>
              ${body.airbnb_link ? `<tr><td style="padding: 0.5rem 0; color: #888;">Airbnb</td><td style="padding: 0.5rem 0;"><a href="${body.airbnb_link}" style="color: #0ABAB5;">${body.airbnb_link}</a></td></tr>` : ''}
            </table>
            <a href="${baseUrl}/admin/marketing-inquiries/${inquiry.id}"
               style="display: inline-block; background: #0a0a0a; color: white; padding: 0.85rem 1.5rem; text-decoration: none; letter-spacing: 0.2em; font-size: 0.75rem; text-transform: uppercase; margin-top: 1.5rem; font-weight: 600;">
              View &amp; Send Payment Link
            </a>
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
