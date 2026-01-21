-- Create storage policies for the media bucket

-- Allow anyone to view files from the public media bucket
CREATE POLICY "Public can view media files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'media');

-- Allow authenticated users to upload files to the media bucket
CREATE POLICY "Authenticated users can upload media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'media' AND auth.uid()::text = owner_id::text)
WITH CHECK (bucket_id = 'media');

-- Allow authenticated users to delete their own files or admins/editors can delete any
CREATE POLICY "Users can delete own media or admins can delete any"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'media' AND (auth.uid()::text = owner_id::text OR public.is_admin_or_editor(auth.uid())));