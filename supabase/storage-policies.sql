-- Storage Bucket Policies for avatars
-- Run this in Supabase SQL Editor after creating the 'avatars' bucket

-- Policy: Allow authenticated users to upload their own avatars
-- Files are named: avatars/{user_id}-{timestamp}.{ext}
-- Check if the full path starts with 'avatars/' followed by the user's UUID and a dash
DROP POLICY IF EXISTS "Users can upload own avatars" ON storage.objects;
CREATE POLICY "Users can upload own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  name LIKE ('avatars/' || auth.uid()::text || '-%')
);

-- Policy: Allow authenticated users to update their own avatars
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  name LIKE ('avatars/' || auth.uid()::text || '-%')
)
WITH CHECK (
  bucket_id = 'avatars' AND
  name LIKE ('avatars/' || auth.uid()::text || '-%')
);

-- Policy: Allow authenticated users to delete their own avatars
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  name LIKE ('avatars/' || auth.uid()::text || '-%')
);

-- Policy: Allow public read access to avatars (so profile photos can be displayed)
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

