export interface Service {
  id: string
  title: string
  description: string
  category: 'experiences' | 'media' | 'custom'
  price?: string
  features?: string[]
}

export interface Client {
  id: string
  email: string
  name: string
  company?: string
  created_at: string
}

export interface Project {
  id: string
  client_id: string
  name: string
  status: 'active' | 'completed' | 'on-hold'
  deliverables?: any[]
  created_at: string
}

export interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  price?: number
  capacity?: number
  rsvp_count?: number
}

export interface Booking {
  id: string
  client_id: string
  type: 'meeting' | 'content-shoot'
  date: string
  time: string
  duration: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
}

