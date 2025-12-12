-- Update all existing event slugs based on their current titles
-- This will regenerate slugs for all events, ensuring they match the current title

-- First, create a function to generate a slug from a title (matching the JavaScript logic)
CREATE OR REPLACE FUNCTION generate_slug_from_title(title_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          TRIM(title_text),
          '[^a-zA-Z0-9\s-]', '', 'g'
        ),
        '[\s_-]+', '-', 'g'
      ),
      '^-+|-+$', '', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Regenerate all slugs from titles
-- This will update ALL events, not just ones with NULL slugs
DO $$
DECLARE
  event_record RECORD;
  base_slug TEXT;
  new_slug TEXT;
  counter INTEGER;
  all_slugs TEXT[];
BEGIN
  -- First, collect all current slugs to check for conflicts
  SELECT ARRAY_AGG(slug) INTO all_slugs
  FROM events
  WHERE slug IS NOT NULL;
  
  -- Process each event
  FOR event_record IN 
    SELECT id, title, slug
    FROM events
    ORDER BY created_at
  LOOP
    -- Generate base slug from title
    base_slug := generate_slug_from_title(event_record.title);
    
    -- If the generated slug is the same as current, skip
    IF base_slug = event_record.slug THEN
      CONTINUE;
    END IF;
    
    -- Start with base slug
    new_slug := base_slug;
    counter := 1;
    
    -- Check for uniqueness (excluding current event's slug)
    WHILE EXISTS (
      SELECT 1 FROM events 
      WHERE slug = new_slug 
      AND id != event_record.id
    ) LOOP
      new_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
    
    -- Update the slug
    UPDATE events 
    SET slug = new_slug 
    WHERE id = event_record.id;
    
    RAISE NOTICE 'Updated event %: "%" -> "%"', event_record.id, event_record.slug, new_slug;
  END LOOP;
END $$;

-- Optional: Drop the temporary function if you don't want to keep it
-- DROP FUNCTION IF EXISTS generate_slug_from_title(TEXT);

