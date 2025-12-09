-- Fix RLS policy to allow public bookings
-- This allows the booking API to insert bookings without authentication

-- First, check if there's an existing policy
-- Then create or replace the policy to allow INSERT for public bookings

-- Drop existing policy if it exists (adjust name if different)
DROP POLICY IF EXISTS "Allow public bookings" ON bookings;
DROP POLICY IF EXISTS "Enable insert for public bookings" ON bookings;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON bookings;

-- Create a policy that allows INSERT for anyone (public bookings)
CREATE POLICY "Enable insert for public bookings"
ON bookings
FOR INSERT
TO public
WITH CHECK (true);

-- Also allow SELECT for authenticated users (so admins can view bookings)
-- This assumes you have an authenticated admin role
CREATE POLICY "Enable select for authenticated users"
ON bookings
FOR SELECT
TO authenticated
USING (true);

-- If you want to allow public to read their own bookings by email, use this instead:
-- CREATE POLICY "Enable select for own bookings"
-- ON bookings
-- FOR SELECT
-- TO public
-- USING (true); -- Or add email check: USING (email = current_setting('request.jwt.claims', true)::json->>'email')

