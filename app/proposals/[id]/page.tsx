export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

import { createServiceClient } from '@/lib/supabase/service'
import { notFound } from 'next/navigation'

export default async function ProposalPage({ params }: { params: { id: string } }) {
  const supabase = createServiceClient()
  
  const { data: project, error } = await supabase
    .from('projects')
    .select('id, proposal_html, proposal_expires_at, proposal_status, proposal_viewed_at')
    .eq('id', params.id)
    .maybeSingle()

  if (!project || !project.proposal_html) {
    notFound()
  }

  const isExpired = project.proposal_expires_at && new Date(project.proposal_expires_at) < new Date()

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

  // Update the Accept Proposal nav link to point to /accept page
  let html = project.proposal_html
  html = html.replace(
    /href="#accept"[^>]*onclick="[^"]*"/gi,
    `href="/proposals/${params.id}/accept"`
  )
  // Also update any remaining #accept links
  html = html.replace(
    /href="#accept"/gi,
    `href="/proposals/${params.id}/accept"`
  )

  return (
    <div dangerouslySetInnerHTML={{ __html: html }} />
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
          \u2726
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
