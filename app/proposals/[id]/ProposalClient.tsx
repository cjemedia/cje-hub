'use client'

import { useState, useMemo } from 'react'

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
    proposalHtml: string
    services: Service[]
    terms: string
    maintenancePlans: MaintenancePlan[]
    depositPercentage: number
  }
  alreadyAccepted: boolean
}

export default function ProposalClient({ project, alreadyAccepted }: Props) {
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

  const depositAmount = useMemo(() => {
    return Math.round(subtotal * (project.depositPercentage / 100) * 100) / 100
  }, [subtotal, project.depositPercentage])

  const toggleService = (index: number) => {
    if (project.services[index].required) return
    setSelectedServices(prev => ({ ...prev, [index]: !prev[index] }))
  }

  const handleAccept = async () => {
    if (!clientName.trim()) {
      setError('Please type your full name to accept.')
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
          selected_maintenance_plan: selectedPlan !== null ? project.maintenancePlans[selectedPlan] : null,
          deposit_percentage: project.depositPercentage,
        }),
      })

      const data = await res.json()

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else if (data.success) {
        window.location.href = `/proposals/${project.id}/success`
      } else {
        setError(data.error || 'Something went wrong. Please try again.')
        setSubmitting(false)
      }
    } catch (err) {
      setError('Something went wrong. Please email media@ciarajevans.com directly.')
      setSubmitting(false)
    }
  }

  if (alreadyAccepted) {
    return (
      <div className="min-h-screen bg-white">
        <div dangerouslySetInnerHTML={{ __html: project.proposalHtml }} />
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-4 text-2xl">
            ✓
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Proposal Accepted</h2>
          <p className="text-gray-500">This proposal has already been accepted and paid. Thank you!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Render the custom HTML proposal */}
      <div dangerouslySetInnerHTML={{ __html: project.proposalHtml }} />

      {/* Hub-generated interactive section */}
      <div className="proposal-interactive" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        
        {/* Services Section */}
        {project.services.length > 0 && (
          <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <div className="text-center mb-8 sm:mb-10">
              <p className="text-xs sm:text-sm tracking-[0.2em] uppercase text-gray-400 mb-2">Your Investment</p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">Select Your Services</h2>
            </div>

            <div className="space-y-3">
              {project.services.map((service, i) => {
                const isSelected = selectedServices[i]
                return (
                  <button
                    key={i}
                    onClick={() => toggleService(i)}
                    disabled={service.required}
                    className={`w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    } ${service.required ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm sm:text-base">{service.name}</p>
                          {service.description && (
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{service.description}</p>
                          )}
                          {service.required && (
                            <span className="text-xs text-gray-400 mt-1 inline-block">Required</span>
                          )}
                        </div>
                      </div>
                      <p className="text-base sm:text-lg font-semibold text-gray-900 flex-shrink-0">${service.price.toLocaleString()}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Live Summary */}
            <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="space-y-2 text-sm sm:text-base">
                {selectedServicesList.map((s, i) => (
                  <div key={i} className="flex justify-between text-gray-600">
                    <span>{s.name}</span>
                    <span>${s.price.toLocaleString()}</span>
                  </div>
                ))}
                {selectedServicesList.length === 0 && (
                  <p className="text-gray-400 text-center py-2">Select services above</p>
                )}
              </div>
              {selectedServicesList.length > 0 && (
                <>
                  <div className="border-t border-gray-200 mt-4 pt-4">
                    <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                      <span>Subtotal</span>
                      <span>${subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-900 font-semibold mt-2 text-base sm:text-lg">
                      <span>Deposit ({project.depositPercentage}%)</span>
                      <span>${depositAmount.toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    Remaining balance of ${(subtotal - depositAmount).toLocaleString()} due upon project completion.
                  </p>
                </>
              )}
            </div>
          </section>
        )}

        {/* Maintenance Plans */}
        {project.maintenancePlans.length > 0 && (
          <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 border-t border-gray-100">
            <div className="text-center mb-8 sm:mb-10">
              <p className="text-xs sm:text-sm tracking-[0.2em] uppercase text-gray-400 mb-2">Post-Launch</p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">Maintenance Plans</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {project.maintenancePlans.map((plan, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedPlan(i)}
                  className={`text-left p-4 sm:p-5 rounded-xl border-2 transition-all relative ${
                    selectedPlan === i
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  {plan.recommended && (
                    <span className="absolute -top-3 left-4 bg-gray-900 text-white text-xs px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  )}
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">{plan.name}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 my-2">${plan.price}<span className="text-sm font-normal text-gray-400">/mo</span></p>
                  <ul className="space-y-1.5 mt-3">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                        <span className="text-gray-400 mt-0.5 flex-shrink-0">✦</span>
                        <span>{f}</span>
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
          <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 border-t border-gray-100">
            <div className="text-center mb-8 sm:mb-10">
              <p className="text-xs sm:text-sm tracking-[0.2em] uppercase text-gray-400 mb-2">Agreement</p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">Terms & Conditions</h2>
            </div>
            <div 
              className="prose prose-sm sm:prose-base max-w-none text-gray-600 bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200 max-h-[4px] sm:max-h-[500px] overflow-y-auto"
              style={{ lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: project.terms }}
            />
          </section>
        )}

        {/* Acceptance */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 border-t border-gray-100">
          <div className="text-center mb-8 sm:mb-10">
            <p className="text-xs sm:text-sm tracking-[0.2em] uppercase text-gray-400 mb-2">Accept</p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">Ready to Get Started?</h2>
          </div>

          <div className="max-w-md mx-auto space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Type your full name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 text-base sm:text-lg focus:outline-none focus:border-gray-900 transition-colors"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              />
              <span className="text-sm text-gray-600 leading-relaxed">
                I have read and agree to the terms of this agreement
              </span>
            </label>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={handleAccept}
              disabled={submitting || !clientName.trim() || !agreed}
              className="w-full py-3 sm:py-4 rounded-xl text-white font-semibold text-sm sm:text-base tracking-wider uppercase transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ 
                background: submitting ? '#666' : '#1a1a1a',
                letterSpacing: '0.15em',
              }}
            >
              {submitting ? 'Processing...' : `Accept & Pay $${depositAmount.toLocaleString()} Deposit`}
            </button>

            <p className="text-xs text-gray-400 text-center">
              You will be redirected to a secure payment page to complete your deposit.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 sm:py-12 border-t border-gray-100">
          <p className="text-xs text-gray-400 tracking-wider">
            ✦ The CJE Experience ✦ CJE Media Tech Solutions
          </p>
        </footer>
      </div>
    </div>
  )
}
