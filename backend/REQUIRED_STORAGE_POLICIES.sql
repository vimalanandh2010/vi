-- Required Storage Policies for "futuremilstone" Bucket
-- Add these in Supabase Dashboard > Storage > Policies

-- 1. Allow anyone to upload files (INSERT)
CREATE POLICY "Allow public uploads to futuremilstone"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'futuremilstone');

-- 2. Allow anyone to read files (SELECT)
CREATE POLICY "Allow public reads from futuremilstone"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'futuremilstone');

-- 3. Allow authenticated users to update their files (UPDATE)
CREATE POLICY "Allow authenticated updates in futuremilstone"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'futuremilstone');

-- 4. Allow authenticated users to delete their files (DELETE)
CREATE POLICY "Allow authenticated deletes in futuremilstone"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'futuremilstone');
