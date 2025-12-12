-- Update events table to support end time, multiple images, and ticket link
-- Run this in Supabase SQL Editor after running events-schema-update.sql

-- Add end_time column
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS end_time TIME;

-- Add ticket_link column
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS ticket_link TEXT;

-- Change image_url to image_urls (JSONB array to store multiple image URLs)
-- First, create a new column
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '[]'::jsonb;

-- Migrate existing image_url data to image_urls array
UPDATE events 
SET image_urls = CASE 
  WHEN image_url IS NOT NULL AND image_url != '' THEN jsonb_build_array(image_url)
  ELSE '[]'::jsonb
END
WHERE image_urls = '[]'::jsonb OR image_urls IS NULL;

-- Note: Keep image_url column for backwards compatibility, but prefer image_urls going forward
-- You can drop image_url later if desired:
-- ALTER TABLE events DROP COLUMN IF EXISTS image_url;

-- Create storage bucket for event images if it doesn't exist
-- Note: You'll need to create the bucket manually in Supabase Dashboard:
-- 1. Go to Storage
-- 2. Create bucket named "event-images"
-- 3. Make it public or set up appropriate RLS policies

