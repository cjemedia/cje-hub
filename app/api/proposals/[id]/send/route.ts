import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendEmail } from '@/lib/resend'
import { logProjectActivity } from '@/lib/activity'

type Params = { params: { id: string } }

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const supabase = createServiceClient()
    const { data: proposal, error } = await supabase
      .from('proposals')
      .select('*, projects(user_id), users:projects!inner(user_id, email, name)')
      .eq('id', params.id)
      .maybeSingle()

    if (error || !proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    // Fetch client email
    const { data: client } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', proposal.user_id)
      .maybeSingle()

    const toEmail = client?.email
    if (!toEmail) {
      return NextResponse.json({ error: 'Client email not found' }, { status: 400 })
    }

    const total = Number(proposal.total_amount || 0).toFixed(2)
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>New Proposal</title>
</head>
<body style="background-color: #0a0a0a; margin: 0; padding: 40px 20px; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 40px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <img src="https://ciarajevans.com/images/cje-logo.png" alt="The CJE Experience" width="240" height="auto" style="max-width: 240px; width: 240px; height: auto; display: block; margin: 0 auto 24px; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
    </div>
    <div style="text-align: center; margin-bottom: 32px;">
      <h2 style="color: #ffffff; margin: 0 0 8px; font-size: 30px; font-weight: 700; text-align: center;">New Proposal</h2>
      <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; margin: 0; text-align: center;">${proposal.title || 'Proposal'} is ready for your review.</p>
    </div>
    <div style="background-color: #0a0a0a; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 20px; margin: 24px 0;">
      <p style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 600;"><strong>Total:</strong> $${total}</p>
    </div>
    <p style="color: #ffffff; line-height: 1.6; margin-bottom: 32px;">Please log in to your portal to view and respond.</p>
    <div style="text-align: center; margin-top: 32px;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || ''}/hub/projects/${proposal.project_id}" style="display: inline-block; background-color: #ffffff; color: #0a0a0a; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Proposal</a>
    </div>
  </div>
</body>
</html>
    `

    const emailResult = await sendEmail({
      to: toEmail,
      subject: proposal.title ? `Proposal: ${proposal.title}` : 'New Proposal',
      html: emailHtml,
      from: 'The CJE Experience <booking@ciarajevans.com>',
    })

    if (!emailResult.success) {
      console.error('Failed to send proposal email:', emailResult.error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    const { data: updated, error: updateError } = await supabase
      .from('proposals')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', params.id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Error updating proposal status to sent:', updateError)
    } else {
      await logProjectActivity(proposal.project_id, proposal.user_id, 'proposal_sent', { proposal_id: params.id })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('API error sending proposal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

