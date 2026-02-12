export const dynamic = 'force-dynamic'

import { createServiceClient } from '@/lib/supabase/service'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface PageProps {
  params: { id: string }
  searchParams: { session_id?: string }
}

export default async function ProposalSuccessPage({ params, searchParams }: PageProps) {
  const supabase = createServiceClient()

  const { data: project } = await supabase
    .from('projects')
    .select('id, name, proposal_status')
    .eq('id', params.id)
    .maybeSingle()

  if (!project) {
    notFound()
  }

  if (searchParams.session_id && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
      const session = await stripe.checkout.sessions.retrieve(searchParams.session_id)

      if (session.payment_status === 'paid') {
        await supabase
          .from('proposal_acceptances')
          .update({ 
            payment_status: 'paid',
            stripe_checkout_session_id: session.id,
            paid_at: new Date().toISOString(),
          })
          .eq('project_id', params.id)

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
    <div className="min-h-screen flex items-center justify-center bg-white p-8">
      <div className="max-w-md text-center">
        <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#81D8D0] to-[#5fb3ad] flex items-center justify-center mx-auto mb-8 text-3xl text-white">
          ✓
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          You&apos;re All Set!
        </h1>

        <p className="text-lg text-gray-500 leading-relaxed mb-8">
          Your proposal has been accepted and your deposit has been received. 
          We&apos;re excited to get started on <strong className="text-gray-900">{project.name}</strong>!
        </p>

        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
          <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#81D8D0] mb-4">
            What Happens Next
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <span className="text-[#81D8D0] font-semibold min-w-[20px]">1.</span>
              <p className="text-gray-600 text-sm leading-relaxed m-0">
                You&apos;ll receive a confirmation email with your receipt and next steps.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-[#81D8D0] font-semibold min-w-[20px]">2.</span>
              <p className="text-gray-600 text-sm leading-relaxed m-0">
                You&apos;ll get login credentials for your client portal where you can track progress.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-[#81D8D0] font-semibold min-w-[20px]">3.</span>
              <p className="text-gray-600 text-sm leading-relaxed m-0">
                Your project kicks off with the style guide and design direction phase.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href={"/proposals/" + params.id}
            className="px-6 py-3 border border-gray-200 rounded-lg text-gray-500 text-sm hover:border-gray-300 transition-colors no-underline"
          >
            View Proposal
          </Link>
          
          <a
            href="mailto:media@ciarajevans.com"
            className="px-6 py-3 bg-[#81D8D0] rounded-lg text-white text-sm font-semibold hover:bg-[#5fb3ad] transition-colors no-underline"
          >
            Contact Us
          </a>
        </div>

        <p className="mt-8 text-xs text-gray-400">
          Questions? Reach us at media@ciarajevans.com
        </p>
      </div>
    </div>
  )
}
