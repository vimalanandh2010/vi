# 🚀 Future Milestone - Complete Documentation

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Technology Stack](#technology-stack)
4. [Core Features](#core-features)
5. [Database Schema](#database-schema)
6. [API Reference](#api-reference)
7. [Installation Guide](#installation-guide)
8. [Deployment Guide](#deployment-guide)
9. [Configuration](#configuration)
10. [Security](#security)
11. [Troubleshooting](#troubleshooting)
12. [Project Structure](#project-structure)
13. [Testing](#testing)
14. [Maintenance](#maintenance)

---

## Executive Summary

### Project Overview

**Future Milestone** is a comprehensive, production-ready MERN stack job portal platform that connects job seekers with recruiters and employers. Built with modern technologies and best practices, it provides a complete ecosystem for job searching, recruitment, learning, and professional networking.

### Purpose

The platform addresses the complete job search and recruitment lifecycle by providing:
- **For Job Seekers**: Tools to find jobs, build profiles, learn new skills, and connect with employers
- **For Recruiters**: Complete applicant tracking system (ATS), candidate management, and hiring tools
- **For Both**: Real-time communication, AI-powered assistance, and community engagement

### Key Features

- ✅ **Dual Role System**: Separate experiences for job seekers and recruiters
- ✅ **Real-time Communication**: Socket.IO-powered chat and notifications
- ✅ **AI Integration**: Google Gemini AI for career assistance and recruitment help
- ✅ **Video Interviews**: Jitsi-powered video conferencing
- ✅ **Learning Platform**: Course management and enrollment system
- ✅ **Community Features**: Discussion forums and networking
- ✅ **Advanced ATS**: Resume parsing, candidate scoring, and application tracking
- ✅ **Multi-cloud Storage**: Tiered file upload strategy (Supabase → Firebase → Local)
- ✅ **Google OAuth**: Seamless authentication with Google accounts
- ✅ **Responsive Design**: Mobile-first, fully responsive UI

### Current Deployment Status

- **Backend**: Deployed on Render at `https://backend-portal-56ud.onrender.com`
- **Frontend**: Ready for Vercel deployment
- **Database**: MongoDB (supports both local and Atlas)
- **Status**: Production-ready with active deployment


---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
│              (Chrome, Firefox, Safari, Edge)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS/WSS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (React + Vite)                    │
│                      Port 5173 (Dev)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • React Router (Client-side routing)                │  │
│  │  • Context API (State management)                    │  │
│  │  • Axios (HTTP client)                               │  │
│  │  • Socket.IO Client (Real-time)                      │  │
│  │  • Tailwind CSS (Styling)                            │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ REST API / WebSocket
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                BACKEND (Node.js + Express)                   │
│                      Port 5000 (Dev)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • Express.js (Web framework)                        │  │
│  │  • JWT Authentication                                │  │
│  │  • Socket.IO Server (Real-time)                      │  │
│  │  • Multer (File uploads)                             │  │
│  │  • Passport (OAuth)                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Mongoose ODM
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   MONGODB DATABASE                           │
│                    Port 27017 (Local)                        │
│                  or MongoDB Atlas (Cloud)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Collections:                                        │  │
│  │  • users          • jobs          • applications     │  │
│  │  • courses        • communities   • messages         │  │
│  │  • companies      • enrollments   • verificationotp  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ External APIs
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • Google OAuth 2.0 (Authentication)                 │  │
│  │  • Google Gemini AI (AI Assistant)                   │  │
│  │  • Supabase (Primary file storage)                   │  │
│  │  • Firebase (Fallback storage)                       │  │
│  │  • Jitsi (Video conferencing)                        │  │
│  │  • Nodemailer (Email notifications)                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

#### 1. Authentication Flow
```
User → Frontend → POST /api/auth/login → Backend
                                           ↓
                                    Verify credentials
                                           ↓
                                    Generate JWT token
                                           ↓
Frontend ← Token + User data ← Backend
    ↓
Store in localStorage
    ↓
Include in subsequent requests
```

#### 2. Real-time Chat Flow
```
User A → Socket.IO Client → Socket.IO Server → MongoDB
                                    ↓
                            Broadcast to room
                                    ↓
User B ← Socket.IO Client ← Socket.IO Server
```

#### 3. File Upload Flow (Tiered Strategy)
```
User → Select file → Frontend → Multer (Backend)
                                      ↓
                              Try Supabase upload
                                      ↓
                              Success? → Return URL
                                      ↓
                              Failed? → Try Firebase
                                      ↓
                              Failed? → Save locally
                                      ↓
                              URL saved to MongoDB
```

### Component Architecture

#### Frontend Components
- **Pages**: Full-page components for routes
- **Components**: Reusable UI components
- **Context**: Global state management
- **API**: Service layer for backend communication
- **Utils**: Helper functions and utilities

#### Backend Structure
- **Routes**: API endpoint definitions
- **Controllers**: Business logic handlers
- **Models**: MongoDB schema definitions
- **Middleware**: Authentication, validation, error handling
- **Utils**: Helper functions and services
- **Config**: Configuration files


---

## Technology Stack

### Backend Technologies

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| **Node.js** | 16+ | JavaScript runtime | [nodejs.org](https://nodejs.org) |
| **Express.js** | 4.18.2 | Web application framework | [expressjs.com](https://expressjs.com) |
| **MongoDB** | Latest | NoSQL database | [mongodb.com](https://mongodb.com) |
| **Mongoose** | 9.1.4 | MongoDB ODM | [mongoosejs.com](https://mongoosejs.com) |
| **Socket.IO** | 4.8.3 | Real-time bidirectional communication | [socket.io](https://socket.io) |
| **JWT** | 9.0.3 | JSON Web Token authentication | [jwt.io](https://jwt.io) |
| **bcryptjs** | 3.0.3 | Password hashing | [npmjs.com/package/bcryptjs](https://www.npmjs.com/package/bcryptjs) |
| **Passport** | 0.7.0 | Authentication middleware | [passportjs.org](http://www.passportjs.org) |
| **Google OAuth** | 2.0.0 | Google authentication strategy | [developers.google.com](https://developers.google.com/identity) |
| **Multer** | 2.0.2 | File upload handling | [npmjs.com/package/multer](https://www.npmjs.com/package/multer) |
| **Nodemailer** | 7.0.12 | Email sending | [nodemailer.com](https://nodemailer.com) |
| **Helmet** | 8.1.0 | Security headers | [helmetjs.github.io](https://helmetjs.github.io) |
| **CORS** | 2.8.5 | Cross-origin resource sharing | [npmjs.com/package/cors](https://www.npmjs.com/package/cors) |

### Frontend Technologies

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| **React** | 18.2.0 | UI library | [react.dev](https://react.dev) |
| **Vite** | 5.0.0 | Build tool and dev server | [vitejs.dev](https://vitejs.dev) |
| **React Router** | 7.13.0 | Client-side routing | [reactrouter.com](https://reactrouter.com) |
| **Tailwind CSS** | 3.4.0 | Utility-first CSS framework | [tailwindcss.com](https://tailwindcss.com) |
| **Axios** | 1.13.5 | HTTP client | [axios-http.com](https://axios-http.com) |
| **Socket.IO Client** | 4.8.3 | WebSocket client | [socket.io](https://socket.io) |
| **Framer Motion** | 12.33.0 | Animation library | [framer.com/motion](https://www.framer.com/motion) |
| **Lucide React** | 0.563.0 | Icon library | [lucide.dev](https://lucide.dev) |
| **React Toastify** | 11.0.5 | Toast notifications | [fkhadra.github.io/react-toastify](https://fkhadra.github.io/react-toastify) |
| **Recharts** | 3.7.0 | Chart library | [recharts.org](https://recharts.org) |

### AI & Machine Learning

| Technology | Version | Purpose |
|------------|---------|---------|
| **Google Gemini AI** | 0.24.1 (Backend) / 0.21.0 (Frontend) | AI chatbot and assistance |
| **Tesseract.js** | 7.0.0 | OCR (Optical Character Recognition) |

### Cloud Services & Storage

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **Supabase** | Primary file storage | Configured with URL and anon key |
| **Firebase** | Fallback file storage | Storage bucket configured |
| **Cloudinary** | Alternative cloud storage | Optional configuration |
| **Render** | Backend hosting | Current deployment platform |
| **Vercel** | Frontend hosting (recommended) | Optimized for React apps |

### Video & Communication

| Technology | Version | Purpose |
|------------|---------|---------|
| **Jitsi React SDK** | 1.4.4 | Video conferencing |
| **@zegocloud/zego-uikit-prebuilt** | 2.17.2 | Alternative video solution |

### Document Processing

| Technology | Version | Purpose |
|------------|---------|---------|
| **pdf-parse** | 2.4.5 | PDF text extraction |
| **pdfjs-dist** | 5.4.624 | PDF rendering |
| **mammoth** | 1.11.0 | DOCX to HTML conversion |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Nodemon** | Auto-restart development server |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Postman** | API testing |
| **MongoDB Compass** | Database GUI |
| **Git** | Version control |

### Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)


---

## Core Features

### For Job Seekers

#### 1. Job Search & Application
- **Browse Jobs**: View IT and Non-IT job listings
- **Advanced Search**: Filter by location, type, salary, company
- **Job Details**: Comprehensive job descriptions with requirements
- **One-Click Apply**: Quick application submission
- **Save Jobs**: Bookmark interesting positions
- **Application Tracking**: Monitor application status in real-time
- **Application History**: View all past applications

#### 2. Profile Management
- **Profile Builder**: Create comprehensive professional profile
- **Resume Upload**: Support for PDF and DOCX formats
- **Photo Upload**: Professional profile picture
- **Education Details**: Add 10th, 12th, and degree information
- **Skills Management**: Add and showcase skills
- **Experience Level**: Specify career stage
- **Preferred Role**: Set job preferences
- **Location**: Add current location

#### 3. Learning & Development
- **Course Catalog**: Browse available courses
- **Course Enrollment**: Enroll in courses with one click
- **Progress Tracking**: Monitor learning progress
- **Video Content**: Access course videos
- **Course Categories**: Filter by category and level
- **My Courses**: View enrolled courses

#### 4. Communication
- **Real-time Chat**: Message recruiters instantly
- **Online Status**: See who's online
- **Message History**: Access past conversations
- **Emoji Support**: Express yourself with emojis
- **Notifications**: Get notified of new messages

#### 5. Video Interviews
- **Join Interviews**: Participate in scheduled video interviews
- **Interview Alerts**: Get notified of upcoming interviews
- **Jitsi Integration**: High-quality video calls
- **Screen Sharing**: Share your screen during interviews

#### 6. AI Assistant
- **Career Guidance**: Get AI-powered career advice
- **Resume Tips**: Improve your resume with AI suggestions
- **Interview Prep**: Practice interview questions
- **Job Recommendations**: AI-suggested job matches

#### 7. Community Engagement
- **Join Communities**: Connect with professionals
- **Discussion Posts**: Participate in discussions
- **Comments**: Engage with community content
- **Networking**: Build professional connections

#### 8. Company Research
- **Company Directory**: Browse registered companies
- **Company Profiles**: View detailed company information
- **Company Jobs**: See all jobs from a company
- **Verification Badges**: Identify verified companies

### For Recruiters/Employers

#### 1. Job Management
- **Post Jobs**: Create detailed job listings
- **Edit Jobs**: Update job information
- **Delete Jobs**: Remove outdated postings
- **Job Status**: Mark jobs as active or closed
- **Job Analytics**: View job performance metrics
- **Applicant Count**: Track number of applications

#### 2. Applicant Tracking System (ATS)
- **View Applicants**: See all candidates for each job
- **Resume Review**: Access candidate resumes
- **Profile Analysis**: View complete candidate profiles
- **Status Management**: Update application status
  - Pending
  - Reviewed
  - Interview
  - Accepted
  - Rejected
- **Candidate Scoring**: AI-powered candidate evaluation
- **Resume Parsing**: Automatic skill extraction

#### 3. Interview Management
- **Schedule Interviews**: Set up video interviews
- **Calendar Integration**: Manage interview schedule
- **Interview Rooms**: Create dedicated video rooms
- **Interview Notifications**: Alert candidates automatically

#### 4. Communication
- **Chat with Candidates**: Direct messaging
- **Bulk Notifications**: Send updates to multiple candidates
- **Email Integration**: Automated email notifications
- **Real-time Updates**: Instant communication

#### 5. Company Profile
- **Company Information**: Add company details
- **Logo Upload**: Brand your company profile
- **Company Description**: Showcase your organization
- **Verification**: Get verified company badge
- **Job Listings**: Display all company jobs

#### 6. Course Management
- **Post Courses**: Create learning content
- **Video Upload**: Add course videos
- **Student Management**: Track enrollments
- **Course Analytics**: Monitor course performance

#### 7. Dashboard & Analytics
- **Active Jobs**: Overview of current postings
- **Total Applicants**: Track application volume
- **Application Trends**: Visualize hiring metrics
- **Performance Metrics**: Job and company statistics
- **Charts & Graphs**: Visual data representation

#### 8. AI Recruitment Assistant
- **Candidate Matching**: AI-powered candidate recommendations
- **Job Description Help**: AI-assisted job posting
- **Screening Assistance**: Automated initial screening
- **Interview Questions**: AI-generated interview questions

### Technical Features

#### 1. Authentication & Security
- **Email/Password**: Traditional authentication
- **Google OAuth**: Sign in with Google
- **OTP Verification**: Email-based OTP
- **Password Reset**: Secure password recovery
- **JWT Tokens**: Secure session management
- **Role-Based Access**: Seeker, Recruiter, Admin roles

#### 2. Real-time Features
- **Live Chat**: Instant messaging
- **Online Presence**: Real-time online status
- **Notifications**: Live updates
- **Application Updates**: Real-time status changes

#### 3. File Management
- **Multi-format Support**: PDF, DOCX, images, videos
- **Tiered Upload Strategy**: 
  1. Supabase (Primary)
  2. Firebase (Fallback)
  3. Local Storage (Last resort)
- **File Validation**: Type and size checks
- **Secure Storage**: Cloud-based file storage

#### 4. Search & Filtering
- **Full-text Search**: Search jobs by keywords
- **Advanced Filters**: Multiple filter criteria
- **Sort Options**: Latest, salary, relevance
- **Pagination**: Efficient data loading

#### 5. Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Responsive layouts
- **Desktop Optimized**: Full-featured desktop experience
- **Cross-browser**: Works on all modern browsers


---

## Database Schema

### MongoDB Collections

#### 1. Users Collection

```javascript
{
  _id: ObjectId,
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique, indexed),
  password: String (hashed with bcrypt),
  phoneNumber: String,
  role: String (enum: ['seeker', 'employer', 'recruiter', 'admin']),
  
  // Profile Information
  resumeUrl: String,
  photoUrl: String,
  location: String,
  preferredRole: String,
  aboutMe: String,
  experienceLevel: String,
  
  // Education
  education: {
    tenth: {
      score: String,
      board: String,
      year: Number
    },
    twelfth: {
      score: String,
      board: String,
      year: Number
    },
    degree: {
      score: String,
      field: String,
      university: String,
      year: Number
    }
  },
  
  // Skills & Preferences
  skills: [String],
  
  // OAuth
  googleId: String,
  authProvider: String (enum: ['local', 'google']),
  
  // Status
  isEmailVerified: Boolean (default: false),
  isBlocked: Boolean (default: false),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email`: Unique index for fast lookups
- `role`: Index for role-based queries
- `googleId`: Index for OAuth lookups

---

#### 2. Jobs Collection

```javascript
{
  _id: ObjectId,
  title: String (required),
  company: String (required),
  location: String (required),
  salary: String,
  type: String (enum: ['Full Time', 'Part Time', 'Contract', 'Internship']),
  category: String (enum: ['IT', 'Non-IT']),
  
  // Job Details
  description: String (required),
  requirements: [String],
  responsibilities: [String],
  benefits: [String],
  
  // Metadata
  postedBy: ObjectId (ref: 'User', required),
  status: String (enum: ['active', 'closed', 'draft'], default: 'active'),
  applicationsCount: Number (default: 0),
  views: Number (default: 0),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  closedAt: Date
}
```

**Indexes:**
- `postedBy`: Index for recruiter queries
- `status`: Index for active job queries
- `category`: Index for job type filtering
- `title, description`: Text index for search

---

#### 3. Applications Collection

```javascript
{
  _id: ObjectId,
  jobId: ObjectId (ref: 'Job', required),
  userId: ObjectId (ref: 'User', required),
  
  // Application Details
  status: String (enum: ['pending', 'reviewed', 'interview', 'accepted', 'rejected'], default: 'pending'),
  coverLetter: String,
  resumeUrl: String,
  
  // Interview
  interviewScheduled: Date,
  interviewNotes: String,
  
  // Recruiter Notes
  notes: String,
  rating: Number,
  
  // Timestamps
  appliedAt: Date (default: Date.now),
  updatedAt: Date,
  reviewedAt: Date,
  respondedAt: Date
}
```

**Indexes:**
- `jobId`: Index for job-specific queries
- `userId`: Index for user application history
- `status`: Index for status filtering
- Compound index: `(jobId, userId)` for uniqueness

---

#### 4. Courses Collection

```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  instructor: String (required),
  
  // Course Details
  duration: String,
  level: String (enum: ['Beginner', 'Intermediate', 'Advanced']),
  category: String,
  syllabus: [String],
  
  // Media
  thumbnailUrl: String,
  contentUrl: String (video URL),
  
  // Metadata
  enrolledCount: Number (default: 0),
  rating: Number (default: 0),
  reviews: [{
    userId: ObjectId (ref: 'User'),
    rating: Number,
    comment: String,
    createdAt: Date
  }],
  
  // Creator
  createdBy: ObjectId (ref: 'User'),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `category`: Index for category filtering
- `level`: Index for level filtering
- `title, description`: Text index for search

---

#### 5. Enrollments Collection

```javascript
{
  _id: ObjectId,
  courseId: ObjectId (ref: 'Course', required),
  userId: ObjectId (ref: 'User', required),
  
  // Progress
  progress: Number (default: 0, min: 0, max: 100),
  completed: Boolean (default: false),
  
  // Timestamps
  enrolledAt: Date (default: Date.now),
  completedAt: Date,
  lastAccessedAt: Date
}
```

**Indexes:**
- `courseId`: Index for course enrollments
- `userId`: Index for user courses
- Compound index: `(courseId, userId)` for uniqueness

---

#### 6. Communities Collection

```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  description: String (required),
  category: String,
  
  // Members
  createdBy: ObjectId (ref: 'User', required),
  members: [ObjectId] (ref: 'User'),
  memberCount: Number (default: 0),
  
  // Settings
  isPrivate: Boolean (default: false),
  imageUrl: String,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `name`: Unique index
- `category`: Index for filtering
- `members`: Index for member queries

---

#### 7. Companies Collection

```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  description: String,
  
  // Company Details
  industry: String,
  size: String (enum: ['1-10', '11-50', '51-200', '201-500', '500+']),
  location: String,
  website: String,
  logoUrl: String,
  
  // Verification
  isVerified: Boolean (default: false),
  verifiedAt: Date,
  
  // Owner
  ownerId: ObjectId (ref: 'User', required),
  
  // Metadata
  jobCount: Number (default: 0),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `name`: Unique index
- `ownerId`: Index for owner queries
- `isVerified`: Index for verified companies

---

#### 8. Messages Collection

```javascript
{
  _id: ObjectId,
  conversationId: String (required, indexed),
  senderId: ObjectId (ref: 'User', required),
  receiverId: ObjectId (ref: 'User', required),
  
  // Message Content
  message: String (required),
  
  // Status
  isRead: Boolean (default: false),
  readAt: Date,
  
  // Timestamp
  timestamp: Date (default: Date.now)
}
```

**Indexes:**
- `conversationId`: Index for conversation queries
- `senderId`: Index for sender queries
- `receiverId`: Index for receiver queries
- `timestamp`: Index for sorting

---

#### 9. VerificationOTP Collection

```javascript
{
  _id: ObjectId,
  email: String (required, indexed),
  otp: String (required),
  purpose: String (enum: ['login', 'signup', 'reset'], required),
  
  // Status
  verified: Boolean (default: false),
  attempts: Number (default: 0),
  
  // Expiration
  expiresAt: Date (required),
  
  // Timestamp
  createdAt: Date (default: Date.now)
}
```

**Indexes:**
- `email`: Index for email lookups
- `expiresAt`: TTL index for automatic deletion

---

### Database Relationships

```
Users (1) ──────── (N) Jobs
  │                   │
  │                   │
  │                   │
  └─── (N) Applications (N) ───┘
  │
  ├─── (N) Enrollments (N) ─── Courses (1)
  │
  ├─── (N) Messages (N) ─── Users (1)
  │
  └─── (1) Companies (N)
```

### Database Best Practices

1. **Indexing**: All foreign keys and frequently queried fields are indexed
2. **Validation**: Schema-level validation for data integrity
3. **Timestamps**: Automatic createdAt and updatedAt timestamps
4. **References**: ObjectId references for relationships
5. **Denormalization**: Strategic denormalization (e.g., applicationsCount) for performance


---

## API Reference

### Base URL

**Development:** `http://localhost:5000/api`  
**Production:** `https://backend-portal-56ud.onrender.com/api`

### Authentication

All protected routes require JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

---

### Authentication Endpoints

#### 1. Sign Up

**POST** `/auth/signup`

Register a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "phoneNumber": "1234567890",
  "role": "seeker"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "seeker",
    "createdAt": "2024-02-24T10:00:00.000Z"
  }
}
```

---

#### 2. Login

**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "seeker",
    "photoUrl": "https://example.com/photo.jpg",
    "resumeUrl": "https://example.com/resume.pdf"
  }
}
```

---

#### 3. Google OAuth Login

**POST** `/auth/google`

Authenticate using Google OAuth credential.

**Request Body:**
```json
{
  "credential": "google_oauth_credential_token",
  "role": "seeker"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... },
  "isNewUser": false
}
```

---

#### 4. Get Current User

**GET** `/auth/me`

Get authenticated user's profile.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "1234567890",
  "role": "seeker",
  "resumeUrl": "https://example.com/resume.pdf",
  "photoUrl": "https://example.com/photo.jpg",
  "location": "New York, USA",
  "preferredRole": "Software Engineer",
  "aboutMe": "Passionate developer...",
  "experienceLevel": "Mid-level",
  "education": {
    "tenth": { "score": "92%" },
    "twelfth": { "score": "88%" },
    "degree": { "score": "8.5 GPA", "field": "Computer Science" }
  },
  "skills": ["JavaScript", "React", "Node.js"]
}
```

---

#### 5. Update Profile

**PUT** `/auth/update`

Update user profile information.

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "1234567890",
  "location": "San Francisco, USA",
  "preferredRole": "Senior Software Engineer",
  "aboutMe": "Experienced full-stack developer...",
  "experienceLevel": "Senior",
  "education": {
    "tenth": { "score": "92%", "board": "CBSE", "year": 2010 },
    "twelfth": { "score": "88%", "board": "CBSE", "year": 2012 },
    "degree": { 
      "score": "8.5 GPA", 
      "field": "Computer Science",
      "university": "MIT",
      "year": 2016
    }
  },
  "skills": ["JavaScript", "React", "Node.js", "MongoDB"]
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": { ... }
}
```

---

#### 6. Upload Resume

**POST** `/auth/resume`

Upload user resume (PDF or DOCX).

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```
resume: <file>
```

**Response (200):**
```json
{
  "message": "Resume uploaded successfully",
  "resumeUrl": "https://supabase.co/storage/resumes/filename.pdf"
}
```

---

#### 7. Upload Photo

**POST** `/auth/photo`

Upload profile photo.

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```
photo: <file>
```

**Response (200):**
```json
{
  "message": "Photo uploaded successfully",
  "photoUrl": "https://supabase.co/storage/photos/filename.jpg"
}
```

---

### Job Endpoints

#### 1. Get All Jobs

**GET** `/jobs`

Retrieve job listings with optional filters.

**Query Parameters:**
```
?search=developer
&location=remote
&type=Full Time
&category=IT
&page=1
&limit=10
&sort=latest
```

**Response (200):**
```json
{
  "jobs": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Senior Software Engineer",
      "company": "Tech Corp",
      "location": "Remote",
      "salary": "$100k - $150k",
      "type": "Full Time",
      "category": "IT",
      "description": "We are looking for...",
      "requirements": ["5+ years experience", "React", "Node.js"],
      "applicationsCount": 25,
      "status": "active",
      "createdAt": "2024-02-24T10:00:00.000Z"
    }
  ],
  "total": 150,
  "page": 1,
  "pages": 15
}
```

---

#### 2. Get Job by ID

**GET** `/jobs/:id`

Get detailed information about a specific job.

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Senior Software Engineer",
  "company": "Tech Corp",
  "location": "Remote",
  "salary": "$100k - $150k",
  "type": "Full Time",
  "category": "IT",
  "description": "Detailed job description...",
  "requirements": ["5+ years experience", "React", "Node.js", "MongoDB"],
  "responsibilities": [
    "Lead development of new features",
    "Code review and mentoring",
    "Architecture decisions"
  ],
  "benefits": [
    "Health insurance",
    "401k matching",
    "Remote work",
    "Unlimited PTO"
  ],
  "postedBy": {
    "_id": "507f1f77bcf86cd799439012",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@techcorp.com"
  },
  "applicationsCount": 25,
  "views": 150,
  "status": "active",
  "createdAt": "2024-02-24T10:00:00.000Z"
}
```

---

#### 3. Apply for Job

**POST** `/jobs/:id/apply`

Submit job application.

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body (Optional):**
```json
{
  "coverLetter": "I am excited to apply..."
}
```

**Response (201):**
```json
{
  "message": "Application submitted successfully",
  "application": {
    "_id": "507f1f77bcf86cd799439013",
    "jobId": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439014",
    "status": "pending",
    "appliedAt": "2024-02-24T10:00:00.000Z"
  }
}
```

---

#### 4. Get User Applications

**GET** `/jobs/applied`

Get all applications submitted by the authenticated user.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "applications": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "job": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Senior Software Engineer",
        "company": "Tech Corp",
        "location": "Remote"
      },
      "status": "interview",
      "appliedAt": "2024-02-24T10:00:00.000Z",
      "updatedAt": "2024-02-25T14:30:00.000Z"
    }
  ]
}
```

---

### Employer Endpoints

#### 1. Post Job

**POST** `/employer/jobs`

Create a new job posting (Employer/Recruiter only).

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Senior Full Stack Developer",
  "company": "Tech Innovations Inc",
  "location": "San Francisco, CA / Remote",
  "salary": "$120k - $180k",
  "type": "Full Time",
  "category": "IT",
  "description": "We are seeking an experienced full stack developer...",
  "requirements": [
    "5+ years of professional experience",
    "Strong proficiency in React and Node.js",
    "Experience with MongoDB",
    "Excellent problem-solving skills"
  ],
  "responsibilities": [
    "Design and develop scalable web applications",
    "Collaborate with cross-functional teams",
    "Mentor junior developers"
  ],
  "benefits": [
    "Competitive salary",
    "Health, dental, and vision insurance",
    "401(k) with company match",
    "Flexible work hours"
  ]
}
```

**Response (201):**
```json
{
  "message": "Job posted successfully",
  "job": {
    "_id": "507f1f77bcf86cd799439015",
    "title": "Senior Full Stack Developer",
    "company": "Tech Innovations Inc",
    "status": "active",
    "createdAt": "2024-02-24T10:00:00.000Z"
  }
}
```

---

#### 2. Get Employer's Jobs

**GET** `/employer/jobs`

Get all jobs posted by the authenticated employer.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "jobs": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "title": "Senior Full Stack Developer",
      "company": "Tech Innovations Inc",
      "applicationsCount": 42,
      "views": 320,
      "status": "active",
      "createdAt": "2024-02-24T10:00:00.000Z"
    }
  ]
}
```

---

#### 3. Get Job Applicants

**GET** `/employer/jobs/:jobId/applications`

Get all applications for a specific job.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "applications": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "user": {
        "_id": "507f1f77bcf86cd799439017",
        "firstName": "Alice",
        "lastName": "Johnson",
        "email": "alice@example.com",
        "resumeUrl": "https://example.com/resume.pdf",
        "photoUrl": "https://example.com/photo.jpg",
        "skills": ["React", "Node.js", "MongoDB"]
      },
      "status": "pending",
      "coverLetter": "I am excited to apply...",
      "appliedAt": "2024-02-24T10:00:00.000Z"
    }
  ]
}
```

---

#### 4. Update Application Status

**PUT** `/employer/applications/:id`

Update the status of a job application.

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "interview",
  "notes": "Strong candidate, schedule for technical interview"
}
```

**Response (200):**
```json
{
  "message": "Application status updated",
  "application": {
    "_id": "507f1f77bcf86cd799439016",
    "status": "interview",
    "notes": "Strong candidate, schedule for technical interview",
    "updatedAt": "2024-02-25T14:30:00.000Z"
  }
}
```

---

### Course Endpoints

#### 1. Get All Courses

**GET** `/courses`

Retrieve all available courses.

**Query Parameters:**
```
?search=react
&category=Engineering
&level=Beginner
&page=1
&limit=10
```

**Response (200):**
```json
{
  "courses": [
    {
      "_id": "507f1f77bcf86cd799439018",
      "title": "React Masterclass 2024",
      "description": "Learn React from scratch...",
      "instructor": "John Smith",
      "duration": "8 weeks",
      "level": "Beginner",
      "category": "Engineering",
      "thumbnailUrl": "https://example.com/thumbnail.jpg",
      "enrolledCount": 1250,
      "rating": 4.8,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

#### 2. Enroll in Course

**POST** `/courses/:id/enroll`

Enroll in a course.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (201):**
```json
{
  "message": "Enrolled successfully",
  "enrollment": {
    "_id": "507f1f77bcf86cd799439019",
    "courseId": "507f1f77bcf86cd799439018",
    "userId": "507f1f77bcf86cd799439014",
    "progress": 0,
    "enrolledAt": "2024-02-24T10:00:00.000Z"
  }
}
```

---

### Chat Endpoints

#### 1. Get Conversations

**GET** `/chat/conversations`

Get all conversations for the authenticated user.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "conversations": [
    {
      "conversationId": "507f1f77bcf86cd799439014_507f1f77bcf86cd799439020",
      "otherUser": {
        "_id": "507f1f77bcf86cd799439020",
        "firstName": "Bob",
        "lastName": "Wilson",
        "photoUrl": "https://example.com/photo.jpg",
        "role": "recruiter"
      },
      "lastMessage": {
        "message": "Thanks for your application!",
        "timestamp": "2024-02-24T15:30:00.000Z",
        "isRead": true
      },
      "unreadCount": 0
    }
  ]
}
```

---

#### 2. Get Messages

**GET** `/chat/messages/:conversationId`

Get all messages in a conversation.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "messages": [
    {
      "_id": "507f1f77bcf86cd799439021",
      "senderId": "507f1f77bcf86cd799439014",
      "receiverId": "507f1f77bcf86cd799439020",
      "message": "Hello, I have a question about the position",
      "isRead": true,
      "timestamp": "2024-02-24T15:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439022",
      "senderId": "507f1f77bcf86cd799439020",
      "receiverId": "507f1f77bcf86cd799439014",
      "message": "Sure, I'd be happy to help!",
      "isRead": true,
      "timestamp": "2024-02-24T15:05:00.000Z"
    }
  ]
}
```

---

#### 3. Send Message

**POST** `/chat/messages`

Send a new message.

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "receiverId": "507f1f77bcf86cd799439020",
  "message": "When can we schedule an interview?"
}
```

**Response (201):**
```json
{
  "message": "Message sent",
  "data": {
    "_id": "507f1f77bcf86cd799439023",
    "senderId": "507f1f77bcf86cd799439014",
    "receiverId": "507f1f77bcf86cd799439020",
    "message": "When can we schedule an interview?",
    "timestamp": "2024-02-24T15:30:00.000Z"
  }
}
```

---

### AI Endpoints

#### 1. Chat with AI Assistant

**POST** `/ai/chat`

Get AI-powered assistance.

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "message": "How can I improve my resume?",
  "context": "seeker"
}
```

**Response (200):**
```json
{
  "response": "Here are some tips to improve your resume:\n1. Use action verbs...\n2. Quantify achievements...\n3. Tailor to job description..."
}
```

---

### Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**
```json
{
  "error": "Validation error",
  "details": ["Email is required", "Password must be at least 8 characters"]
}
```

**401 Unauthorized:**
```json
{
  "error": "Authentication required",
  "message": "Please log in to access this resource"
}
```

**403 Forbidden:**
```json
{
  "error": "Access denied",
  "message": "You don't have permission to perform this action"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found",
  "message": "The requested resource does not exist"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Something went wrong on our end"
}
```


---

## Installation Guide

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)
- **Code Editor** (VS Code recommended) - [Download](https://code.visualstudio.com/)

### Verify Installation

```bash
# Check Node.js version
node --version
# Should output: v16.x.x or higher

# Check npm version
npm --version
# Should output: 8.x.x or higher

# Check MongoDB
mongod --version
# Should output MongoDB version

# Check Git
git --version
# Should output git version
```

---

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd futuremilestone
```

---

### Step 2: Backend Setup

#### 2.1 Install Backend Dependencies

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# This will install all packages from package.json including:
# - express, mongoose, socket.io
# - jsonwebtoken, bcryptjs
# - multer, nodemailer
# - and all other dependencies
```

#### 2.2 Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# Create .env file
touch .env  # On Windows: type nul > .env
```

Add the following configuration to `backend/.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/jobportal
MONGO_URI=mongodb://127.0.0.1:27017/jobportal

# JWT Secret (change this to a random string)
JWT_SECRET=your_super_secret_jwt_key_change_this

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Supabase Storage (Get from Supabase Dashboard)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE=your_supabase_service_role_key

# Firebase Storage (Optional - Fallback)
FIREBASE_STORAGE_BUCKET=your_firebase_bucket_name
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# Email Configuration (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# OTP Configuration
ENFORCE_VERIFICATION=false
ALLOW_MASTER_OTP=true
```

#### 2.3 Start MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service
mongod

# Or on Windows, start MongoDB service from Services
# Or use MongoDB Compass to start the server
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env` with Atlas connection string

#### 2.4 Start Backend Server

```bash
# Make sure you're in the backend directory
cd backend

# Start the server
npm start

# Or for development with auto-restart
npm run dev
```

You should see:
```
✅ Server running on port 5000
✅ MongoDB connected successfully
✅ Socket.IO initialized
```

Backend is now running at: **http://localhost:5000**

---

### Step 3: Frontend Setup

#### 3.1 Install Frontend Dependencies

Open a new terminal window:

```bash
# Navigate to frontend directory from project root
cd frontend

# Install dependencies
npm install

# This will install:
# - react, react-dom, react-router-dom
# - vite, tailwindcss
# - axios, socket.io-client
# - and all other frontend dependencies
```

#### 3.2 Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
# Create .env file
touch .env  # On Windows: type nul > .env
```

Add the following to `frontend/.env`:

```env
# API Configuration
VITE_API_URL=/api
VITE_SOCKET_URL=http://localhost:5000

# Google OAuth Client ID (same as backend)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

#### 3.3 Start Frontend Development Server

```bash
# Make sure you're in the frontend directory
cd frontend

# Start the development server
npm run dev
```

You should see:
```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Frontend is now running at: **http://localhost:5173**

---

### Step 4: Verify Installation

#### 4.1 Check Backend

Open your browser and navigate to:
```
http://localhost:5000/api/health
```

You should see:
```json
{
  "status": "OK",
  "database": "Connected"
}
```

#### 4.2 Check Frontend

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the Future Milestone landing page.

#### 4.3 Test Login

Use the default admin credentials:
```
Email: admin@jobportal.com
Password: admin123
```

---

### Step 5: Optional Setup

#### 5.1 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5173`
   - `http://localhost:5000/auth/google/callback`
6. Copy Client ID and Client Secret
7. Update `.env` files in both backend and frontend

#### 5.2 Supabase Storage Setup

1. Create account at [Supabase](https://supabase.com/)
2. Create a new project
3. Go to Storage section
4. Create buckets:
   - `resumes`
   - `photos`
   - `videos`
5. Set bucket policies to public
6. Copy project URL and anon key
7. Update `backend/.env`

#### 5.3 Gemini AI Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Update `GEMINI_API_KEY` in `backend/.env`

---

### Common Installation Issues

#### Issue: MongoDB Connection Error

**Solution:**
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
mongod

# Or check MongoDB service status
# Windows: Services → MongoDB Server
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

#### Issue: Port Already in Use

**Solution:**
```bash
# Find process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# Mac/Linux:
lsof -i :5000
kill -9 <process_id>

# Or change PORT in backend/.env
```

#### Issue: npm install fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall with legacy peer deps
npm install --legacy-peer-deps
```

#### Issue: Frontend can't connect to backend

**Solution:**
1. Check backend is running on port 5000
2. Verify `VITE_API_URL` in `frontend/.env`
3. Check CORS settings in `backend/index.js`
4. Clear browser cache

---

### Development Workflow

#### Running Both Servers

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

#### Stopping Servers

Press `Ctrl + C` in each terminal to stop the servers.

---

### Next Steps

After successful installation:

1. ✅ Explore the application at `http://localhost:5173`
2. ✅ Test user registration and login
3. ✅ Browse jobs and apply
4. ✅ Test chat functionality
5. ✅ Upload resume and profile photo
6. ✅ Review API documentation
7. ✅ Customize for your needs


---

## Deployment Guide

### Overview

This guide covers deploying the Future Milestone application to production environments. The recommended setup is:
- **Backend**: Render
- **Frontend**: Vercel
- **Database**: MongoDB Atlas

### Current Deployment

- **Backend**: `https://backend-portal-56ud.onrender.com`
- **Frontend**: Ready for deployment
- **Status**: Backend is live and operational

---

### Prerequisites for Deployment

- GitHub account
- Render account (for backend)
- Vercel account (for frontend)
- MongoDB Atlas account (for database)
- Domain name (optional)

---

### Part 1: Database Deployment (MongoDB Atlas)

#### Step 1: Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Click "Build a Database"
4. Choose "Shared" (Free tier) or "Dedicated"
5. Select cloud provider and region
6. Click "Create Cluster"

#### Step 2: Configure Database Access

1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Create username and password (save these!)
4. Set privileges to "Read and write to any database"
5. Click "Add User"

#### Step 3: Configure Network Access

1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

#### Step 4: Get Connection String

1. Go to "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `jobportal`

Example:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/jobportal?retryWrites=true&w=majority
```

---

### Part 2: Backend Deployment (Render)

#### Step 1: Prepare Backend for Deployment

1. Ensure `backend/package.json` has start script:
```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```

2. Create `render.yaml` in project root (already exists):
```yaml
services:
  - type: web
    name: backend-portal
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: GOOGLE_CLIENT_ID
        sync: false
      - key: GOOGLE_CLIENT_SECRET
        sync: false
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_ANON_KEY
        sync: false
      - key: GEMINI_API_KEY
        sync: false
```

#### Step 2: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for deployment"

# Add remote repository
git remote add origin <your-github-repo-url>

# Push to GitHub
git push -u origin main
```

#### Step 3: Deploy on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `backend-portal` (or your choice)
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free or paid

#### Step 4: Add Environment Variables

In Render dashboard, go to "Environment" and add:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=<your-mongodb-atlas-connection-string>
JWT_SECRET=<your-secret-key>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-key>
SUPABASE_SERVICE_ROLE=<your-supabase-service-role>
GEMINI_API_KEY=<your-gemini-api-key>
FRONTEND_URL=<your-frontend-url>
BACKEND_URL=<your-render-backend-url>
EMAIL_SERVICE=gmail
EMAIL_USER=<your-email>
EMAIL_PASS=<your-app-password>
```

#### Step 5: Deploy

1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Once deployed, you'll get a URL like: `https://backend-portal-xxxx.onrender.com`
4. Test the API: `https://your-backend-url.onrender.com/api/health`

---

### Part 3: Frontend Deployment (Vercel)

#### Step 1: Prepare Frontend for Deployment

1. Update `frontend/.env.production`:
```env
VITE_API_URL=https://backend-portal-56ud.onrender.com/api
VITE_SOCKET_URL=https://backend-portal-56ud.onrender.com
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
```

2. Update `frontend/vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://backend-portal-56ud.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
```

3. Create `vercel.json` in project root (already exists):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "frontend/dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://backend-portal-56ud.onrender.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://backend-portal-56ud.onrender.com/api/:path*"
    }
  ]
}
```

#### Step 2: Build Frontend

```bash
cd frontend
npm run build
```

This creates a `dist` folder with production-ready files.

#### Step 3: Deploy on Vercel

**Option A: Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd frontend
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? future-milestone-frontend
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

**Option B: Vercel Dashboard**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

#### Step 4: Add Environment Variables in Vercel

In Vercel project settings → Environment Variables:

```
VITE_API_URL=https://backend-portal-56ud.onrender.com/api
VITE_SOCKET_URL=https://backend-portal-56ud.onrender.com
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
```

#### Step 5: Deploy

1. Click "Deploy"
2. Wait for deployment (2-5 minutes)
3. You'll get a URL like: `https://future-milestone.vercel.app`

---

### Part 4: Post-Deployment Configuration

#### Update Backend CORS

Update `backend/index.js` to allow your frontend domain:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://future-milestone.vercel.app', // Add your Vercel URL
    'https://your-custom-domain.com' // If using custom domain
  ],
  credentials: true
}));
```

Redeploy backend after this change.

#### Update Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "Credentials"
4. Edit OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `https://future-milestone.vercel.app`
   - `https://backend-portal-56ud.onrender.com/auth/google/callback`
6. Save changes

#### Update Supabase CORS

1. Go to Supabase Dashboard
2. Project Settings → API
3. Add your frontend URL to allowed origins

---

### Part 5: Custom Domain (Optional)

#### For Frontend (Vercel)

1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. Wait for DNS propagation (up to 48 hours)

#### For Backend (Render)

1. Go to Render service settings
2. Click "Custom Domains"
3. Add your custom domain
4. Configure DNS records as instructed
5. Wait for SSL certificate provisioning

---

### Deployment Checklist

Before going live, verify:

- [ ] MongoDB Atlas cluster is running
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] All environment variables configured
- [ ] CORS settings updated
- [ ] Google OAuth redirect URIs updated
- [ ] API endpoints working
- [ ] File uploads working
- [ ] Real-time chat working
- [ ] Email notifications working (if configured)
- [ ] SSL certificates active (HTTPS)
- [ ] Custom domains configured (if applicable)

---

### Monitoring & Maintenance

#### Render Monitoring

- View logs in Render dashboard
- Set up health checks
- Monitor resource usage
- Configure auto-scaling (paid plans)

#### Vercel Monitoring

- View deployment logs
- Monitor function execution
- Check analytics
- Set up custom monitoring

#### Database Monitoring

- MongoDB Atlas provides built-in monitoring
- Set up alerts for high usage
- Monitor query performance
- Regular backups (automatic on Atlas)

---

### Troubleshooting Deployment

#### Backend Issues

**Problem**: Backend not starting
```bash
# Check Render logs
# Common issues:
# - Missing environment variables
# - MongoDB connection string incorrect
# - Port configuration issues
```

**Solution**:
1. Verify all environment variables
2. Check MongoDB Atlas IP whitelist
3. Ensure connection string is correct

#### Frontend Issues

**Problem**: API calls failing
```bash
# Check browser console
# Common issues:
# - CORS errors
# - Incorrect API URL
# - Missing environment variables
```

**Solution**:
1. Verify `VITE_API_URL` is correct
2. Check backend CORS configuration
3. Ensure backend is running

#### Database Issues

**Problem**: Can't connect to MongoDB
```bash
# Common issues:
# - IP not whitelisted
# - Incorrect credentials
# - Connection string malformed
```

**Solution**:
1. Add 0.0.0.0/0 to IP whitelist
2. Verify username and password
3. Check connection string format

---

### Scaling Considerations

#### Backend Scaling

- **Render**: Upgrade to paid plan for auto-scaling
- **Load Balancing**: Use Render's built-in load balancing
- **Caching**: Implement Redis for session storage
- **CDN**: Use Cloudflare for static assets

#### Database Scaling

- **MongoDB Atlas**: Upgrade cluster tier
- **Sharding**: Enable for large datasets
- **Read Replicas**: Add for read-heavy workloads
- **Indexes**: Optimize queries with proper indexes

#### Frontend Scaling

- **Vercel**: Automatic edge caching
- **Image Optimization**: Use Vercel's image optimization
- **Code Splitting**: Implement lazy loading
- **CDN**: Vercel provides global CDN

---

### Cost Estimation

#### Free Tier (Development/Testing)

- **MongoDB Atlas**: Free (512 MB storage)
- **Render**: Free (750 hours/month)
- **Vercel**: Free (100 GB bandwidth)
- **Total**: $0/month

#### Production (Small Scale)

- **MongoDB Atlas**: $9/month (Shared M2)
- **Render**: $7/month (Starter)
- **Vercel**: $20/month (Pro)
- **Total**: ~$36/month

#### Production (Medium Scale)

- **MongoDB Atlas**: $57/month (Dedicated M10)
- **Render**: $25/month (Standard)
- **Vercel**: $20/month (Pro)
- **Total**: ~$102/month


---

## Configuration

### Environment Variables

#### Backend Environment Variables

Complete reference for `backend/.env`:

```env
# ============================================
# SERVER CONFIGURATION
# ============================================
NODE_ENV=development                    # Environment: development, production, test
PORT=5000                               # Server port (default: 5000)

# ============================================
# DATABASE CONFIGURATION
# ============================================
MONGODB_URI=mongodb://127.0.0.1:27017/jobportal    # Local MongoDB
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobportal

MONGO_URI=mongodb://127.0.0.1:27017/jobportal      # Fallback connection string

# ============================================
# AUTHENTICATION
# ============================================
JWT_SECRET=supersecret_milestone_token_2026        # JWT signing secret (change in production!)
JWT_EXPIRE=7d                                      # Token expiration (optional)

# ============================================
# GOOGLE OAUTH 2.0
# ============================================
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# ============================================
# FILE STORAGE - SUPABASE (Primary)
# ============================================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE=your_supabase_service_role_key

# ============================================
# FILE STORAGE - FIREBASE (Fallback)
# ============================================
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json

# ============================================
# FILE STORAGE - CLOUDINARY (Optional)
# ============================================
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ============================================
# APPLICATION URLS
# ============================================
FRONTEND_URL=http://localhost:5173              # Frontend URL for CORS
BACKEND_URL=http://localhost:5000               # Backend URL for callbacks

# Production URLs:
# FRONTEND_URL=https://your-app.vercel.app
# BACKEND_URL=https://your-backend.onrender.com

# ============================================
# EMAIL CONFIGURATION
# ============================================
EMAIL_SERVICE=gmail                             # Email service provider
EMAIL_USER=your_email@gmail.com                 # Sender email
EMAIL_PASS=your_app_specific_password           # App-specific password (not regular password)
EMAIL_FROM=Future Milestone <noreply@futuremilestone.com>

# ============================================
# AI SERVICES
# ============================================
GEMINI_API_KEY=your_gemini_api_key              # Google Gemini AI API key

# ============================================
# OTP & VERIFICATION
# ============================================
ENFORCE_VERIFICATION=false                      # Require email verification
ALLOW_MASTER_OTP=true                          # Allow master OTP for testing
MASTER_OTP=123456                              # Master OTP (development only)

# ============================================
# SECURITY
# ============================================
BCRYPT_ROUNDS=10                               # Password hashing rounds
RATE_LIMIT_WINDOW=15                           # Rate limit window (minutes)
RATE_LIMIT_MAX=100                             # Max requests per window

# ============================================
# SOCKET.IO
# ============================================
SOCKET_CORS_ORIGIN=http://localhost:5173       # Socket.IO CORS origin

# ============================================
# FILE UPLOAD LIMITS
# ============================================
MAX_FILE_SIZE=10485760                         # Max file size in bytes (10MB)
MAX_RESUME_SIZE=5242880                        # Max resume size (5MB)
MAX_PHOTO_SIZE=2097152                         # Max photo size (2MB)
MAX_VIDEO_SIZE=52428800                        # Max video size (50MB)

# ============================================
# SESSION & COOKIES
# ============================================
SESSION_SECRET=your_session_secret             # Session secret
COOKIE_DOMAIN=localhost                        # Cookie domain
COOKIE_SECURE=false                            # HTTPS only cookies (true in production)

# ============================================
# LOGGING
# ============================================
LOG_LEVEL=info                                 # Logging level: error, warn, info, debug
LOG_FILE=./logs/app.log                        # Log file path

# ============================================
# FEATURES FLAGS
# ============================================
ENABLE_CHAT=true                               # Enable chat feature
ENABLE_VIDEO_CALLS=true                        # Enable video interviews
ENABLE_AI_ASSISTANT=true                       # Enable AI chatbot
ENABLE_EMAIL_NOTIFICATIONS=true                # Enable email notifications
```

---

#### Frontend Environment Variables

Complete reference for `frontend/.env`:

```env
# ============================================
# API CONFIGURATION
# ============================================
VITE_API_URL=/api                              # API base URL (proxied in development)
# Production:
# VITE_API_URL=https://backend-portal-56ud.onrender.com/api

# ============================================
# WEBSOCKET CONFIGURATION
# ============================================
VITE_SOCKET_URL=http://localhost:5000          # Socket.IO server URL
# Production:
# VITE_SOCKET_URL=https://backend-portal-56ud.onrender.com

# ============================================
# GOOGLE OAUTH
# ============================================
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# ============================================
# FEATURE FLAGS
# ============================================
VITE_ENABLE_CHAT=true                          # Enable chat feature
VITE_ENABLE_VIDEO=true                         # Enable video calls
VITE_ENABLE_AI=true                            # Enable AI assistant

# ============================================
# ANALYTICS (Optional)
# ============================================
VITE_GA_TRACKING_ID=G-XXXXXXXXXX               # Google Analytics
VITE_SENTRY_DSN=your_sentry_dsn                # Sentry error tracking

# ============================================
# APP CONFIGURATION
# ============================================
VITE_APP_NAME=Future Milestone                 # Application name
VITE_APP_VERSION=1.0.0                         # Application version
```

---

### Configuration Files

#### Backend Configuration

**1. CORS Configuration** (`backend/index.js`)

```javascript
const cors = require('cors');

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
    'https://your-production-domain.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

**2. Multer Configuration** (`backend/config/multerConfig.js`)

```javascript
const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = {
    'image/jpeg': true,
    'image/png': true,
    'image/jpg': true,
    'application/pdf': true,
    'application/msword': true,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: fileFilter
});

module.exports = upload;
```

**3. MongoDB Configuration** (`backend/config/database.js`)

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

**4. Socket.IO Configuration** (`backend/index.js`)

```javascript
const socketIO = require('socket.io');

const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
  });

  socket.on('sendMessage', async (data) => {
    // Handle message
    io.to(data.receiverId).emit('newMessage', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
```

---

#### Frontend Configuration

**1. Vite Configuration** (`frontend/vite.config.js`)

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', 'lucide-react']
        }
      }
    }
  }
})
```

**2. Tailwind Configuration** (`frontend/tailwind.config.cjs`)

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
```

**3. Axios Configuration** (`frontend/src/api/axios.js`)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

**4. Socket.IO Configuration** (`frontend/src/context/ChatContext.jsx`)

```javascript
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

export { socket };
```

---

### Security Configuration

#### 1. Helmet.js Security Headers

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

#### 2. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);
```

#### 3. Input Validation

```javascript
const { body, validationResult } = require('express-validator');

const validateSignup = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
```

---

### Performance Configuration

#### 1. Compression

```javascript
const compression = require('compression');

app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
```

#### 2. Caching

```javascript
// Static file caching
app.use(express.static('public', {
  maxAge: '1d',
  etag: true
}));

// API response caching (using Redis)
const redis = require('redis');
const client = redis.createClient();

const cache = (duration) => {
  return (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    client.get(key, (err, data) => {
      if (data) {
        return res.json(JSON.parse(data));
      }
      res.sendResponse = res.json;
      res.json = (body) => {
        client.setex(key, duration, JSON.stringify(body));
        res.sendResponse(body);
      };
      next();
    });
  };
};
```

---

### Logging Configuration

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```


---

## Security

### Security Features

Future Milestone implements multiple layers of security to protect user data and ensure safe operations.

#### 1. Authentication Security

**Password Security**
- Passwords hashed using bcrypt with 10 salt rounds
- Minimum password length: 8 characters
- Password complexity requirements (recommended)
- Secure password reset flow with OTP

```javascript
// Password hashing example
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Password verification
const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
```

**JWT Token Security**
- Tokens signed with secret key
- Token expiration (7 days default)
- Secure token storage (localStorage with HTTPS)
- Token validation on every protected route

```javascript
// Token generation
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { userId: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Token verification
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

**OAuth Security**
- Google OAuth 2.0 implementation
- Secure credential verification
- No password storage for OAuth users
- Automatic account linking

---

#### 2. API Security

**CORS Protection**
```javascript
const corsOptions = {
  origin: [
    'http://localhost:5173',
    process.env.FRONTEND_URL
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```

**Helmet.js Security Headers**
```javascript
app.use(helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: true,
  dnsPrefetchControl: true,
  frameguard: true,
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: true,
  referrerPolicy: true,
  xssFilter: true
}));
```

**Rate Limiting**
```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', apiLimiter);

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  skipSuccessfulRequests: true
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);
```

---

#### 3. Input Validation & Sanitization

**Express Validator**
```javascript
const { body, validationResult } = require('express-validator');

// Signup validation
const signupValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('firstName')
    .trim()
    .notEmpty()
    .escape()
    .withMessage('First name required'),
  body('lastName')
    .trim()
    .notEmpty()
    .escape()
    .withMessage('Last name required')
];

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
```

**MongoDB Injection Prevention**
- Mongoose automatically sanitizes queries
- No raw query execution
- Schema validation enforced

---

#### 4. File Upload Security

**File Type Validation**
```javascript
const allowedMimeTypes = {
  resume: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  photo: ['image/jpeg', 'image/png', 'image/jpg'],
  video: ['video/mp4', 'video/mpeg', 'video/quicktime']
};

const fileFilter = (req, file, cb) => {
  const fileType = req.route.path.includes('resume') ? 'resume' : 
                   req.route.path.includes('photo') ? 'photo' : 'video';
  
  if (allowedMimeTypes[fileType].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};
```

**File Size Limits**
```javascript
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 1 // Single file upload
  },
  fileFilter: fileFilter
});
```

**Secure File Storage**
- Files stored in cloud (Supabase/Firebase)
- No direct file system access
- Signed URLs for private files
- Automatic virus scanning (cloud provider)

---

#### 5. Database Security

**Connection Security**
```javascript
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true, // Enable SSL in production
  sslValidate: true,
  authSource: 'admin'
};
```

**Schema Validation**
```javascript
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: (v) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v),
      message: 'Invalid email format'
    }
  },
  password: {
    type: String,
    required: function() {
      return this.authProvider === 'local';
    },
    minlength: 8
  }
});
```

**Sensitive Data Protection**
```javascript
// Exclude password from queries
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Or use select in queries
const user = await User.findById(id).select('-password');
```

---

#### 6. Session Security

**Secure Cookie Configuration**
```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' // CSRF protection
  }
}));
```

---

#### 7. XSS Protection

**Content Security Policy**
```javascript
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "trusted-cdn.com"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", "wss:", "https:"],
    fontSrc: ["'self'", "https:", "data:"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'self'", "https://meet.jit.si"]
  }
}));
```

**Output Encoding**
```javascript
// Frontend - React automatically escapes
<div>{userInput}</div> // Safe

// For dangerouslySetInnerHTML, use DOMPurify
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
```

---

#### 8. CSRF Protection

**Token-based Protection**
```javascript
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);

app.get('/form', (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});
```

---

#### 9. SQL/NoSQL Injection Prevention

**Mongoose Protection**
```javascript
// Mongoose automatically sanitizes
const user = await User.findOne({ email: req.body.email }); // Safe

// Avoid raw queries
// BAD: User.find({ $where: userInput })
// GOOD: User.find({ email: sanitizedInput })
```

---

#### 10. Secure Communication

**HTTPS Enforcement**
```javascript
// Redirect HTTP to HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

**WebSocket Security**
```javascript
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  },
  transports: ['websocket', 'polling'],
  secure: process.env.NODE_ENV === 'production'
});

// Authenticate socket connections
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});
```

---

### Security Best Practices

#### For Developers

1. **Never commit sensitive data**
   - Use `.env` files
   - Add `.env` to `.gitignore`
   - Use environment variables for secrets

2. **Keep dependencies updated**
   ```bash
   npm audit
   npm audit fix
   npm update
   ```

3. **Use HTTPS in production**
   - Enable SSL certificates
   - Force HTTPS redirects
   - Use secure cookies

4. **Implement proper error handling**
   ```javascript
   // Don't expose internal errors
   app.use((err, req, res, next) => {
     console.error(err.stack);
     res.status(500).json({
       error: 'Something went wrong',
       // Don't send: message: err.message
     });
   });
   ```

5. **Regular security audits**
   - Run `npm audit` regularly
   - Review dependencies
   - Update security patches

#### For Users

1. **Strong passwords**
   - Minimum 8 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Don't reuse passwords

2. **Enable two-factor authentication** (if implemented)

3. **Be cautious with file uploads**
   - Only upload legitimate files
   - Scan files for viruses

4. **Logout when done**
   - Especially on shared computers
   - Clear browser cache

5. **Report security issues**
   - Contact: security@futuremilestone.com
   - Responsible disclosure

---

### Security Checklist

Before deployment, ensure:

- [ ] All environment variables configured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] File upload restrictions in place
- [ ] Password hashing working
- [ ] JWT tokens secure
- [ ] Database connection encrypted
- [ ] Error messages don't expose sensitive info
- [ ] Security headers configured (Helmet)
- [ ] Dependencies updated
- [ ] No sensitive data in logs
- [ ] Backup strategy in place
- [ ] Monitoring and alerts configured

---

### Incident Response

If a security breach occurs:

1. **Immediate Actions**
   - Isolate affected systems
   - Change all credentials
   - Revoke compromised tokens
   - Enable maintenance mode

2. **Investigation**
   - Review logs
   - Identify breach vector
   - Assess damage
   - Document findings

3. **Remediation**
   - Patch vulnerabilities
   - Update security measures
   - Restore from clean backup
   - Test thoroughly

4. **Communication**
   - Notify affected users
   - Report to authorities (if required)
   - Update security documentation
   - Implement preventive measures

5. **Post-Incident**
   - Conduct security audit
   - Update policies
   - Train team
   - Monitor closely

---

### Compliance

#### GDPR Compliance (if applicable)

- User data encryption
- Right to access data
- Right to deletion
- Data portability
- Privacy policy
- Cookie consent
- Data breach notification

#### Data Protection

- Encrypt sensitive data at rest
- Encrypt data in transit (HTTPS)
- Regular backups
- Access controls
- Audit logs
- Data retention policies


---

## Troubleshooting

### Common Issues and Solutions

#### Backend Issues

##### 1. MongoDB Connection Failed

**Error:**
```
MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**

**A. MongoDB not running**
```bash
# Windows
# Start MongoDB service from Services app
# Or run: net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**B. Wrong connection string**
```env
# Check MONGODB_URI in .env
MONGODB_URI=mongodb://127.0.0.1:27017/jobportal

# For MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobportal
```

**C. MongoDB not installed**
```bash
# Download and install from:
# https://www.mongodb.com/try/download/community
```

---

##### 2. Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**

**Windows:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <process_id> /F
```

**Mac/Linux:**
```bash
# Find process
lsof -i :5000

# Kill process
kill -9 <process_id>

# Or use different port
# Change PORT in .env
PORT=5001
```

---

##### 3. JWT Token Invalid

**Error:**
```
JsonWebTokenError: invalid token
```

**Solutions:**

**A. Token expired**
```javascript
// Frontend: Clear token and redirect to login
localStorage.removeItem('token');
window.location.href = '/login';
```

**B. Wrong JWT_SECRET**
```env
# Ensure JWT_SECRET matches in .env
JWT_SECRET=supersecret_milestone_token_2026
```

**C. Token format incorrect**
```javascript
// Ensure token is sent with Bearer prefix
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

##### 4. File Upload Fails

**Error:**
```
MulterError: File too large
```

**Solutions:**

**A. File size exceeds limit**
```javascript
// Increase limit in multer config
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});
```

**B. Invalid file type**
```javascript
// Check allowed file types
const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
```

**C. Supabase/Firebase not configured**
```env
# Add credentials to .env
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
```

---

##### 5. CORS Error

**Error:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solutions:**

**A. Update CORS configuration**
```javascript
// backend/index.js
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ],
  credentials: true
};
app.use(cors(corsOptions));
```

**B. Check frontend URL**
```env
# backend/.env
FRONTEND_URL=http://localhost:5173
```

---

#### Frontend Issues

##### 1. API Calls Failing

**Error:**
```
Network Error / Request failed with status code 404
```

**Solutions:**

**A. Backend not running**
```bash
# Start backend server
cd backend
npm start
```

**B. Wrong API URL**
```env
# frontend/.env
VITE_API_URL=/api
# Or for production:
VITE_API_URL=https://backend-portal-56ud.onrender.com/api
```

**C. Proxy not configured**
```javascript
// frontend/vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

---

##### 2. Socket.IO Not Connecting

**Error:**
```
WebSocket connection failed
```

**Solutions:**

**A. Wrong Socket URL**
```env
# frontend/.env
VITE_SOCKET_URL=http://localhost:5000
```

**B. Socket not initialized**
```javascript
// Check socket connection
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  autoConnect: true,
  reconnection: true
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
```

---

##### 3. Google OAuth Not Working

**Error:**
```
Invalid client ID / Redirect URI mismatch
```

**Solutions:**

**A. Check Client ID**
```env
# Ensure same client ID in both .env files
# backend/.env
GOOGLE_CLIENT_ID=your_client_id

# frontend/.env
VITE_GOOGLE_CLIENT_ID=your_client_id
```

**B. Update redirect URIs in Google Console**
```
Authorized JavaScript origins:
- http://localhost:5173
- http://localhost:5000
- https://your-production-domain.com

Authorized redirect URIs:
- http://localhost:5173
- http://localhost:5000/auth/google/callback
- https://your-backend.com/auth/google/callback
```

---

##### 4. Build Fails

**Error:**
```
npm run build fails with errors
```

**Solutions:**

**A. Clear cache and rebuild**
```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall
npm install

# Build
npm run build
```

**B. Fix TypeScript/ESLint errors**
```bash
# Check for errors
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

---

##### 5. Page Not Found (404) After Deployment

**Error:**
```
404 Not Found on page refresh
```

**Solutions:**

**A. Configure Vercel redirects**
```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**B. Configure Netlify redirects**
```
// public/_redirects
/*    /index.html   200
```

---

#### Database Issues

##### 1. Duplicate Key Error

**Error:**
```
E11000 duplicate key error collection
```

**Solutions:**

**A. Email already exists**
```javascript
// Check if user exists before creating
const existingUser = await User.findOne({ email });
if (existingUser) {
  return res.status(400).json({ error: 'Email already registered' });
}
```

**B. Drop duplicate indexes**
```bash
# Connect to MongoDB
mongo

# Use database
use jobportal

# Check indexes
db.users.getIndexes()

# Drop duplicate index
db.users.dropIndex("email_1")

# Recreate unique index
db.users.createIndex({ email: 1 }, { unique: true })
```

---

##### 2. Slow Queries

**Problem:**
```
Queries taking too long to execute
```

**Solutions:**

**A. Add indexes**
```javascript
// In model file
userSchema.index({ email: 1 });
jobSchema.index({ title: 'text', description: 'text' });
applicationSchema.index({ jobId: 1, userId: 1 });
```

**B. Use lean queries**
```javascript
// For read-only operations
const jobs = await Job.find().lean();
```

**C. Limit results**
```javascript
// Add pagination
const jobs = await Job.find()
  .limit(10)
  .skip(page * 10)
  .sort({ createdAt: -1 });
```

---

##### 3. Connection Pool Exhausted

**Error:**
```
MongoError: connection pool exhausted
```

**Solutions:**

**A. Increase pool size**
```javascript
mongoose.connect(uri, {
  maxPoolSize: 50,
  minPoolSize: 10
});
```

**B. Close connections properly**
```javascript
// Always close connections in tests
afterAll(async () => {
  await mongoose.connection.close();
});
```

---

#### Deployment Issues

##### 1. Render Deployment Fails

**Error:**
```
Build failed / Deploy failed
```

**Solutions:**

**A. Check build logs**
- Go to Render dashboard
- Click on service
- View "Logs" tab
- Look for error messages

**B. Verify environment variables**
- All required variables set
- No typos in variable names
- Values are correct

**C. Check build command**
```yaml
# render.yaml
buildCommand: cd backend && npm install
startCommand: cd backend && npm start
```

---

##### 2. Vercel Deployment Fails

**Error:**
```
Build failed / Function timeout
```

**Solutions:**

**A. Check build settings**
```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

**B. Increase function timeout** (Pro plan)
```json
// vercel.json
{
  "functions": {
    "api/**/*.js": {
      "maxDuration": 30
    }
  }
}
```

---

##### 3. Environment Variables Not Working

**Problem:**
```
Environment variables undefined in production
```

**Solutions:**

**A. Render**
- Go to service settings
- Environment tab
- Add all variables
- Redeploy

**B. Vercel**
- Project settings
- Environment Variables
- Add for Production, Preview, Development
- Redeploy

**C. Prefix frontend variables**
```env
# Must start with VITE_
VITE_API_URL=...
VITE_SOCKET_URL=...
```

---

#### Performance Issues

##### 1. Slow Page Load

**Solutions:**

**A. Enable compression**
```javascript
const compression = require('compression');
app.use(compression());
```

**B. Optimize images**
```javascript
// Use WebP format
// Lazy load images
<img loading="lazy" src="..." />
```

**C. Code splitting**
```javascript
// React lazy loading
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

---

##### 2. High Memory Usage

**Solutions:**

**A. Limit query results**
```javascript
// Add pagination
const limit = 20;
const skip = (page - 1) * limit;
const results = await Model.find().limit(limit).skip(skip);
```

**B. Use streams for large files**
```javascript
const stream = fs.createReadStream(filePath);
stream.pipe(res);
```

---

### Debugging Tips

#### Backend Debugging

**1. Enable detailed logging**
```javascript
// Add to index.js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

**2. Use debugger**
```javascript
// Add breakpoint
debugger;

// Run with inspect
node --inspect index.js
```

**3. Check MongoDB queries**
```javascript
mongoose.set('debug', true);
```

---

#### Frontend Debugging

**1. React DevTools**
- Install React DevTools extension
- Inspect component state and props

**2. Network tab**
- Open browser DevTools
- Check Network tab
- Inspect API calls and responses

**3. Console logging**
```javascript
console.log('State:', state);
console.log('Props:', props);
console.error('Error:', error);
```

---

### Getting Help

#### Resources

1. **Documentation**
   - Read this documentation thoroughly
   - Check API documentation
   - Review code comments

2. **Logs**
   - Backend: Check terminal output
   - Frontend: Check browser console
   - Database: Check MongoDB logs

3. **Community**
   - Stack Overflow
   - GitHub Issues
   - Discord/Slack communities

4. **Support**
   - Email: support@futuremilestone.com
   - GitHub: Create an issue
   - Documentation: Check FAQ

#### When Reporting Issues

Include:
1. Error message (full stack trace)
2. Steps to reproduce
3. Expected vs actual behavior
4. Environment (OS, Node version, etc.)
5. Relevant code snippets
6. Screenshots (if applicable)


---

## Project Structure

### Root Directory Structure

```
futuremilestone/
├── backend/                    # Backend API server
├── frontend/                   # React frontend application
├── clerk-react/               # Clerk authentication (optional)
├── .venv/                     # Python virtual environment (AI features)
├── pics/                      # Project screenshots
├── node_modules/              # Root dependencies
├── .git/                      # Git repository
├── .gitignore                 # Git ignore rules
├── package.json               # Root package configuration
├── render.yaml                # Render deployment config
├── vercel.json                # Vercel deployment config
└── Documentation files        # Various .md files
```

---

### Backend Structure

```
backend/
├── api/                       # API route handlers
├── chat-feature/              # Chat functionality
├── chat-module/               # Chat module
├── community-chat/            # Community chat features
├── community-module/          # Community features
├── config/                    # Configuration files
│   ├── database.js           # MongoDB connection
│   ├── multerConfig.js       # File upload config
│   ├── supabase.js           # Supabase client
│   └── firebase.js           # Firebase config
├── controllers/               # Business logic controllers
│   ├── authController.js     # Authentication logic
│   ├── jobController.js      # Job management
│   ├── courseController.js   # Course management
│   └── chatController.js     # Chat logic
├── cron/                      # Scheduled tasks
├── middleware/                # Express middleware
│   ├── auth.js               # JWT authentication
│   ├── role.js               # Role-based access
│   └── validation.js         # Input validation
├── models/                    # MongoDB schemas
│   ├── User.js               # User model
│   ├── Job.js                # Job model
│   ├── Application.js        # Application model
│   ├── Course.js             # Course model
│   ├── Community.js          # Community model
│   ├── Company.js            # Company model
│   ├── Message.js            # Message model
│   ├── Enrollment.js         # Enrollment model
│   └── VerificationOTP.js    # OTP model
├── routes/                    # API route definitions
│   ├── authRoutes.js         # /api/auth/*
│   ├── jobRoutes.js          # /api/jobs/*
│   ├── employerRoutes.js     # /api/employer/*
│   ├── courseRoutes.js       # /api/courses/*
│   ├── adminRoutes.js        # /api/admin/*
│   ├── chatRoutes.js         # /api/chat/*
│   ├── communityRoutes.js    # /api/communities/*
│   ├── companyRoutes.js      # /api/companies/*
│   └── aiRoutes.js           # /api/ai/*
├── scripts/                   # Utility scripts
│   ├── seedJobs.js           # Seed job data
│   └── seedCommunities.js    # Seed communities
├── services/                  # External services
│   ├── emailService.js       # Email sending
│   ├── aiService.js          # AI integration
│   └── uploadService.js      # File upload service
├── uploads/                   # Local file storage
│   ├── resumes/              # Resume files
│   ├── photos/               # Profile photos
│   └── videos/               # Course videos
├── utils/                     # Helper functions
│   ├── uploadService.js      # Tiered upload logic
│   ├── supabaseUpload.js     # Supabase upload
│   └── helpers.js            # General helpers
├── .env                       # Environment variables
├── .env.example              # Environment template
├── index.js                   # Server entry point
├── package.json              # Dependencies
└── Documentation files        # API docs, guides
```

---

### Frontend Structure

```
frontend/
├── api/                       # API service layer (legacy)
├── dist/                      # Production build output
├── employee/                  # Recruiter-specific (legacy)
├── jobseeker/                # Seeker-specific (legacy)
├── node_modules/             # Dependencies
├── public/                    # Static assets
│   ├── favicon.ico           # Favicon
│   └── assets/               # Images, fonts
├── src/                       # Source code
│   ├── api/                  # API service functions
│   │   └── axios.js          # Axios configuration
│   ├── assets/               # Images, icons
│   ├── components/           # Reusable components
│   │   ├── ProtectedRoute.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── InterviewAlerts.jsx
│   │   ├── SeekerHelperChat.jsx
│   │   ├── RecruiterHelperChat.jsx
│   │   ├── JobCard.jsx
│   │   ├── CompanyCard.jsx
│   │   ├── CourseCard.jsx
│   │   └── ...
│   ├── context/              # React Context providers
│   │   ├── AuthContext.jsx   # Authentication state
│   │   ├── CompanyContext.jsx
│   │   └── ChatContext.jsx
│   ├── pages/                # Page components
│   │   ├── Home.jsx          # Landing page
│   │   ├── RoleSelection.jsx # Role chooser
│   │   │
│   │   ├── seeker/           # Job seeker pages
│   │   │   ├── SeekerLanding.jsx
│   │   │   ├── SeekerLogin.jsx
│   │   │   ├── SeekerSignup.jsx
│   │   │   ├── SeekerDashboard.jsx
│   │   │   ├── SeekerProfile.jsx
│   │   │   ├── Jobs.jsx
│   │   │   ├── NonITJobs.jsx
│   │   │   ├── Applications.jsx
│   │   │   ├── SavedJobs.jsx
│   │   │   ├── Courses.jsx
│   │   │   ├── Companies.jsx
│   │   │   ├── Communities.jsx
│   │   │   └── Chat.jsx
│   │   │
│   │   ├── recruiter/        # Recruiter pages
│   │   │   ├── RecruiterLanding.jsx
│   │   │   ├── RecruiterLogin.jsx
│   │   │   ├── RecruiterSignup.jsx
│   │   │   ├── RecruiterDashboard.jsx
│   │   │   ├── PostJob.jsx
│   │   │   ├── MyJobs.jsx
│   │   │   ├── Applicants.jsx
│   │   │   ├── JobAnalytics.jsx
│   │   │   ├── Candidates.jsx
│   │   │   ├── CompanyProfile.jsx
│   │   │   ├── Calendar.jsx
│   │   │   └── Chat.jsx
│   │   │
│   │   ├── auth/             # Authentication pages
│   │   │   ├── LoginOTP.jsx
│   │   │   ├── VerifyOTP.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   └── ResetPassword.jsx
│   │   │
│   │   └── Interview.jsx     # Video interview page
│   │
│   ├── utils/                # Utility functions
│   │   ├── helpers.js        # Helper functions
│   │   └── constants.js      # Constants
│   │
│   ├── App.jsx               # Main app component
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
│
├── .env                       # Environment variables
├── .env.example              # Environment template
├── index.html                # HTML template
├── package.json              # Dependencies
├── postcss.config.cjs        # PostCSS config
├── tailwind.config.cjs       # Tailwind config
├── vite.config.js            # Vite configuration
└── README.md                 # Frontend readme
```

---

### Key Files Explained

#### Backend

**index.js** - Main server file
```javascript
// Server initialization
// Express app setup
// Middleware configuration
// Route mounting
// Socket.IO setup
// Database connection
// Server start
```

**models/User.js** - User schema
```javascript
// User schema definition
// Password hashing pre-save hook
// Methods for password comparison
// Virtual fields
// Indexes
```

**routes/authRoutes.js** - Authentication routes
```javascript
// POST /api/auth/signup
// POST /api/auth/login
// POST /api/auth/google
// GET /api/auth/me
// PUT /api/auth/update
// POST /api/auth/resume
// POST /api/auth/photo
```

**middleware/auth.js** - JWT verification
```javascript
// Extract token from header
// Verify token
// Attach user to request
// Handle errors
```

---

#### Frontend

**App.jsx** - Main application component
```javascript
// Router setup
// Context providers
// Route definitions
// Protected routes
// Layout components
```

**context/AuthContext.jsx** - Authentication state
```javascript
// User state
// Token management
// Login/logout functions
// Profile update
// Google OAuth
```

**api/axios.js** - API client
```javascript
// Axios instance
// Base URL configuration
// Request interceptor (add token)
// Response interceptor (handle errors)
```

**pages/seeker/SeekerDashboard.jsx** - Seeker dashboard
```javascript
// Fetch user data
// Display statistics
// Recent applications
// Saved jobs
// Recommended jobs
```

---

### File Naming Conventions

#### Backend
- **Models**: PascalCase (User.js, Job.js)
- **Routes**: camelCase with Routes suffix (authRoutes.js)
- **Controllers**: camelCase with Controller suffix (authController.js)
- **Middleware**: camelCase (auth.js, validation.js)
- **Utils**: camelCase (uploadService.js)

#### Frontend
- **Components**: PascalCase (JobCard.jsx, ProtectedRoute.jsx)
- **Pages**: PascalCase (SeekerDashboard.jsx)
- **Context**: PascalCase with Context suffix (AuthContext.jsx)
- **Utils**: camelCase (helpers.js)
- **Styles**: kebab-case (job-card.css)

---

### Import/Export Patterns

#### Backend (CommonJS)
```javascript
// Export
module.exports = router;
module.exports = { function1, function2 };

// Import
const express = require('express');
const { function1 } = require('./utils');
```

#### Frontend (ES Modules)
```javascript
// Export
export default Component;
export { function1, function2 };

// Import
import Component from './Component';
import { function1 } from './utils';
```

---

### Code Organization Best Practices

1. **Separation of Concerns**
   - Routes: Define endpoints
   - Controllers: Business logic
   - Models: Data structure
   - Services: External integrations

2. **DRY (Don't Repeat Yourself)**
   - Reusable components
   - Utility functions
   - Shared middleware

3. **Single Responsibility**
   - Each file has one purpose
   - Functions do one thing
   - Components are focused

4. **Consistent Structure**
   - Similar files in same directory
   - Predictable naming
   - Clear hierarchy


---

## Testing

### Testing Strategy

Future Milestone uses a comprehensive testing approach covering unit tests, integration tests, and end-to-end tests.

---

### Backend Testing

#### Setup Testing Environment

**Install Testing Dependencies**
```bash
cd backend
npm install --save-dev jest supertest mongodb-memory-server
```

**Configure Jest** (`backend/jest.config.js`)
```javascript
module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'routes/**/*.js',
    'controllers/**/*.js',
    'models/**/*.js',
    'middleware/**/*.js'
  ]
};
```

---

#### Unit Tests

**Test User Model** (`backend/__tests__/models/User.test.js`)
```javascript
const User = require('../../models/User');
const mongoose = require('mongoose');

describe('User Model', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should hash password before saving', async () => {
    const user = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      password: 'password123',
      role: 'seeker'
    });

    await user.save();
    expect(user.password).not.toBe('password123');
    expect(user.password.length).toBeGreaterThan(20);
  });

  it('should validate email format', async () => {
    const user = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'invalid-email',
      password: 'password123',
      role: 'seeker'
    });

    await expect(user.save()).rejects.toThrow();
  });

  it('should require required fields', async () => {
    const user = new User({});
    await expect(user.save()).rejects.toThrow();
  });
});
```

---

#### Integration Tests

**Test Authentication Routes** (`backend/__tests__/routes/auth.test.js`)
```javascript
const request = require('supertest');
const app = require('../../index');
const User = require('../../models/User');

describe('Auth Routes', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/signup', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
          password: 'password123',
          role: 'seeker'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('john@test.com');
    });

    it('should not register duplicate email', async () => {
      await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: 'password123',
        role: 'seeker'
      });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'john@test.com',
          password: 'password456',
          role: 'seeker'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/signup')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
          password: 'password123',
          role: 'seeker'
        });
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@test.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should not login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@test.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
    });
  });
});
```

---

#### Test Job Routes

```javascript
describe('Job Routes', () => {
  let token;
  let userId;

  beforeEach(async () => {
    // Create and login user
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        firstName: 'Recruiter',
        lastName: 'Test',
        email: 'recruiter@test.com',
        password: 'password123',
        role: 'recruiter'
      });

    token = signupRes.body.token;
    userId = signupRes.body.user.id;
  });

  describe('POST /api/employer/jobs', () => {
    it('should create a new job', async () => {
      const res = await request(app)
        .post('/api/employer/jobs')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Software Engineer',
          company: 'Tech Corp',
          location: 'Remote',
          salary: '$100k - $150k',
          type: 'Full Time',
          category: 'IT',
          description: 'Great opportunity',
          requirements: ['React', 'Node.js']
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.job.title).toBe('Software Engineer');
    });

    it('should not create job without auth', async () => {
      const res = await request(app)
        .post('/api/employer/jobs')
        .send({
          title: 'Software Engineer',
          company: 'Tech Corp'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/jobs', () => {
    it('should get all jobs', async () => {
      const res = await request(app).get('/api/jobs');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.jobs)).toBe(true);
    });

    it('should filter jobs by search', async () => {
      const res = await request(app)
        .get('/api/jobs')
        .query({ search: 'engineer' });

      expect(res.statusCode).toBe(200);
    });
  });
});
```

---

#### Run Backend Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- auth.test.js

# Run in watch mode
npm test -- --watch
```

---

### Frontend Testing

#### Setup Testing Environment

**Install Testing Dependencies**
```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom
```

**Configure Vitest** (`frontend/vite.config.js`)
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      reporter: ['text', 'json', 'html']
    }
  }
})
```

**Setup File** (`frontend/src/test/setup.js`)
```javascript
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})
```

---

#### Component Tests

**Test JobCard Component** (`frontend/src/components/__tests__/JobCard.test.jsx`)
```javascript
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import JobCard from '../JobCard'

describe('JobCard', () => {
  const mockJob = {
    _id: '1',
    title: 'Software Engineer',
    company: 'Tech Corp',
    location: 'Remote',
    salary: '$100k - $150k',
    type: 'Full Time'
  }

  it('renders job information', () => {
    render(
      <BrowserRouter>
        <JobCard job={mockJob} />
      </BrowserRouter>
    )

    expect(screen.getByText('Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('Tech Corp')).toBeInTheDocument()
    expect(screen.getByText('Remote')).toBeInTheDocument()
  })

  it('displays salary when provided', () => {
    render(
      <BrowserRouter>
        <JobCard job={mockJob} />
      </BrowserRouter>
    )

    expect(screen.getByText('$100k - $150k')).toBeInTheDocument()
  })
})
```

---

#### Context Tests

**Test AuthContext** (`frontend/src/context/__tests__/AuthContext.test.jsx`)
```javascript
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'

describe('AuthContext', () => {
  it('provides auth state', () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('updates user on login', async () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toBeTruthy()
  })
})
```

---

#### Integration Tests

**Test Login Flow** (`frontend/src/__tests__/LoginFlow.test.jsx`)
```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'

describe('Login Flow', () => {
  it('allows user to login', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    // Navigate to login
    fireEvent.click(screen.getByText('Login'))

    // Fill form
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    })

    // Submit
    fireEvent.click(screen.getByRole('button', { name: 'Login' }))

    // Wait for redirect
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })
})
```

---

#### Run Frontend Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch

# Run specific test
npm test JobCard.test.jsx
```

---

### End-to-End Testing

#### Setup Playwright

```bash
npm install --save-dev @playwright/test
npx playwright install
```

**Configure Playwright** (`playwright.config.js`)
```javascript
module.exports = {
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI
  }
}
```

---

#### E2E Test Examples

**Test User Registration** (`e2e/auth.spec.js`)
```javascript
const { test, expect } = require('@playwright/test')

test.describe('Authentication', () => {
  test('user can register', async ({ page }) => {
    await page.goto('/')
    
    // Click signup
    await page.click('text=Sign Up')
    
    // Fill form
    await page.fill('input[name="firstName"]', 'John')
    await page.fill('input[name="lastName"]', 'Doe')
    await page.fill('input[name="email"]', 'john@example.com')
    await page.fill('input[name="password"]', 'password123')
    
    // Submit
    await page.click('button[type="submit"]')
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/)
  })

  test('user can login', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[name="email"]', 'john@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/.*dashboard/)
  })
})
```

**Test Job Application** (`e2e/jobs.spec.js`)
```javascript
test.describe('Job Application', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="email"]', 'seeker@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
  })

  test('user can apply to job', async ({ page }) => {
    // Go to jobs page
    await page.goto('/seeker/jobs')
    
    // Click on first job
    await page.click('.job-card:first-child')
    
    // Click apply button
    await page.click('text=Apply Now')
    
    // Verify success message
    await expect(page.locator('text=Application submitted')).toBeVisible()
  })
})
```

---

### Manual Testing Checklist

#### Authentication
- [ ] User can register with email/password
- [ ] User can login with email/password
- [ ] User can login with Google OAuth
- [ ] User can reset password
- [ ] User can logout
- [ ] Invalid credentials show error
- [ ] Token expires after set time

#### Job Seeker Features
- [ ] Can browse jobs
- [ ] Can search and filter jobs
- [ ] Can view job details
- [ ] Can apply to jobs
- [ ] Can save jobs
- [ ] Can view application status
- [ ] Can upload resume
- [ ] Can update profile

#### Recruiter Features
- [ ] Can post jobs
- [ ] Can edit jobs
- [ ] Can delete jobs
- [ ] Can view applicants
- [ ] Can update application status
- [ ] Can schedule interviews
- [ ] Can view analytics

#### Chat Features
- [ ] Can send messages
- [ ] Can receive messages in real-time
- [ ] Can see online status
- [ ] Can view message history
- [ ] Emojis work correctly

#### File Uploads
- [ ] Resume upload works
- [ ] Photo upload works
- [ ] Video upload works
- [ ] File size limits enforced
- [ ] File type validation works

---

### Performance Testing

#### Load Testing with Artillery

**Install Artillery**
```bash
npm install -g artillery
```

**Create Test Script** (`load-test.yml`)
```yaml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
  
scenarios:
  - name: "Get jobs"
    flow:
      - get:
          url: "/api/jobs"
  
  - name: "Login and get profile"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password123"
          capture:
            - json: "$.token"
              as: "token"
      - get:
          url: "/api/auth/me"
          headers:
            Authorization: "Bearer {{ token }}"
```

**Run Load Test**
```bash
artillery run load-test.yml
```

---

### Test Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Critical paths covered
- **E2E Tests**: Main user flows covered
- **Performance**: Response time < 200ms for 95% of requests

---

### Continuous Integration

**GitHub Actions** (`.github/workflows/test.yml`)
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: |
          cd backend && npm install
          cd ../frontend && npm install
      
      - name: Run backend tests
        run: cd backend && npm test
      
      - name: Run frontend tests
        run: cd frontend && npm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```


---

## Maintenance

### Regular Maintenance Tasks

#### Daily Tasks

**1. Monitor Application Health**
```bash
# Check backend status
curl https://backend-portal-56ud.onrender.com/api/health

# Check logs for errors
# Render: Dashboard → Logs
# Vercel: Dashboard → Deployments → Logs
```

**2. Monitor Database**
- Check MongoDB Atlas metrics
- Review slow queries
- Monitor storage usage
- Check connection pool

**3. Review Error Logs**
```javascript
// Backend error logging
const winston = require('winston');

logger.error('Error occurred', {
  error: err.message,
  stack: err.stack,
  timestamp: new Date()
});
```

---

#### Weekly Tasks

**1. Database Backup**
```bash
# MongoDB Atlas: Automatic backups enabled
# Manual backup:
mongodump --uri="mongodb+srv://..." --out=./backup

# Restore if needed:
mongorestore --uri="mongodb+srv://..." ./backup
```

**2. Update Dependencies**
```bash
# Check for updates
npm outdated

# Update non-breaking changes
npm update

# Update major versions (carefully)
npm install package@latest
```

**3. Review Analytics**
- User registrations
- Job applications
- Active users
- Error rates
- Response times

**4. Clean Up Old Data**
```javascript
// Delete old OTP records
await VerificationOTP.deleteMany({
  expiresAt: { $lt: new Date() }
});

// Archive old applications (optional)
await Application.updateMany(
  { createdAt: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } },
  { $set: { archived: true } }
);
```

---

#### Monthly Tasks

**1. Security Audit**
```bash
# Run npm audit
npm audit

# Fix vulnerabilities
npm audit fix

# Check for critical issues
npm audit --audit-level=critical
```

**2. Performance Review**
- Analyze slow queries
- Review API response times
- Check database indexes
- Optimize heavy operations

**3. Database Optimization**
```javascript
// Rebuild indexes
db.collection.reIndex();

// Analyze query performance
db.collection.explain("executionStats").find({...});

// Add missing indexes
db.collection.createIndex({ field: 1 });
```

**4. Storage Cleanup**
```bash
# Clean up unused files in Supabase
# Review and delete old uploads
# Archive old data
```

---

### Updating the Application

#### Backend Updates

**1. Update Dependencies**
```bash
cd backend

# Check outdated packages
npm outdated

# Update package.json
npm install package@latest

# Test thoroughly
npm test

# Commit changes
git add package.json package-lock.json
git commit -m "Update dependencies"
```

**2. Deploy Updates**
```bash
# Push to GitHub
git push origin main

# Render auto-deploys from main branch
# Or manually trigger deployment in Render dashboard
```

**3. Verify Deployment**
```bash
# Check health endpoint
curl https://backend-portal-56ud.onrender.com/api/health

# Test critical endpoints
curl https://backend-portal-56ud.onrender.com/api/jobs

# Monitor logs for errors
```

---

#### Frontend Updates

**1. Update Dependencies**
```bash
cd frontend

# Update packages
npm update

# Test locally
npm run dev

# Build for production
npm run build

# Test production build
npm run preview
```

**2. Deploy to Vercel**
```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys
# Or use Vercel CLI
vercel --prod
```

---

### Database Maintenance

#### Index Management

**Check Existing Indexes**
```javascript
// In MongoDB shell or Compass
db.users.getIndexes()
db.jobs.getIndexes()
db.applications.getIndexes()
```

**Add New Indexes**
```javascript
// For frequently queried fields
db.jobs.createIndex({ title: "text", description: "text" })
db.applications.createIndex({ jobId: 1, userId: 1 })
db.messages.createIndex({ conversationId: 1, timestamp: -1 })
```

**Remove Unused Indexes**
```javascript
// Check index usage
db.collection.aggregate([{ $indexStats: {} }])

// Drop unused index
db.collection.dropIndex("index_name")
```

---

#### Data Cleanup Scripts

**Clean Expired OTPs** (`backend/scripts/cleanupOTPs.js`)
```javascript
const mongoose = require('mongoose');
const VerificationOTP = require('../models/VerificationOTP');

async function cleanupExpiredOTPs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const result = await VerificationOTP.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    
    console.log(`Deleted ${result.deletedCount} expired OTPs`);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

cleanupExpiredOTPs();
```

**Archive Old Applications** (`backend/scripts/archiveApplications.js`)
```javascript
const mongoose = require('mongoose');
const Application = require('../models/Application');

async function archiveOldApplications() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const result = await Application.updateMany(
      {
        createdAt: { $lt: sixMonthsAgo },
        status: { $in: ['rejected', 'accepted'] },
        archived: { $ne: true }
      },
      { $set: { archived: true } }
    );
    
    console.log(`Archived ${result.modifiedCount} applications`);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Archive failed:', error);
  }
}

archiveOldApplications();
```

---

### Monitoring & Alerts

#### Setup Monitoring

**1. Application Monitoring**
```javascript
// Install monitoring package
npm install @sentry/node

// Configure Sentry (backend/index.js)
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});

// Error handler
app.use(Sentry.Handlers.errorHandler());
```

**2. Database Monitoring**
- MongoDB Atlas: Built-in monitoring
- Set up alerts for:
  - High CPU usage
  - Low storage
  - Slow queries
  - Connection issues

**3. Uptime Monitoring**
- Use services like:
  - UptimeRobot
  - Pingdom
  - StatusCake
- Monitor endpoints:
  - `https://backend-portal-56ud.onrender.com/api/health`
  - `https://your-frontend.vercel.app`

---

#### Log Management

**Backend Logging** (`backend/utils/logger.js`)
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

**Usage:**
```javascript
const logger = require('./utils/logger');

logger.info('User logged in', { userId: user._id });
logger.error('Database error', { error: err.message });
logger.warn('High memory usage', { usage: process.memoryUsage() });
```

---

### Backup Strategy

#### Database Backups

**Automated Backups (MongoDB Atlas)**
- Continuous backups enabled
- Point-in-time recovery
- Retention: 7 days (free tier) to 365 days (paid)

**Manual Backups**
```bash
# Full database backup
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/jobportal" --out=./backup-$(date +%Y%m%d)

# Backup specific collection
mongodump --uri="mongodb+srv://..." --collection=users --out=./backup

# Compress backup
tar -czf backup-$(date +%Y%m%d).tar.gz ./backup-$(date +%Y%m%d)
```

**Restore from Backup**
```bash
# Restore full database
mongorestore --uri="mongodb+srv://..." ./backup-20240224

# Restore specific collection
mongorestore --uri="mongodb+srv://..." --collection=users ./backup/jobportal/users.bson
```

---

#### File Backups

**Supabase Storage**
- Automatic backups by Supabase
- Download files periodically for local backup

**Local Backup Script**
```bash
#!/bin/bash
# backup-files.sh

BACKUP_DIR="./backups/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Backup uploads directory
cp -r backend/uploads $BACKUP_DIR/

# Compress
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR

# Remove uncompressed
rm -rf $BACKUP_DIR

echo "Backup completed: $BACKUP_DIR.tar.gz"
```

---

### Scaling Considerations

#### When to Scale

**Indicators:**
- Response time > 500ms consistently
- CPU usage > 80%
- Memory usage > 80%
- Database connections maxed out
- Frequent timeouts

---

#### Horizontal Scaling

**Backend Scaling**
```yaml
# Render: Upgrade plan for auto-scaling
# Or use multiple instances with load balancer

# Add Redis for session storage
npm install redis connect-redis

# Configure session store
const RedisStore = require('connect-redis')(session);
const redis = require('redis');
const redisClient = redis.createClient();

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET
}));
```

**Database Scaling**
- Upgrade MongoDB Atlas tier
- Enable sharding for large collections
- Add read replicas
- Implement caching (Redis)

---

#### Vertical Scaling

**Render:**
- Upgrade to higher tier
- More CPU and RAM
- Better performance

**MongoDB Atlas:**
- Upgrade cluster tier
- More storage and IOPS
- Better performance

---

### Performance Optimization

#### Backend Optimization

**1. Database Query Optimization**
```javascript
// Use lean() for read-only queries
const jobs = await Job.find().lean();

// Select only needed fields
const users = await User.find().select('firstName lastName email');

// Use pagination
const jobs = await Job.find()
  .limit(20)
  .skip((page - 1) * 20);

// Use indexes
jobSchema.index({ title: 'text', description: 'text' });
```

**2. Caching**
```javascript
// Install Redis
npm install redis

// Setup Redis client
const redis = require('redis');
const client = redis.createClient();

// Cache middleware
const cache = (duration) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    
    const cached = await client.get(key);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      client.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };
    
    next();
  };
};

// Use in routes
app.get('/api/jobs', cache(300), getJobs);
```

**3. Compression**
```javascript
const compression = require('compression');
app.use(compression());
```

---

#### Frontend Optimization

**1. Code Splitting**
```javascript
// Use React.lazy
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Wrap in Suspense
<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

**2. Image Optimization**
```javascript
// Use WebP format
// Lazy load images
<img loading="lazy" src="..." alt="..." />

// Use srcset for responsive images
<img 
  srcset="small.jpg 480w, medium.jpg 800w, large.jpg 1200w"
  sizes="(max-width: 600px) 480px, (max-width: 900px) 800px, 1200px"
  src="medium.jpg"
  alt="..."
/>
```

**3. Bundle Optimization**
```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'lucide-react']
        }
      }
    }
  }
})
```

---

### Disaster Recovery

#### Recovery Plan

**1. Database Failure**
- Restore from MongoDB Atlas backup
- Point-in-time recovery available
- RTO: < 1 hour
- RPO: < 5 minutes

**2. Backend Failure**
- Redeploy from GitHub
- Render keeps previous deployments
- Rollback if needed
- RTO: < 15 minutes

**3. Frontend Failure**
- Redeploy from GitHub
- Vercel keeps deployment history
- Instant rollback
- RTO: < 5 minutes

**4. Complete Failure**
- Restore database from backup
- Redeploy backend and frontend
- Update DNS if needed
- RTO: < 2 hours

---

### Documentation Maintenance

#### Keep Documentation Updated

**When to Update:**
- New features added
- API changes
- Configuration changes
- Deployment process changes
- Security updates

**Documentation Files:**
- `FINAL_DOCUMENTATION.md` - This file
- `API_DOCUMENTATION.md` - API reference
- `README.md` - Quick start
- Code comments
- Inline documentation

---

### Support & Contact

#### Getting Help

**Documentation:**
- Read this documentation
- Check API documentation
- Review code comments

**Community:**
- GitHub Issues
- Stack Overflow
- Discord/Slack

**Professional Support:**
- Email: support@futuremilestone.com
- Priority support available

---

### Changelog

Keep track of changes in `CHANGELOG.md`:

```markdown
# Changelog

## [1.0.0] - 2024-02-24

### Added
- Initial release
- User authentication
- Job posting and application
- Real-time chat
- AI assistant
- Video interviews

### Changed
- N/A

### Fixed
- N/A

### Security
- Implemented JWT authentication
- Added rate limiting
- Enabled HTTPS
```

---

## Conclusion

Future Milestone is a comprehensive, production-ready job portal platform built with modern technologies and best practices. This documentation provides everything needed to understand, deploy, maintain, and scale the application.

### Key Takeaways

✅ **Complete MERN Stack**: MongoDB, Express, React, Node.js  
✅ **Real-time Features**: Socket.IO for chat and notifications  
✅ **AI Integration**: Google Gemini for intelligent assistance  
✅ **Production Ready**: Deployed and operational  
✅ **Secure**: Multiple security layers implemented  
✅ **Scalable**: Architecture supports growth  
✅ **Well Documented**: Comprehensive documentation  

### Next Steps

1. **Deploy**: Follow deployment guide to go live
2. **Customize**: Adapt to your specific needs
3. **Monitor**: Set up monitoring and alerts
4. **Maintain**: Follow maintenance schedule
5. **Scale**: Grow as your user base expands

### Resources

- **Live Backend**: https://backend-portal-56ud.onrender.com
- **Documentation**: This file
- **API Reference**: backend/API_DOCUMENTATION.md
- **Support**: support@futuremilestone.com

---

**Version**: 1.0.0  
**Last Updated**: February 24, 2026  
**Status**: Production Ready  

---

*Built with ❤️ using MERN Stack*

