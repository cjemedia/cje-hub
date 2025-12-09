-- FRESH START: Drop and recreate bookings table (NO DATA PRESERVATION)
-- ⚠️ WARNING: This will DELETE ALL existing bookings
-- Use this ONLY if you have no existing bookings to preserve
-- Run this ENTIRE script in Supabase SQL Editor

-- Step 1: Drop existing table and all dependencies
DROP TABLE IF EXISTS bookings CASCADE;

-- Step 2: Create fresh bookings table
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID, -- Nullable for public bookings, but kept for client hub compatibility
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  inquiry_type TEXT NOT NULL,
  notes TEXT,
  google_event_id TEXT,
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Legacy columns (nullable, for backward compatibility)
  type TEXT,
  date DATE,
  time TIME,
  duration INTEGER DEFAULT 45,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create indexes
CREATE INDEX idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX idx_bookings_email ON bookings(email);
CREATE INDEX idx_bookings_inquiry_type ON bookings(inquiry_type);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_client_id ON bookings(client_id);

-- Step 4: Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies
-- Public can insert (for new booking system)
CREATE POLICY "Allow public inserts" 
    ON bookings FOR INSERT 
    TO anon 
    WITH CHECK (true);

-- Public can select (for viewing their own bookings by email)
CREATE POLICY "Allow public selects" 
    ON bookings FOR SELECT 
    TO anon 
    USING (true);

-- Authenticated clients can view their own bookings (by client_id)
CREATE POLICY "Clients can view own bookings" 
    ON bookings FOR SELECT 
    TO authenticated 
    USING (auth.uid() = client_id);

-- Authenticated clients can create their own bookings
CREATE POLICY "Clients can create own bookings" 
    ON bookings FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = client_id);

-- Authenticated clients can update their own bookings
CREATE POLICY "Clients can update own bookings" 
    ON bookings FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = client_id);

-- Step 6: Verify table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'bookings'
ORDER BY ordinal_position;

