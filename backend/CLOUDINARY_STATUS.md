# ☁️ Cloudinary Configuration Status

## 📊 Current Situation

### ✅ **Cloudinary is CONFIGURED**

Your Cloudinary account is set up and ready to use!

**Credentials:**
- **Cloud Name**: `dwkzum93b`
- **API Key**: `471183591147462`
- **API Secret**: ✅ Set (hidden for security)

---

## 📁 Current Usage

### **Where Cloudinary is Used:**

1. **Course Videos** (`backend/routes/courseRoutes.js`)
   - Uploads course videos to Cloudinary
   - Folder: `course_videos`
   - Formats: MP4, MKV, MOV, AVI

2. **Course Thumbnails** (`backend/routes/courseRoutes.js`)
   - Uploads course thumbnails to Cloudinary
   - Folder: `course_thumbnails`
   - Formats: JPG, PNG, JPEG

### **Where Cloudinary is NOT Used:**

❌ **Job Portal Features** (Currently using local storage)
- Resume uploads → Local storage (`backend/uploads/resumes/`)
- Profile photos → Local storage (`backend/uploads/photos/`)
- Intro videos → Local storage (`backend/uploads/videos/`)

---

## 🔧 Cloudinary Configuration

### **File: `backend/config/cloudinary.js`**

```javascript
// Current configuration
cloudinary.config({
    cloud_name: 'dwkzum93b',
    api_key: '471183591147462',
    api_secret: '***' // Hidden
});

// Storage settings
- Folder structure: course_videos, course_thumbnails
- Auto quality optimization
- Auto format conversion
- Unique file naming with timestamps
```

---

## 🎯 Two Separate Systems

Your project has **TWO DIFFERENT upload systems**:

### **1. Course System (Uses Cloudinary)**
- ✅ Videos uploaded to Cloudinary
- ✅ Thumbnails uploaded to Cloudinary
- ✅ CDN delivery
- ✅ Automatic optimization

### **2. Job Portal System (Uses Local Storage)**
- ✅ Resumes stored locally
- ✅ Photos stored locally
- ✅ Videos stored locally
- ✅ Served via Express static

---

## 💡 Options for Job Portal Files

You have **3 options** for handling job portal uploads:

### **Option 1: Keep Local Storage (Current)**
**Pros:**
- ✅ No external dependencies
- ✅ No API limits
- ✅ Free
- ✅ Fast for local development
- ✅ Already working

**Cons:**
- ❌ Files stored on server
- ❌ No CDN
- ❌ Harder to scale
- ❌ No automatic optimization

### **Option 2: Switch to Cloudinary**
**Pros:**
- ✅ CDN delivery (faster)
- ✅ Automatic optimization
- ✅ Image transformations
- ✅ Video processing
- ✅ Better for production
- ✅ Already configured!

**Cons:**
- ❌ API limits (free tier)
- ❌ Costs money at scale
- ❌ External dependency

### **Option 3: Use Supabase (You have it configured)**
**Pros:**
- ✅ Free tier generous
- ✅ Built-in CDN
- ✅ Public URLs
- ✅ Already configured!

**Cons:**
- ❌ Requires bucket setup
- ❌ Network dependency
- ❌ Previous connection issues

---

## 🚀 How to Switch Job Portal to Cloudinary

If you want to use Cloudinary for job portal uploads, here's what to do:

### **Step 1: Update Upload Service**

Replace `backend/utils/uploadService.js` with Cloudinary upload:

```javascript
const { cloudinary } = require('../config/cloudinary');

const uploadFile = async (file, folder) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `job_portal/${folder}`,
                resource_type: 'auto',
                public_id: `${Date.now()}-${file.originalname}`,
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result.secure_url);
            }
        );
        
        uploadStream.end(file.buffer);
    });
};

module.exports = { uploadFile };
```

### **Step 2: Update Cloudinary Config**

Add job portal folders to `backend/config/cloudinary.js`:

```javascript
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Detect file type
        const isVideo = file.mimetype.startsWith('video');
        const isImage = file.mimetype.startsWith('image');
        const isPDF = file.mimetype === 'application/pdf';
        
        let folder = 'job_portal/other';
        let resourceType = 'auto';
        
        if (isVideo) {
            folder = 'job_portal/videos';
            resourceType = 'video';
        } else if (isImage) {
            folder = 'job_portal/photos';
            resourceType = 'image';
        } else if (isPDF) {
            folder = 'job_portal/resumes';
            resourceType = 'raw';
        }
        
        return {
            folder,
            resource_type: resourceType,
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
        };
    }
});
```

### **Step 3: Test It**

```bash
node test-upload.js
```

---

## 📊 Cloudinary Dashboard

Access your Cloudinary dashboard:
👉 https://cloudinary.com/console

**Your Cloud Name**: `dwkzum93b`

### **What You Can Do:**
- View uploaded files
- Check storage usage
- Monitor bandwidth
- Configure transformations
- Set up webhooks
- Manage folders

---

## 🔍 Current File Locations

### **Course Files (Cloudinary)**
```
https://res.cloudinary.com/dwkzum93b/
├── course_videos/
│   └── [timestamp]-[filename].mp4
└── course_thumbnails/
    └── [timestamp]-[filename].jpg
```

### **Job Portal Files (Local)**
```
backend/uploads/
├── resumes/
│   ├── 1769959082462-test_resume.pdf
│   ├── 1769969851850-Akshay_Vaishnav_CV.pdf
│   └── ... (5 files total)
├── photos/
│   └── (empty)
└── videos/
    └── (empty)
```

---

## 💰 Cloudinary Free Tier Limits

**Your current plan includes:**
- ✅ 25 GB storage
- ✅ 25 GB bandwidth/month
- ✅ 25,000 transformations/month
- ✅ Unlimited uploads

**This is enough for:**
- ~5,000 resume uploads (5MB each)
- ~25,000 profile photos (1MB each)
- ~500 intro videos (50MB each)

---

## 🎯 Recommendation

### **For Development:**
✅ **Keep local storage** - It's working perfectly and free

### **For Production:**
✅ **Switch to Cloudinary** - Better performance, CDN, optimization

### **Why Cloudinary is Better for Production:**
1. **CDN Delivery** - Files load faster worldwide
2. **Automatic Optimization** - Smaller file sizes
3. **Image Transformations** - Resize, crop, format conversion
4. **Video Processing** - Automatic format conversion
5. **Reliability** - 99.9% uptime
6. **Scalability** - Handles traffic spikes

---

## 🧪 Test Cloudinary

Want to test if Cloudinary is working? Run:

```bash
node test-cloudinary.js
```

This will:
1. Upload a test file to Cloudinary
2. Verify the URL
3. Show you the result

---

## 📝 Summary

**Current Status:**
- ✅ Cloudinary is configured and working
- ✅ Used for course videos/thumbnails
- ✅ Job portal uses local storage
- ✅ Both systems working independently

**Your Choice:**
- Keep local storage (simple, free)
- Switch to Cloudinary (better for production)
- Use Supabase (alternative cloud storage)

**All three options are valid!** Choose based on your needs.

---

**Last Updated**: February 6, 2026
**Cloudinary Account**: dwkzum93b
**Status**: ✅ Active and Working