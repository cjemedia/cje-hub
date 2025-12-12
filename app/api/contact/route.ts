import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/resend'
import { createServiceClient } from '@/lib/supabase/service'
import { checkRateLimit } from '@/lib/rate-limit'
import { addToMailchimp } from '@/lib/mailchimp'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { name, email, message, subject, inquiryType, from, subscribe, website } = body

    // Honeypot spam trap
    if (website) {
      return NextResponse.json({ success: true })
    }

    const senderEmail = email || from
    if (!senderEmail || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const senderName = name || 'Website Visitor'
    const inquiryArray = Array.isArray(inquiryType)
      ? inquiryType
      : inquiryType
      ? [inquiryType]
      : []
    const formattedInquiry =
      inquiryArray.length > 0 ? inquiryArray.join(', ') : 'Not specified'

    // Send email to The CJE Experience
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>New Contact Form Submission</title>
</head>
<body style="background-color: #0a0a0a; margin: 0; padding: 40px 20px; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 40px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <img src="https://ciarajevans.com/images/cje-logo.png" alt="The CJE Experience" width="240" height="auto" style="max-width: 240px; width: 240px; height: auto; display: block; margin: 0 auto 24px; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
    </div>
    <div style="text-align: center; margin-bottom: 32px;">
      <h2 style="color: #ffffff; margin: 0 0 8px; font-size: 30px; font-weight: 700; text-align: center;">New Contact Form Submission</h2>
      <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; margin: 0; text-align: center;">
        ${formattedInquiry}
      </p>
    </div>
    <p style="color: #ffffff; line-height: 1.6; margin-bottom: 8px;"><strong>Name:</strong> ${senderName}</p>
    <p style="color: #ffffff; line-height: 1.6; margin-bottom: 8px;"><strong>Email:</strong> ${senderEmail}</p>
    <p style="color: #ffffff; line-height: 1.6; margin-bottom: 8px;"><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
    <p style="color: #ffffff; line-height: 1.6; margin-bottom: 24px;"><strong>Inquiry Type:</strong> ${formattedInquiry}</p>
    <p style="color: #ffffff; margin-top: 24px; font-weight: 500; margin-bottom: 8px;"><strong>Message:</strong></p>
    <div style="background-color: #0a0a0a; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 20px; margin: 16px 0;">
      <p style="color: #ffffff; margin: 0; white-space: pre-wrap; line-height: 1.6;">${message}</p>
    </div>
  </div>
</body>
</html>
    `

    const result = await sendEmail({
      to: 'media@ciarajevans.com',
      subject: subject
        ? `${subject} - ${senderName}`
        : `New Contact Form Submission from ${senderName}`,
      html: emailHtml,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    // Send confirmation email to user
    const confirmationHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>Thank you for contacting The CJE Experience</title>
</head>
<body style="background-color: #0a0a0a; margin: 0; padding: 40px 20px; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 40px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <img src="https://ciarajevans.com/images/cje-logo.png" alt="The CJE Experience" width="240" height="auto" style="max-width: 240px; width: 240px; height: auto; display: block; margin: 0 auto 24px; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
    </div>
    <div style="text-align: center; margin-bottom: 32px;">
      <h2 style="color: #ffffff; margin: 0 0 8px; font-size: 30px; font-weight: 700; text-align: center;">Thank You for Reaching Out!</h2>
      <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; margin: 0; text-align: center;">
        We've received your message
      </p>
    </div>
    <p style="color: #ffffff; line-height: 1.6; margin-bottom: 8px;">Hi ${senderName},</p>
    <p style="color: #ffffff; line-height: 1.6; margin-bottom: 24px;">We've received your message and will get back to you soon.</p>
    <p style="color: rgba(255, 255, 255, 0.7); margin-top: 24px; line-height: 1.6;">Best regards,<br>The CJE Experience Team</p>
  </div>
</body>
</html>
    `

    await sendEmail({
      to: senderEmail,
      subject: 'Thank you for contacting The CJE Experience',
      html: confirmationHtml,
    })

    const supabase = createServiceClient()
    await supabase.from('contact_messages').insert({
      sender_email: senderEmail,
      phone: body.phone || null,
      subject: subject || null,
      inquiry_types: inquiryArray,
      preferred_contact: body.preferredContact || null,
      message,
    })

    // Add to Mailchimp if subscribed
    if (subscribe && senderEmail) {
      const nameParts = senderName.split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      await addToMailchimp(senderEmail, firstName, lastName)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

