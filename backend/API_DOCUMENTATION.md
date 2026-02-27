# Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Routes (`/api/auth`)

### 1. Sign Up
**POST** `/auth/signup`

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNumber": "1234567890",
  "role": "seeker" // or "employer"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "seeker"
  }
}
```

---

### 2. Login
**POST** `/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "email": "john@example.com",
    "role": "seeker"
  }
}
```

---

### 3. Google OAuth
**POST** `/auth/google`

**Body:**
```json
{
  "credential": "google_credential_token",
  "role": "seeker" // or "employer"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": { ... },
  "isNewUser": false
}
```

---

### 4. Get Current User (Protected)
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "user_id",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "1234567890",
  "role": "seeker",
  "resumeUrl": "url_to_resume",
  "photoUrl": "url_to_photo",
  "location": "City, Country",
  "preferredRole": "Software Engineer",
  "aboutMe": "Description...",
  "education": { ... }
}
```

---

### 5. Update Profile (Protected)
**PUT** `/auth/update`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "1234567890",
  "location": "New York, USA",
  "preferredRole": "Full Stack Developer",
  "aboutMe": "Passionate developer...",
  "education": {
    "tenth": { "score": "92" },
    "twelfth": { "score": "88" },
    "degree": { "score": "8.5" }
  }
}
```

**Response:**
```json
{
  "id": "user_id",
  "firstName": "John",
  // ... updated user data
}
```

---

### 6. Upload Resume (Protected)
**POST** `/auth/resume`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (FormData):**
```
resume: <file>
```

**Response:**
```json
{
  "message": "Resume uploaded successfully",
  "resumeUrl": "uploads/resumes/filename.pdf"
}
```

---

### 7. Upload Photo (Protected)
**POST** `/auth/photo`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (FormData):**
```
photo: <file>
```

**Response:**
```json
{
  "message": "Photo uploaded successfully",
  "photoUrl": "uploads/photos/filename.jpg"
}
```

---

## 💼 Job Routes (`/api/jobs`)

### 1. Get All Jobs
**GET** `/jobs`

**Query Parameters:**
```
?search=developer
&location=remote
&type=Full Time
&page=1
&limit=10
&sort=latest
```

**Response:**
```json
[
  {
    "_id": "job_id",
    "title": "Software Engineer",
    "company": "Tech Corp",
    "location": "Remote",
    "salary": "$80k - $120k",
    "type": "Full Time",
    "description": "Job description...",
    "requirements": ["React", "Node.js"],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 2. Get Job by ID
**GET** `/jobs/:id`

**Response:**
```json
{
  "_id": "job_id",
  "title": "Software Engineer",
  "company": "Tech Corp",
  "location": "Remote",
  "salary": "$80k - $120k",
  "type": "Full Time",
  "description": "Detailed job description...",
  "requirements": ["React", "Node.js", "MongoDB"],
  "responsibilities": ["Build features", "Code review"],
  "benefits": ["Health insurance", "Remote work"],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 3. Apply for Job (Protected)
**POST** `/jobs/:id/apply`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Application submitted successfully",
  "application": {
    "jobId": "job_id",
    "userId": "user_id",
    "status": "pending"
  }
}
```

---

### 4. Get Applied Jobs (Protected)
**GET** `/jobs/applied`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "application_id",
    "job": {
      "title": "Software Engineer",
      "company": "Tech Corp"
    },
    "status": "pending", // or "interview", "accepted", "rejected"
    "appliedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 5. Get Job Categories
**GET** `/jobs/categories`

**Response:**
```json
[
  {
    "name": "Engineering",
    "count": "800+ Jobs"
  },
  {
    "name": "Design",
    "count": "300+ Jobs"
  }
]
```

---

## 📚 Course Routes (`/api/courses`)

### 1. Get All Courses
**GET** `/courses`

**Query Parameters:**
```
?search=react
&category=Engineering
&page=1
&limit=10
```

**Response:**
```json
[
  {
    "_id": "course_id",
    "title": "React Masterclass",
    "description": "Learn React from scratch",
    "instructor": "John Doe",
    "duration": "4 weeks",
    "level": "Beginner",
    "thumbnailUrl": "url_to_thumbnail",
    "contentUrl": "url_to_video",
    "category": "Engineering",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 2. Get Course by ID
**GET** `/courses/:id`

**Response:**
```json
{
  "_id": "course_id",
  "title": "React Masterclass",
  "description": "Detailed description...",
  "instructor": "John Doe",
  "duration": "4 weeks",
  "level": "Beginner",
  "thumbnailUrl": "url_to_thumbnail",
  "contentUrl": "url_to_video",
  "category": "Engineering",
  "syllabus": ["Module 1", "Module 2"],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

## 🏢 Employer Routes (`/api/employer`)

### 1. Post a Job (Protected - Employer only)
**POST** `/employer/jobs`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "title": "Senior Developer",
  "company": "Tech Corp",
  "location": "Remote",
  "salary": "$100k - $150k",
  "type": "Full Time",
  "description": "Job description...",
  "requirements": ["5+ years experience", "React", "Node.js"],
  "responsibilities": ["Lead development", "Mentor team"],
  "benefits": ["Health insurance", "401k"]
}
```

**Response:**
```json
{
  "message": "Job posted successfully",
  "job": { ... }
}
```

---

### 2. Get Employer's Jobs (Protected)
**GET** `/employer/jobs`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "job_id",
    "title": "Senior Developer",
    "applicationsCount": 25,
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 3. Get Applications for Job (Protected)
**GET** `/employer/jobs/:jobId/applications`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "application_id",
    "user": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "resumeUrl": "url_to_resume"
    },
    "status": "pending",
    "appliedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

## 👨‍💼 Admin Routes (`/api/admin`)

### 1. Get All Users (Protected - Admin only)
**GET** `/admin/users`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "seeker",
    "isBlocked": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 2. Upload Course (Protected - Admin only)
**POST** `/admin/courses`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (FormData):**
```
title: "Course Title"
description: "Course description"
instructor: "Instructor Name"
duration: "4 weeks"
level: "Beginner"
category: "Engineering"
thumbnail: <file>
video: <file>
```

**Response:**
```json
{
  "message": "Course uploaded successfully",
  "course": { ... }
}
```

---

## 🏥 Health Check

**GET** `/api/health`

**Response:**
```json
{
  "status": "OK",
  "database": "Connected"
}
```

---

## 📝 Notes

### File Upload Locations
- Resumes: `backend/uploads/resumes/`
- Photos: `backend/uploads/photos/`
- Videos: `backend/uploads/videos/`

### Environment Variables Required
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/jobportal
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### User Roles
- `seeker` - Job Seeker
- `employer` - Recruiter/Employer
- `admin` - Administrator

### Database Collections
- `users` - User accounts
- `jobs` - Job postings
- `applications` - Job applications
- `courses` - Learning courses
- `employers` - Employer profiles

---

## 🔧 Testing

Test user credentials:
```
Email: admin@jobportal.com
Password: admin123
Role: admin
```

---

## 🚀 Quick Start for New Frontend

1. **Install axios:**
```bash
npm install axios
```

2. **Create API utility:**
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

3. **Example Usage:**
```javascript
// Login
const response = await api.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});
localStorage.setItem('token', response.data.token);

// Get jobs
const jobs = await api.get('/jobs');

// Apply for job
await api.post(`/jobs/${jobId}/apply`);
```

---

## ✅ Backend Status
- ✅ MongoDB Connected
- ✅ 5 Users in database
- ✅ JWT Authentication working
- ✅ Google OAuth configured
- ✅ File uploads working (local storage)
- ✅ All routes tested and functional

Backend is ready to connect with any frontend framework!
