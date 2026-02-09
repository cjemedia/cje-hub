import { createServiceClient } from '@/lib/supabase/service'

export default async function ProposalSuccess({ params, searchParams }: { params: { id: string }, searchParams: { session_id?: string } }) {
  const supabase = createServiceClient()

  const { data: project } = await supabase
    .from('projects')
    .select('name')
    .eq('id', params.id)
    .maybeSingle()

  // If there's a session_id, Stripe webhook will handle updating payment status
  // This page just shows the thank you message

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
      padding: '2rem',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ maxWidth: '500px', textAlign: 'center' }}>
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'rgba(129, 216, 208, 0.15)',
          border: '2px solid rgba(129, 216, 208, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          fontSize: '1.8rem',
          color: '#81D8D0',
        }}>
          ✓
        </div>
        <h1 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          Thank You!
        </h1>
        <p style={{ color: '#a1a1a1', lineHeight: 1.7, fontSize: '1rem', marginBottom: '1.5rem' }}>
          Your proposal has been accepted and your deposit has been received. We will be in touch within the next business day to get started.
        </p>
        <p style={{ color: '#555', fontSize: '0.85rem' }}>
          Questions? Reach out at{' '}
          <a href="mailto:media@ciarajevans.com" style={{ color: '#81D8D0', textDecoration: 'none' }}>
            media@ciarajevans.com
          </a>
        </p>
        <div style={{ marginTop: '3rem', color: '#333', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
          ✦ The CJE Experience ✦
        </div>
      </div>
    </div>
  )
}
