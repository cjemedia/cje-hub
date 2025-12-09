-- FRESH INSTALL: Create bookings table (drops existing if any)
-- Use this if you want to start completely fresh
-- Run this ENTIRE script in Supabase SQL Editor

-- Drop existing table if it exists
DROP TABLE IF EXISTS bookings CASCADE;

-- Create bookings table
CREATE TABLE bookings (
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

-- Create indexes for faster queries
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_email ON bookings(email);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Verify table was created
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;

