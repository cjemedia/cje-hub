-- Fix client_id to be nullable for public bookings
-- Run this in Supabase SQL Editor

-- Make client_id nullable (public bookings don't have a client_id)
ALTER TABLE bookings ALTER COLUMN client_id DROP NOT NULL;

-- Verify the change
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'bookings'
  AND column_name = 'client_id';

