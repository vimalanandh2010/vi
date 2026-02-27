# Supabase Bucket Policy Configuration

## Issue
Getting 500 error when uploading resume to `/api/jobseeker/resume`

## Required Bucket Policies

Your "futuremilstone" bucket needs proper RLS (Row Level Security) policies to allow uploads.

### Steps to Configure:

1. **Go to Storage Policies**:
   - Visit: https://supabase.com/dashboard/project/nndgtxbvprubtjhhytfj/storage/policies

2. **Select the "futuremilstone" bucket**

3. **Add the following policies**:

#### Policy 1: Allow Public Uploads (INSERT)
```sql
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'futuremilstone');
```

#### Policy 2: Allow Public Reads (SELECT)
```sql
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'futuremilstone');
```

#### Policy 3: Allow Authenticated Updates (UPDATE)
```sql
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'futuremilstone');
```

#### Policy 4: Allow Authenticated Deletes (DELETE)
```sql
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'futuremilstone');
```

### Quick Setup via Dashboard:

1. Go to the policies page for your bucket
2. Click "New Policy"
3. Choose "For full customization" or use templates:
   - **INSERT**: Allow public uploads
   - **SELECT**: Allow public reads
   - **UPDATE**: Allow authenticated users
   - **DELETE**: Allow authenticated users

4. For each policy, set:
   - **Target roles**: `public` (for INSERT/SELECT) or `authenticated` (for UPDATE/DELETE)
   - **Policy definition**: `bucket_id = 'futuremilstone'`

### Alternative: Disable RLS (Not Recommended for Production)

If you want to quickly test without policies:
1. Go to Storage settings
2. Find "futuremilstone" bucket
3. Toggle "Enable RLS" to OFF

⚠️ **Warning**: Disabling RLS makes your bucket completely public. Only use for testing!

## Verify After Setup

After adding policies, restart your backend server and try uploading again.
