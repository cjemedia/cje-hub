import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    const body = await request.text()
    const sig = request.headers.get('stripe-signature')

    let event
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const acceptanceId = session.client_reference_id
      const projectId = session.metadata?.project_id

      if (!acceptanceId) {
        return NextResponse.json({ received: true })
      }

      const supabase = createServiceClient()

      await supabase
        .from('proposal_acceptances')
        .update({
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
          stripe_checkout_session_id: session.id,
        })
        .eq('id', acceptanceId)

      if (projectId) {
        await supabase
          .from('projects')
          .update({ proposal_status: 'paid' })
          .eq('id', projectId)

        const { data: acceptance } = await supabase
          .from('proposal_acceptances')
          .select('*')
          .eq('id', acceptanceId)
          .single()

        const { data: project } = await supabase
          .from('projects')
          .select('name, user_id')
          .eq('id', projectId)
          .single()

        if (acceptance) {
          const servicesHtml = (acceptance.selected_services as any[])
            .map(s => `<li>${s.name} - $${s.price.toLocaleString()}</li>`)
            .join('')

          const planInfo = acceptance.selected_maintenance_plan
            ? `${acceptance.selected_maintenance_plan.name} ($${acceptance.selected_maintenance_plan.price}/mo)`
            : 'None selected'

          await sendEmail({
            to: 'media@ciarajevans.com',
            subject: `Deposit Paid - ${acceptance.client_name}`,
            html: `<div style="font-family: sans-serif; max-width: 600px;"><h2>Proposal Accepted and Deposit Paid</h2><p><strong>Client:</strong> ${acceptance.client_name}</p><p><strong>Project:</strong> ${project?.name || projectId}</p><p><strong>Services:</strong></p><ul>${servicesHtml}</ul><p><strong>Maintenance Plan:</strong> ${planInfo}</p><p><strong>Total:</strong> $${acceptance.total_amount}</p><p><strong>Deposit Paid:</strong> $${acceptance.deposit_amount}</p><p><strong>Remaining:</strong> $${acceptance.total_amount - acceptance.deposit_amount}</p></div>`,
          })

          if (project?.user_id) {
            await supabase.from('messages').insert({
              project_id: projectId,
              user_id: project.user_id,
              sender_type: 'system',
              content: `${acceptance.client_name} accepted the proposal and paid the $${acceptance.deposit_amount} deposit.`,
              message_type: 'proposal',
            })
          }
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
