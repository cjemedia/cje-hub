import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  html,
  from = 'The CJE Experience <booking@ciarajevans.com>',
  replyTo,
}: {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}) {
  try {
    // Ensure to is always an array
    const recipients = Array.isArray(to) ? to : [to]
    
    const emailOptions: any = {
      from,
      to: recipients,
      subject,
      html,
    }

    // Add reply-to if provided
    if (replyTo) {
      emailOptions.reply_to = replyTo
    }

    // Add headers to improve deliverability
    emailOptions.headers = {
      'X-Entity-Ref-ID': `booking-${Date.now()}`,
    }

    const { data, error } = await resend.emails.send(emailOptions)

    if (error) {
      console.error('Resend error:', JSON.stringify(error, null, 2))
      return { success: false, error }
    }

    // Check if email was actually accepted by Resend
    if (!data?.id) {
      console.error('Resend returned no message ID - email may not have been sent')
      return { success: false, error: 'No message ID returned from Resend' }
    }

    console.log('Email sent successfully:', { 
      to: recipients, 
      subject, 
      messageId: data.id,
      from,
      replyTo: replyTo || 'none',
      // Log the actual email address to verify
      actualRecipient: recipients[0]
    })
    return { success: true, data }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

