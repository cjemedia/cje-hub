import { createServiceClient } from '@/lib/supabase/service'
import { notFound } from 'next/navigation'
import ProposalClient from './ProposalClient'

export default async function ProposalPage({ params }: { params: { id: string } }) {
  const supabase = createServiceClient()
  
  const { data: project, error } = await supabase
    .from('projects')
    .select('id, name, proposal_html, proposal_services, proposal_terms, proposal_maintenance_plans, proposal_expires_at, proposal_status, deposit_percentage, proposal_viewed_at')
    .eq('id', params.id)
    .maybeSingle()

  if (!project || !project.proposal_html) {
    notFound()
  }

  // Check expiration
  const isExpired = project.proposal_expires_at && new Date(project.proposal_expires_at) < new Date()

  // Track view (only if status is 'sent')
  if (project.proposal_status === 'sent' && !isExpired) {
    await supabase
      .from('projects')
      .update({ 
        proposal_viewed_at: new Date().toISOString(),
        proposal_status: 'viewed'
      })
      .eq('id', params.id)
  }

  if (isExpired) {
    return <ExpiredProposal />
  }

  // Check if already accepted
  const { data: acceptance } = await supabase
    .from('proposal_acceptances')
    .select('*')
    .eq('project_id', params.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const alreadyAccepted = acceptance?.payment_status === 'paid'

  return (
    <ProposalClient
      project={{
        id: project.id,
        name: project.name,
        proposalHtml: project.proposal_html,
        services: project.proposal_services || [],
        terms: project.proposal_terms || '',
        maintenancePlans: project.proposal_maintenance_plans || [],
        depositPercentage: project.deposit_percentage || 50,
      }}
      alreadyAccepted={alreadyAccepted}
    />
  )
}

function ExpiredProposal() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: '500px',
        textAlign: 'center',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'rgba(129, 216, 208, 0.1)',
          border: '2px solid rgba(129, 216, 208, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          fontSize: '1.5rem',
        }}>
          ✦
        </div>
        <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
          This proposal has expired
        </h1>
        <p style={{ color: '#a1a1a1', lineHeight: 1.6 }}>
          Please contact <a href="mailto:media@ciarajevans.com" style={{ color: '#81D8D0' }}>media@ciarajevans.com</a> to request an updated proposal.
        </p>
      </div>
    </div>
  )
}
