# Supabase Storage Setup Guide

## Issues Found:
1. ❌ "uploads" bucket not found
2. ❌ Row-level security policy blocking uploads

## Fix Steps:

### 1. Create Storage Bucket
1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Set bucket name: `uploads`
5. Make it **Public** (check the public checkbox)
6. Click **"Create bucket"**

### 2. Set Bucket Policies
After creating the bucket, you need to set up policies:

1. Go to **Storage** → **Policies**
2. For the `uploads` bucket, create these policies:

#### Policy 1: Allow Public Uploads
```sql
-- Policy Name: Allow authenticated uploads
-- Operation: INSERT
-- Target roles: authenticated

CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'uploads');
```

#### Policy 2: Allow Public Downloads
```sql
-- Policy Name: Allow public downloads
-- Operation: SELECT
-- Target roles: public

CREATE POLICY "Allow public downloads" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'uploads');
```

#### Policy 3: Allow Users to Update Their Files
```sql
-- Policy Name: Allow users to update own files
-- Operation: UPDATE
-- Target roles: authenticated

CREATE POLICY "Allow users to update own files" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'uploads');
```

#### Policy 4: Allow Users to Delete Their Files
```sql
-- Policy Name: Allow users to delete own files
-- Operation: DELETE
-- Target roles: authenticated

USING (bucket_id = 'uploads');
```

### 3. Alternative: Disable RLS (Quick Fix)
If you want a quick fix for development:

1. Go to **Storage** → **Settings**
2. Find the `uploads` bucket
3. Click **"Edit"**
4. **Uncheck "Enable RLS"** (Row Level Security)
5. Save

⚠️ **Warning**: Disabling RLS makes your bucket fully public. Only use this for development!

### 4. Verify Setup
After making changes, run this command to test:

```bash
node debug-upload.js
```

You should see:
- ✅ "uploads" bucket found
- ✅ Upload function works!

## Quick Setup Commands

If you prefer using SQL, run these in your Supabase SQL Editor:

```sql
-- Create bucket (if not exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Allow public downloads" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'uploads');

CREATE POLICY "Allow users to update own files" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'uploads');

CREATE POLICY "Allow users to delete own files" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'uploads');
```