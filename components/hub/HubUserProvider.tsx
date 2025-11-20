'use client'

import { createContext, useContext } from 'react'

type HubUser = {
  id: string
  email?: string | null
  name?: string | null
}

type HubUserContextValue = {
  user: HubUser | null
  role: 'client' | 'admin'
}

const HubUserContext = createContext<HubUserContextValue | null>(null)

export function HubUserProvider({
  value,
  children,
}: {
  value: HubUserContextValue
  children: React.ReactNode
}) {
  return <HubUserContext.Provider value={value}>{children}</HubUserContext.Provider>
}

export function useHubUser() {
  const context = useContext(HubUserContext)
  if (!context) {
    throw new Error('useHubUser must be used within a HubUserProvider')
  }
  return context
}

