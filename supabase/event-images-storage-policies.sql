-- Storage Bucket Policies for event-images
-- Run this in Supabase SQL Editor after creating the 'event-images' bucket

-- Policy: Allow authenticated users to upload event images
DROP POLICY IF EXISTS "Users can upload event images" ON storage.objects;
CREATE POLICY "Users can upload event images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-images'
);

-- Policy: Allow authenticated users to update their own event images
DROP POLICY IF EXISTS "Users can update own event images" ON storage.objects;
CREATE POLICY "Users can update own event images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'event-images' AND
  (storage.foldername(name))[1] = 'event-images' OR
  split_part(name, '-', 1) = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'event-images' AND
  (storage.foldername(name))[1] = 'event-images' OR
  split_part(name, '-', 1) = auth.uid()::text
);

-- Policy: Allow authenticated users to delete their own event images
DROP POLICY IF EXISTS "Users can delete own event images" ON storage.objects;
CREATE POLICY "Users can delete own event images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'event-images' AND
  split_part(name, '-', 1) = auth.uid()::text
);

-- Policy: Allow public read access to event images (so they can be displayed)
DROP POLICY IF EXISTS "Public can view event images" ON storage.objects;
CREATE POLICY "Public can view event images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-images');

