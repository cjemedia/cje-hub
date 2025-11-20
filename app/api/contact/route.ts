import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/resend'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, message, subject, inquiryType, from } = body

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

    // Send email to CJE Media
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0ABAB5;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${senderName}</p>
        <p><strong>Email:</strong> ${senderEmail}</p>
        <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
        <p><strong>Inquiry Type:</strong> ${formattedInquiry}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0ABAB5;">Thank You for Reaching Out!</h2>
        <p>Hi ${senderName},</p>
        <p>We've received your message and will get back to you soon.</p>
        <p>Best regards,<br>CJE Media Team</p>
      </div>
    `

    await sendEmail({
      to: senderEmail,
      subject: 'Thank you for contacting CJE Media',
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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

