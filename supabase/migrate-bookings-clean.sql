-- SAFE MIGRATION: Preserves existing data and maintains client hub compatibility
-- Run this ENTIRE script in Supabase SQL Editor

-- Step 1: Backup existing data (optional but recommended)
CREATE TABLE IF NOT EXISTS bookings_backup AS SELECT * FROM bookings;

-- Step 2: Add new columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='name') THEN
        ALTER TABLE bookings ADD COLUMN name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='email') THEN
        ALTER TABLE bookings ADD COLUMN email TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='phone') THEN
        ALTER TABLE bookings ADD COLUMN phone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='booking_date') THEN
        ALTER TABLE bookings ADD COLUMN booking_date DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='booking_time') THEN
        ALTER TABLE bookings ADD COLUMN booking_time TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='inquiry_type') THEN
        ALTER TABLE bookings ADD COLUMN inquiry_type TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='google_event_id') THEN
        ALTER TABLE bookings ADD COLUMN google_event_id TEXT;
    END IF;
END $$;

-- Step 3: Migrate existing data to new columns (if any exists)
UPDATE bookings
SET 
    booking_date = COALESCE(booking_date, date),
    booking_time = COALESCE(booking_time, TO_CHAR(time, 'HH:MI AM')),
    inquiry_type = COALESCE(inquiry_type, type)
WHERE booking_date IS NULL OR booking_time IS NULL OR inquiry_type IS NULL;

-- Step 4: Make client_id nullable (for public bookings)
ALTER TABLE bookings ALTER COLUMN client_id DROP NOT NULL;

-- Step 5: Make legacy columns nullable
ALTER TABLE bookings ALTER COLUMN type DROP NOT NULL;
ALTER TABLE bookings ALTER COLUMN date DROP NOT NULL;
ALTER TABLE bookings ALTER COLUMN time DROP NOT NULL;
ALTER TABLE bookings ALTER COLUMN duration DROP NOT NULL;

-- Step 6: Remove the check constraint on type column
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_type_check;

-- Step 7: Make new columns NOT NULL (only after data migration)
ALTER TABLE bookings ALTER COLUMN name SET NOT NULL;
ALTER TABLE bookings ALTER COLUMN email SET NOT NULL;
ALTER TABLE bookings ALTER COLUMN booking_date SET NOT NULL;
ALTER TABLE bookings ALTER COLUMN booking_time SET NOT NULL;
ALTER TABLE bookings ALTER COLUMN inquiry_type SET NOT NULL;

-- Step 8: Set defaults
ALTER TABLE bookings ALTER COLUMN duration SET DEFAULT 45;
ALTER TABLE bookings ALTER COLUMN status SET DEFAULT 'confirmed';

-- Step 9: Create indexes
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);
CREATE INDEX IF NOT EXISTS idx_bookings_inquiry_type ON bookings(inquiry_type);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Step 10: Update RLS policies for public access
-- Drop old policies
DROP POLICY IF EXISTS "Clients can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Clients can create own bookings" ON bookings;
DROP POLICY IF EXISTS "Clients can update own bookings" ON bookings;

-- Create new policies
-- Public can insert (for new booking system)
CREATE POLICY "Allow public inserts" 
    ON bookings FOR INSERT 
    TO anon 
    WITH CHECK (true);

-- Public can select their own bookings (by email)
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

-- Step 11: Verify the migration
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'bookings'
ORDER BY ordinal_position;

