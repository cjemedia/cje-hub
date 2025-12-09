-- Remove the check constraint on the bookings.type column
-- This allows the legacy type column to accept any value
-- while the new inquiry_type column stores the actual inquiry type

-- First, find the constraint name
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'bookings'::regclass
  AND contype = 'c'
  AND pg_get_constraintdef(oid) LIKE '%type%';

-- Drop the constraint (replace 'bookings_type_check' with the actual constraint name from above)
-- If the constraint name is different, update this line
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_type_check;

-- Verify the constraint is removed
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'bookings'::regclass
  AND contype = 'c'
  AND pg_get_constraintdef(oid) LIKE '%type%';

