-- ============================================================
-- Marketing Inquiries — CJE Airbnb Marketing Portal
-- Run this in Supabase SQL Editor before deploying.
--
-- This migration is idempotent: safe to re-run.
-- ============================================================

-- 1. TABLE -----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.marketing_inquiries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  -- Client info
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  social_handles text,

  -- Property info
  property_location text NOT NULL,
  airbnb_link text,

  -- Content direction
  ideal_guest text[] DEFAULT '{}',
  highlights text,
  special_features text,
  vibe text[] DEFAULT '{}',
  music_preference text,

  -- Filming logistics
  preferred_start_date date,
  availability text,
  access_method text,
  other_notes text,

  -- Status workflow
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'payment_sent', 'paid', 'completed', 'archived')),

  -- Payment tracking
  payment_amount numeric,
  stripe_payment_link_id text,
  stripe_payment_link_url text,
  stripe_price_id text,
  payment_sent_at timestamp with time zone,
  paid_at timestamp with time zone,
  completed_at timestamp with time zone,

  CONSTRAINT marketing_inquiries_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_marketing_inquiries_status
  ON public.marketing_inquiries(status);

CREATE INDEX IF NOT EXISTS idx_marketing_inquiries_created
  ON public.marketing_inquiries(created_at DESC);


-- 2. ROW LEVEL SECURITY ---------------------------------------

-- Enable RLS. Note: service role (used by API routes) bypasses RLS automatically,
-- so the public form submission, send-payment, and mark-paid routes work regardless.
-- Policies below are for AUTHENTICATED browser-side access (Ciara's admin pages).

ALTER TABLE public.marketing_inquiries ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies so this script can be re-run safely
DROP POLICY IF EXISTS "Admins have full access to marketing inquiries"
  ON public.marketing_inquiries;

-- Admin = authenticated user whose row in public.users has role='admin'.
-- This single FOR ALL policy covers SELECT, INSERT, UPDATE, DELETE.
CREATE POLICY "Admins have full access to marketing inquiries"
  ON public.marketing_inquiries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- Note: no 'anon' or 'authenticated client' policies exist by design.
-- - Public website visitors never touch this table directly. They POST to
--   /api/marketing-inquiries, which uses the service role key.
-- - Authenticated client users (role='client') have NO access to this table.
--   These are Ciara's marketing leads, not portal clients.
