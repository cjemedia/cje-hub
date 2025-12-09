-- Final migration steps to make bookings table fully compatible
-- Run these in Supabase SQL Editor

-- Step 1: Make client_id nullable (public bookings don't have client_id)
ALTER TABLE bookings ALTER COLUMN client_id DROP NOT NULL;

-- Step 2: Make legacy columns nullable (they'll be populated for backward compatibility)
-- but allow nulls for new public bookings that only use new columns
ALTER TABLE bookings ALTER COLUMN type DROP NOT NULL;
ALTER TABLE bookings ALTER COLUMN date DROP NOT NULL;
ALTER TABLE bookings ALTER COLUMN time DROP NOT NULL;
ALTER TABLE bookings ALTER COLUMN duration DROP NOT NULL;

-- Step 3: Set default duration for new bookings
ALTER TABLE bookings ALTER COLUMN duration SET DEFAULT 30;

-- Verify all changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'bookings'
ORDER BY ordinal_position;

