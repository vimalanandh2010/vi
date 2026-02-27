# Step-by-Step Guide: Storing Videos with Cloudinary

This guide explains how to upload and store course videos using the Cloudinary integration built into the project.

## 1. Backend Utility (`backend/utils/cloudinaryUpload.js`)
We use a utility function that takes a Multer file and uploads it directly to Cloudinary using a stream.

```javascript
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

// Example usage in route:
const videoUrl = await uploadToCloudinary(req.files.content[0], 'course_videos');
```

## 2. API Route (`backend/routes/courseRoutes.js`)
The `POST /api/courses` endpoint is configured to handle multipart form data. It expects a field named `content` for the video file.

- **Endpoint**: `POST /api/courses`
- **Method**: `multipart/form-data`
- **Field Name**: `content`

## 3. Frontend Implementation (React)
To upload a video from the frontend, follow these steps:

### A. Create a File Input
```jsx
<input 
  type="file" 
  accept="video/*" 
  onChange={(e) => setVideoFile(e.target.files[0])} 
/>
```

### B. Prepare FormData and Send Request
```javascript
const handleUpload = async () => {
  const formData = new FormData();
  formData.append('title', 'My Great Course');
  formData.append('content', videoFile); // The video file from state

  try {
    const response = await axios.post('/api/courses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Video stored at:', response.data.contentUrl);
  } catch (error) {
    console.error('Upload failed');
  }
};
```

## 4. Automatic Optimizations
Cloudinary is configured to automatically:
- **Auto-Quality**: Adjusts compression based on the video content.
- **Auto-Format**: Delivers the best format (WebM, MP4, etc.) based on the user's browser.
- **Auto-Optimization**: Uses `quality: 'auto'` and `fetch_format: 'auto'`.

## Summary Flow
1. User selects video in React UI.
2. React sends `FormData` to `/api/courses`.
3. Backend receives file via `multer`.
4. `uploadToCloudinary` helper streams file to Cloudinary.
5. Cloudinary returns a secure URL.
6. Backend saves URL to MongoDB `Course` model.
