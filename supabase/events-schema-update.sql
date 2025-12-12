-- Add status, user_id, and rejection_reason to events table
-- Run this in Supabase SQL Editor

-- Add new columns
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_date_status ON events(date, status);

-- Update RLS policies
-- Allow users to see their own events
DROP POLICY IF EXISTS "Users can view own events" ON events;
CREATE POLICY "Users can view own events"
  ON events FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to create their own events
DROP POLICY IF EXISTS "Users can create own events" ON events;
CREATE POLICY "Users can create own events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own events (regardless of status)
-- This allows editing approved events and setting them back to pending
DROP POLICY IF EXISTS "Users can update own pending events" ON events;
DROP POLICY IF EXISTS "Users can update own events" ON events;
CREATE POLICY "Users can update own events"
  ON events FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Public can view approved events
DROP POLICY IF EXISTS "Public can view approved events" ON events;
CREATE POLICY "Public can view approved events"
  ON events FOR SELECT
  USING (status = 'approved');

-- Keep existing policy for backwards compatibility (admin access)
-- Admins can view all events via service role client in API routes

