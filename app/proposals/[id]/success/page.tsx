export const dynamic = 'force-dynamic'

import { createServiceClient } from '@/lib/supabase/service'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function ProposalSuccessPage({ 
  params, 
  searchParams 
}: { 
  params: { id: string }
  searchParams: { session_id?: string } 
}) {
  const supabase = createServiceClient()

  const { data: project } = await supabase
    .from('projects')
    .select('id, name, proposal_status')
    .eq('id', params.id)
    .maybeSingle()

  if (!project) {
    notFound()
  }

  // If we have a Stripe session ID, verify and update payment status
  if (searchParams.session_id && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
      const session = await stripe.checkout.sessions.retrieve(searchParams.session_id)

      if (session.payment_status === 'paid') {
        // Update acceptance record
        await supabase
          .from('proposal_acceptances')
          .update({ 
            payment_status: 'paid',
            stripe_checkout_session_id: session.id,
            paid_at: new Date().toISOString(),
          })
          .eq('project_id', params.id)

        // Update project status
        await supabase
          .from('projects')
          .update({ proposal_status: 'accepted' })
          .eq('id', params.id)
      }
    } catch (err) {
      console.error('Stripe verification error:', err)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#ffffff',
      padding: '2rem',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        maxWidth: '500px',
        textAlign: 'center',
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #81D8D0, #5fb3ad)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem',
          fontSize: '2rem',
          color: '#ffffff',
        }}>
          ✓
        </div>

        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: '#1a1a1a',
          marginBottom: '0.75rem',
        }}>
          You're All Set!
        </h1>

        <p style={{
          fontSize: '1.1rem',
          color: '#666',
          lineHeight: 1.7,
          marginBottom: '2rem',
        }}>
          Your proposal has been accepted and your deposit has been received. 
          We're excited to get started on <strong>{project.name}</strong>!
        </p>

        <div style={{
          background: '#f8f8f8',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          textAlign: 'left',
        }}>
          <h3 style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            lettSpacing: '0.15em',
            textTransform: 'uppercase' as const,
            color: '#81D8D0',
            marginBottom: '1rem',
          }}>
            What Happens Next
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span style={{ color: '#81D8D0', fontWeight: 600, minWidth: '20px' }}>1.</span>
              <p style={{ color: '#444', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
                You'll receive a confirmation email with your receipt and next steps.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span style={{ color: '#81D8D0', fontWeight: 600, minWidth: '20px' }}>2.</span>
              <p style={{ color: '#444', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
                You'll get login credentials for your client portal where you can track progress.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span style={{ color: '#81D8D0', fontWeight: 600, minWidth: '20px' }}>3.</span>
              <p style={{ color: '#444', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
                Your project kicks off with the style guide and design direction phase.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' as const }}>
          <Link
            href={`/proposals/${params.id}`}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              color: '#444',
              textDecoration: 'none',
              fontSize: '0.9rem',
            }}
          >
            View Proposal
          </Link>
          
            href="mailto:media@ciarajevans.com"
            style={{
              padding: '0.75rem 1.5rem',
              background: '#81D8D0',
              borderRadius: '8px',
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            Contact Us
          </a>
        </div>

        <p style={{
          marginTop: '2rem',
          fontSize: '0.8rem',
          color: '#999',
        }}>
          Questions? Reach us at media@ciarajevans.com
        </p>
      </div>
    </div>
  )
}
