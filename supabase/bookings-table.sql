-- Create bookings table for custom booking system
-- Run this ENTIRE script in Supabase SQL Editor (select all and run)

-- Drop table if it exists (use this only if you want to start fresh)
-- DROP TABLE IF EXISTS bookings CASCADE;

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  inquiry_type TEXT NOT NULL,
  notes TEXT,
  google_event_id TEXT,
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bookings') THEN
    CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
    CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
  END IF;
END $$;

-- Add RLS (Row Level Security) policies if needed
-- ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to insert bookings (for public booking form)
-- CREATE POLICY "Allow public booking inserts" ON bookings
--   FOR INSERT
--   TO anon
--   WITH CHECK (true);

-- Policy to allow authenticated users to view all bookings
-- CREATE POLICY "Allow authenticated users to view bookings" ON bookings
--   FOR SELECT
--   TO authenticated
--   USING (true);

