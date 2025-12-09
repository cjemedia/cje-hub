-- Migration script for existing bookings table
-- This adds the new columns needed for the public booking system
-- Run this in Supabase SQL Editor

-- Add new columns if they don't exist
DO $$
BEGIN
  -- Add name column (for public bookings without client_id)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'bookings' 
                 AND column_name = 'name') THEN
    ALTER TABLE bookings ADD COLUMN name TEXT;
  END IF;

  -- Add email column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'bookings' 
                 AND column_name = 'email') THEN
    ALTER TABLE bookings ADD COLUMN email TEXT;
  END IF;

  -- Add phone column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'bookings' 
                 AND column_name = 'phone') THEN
    ALTER TABLE bookings ADD COLUMN phone TEXT;
  END IF;

  -- Add booking_date column (alias for date, or keep both)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'bookings' 
                 AND column_name = 'booking_date') THEN
    ALTER TABLE bookings ADD COLUMN booking_date DATE;
    -- Copy existing date values
    UPDATE bookings SET booking_date = date WHERE booking_date IS NULL;
  END IF;

  -- Add booking_time column (text format for display)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'bookings' 
                 AND column_name = 'booking_time') THEN
    ALTER TABLE bookings ADD COLUMN booking_time TEXT;
    -- Convert existing time to text format
    UPDATE bookings SET booking_time = time::text WHERE booking_time IS NULL;
  END IF;

  -- Add inquiry_type column (alias for type, or keep both)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'bookings' 
                 AND column_name = 'inquiry_type') THEN
    ALTER TABLE bookings ADD COLUMN inquiry_type TEXT;
    -- Copy existing type values
    UPDATE bookings SET inquiry_type = type WHERE inquiry_type IS NULL;
  END IF;

  -- Add google_event_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'bookings' 
                 AND column_name = 'google_event_id') THEN
    ALTER TABLE bookings ADD COLUMN google_event_id TEXT;
  END IF;

  -- Update status default if needed
  -- (Keep existing status column, just ensure it can handle 'confirmed')
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Verify the migration
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'bookings'
ORDER BY ordinal_position;

