# Manual Bucket Creation Guide

Your Supabase credentials are now correctly configured in `backend/.env`:

✅ **Project URL**: `https://nndgtxbvprubtjhhytfj.supabase.co`
✅ **Anon Key**: Configured
✅ **Service Role Key**: Configured

## Create the "futuremilstone" Bucket Manually

Since the automated script is having connection issues, please create the bucket manually:

### Steps:

1. **Go to Supabase Storage Dashboard**:
   - Visit: https://supabase.com/dashboard/project/nndgtxbvprubtjhhytfj/storage/buckets

2. **Click "New bucket"** button

3. **Configure the bucket**:
   - **Name**: `futuremilstone` (exactly as shown)
   - **Public bucket**: ✅ Enable (toggle ON)
   - **File size limit**: `104857600` bytes (100 MB)
   - **Allowed MIME types**: 
     - `image/*`
     - `video/*`
     - `application/pdf`

4. **Click "Create bucket"**

## Verify Configuration

After creating the bucket, your entire Job Portal project will be able to:
- Upload resumes (PDFs)
- Upload profile images
- Upload company logos
- Upload any other files to the "futuremilstone" bucket

All file uploads in your application will automatically use this Supabase storage bucket.

## Test the Connection (Optional)

If you want to test the connection after creating the bucket, run:

```bash
cd backend
node scripts/testSupabase.js
```

This should show "Bucket 'futuremilstone' already exists!" if everything is working.
