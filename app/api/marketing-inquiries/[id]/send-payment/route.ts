import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendEmail } from '@/lib/resend'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { amount } = await request.json()
    const inquiryId = params.id

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const supabase = createServiceClient()

    const { data: inquiry, error: fetchError } = await supabase
      .from('marketing_inquiries')
      .select('*')
      .eq('id', inquiryId)
      .single()

    if (fetchError || !inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

    // Generic product name keeps the customer's receipt clean.
    // Client identification lives in metadata + payment_intent description.
    const price = await stripe.prices.create({
      unit_amount: Math.round(Number(amount) * 100),
      currency: 'usd',
      product_data: {
        name: 'CJE Airbnb Marketing Package',
      },
    })

    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{
        price: price.id,
        quantity: 1,
      }],
      metadata: {
        inquiry_id: inquiry.id,
        client_email: inquiry.email,
        client_name: `${inquiry.first_name} ${inquiry.last_name}`,
        property_location: inquiry.property_location || '',
      },
      payment_intent_data: {
        description: `Airbnb Marketing — ${inquiry.first_name} ${inquiry.last_name}${inquiry.property_location ? ` · ${inquiry.property_location}` : ''}`,
      },
    })

    const now = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('marketing_inquiries')
      .update({
        status: 'payment_sent',
        payment_amount: Number(amount),
        stripe_payment_link_id: paymentLink.id,
        stripe_payment_link_url: paymentLink.url,
        stripe_price_id: price.id,
        payment_sent_at: now,
        updated_at: now,
      })
      .eq('id', inquiryId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    const prefilledUrl = `${paymentLink.url}?prefilled_email=${encodeURIComponent(inquiry.email)}`
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ciarajevans.com'

    // -------- Email to client (no amount in body — it's on the Stripe page) --------
    try {
      await sendEmail({
        to: inquiry.email,
        subject: `Your CJE Airbnb Marketing — Deposit Link Inside`,
        replyTo: 'media@ciarajevans.com',
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
    <p style="font-size: 1rem; line-height: 1.7; color: #1a1a1a; margin: 0 0 1rem;">
      Hi ${inquiry.first_name},
    </p>
    <p style="font-size: 0.95rem; line-height: 1.7; color: #4a4a4a; margin: 0 0 1rem;">
      Thank you for sharing your property vision. Your deposit link is ready below — once payment is in, I'll lock your filming dates and be in touch on creative direction.
    </p>
    <div style="text-align: center; margin: 2.5rem 0 1.5rem;">
      <a href="${prefilledUrl}"
         style="display: inline-block; background: #0a0a0a; color: #ffffff; padding: 0.95rem 2.25rem; text-decoration: none; letter-spacing: 0.25em; font-size: 0.7rem; text-transform: uppercase; font-weight: 600;">
        Complete Your Deposit
      </a>
    </div>
    <p style="font-size: 0.9rem; line-height: 1.6; color: #1a1a1a; margin: 2rem 0 0;">
      — Ciara
    </p>
  </div>
  <div style="padding: 1.5rem; border-top: 1px solid #f0f0f0; text-align: center; font-size: 0.7rem; color: #8a8a8a; letter-spacing: 0.05em;">
    media@ciarajevans.com · 773.727.8262
  </div>
</div>
        `,
      })
    } catch (emailErr) {
      console.error('Client email failed:', emailErr)
    }

    // -------- Notify Ciara (internal — keeps the amount) --------
    try {
      await sendEmail({
        to: 'media@ciarajevans.com',
        subject: `Payment link sent — ${inquiry.first_name} ${inquiry.last_name} · $${Number(amount).toFixed(2)}`,
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
      Payment Link Sent
    </p>
    <p style="font-size: 1rem; line-height: 1.7; color: #1a1a1a; margin: 0 0 0.5rem;">
      <strong>$${Number(amount).toFixed(2)}</strong> link went to ${inquiry.first_name} ${inquiry.last_name}
    </p>
    <p style="font-size: 0.85rem; line-height: 1.7; color: #4a4a4a; margin: 0 0 1.5rem;">
      ${inquiry.email}
    </p>
    <div style="text-align: center; margin: 2rem 0 1rem;">
      <a href="${baseUrl}/admin/marketing-inquiries/${inquiry.id}"
         style="display: inline-block; background: #0a0a0a; color: #ffffff; padding: 0.95rem 2.25rem; text-decoration: none; letter-spacing: 0.25em; font-size: 0.7rem; text-transform: uppercase; font-weight: 600;">
        View Inquiry
      </a>
    </div>
  </div>
  <div style="padding: 1.5rem; border-top: 1px solid #f0f0f0; text-align: center; font-size: 0.7rem; color: #8a8a8a; letter-spacing: 0.05em;">
    CJE Media · Internal
  </div>
</div>
        `,
      })
    } catch (notifyErr) {
      console.error('Ciara notification failed:', notifyErr)
    }

    return NextResponse.json({
      success: true,
      payment_link_url: paymentLink.url,
    })
  } catch (err: any) {
    console.error('Send payment error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
