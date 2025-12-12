-- Add slug column to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);

-- Generate slugs for existing events
-- This will create slugs from existing titles
UPDATE events
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  )
)
WHERE slug IS NULL;

-- Make slug unique (add constraint)
-- First, handle any duplicates by appending numbers
DO $$
DECLARE
  event_record RECORD;
  base_slug TEXT;
  new_slug TEXT;
  counter INTEGER;
BEGIN
  FOR event_record IN 
    SELECT id, slug, title 
    FROM events 
    WHERE slug IS NOT NULL
    ORDER BY created_at
  LOOP
    base_slug := event_record.slug;
    new_slug := base_slug;
    counter := 1;
    
    -- Check if slug already exists for another event
    WHILE EXISTS (
      SELECT 1 FROM events 
      WHERE slug = new_slug AND id != event_record.id
    ) LOOP
      new_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
    
    -- Update if slug changed
    IF new_slug != event_record.slug THEN
      UPDATE events SET slug = new_slug WHERE id = event_record.id;
    END IF;
  END LOOP;
END $$;

-- Add unique constraint on slug
ALTER TABLE events
ADD CONSTRAINT events_slug_unique UNIQUE (slug);

