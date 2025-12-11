export type ServiceType =
  | 'speaking_engagement'
  | 'workshop'
  | 'event_hosting'
  | 'coaching_1on1'
  | 'coaching_cohort'
  | 'website'
  | 'client_portal'
  | 'business_tools'
  | 'brand_consulting'
  | 'creative_direction'

export type InquiryType =
  | 'speaking'
  | 'workshop'
  | 'hosting'
  | 'coaching'
  | 'accelerator'
  | 'website'
  | 'portal'
  | 'tools'
  | 'brand'
  | 'creative'
  | 'organization'

export type ProjectStatus = 'inquiry' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export type ClientType = 'speaking' | 'coaching' | 'branding' | 'mixed'

export interface Project {
  id: string
  user_id: string
  name: string
  description?: string
  status: ProjectStatus
  service_type?: ServiceType
  start_date?: string
  end_date?: string
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  user_id?: string
  name: string
  email: string
  phone?: string
  booking_date: string
  booking_time: string
  inquiry_type: InquiryType
  notes?: string
  google_event_id?: string
  status: BookingStatus
  created_at: string
}

export interface User {
  id: string
  email: string
  name: string
  company?: string
  phone?: string
  role: string
  client_type?: ClientType
  bio?: string
  avatar_url?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

