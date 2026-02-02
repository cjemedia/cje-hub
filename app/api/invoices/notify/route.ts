import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const { invoiceId } = await request.json()
    if (!invoiceId) {
      return NextResponse.json({ error: 'Missing invoiceId' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data: invoice } = await supabase
      .from('invoices')
      .select('*, users(id, name, email), projects(id, name)')
      .eq('id', invoiceId)
      .single()

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const client = invoice.users as any
    const project = invoice.projects as any

    if (!client?.email) {
      return NextResponse.json({ error: 'Client has no email' }, { status: 400 })
    }

    const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.amount)

    await sendEmail({
      to: client.email,
      cc: 'media@ciarajevans.com',
      subject: `Invoice Reminder from The CJE Experience - ${formattedAmount}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>Invoice Reminder from The CJE Experience</title>
</head>
<body style="background-color: #0a0a0a; margin: 0; padding: 40px 20px; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 40px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <img src="https://ciarajevans.com/images/cje-logo.png" alt="The CJE Experience" width="240" height="auto" style="max-width: 240px; width: 240px; height: auto; display: block; margin: 0 auto 24px; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
    </div>
    <div style="text-align: center; margin-bottom: 32px;">
      <h2 style="color: #ffffff; margin: 0 0 8px; font-size: 30px; font-weight: 700;">Invoice Reminder</h2>
      <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; margin: 0;">
        You have an invoice from The CJE Experience
      </p>
    </div>
    <div style="background-color: #0a0a0a; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center;">
      <p style="color: rgba(255, 255, 255, 0.7); font-size: 14px; margin: 0 0 8px;">Amount Due</p>
      <p style="color: #81D8D0; font-size: 36px; font-weight: 700; margin: 0;">${formattedAmount}</p>
      ${invoice.description ? `<p style="color: rgba(255, 255, 255, 0.7); font-size: 14px; margin: 12px 0 0;">${invoice.description}</p>` : ''}
      ${project?.name ? `<p style="color: rgba(255, 255, 255, 0.5); font-size: 13px; margin: 8px 0 0;">Project: ${project.name}</p>` : ''}
    </div>
    ${invoice.stripe_link ? `
    <div style="text-align: center; margin: 24px 0;">
      <a href="${invoice.stripe_link}" style="display: inline-block; background-color: #81D8D0; color: #0a0a0a; font-weight: 700; font-size: 16px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">Pay Now</a>
    </div>
    ` : ''}
    <p style="margin-top: 24px; text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ciarajevans.com'}/hub/invoices" style="color: #ffffff; text-decoration: underline;">View in your portal</a>
    </p>
  </div>
</body>
</html>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Invoice notify error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
