'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'

type Service = {
  name: string
  price: number
  description?: string
  required?: boolean
}

type MaintenancePlan = {
  name: string
  price: number
  features: string[]
  recommended?: boolean
}

type Props = {
  project: {
    id: string
    name: string
    services: Service[]
    terms: string
    maintenancePlans: MaintenancePlan[]
    depositPercentage: number
  }
  alreadyAccepted: boolean
}

export default function ProposalAcceptClient({ project, alreadyAccepted }: Props) {
  const [selectedServices, setSelectedServices] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {}
    project.services.forEach((s, i) => {
      if (s.required) initial[i] = true
    })
    return initial
  })
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)
  const [clientName, setClientName] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const selectedServicesList = useMemo(() => {
    return project.services.filter((_, i) => selectedServices[i])
  }, [selectedServices, project.services])

  const subtotal = useMemo(() => {
    return selectedServicesList.reduce((sum, s) => sum + s.price, 0)
  }, [selectedServicesList])

  const deposit = Math.round(subtotal * (project.depositPercentage / 100))

  const handleAccept = async () => {
    if (!clientName.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (!agreed) {
      setError('Please agree to the terms to continue.')
      return
    }
    if (selectedServicesList.length === 0) {
      setError('Please select at least one service.')
      return
    }
    if (project.maintenancePlans.length > 0 && selectedPlan === null) {
      setError('Please select a maintenance plan.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/proposals/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: project.id,
          client_name: clientName.trim(),
          selected_services: selectedServicesList,
          selected_plan: selectedPlan !== null ? project.maintenancePlans[selectedPlan] : null,
          deposit_amount: deposit,
          total_amount: subtotal,
        }),
      })
      const data = await res.json()
      if (data.checkout_url) {
        window.location.href = data.checkout_url
      } else {
        setError('Something went wrong. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  if (alreadyAccepted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-lg text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-4 text-2xl">
            ✓
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Proposal Accepted</h2>
          <p className="text-gray-500 mb-6">This proposal has already been accepted and paid. Thank you!</p>
          <Link
            href={`/proposals/${project.id}`}
            className="text-[#81D8D0] hover:underline"
          >
            ← View Proposal
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link
          href={`/proposals/${project.id}`}
          className="text-gray-500 hover:text-gray-900 text-sm flex items-center gap-1"
        >
          ← Back to Proposal
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">{project.name}</h1>
        <div />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Services Section */}
        {project.services.length > 0 && (
          <section>
            <div className="text-center mb-6">
              <p className="text-xs tracking-[0.2em] uppercase text-gray-400 mb-2">Your Investment</p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">Select Your Services</h2>
            </div>
            <div className="space-y-3">
              {project.services.map((service, idx) => (
                <label
                  key={idx}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedServices[idx]
                      ? 'border-[#81D8D0] bg-[#81D8D0]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${service.required ? 'opacity-75' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={!!selectedServices[idx]}
                      disabled={service.required}
                      onChange={(e) => setSelectedServices(prev => ({ ...prev, [idx]: e.target.checked }))}
                      className="w-5 h-5 rounded border-gray-300 text-[#81D8D0] focus:ring-[#81D8D0]"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{service.name}</p>
                      {service.description && <p className="text-sm text-gray-500">{service.description}</p>}
                      {service.required && <p className="text-xs text-[#81D8D0]">Required</p>}
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">${service.price.toLocaleString()}</p>
                </label>
              ))}
            </div>
          </section>
        )}

        {/* Maintenance Plans */}
        {project.maintenancePlans.length > 0 && (
          <section>
            <div className="text-center mb-6">
              <p className="text-xs tracking-[0.2em] uppercase text-gray-400 mb-2">Ongoing Support</p>
              <h2 className="text-2xl font-semibold text-gray-900">Choose a Maintenance Plan</h2>
              <p className="text-sm text-gray-500 mt-1">30 days of post-launch support included. Monthly billing begins after.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {project.maintenancePlans.map((plan, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPlan(idx)}
                  className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                    selectedPlan === idx
                      ? 'border-[#81D8D0] bg-[#81D8D0]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {plan.recommended && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#81D8D0] text-white text-xs font-semibold rounded-full">
                      Recommended
                    </span>
                  )}
                  <p className="font-semibold text-gray-900 mb-1">{plan.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-3">${plan.price}<span className="text-sm font-normal text-gray-400">/mo</span></p>
                  <ul className="space-y-1.5">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-[#81D8D0] mt-0.5">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Terms */}
        {project.terms && (
          <section>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Terms & Conditions</h2>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 prose prose-sm max-w-none text-gray-700 [&_h3]:text-gray-900 [&_h2]:text-gray-900 [&_h1]:text-gray-900" dangerouslySetInnerHTML={{ __html: project.terms }} />
          </section>
        )}

        {/* Summary & Accept */}
        <section className="border-t border-gray-200 pt-8">
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <div className="flex justify-between text-lg font-semibold text-gray-900">
              <span>Total</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Deposit Due Today ({project.depositPercentage}%)</span>
              <span>${deposit.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#81D8D0] focus:border-transparent text-gray-900"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-[#81D8D0] focus:ring-[#81D8D0]"
              />
              <span className="text-sm text-gray-600">
                I agree to the terms and conditions outlined above and authorize the deposit payment.
              </span>
            </label>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              onClick={handleAccept}
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-[#81D8D0] text-white font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? 'Processing...' : `Accept & Pay Deposit ($${deposit.toLocaleString()})`}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
