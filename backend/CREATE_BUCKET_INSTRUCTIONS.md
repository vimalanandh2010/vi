# 🚀 ONE-TIME SETUP: Create Uploads Bucket

## Why do you need this?
Your resume upload is failing because the "uploads" bucket doesn't exist in your Supabase project. This is a **one-time setup** - once you create it, you'll never need to do it again.

## 📋 EXACT STEPS (Takes 30 seconds):

### Step 1: Click this link
👉 **https://supabase.com/dashboard/project/xblulaqgaqhhtmhiernt/storage/buckets**

### Step 2: Create the bucket
1. Click the **"New bucket"** button
2. Enter bucket name: **`uploads`**
3. ✅ **Check "Public bucket"** (very important!)
4. Click **"Create bucket"**

### Step 3: Verify it worked
Run this command to test:
```bash
node test-bucket.js
```

You should see: ✅ "uploads" bucket found!

## 🎉 After creating the bucket:
- ✅ Resume uploads will work
- ✅ Photo uploads will work  
- ✅ Video uploads will work
- ✅ No more "fetch failed" errors

## ❓ Why can't this be automated?
Supabase has security policies that prevent automatic bucket creation from the API. The bucket must be created through the dashboard for security reasons.

## 🔧 Alternative: Use Local Storage (Development Only)
If you don't want to use Supabase, I can help you set up local file storage instead. But Supabase is better for production.

---

**This is a one-time setup!** Once you create the bucket, your upload system will work perfectly forever. 🚀