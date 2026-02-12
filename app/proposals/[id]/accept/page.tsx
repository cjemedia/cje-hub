export const dynamic = 'force-dynamic'

import { createServiceClient } from '@/lib/supabase/service'
import { notFound } from 'next/navigation'
import ProposalAcceptClient from './ProposalAcceptClient'

export default async function AcceptPage({ params }: { params: { id: string } }) {
  const supabase = createServiceClient()
  
  const { data: project } = await supabase
    .from('projects')
    .select('id, name, proposal_html, proposal_services, proposal_terms, proposal_maintenance_plans, proposal_expires_at, proposal_status, deposit_percentage')
    .eq('id', params.id)
    .maybeSingle()

  if (!project || !project.proposal_html) {
    notFound()
  }

  const isExpired = project.proposal_expires_at && new Date(project.proposal_expires_at) < new Date()
  if (isExpired) {
    notFound()
  }

  const { data: acceptance } = await supabase
    .from('proposal_acceptances')
    .select('*')
    .eq('project_id', params.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const alreadyAccepted = acceptance?.payment_status === 'paid'

  return (
    <ProposalAcceptClient
      project={{
        id: project.id,
        name: project.name,
        services: project.proposal_services || [],
        terms: project.proposal_terms || '',
        maintenancePlans: project.proposal_maintenance_plans || [],
        depositPercentage: project.deposit_percentage || 50,
      }}
      alreadyAccepted={alreadyAccepted}
    />
  )
}
