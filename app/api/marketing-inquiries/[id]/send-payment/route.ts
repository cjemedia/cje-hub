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

    // Create Stripe Payment Link
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

    const price = await stripe.prices.create({
      unit_amount: Math.round(Number(amount) * 100),
      currency: 'usd',
      product_data: {
        name: `CJE Airbnb Marketing — ${inquiry.first_name} ${inquiry.last_name}`,
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
      },
    })

    // Update inquiry record
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

    // Email client
    try {
      await sendEmail({
        to: inquiry.email,
        subject: `Your CJE Airbnb Marketing Deposit — Secure Your Filming Dates`,
        replyTo: 'media@ciarajevans.com',
        html: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 580px; margin: 0 auto; color: #1a1a1a; background: #ffffff;">
            <div style="text-align: center; padding: 2.5rem 0 2rem; border-bottom: 1px solid #efefef;">
              <div style="font-size: 1.5rem; font-weight: 300; letter-spacing: 0.2em; color: #0a0a0a;">CJE <span style="color: #0ABAB5; font-weight: 600;">Media</span></div>
            </div>
            <div style="padding: 2.5rem 1.75rem;">
              <p style="font-size: 0.7rem; letter-spacing: 0.3em; text-transform: uppercase; color: #0ABAB5; font-weight: 600; margin: 0 0 1rem;">Your Deposit Is Ready</p>
              <h1 style="font-size: 1.75rem; font-weight: 300; color: #0a0a0a; margin: 0 0 1.5rem; line-height: 1.3;">
                Hi ${inquiry.first_name},
              </h1>
              <p style="font-size: 0.95rem; line-height: 1.7; color: #4a4a4a; margin-bottom: 1.5rem;">
                Thank you for submitting your Property Vision Form. To secure your filming dates, please complete your <strong style="color: #0a0a0a;">$${Number(amount).toFixed(2)} deposit</strong> using the secure link below.
              </p>
              <div style="text-align: center; margin: 2.5rem 0;">
                <a href="${prefilledUrl}"
                   style="display: inline-block; background: #0a0a0a; color: #ffffff; padding: 1rem 2.5rem; text-decoration: none; letter-spacing: 0.25em; font-size: 0.75rem; text-transform: uppercase; font-weight: 600;">
                  Complete Your Deposit
                </a>
              </div>
              <p style="font-size: 0.85rem; line-height: 1.7; color: #8a8a8a; margin-bottom: 1rem;">
                Once payment is complete, I'll be in touch to lock in your filming schedule and align on creative direction.
              </p>
              <p style="font-size: 0.85rem; line-height: 1.7; color: #8a8a8a; margin-bottom: 2rem;">
                Looking forward to creating something beautiful for your property.
              </p>
              <p style="font-size: 0.9rem; line-height: 1.6; color: #1a1a1a; margin: 0;">
                — Ciara<br/>
                <span style="color: #8a8a8a; font-size: 0.8rem;">CJE Media</span>
              </p>
            </div>
            <div style="padding: 1.5rem; background: #fafaf7; text-align: center; font-size: 0.75rem; color: #8a8a8a; letter-spacing: 0.05em;">
              Questions? Reply to this email or text 773.727.8262
            </div>
          </div>
        `,
      })
    } catch (emailErr) {
      console.error('Client email failed:', emailErr)
    }

    // Notify Ciara
    try {
      await sendEmail({
        to: 'media@ciarajevans.com',
        subject: `Payment link sent — ${inquiry.first_name} ${inquiry.last_name} · $${Number(amount).toFixed(2)}`,
        html: `
          <div style="font-family: 'Helvetica Neue', sans-serif; color: #1a1a1a;">
            <p>Payment link of <strong>$${Number(amount).toFixed(2)}</strong> just went out to ${inquiry.first_name} ${inquiry.last_name} (${inquiry.email}).</p>
            <p>
              <a href="${paymentLink.url}" style="color: #0ABAB5;">View Stripe link</a>
              &nbsp;·&nbsp;
              <a href="${baseUrl}/admin/marketing-inquiries/${inquiry.id}" style="color: #0ABAB5;">View inquiry</a>
            </p>
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
