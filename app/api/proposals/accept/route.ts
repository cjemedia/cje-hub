import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { project_id, client_name, selected_services, selected_maintenance_plan, deposit_percentage } = body

    if (!project_id || !client_name || !selected_services || selected_services.length === 0) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Calculate amounts
    const totalAmount = selected_services.reduce((sum: number, s: any) => sum + s.price, 0)
    const depositAmount = Math.round(totalAmount * (deposit_percentage / 100) * 100) / 100

    // Get client IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               request.headers.get('x-real-ip') || 
               'unknown'

    // Create acceptance record
    const { data: acceptance, error: acceptError } = await supabase
      .from('proposal_acceptances')
      .insert({
        project_id,
        client_name,
        selected_services,
        selected_maintenance_plan,
        total_amount: totalAmount,
        deposit_percentage,
        deposit_amount: depositAmount,
        ip_address: ip,
      })
      .select()
      .single()

    if (acceptError) {
      console.error('Error creating acceptance:', acceptError)
      return NextResponse.json({ error: 'Failed to save acceptance.' }, { status: 500 })
    }

    // Update project status
    await supabase
      .from('projects')
      .update({ proposal_status: 'accepted' })
      .eq('id', project_id)

    // Try Stripe Checkout if key exists
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

        const lineItems = selected_services.map((s: any) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: s.name,
              description: s.description || undefined,
            },
            unit_amount: Math.round(s.price * (deposit_percentage / 100) * 100),
          },
          quantity: 1,
        }))

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ciarajevans.com'

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: lineItems,
          mode: 'payment',
          success_url: `${baseUrl}/proposals/${project_id}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl}/proposals/${project_id}`,
          client_reference_id: acceptance.id,
          metadata: {
            project_id,
            acceptance_id: acceptance.id,
            client_name,
            maintenance_plan: selected_maintenance_plan?.name || 'None',
          },
        })

        // Save session ID
        await supabase
          .from('proposal_acceptances')
          .update({ stripe_checkout_session_id: session.id })
          .eq('id', acceptance.id)

        return NextResponse.json({ checkoutUrl: session.url })
      } catch (stripeError) {
        console.error('Stripe error:', stripeError)
        // Fall through to non-Stripe flow
      }
    }

    // No Stripe — send email notification and redirect to success
    const { data: project } = await supabase
      .from('projects')
      .select('name')
      .eq('id', project_id)
      .single()

    const planInfo = selected_maintenance_plan 
      ? `${selected_maintenance_plan.name} ($${selected_maintenance_plan.price}/mo)`
      : 'None selected'

    const servicesHtml = selected_services
      .map((s: any) => `<li>${s.name} — $${s.price.toLocaleString()}</li>`)
      .join('')

    await sendEmail({
      to: 'media@ciarajevans.com',
      subject: `Proposal Accepted — ${client_name}`,
      html: `
        <div style="font-family: sans-serif; max- 600px;">
          <h2 style="color: #1a1a1a;">Proposal Accepted</h2>
          <p><strong>Client:</strong> ${client_name}</p>
          <p><strong>Project:</strong> ${project?.name || project_id}</p>
          <p><strong>Services Selected:</strong></p>
          <ul>${servicesHtml}</ul>
          <p><strong>Maintenance Plan:</strong> ${planInfo}</p>
          <p><strong>Total:</strong> $${totalAmount.toLocaleString()}</p>
          <p><strong>Deposit (${deposit_percentage}%):</strong> $${depositAmount.toLocaleString()}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 1.5rem 0;" />
          <p style="color: #999; font-size: 0.85rem;">
            ⚠️ Stripe is not configured. The client was not charged. Send them an invoice manually.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Proposal accept error:', error)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
}
}

export async function DELETE(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('project_id')
    if (!projectId) {
      return NextResponse.json({ error: 'Missing project_id' }, { status: 400 })
    }
    const supabase = createServiceClient()
    await supabase
      .from('proposal_acceptances')
      .delete()
      .eq('project_id', projectId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete acceptance error:', error)
    return NextResponse.json({ error: 'Failed to delete.' }, { status: 500 })
  }
}
