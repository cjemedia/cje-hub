-- Fix RLS policy to allow users to update their own events regardless of status
-- The previous policy only allowed updates when status = 'pending', which prevented
-- users from editing approved events (even though we want to set them back to pending)

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can update own pending events" ON events;

-- Create new policy that allows users to update their own events regardless of status
CREATE POLICY "Users can update own events"
  ON events FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- This allows users to edit their own events whether they're pending, approved, or rejected
-- The application logic handles setting status back to 'pending' when needed

