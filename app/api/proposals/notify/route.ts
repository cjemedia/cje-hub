import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const { project_id, client_email, client_name, proposal_url, project_name } = await request.json()

    if (!project_id || !client_email || !proposal_url) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    await sendEmail({
      to: client_email,
      subject: `Your Proposal is Ready — ${project_name || 'CJE Media'}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; border-radius: 16px; overflow: hidden;">
          <div style="padding: 40px 32px; text-align: center;">
            <p style="color: #81D8D0; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; margin: 0 0 16px;">The CJE Experience</p>
            <h1 style="color: #ffffff; font-size: 24px; font-weight: 600; margin: 0 0 12px;">Your Proposal is Ready</h1>
            <p style="color: #a1a1a1; font-size: 15px; line-height: 1.6; margin: 0 0 32px;">
              Hi ${client_name || 'there'},<br><br>
              Your website proposal for <strong style="color: #fff;">${project_name || 'your project'}</strong> is ready to review.
            </p>
            <a href="${proposal_url}" style="display: inline-block; background: #81D8D0; color: #0a0a0a; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px; letter-spacing: 0.05em; text-transform: uppercase;">
              View Your Proposal
            </a>
            <p style="color: #555; font-size: 13px; margin-top: 24px;">
              This proposal expires in 30 days.
            </p>
          </div>
          <div style="padding: 20px 32px; border-top: 1px solid #1a1a1a; text-align: center;">
            <p style="color: #333; font-size: 11px; letter-spacing: 0.15em;">✦ CJE Media Tech Solutions ✦</p>
          </div>
        </div>
      `,
    })

    // Also notify admin
    await sendEmail({
      to: 'media@ciarajevans.com',
      subject: `Proposal Sent — ${project_name || project_id}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2>Proposal Sent</h2>
          <p><strong>Client:</strong> ${client_name} (${client_email})</p>
          <p><strong>Project:</strong> ${project_name || project_id}</p>
          <p><strong>Link:</strong> <a href="${proposal_url}">${proposal_url}</a></p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Proposal notify error:', error)
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 })
  }
}
