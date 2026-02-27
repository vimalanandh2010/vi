# 🎯 Future Milestone - Architecture & Package Summary

## 📋 Quick Overview

**Future Milestone** is a full-stack job portal connecting job seekers with recruiters, featuring real-time chat, AI assistance, video interviews, and community features.

---

## 🏗️ System Architecture

```
USER BROWSER (Chrome, Firefox, Safari)
        ↓
FRONTEND (React + Vite) - Port 5173
        ↓
BACKEND (Node.js + Express) - Port 5000
        ↓
MONGODB DATABASE - Port 27017
        ↓
EXTERNAL SERVICES (Google OAuth, Gemini AI, Cloudinary, Supabase, Jitsi)
```

---

## 📦 Core Packages & Download Links

### Backend (Node.js + Express)

| Package | Version | Purpose | Download |
|---------|---------|---------|----------|
| **express** | 4.18.2 | Web framework | [npm](https://www.npmjs.com/package/express) |
| **mongoose** | 9.1.4 | MongoDB ODM | [npm](https://www.npmjs.com/package/mongoose) |
| **socket.io** | 4.8.3 | Real-time communication | [npm](https://www.npmjs.com/package/socket.io) |
| **jsonwebtoken** | 9.0.3 | JWT authentication | [npm](https://www.npmjs.com/package/jsonwebtoken) |
| **bcryptjs** | 3.0.3 | Password hashing | [npm](https://www.npmjs.com/package/bcryptjs) |
| **multer** | 2.0.2 | File upload | [npm](https://www.npmjs.com/package/multer) |
| **cloudinary** | 1.41.3 | Cloud storage | [npm](https://www.npmjs.com/package/cloudinary) |
| **@supabase/supabase-js** | 2.94.1 | Supabase client | [npm](https://www.npmjs.com/package/@supabase/supabase-js) |
| **@google/generative-ai** | 0.24.1 | Gemini AI | [npm](https://www.npmjs.com/package/@google/generative-ai) |
| **nodemailer** | 7.0.12 | Email service | [npm](https://www.npmjs.com/package/nodemailer) |
| **passport** | 0.7.0 | Authentication | [npm](https://www.npmjs.com/package/passport) |
| **passport-google-oauth20** | 2.0.0 | Google OAuth | [npm](https://www.npmjs.com/package/passport-google-oauth20) |
| **pdf-parse** | 2.4.5 | PDF extraction | [npm](https://www.npmjs.com/package/pdf-parse) |
| **mammoth** | 1.11.0 | DOCX processing | [npm](https://www.npmjs.com/package/mammoth) |
| **helmet** | 8.1.0 | Security headers | [npm](https://www.npmjs.com/package/helmet) |
| **cors** | 2.8.5 | CORS handling | [npm](https://www.npmjs.com/package/cors) |
| **dotenv** | 17.3.1 | Environment variables | [npm](https://www.npmjs.com/package/dotenv) |
| **nodemon** | 3.1.11 | Dev auto-restart | [npm](https://www.npmjs.com/package/nodemon) |

### Frontend (React + Vite)

| Package | Version | Purpose | Download |
|---------|---------|---------|----------|
| **react** | 18.2.0 | UI library | [npm](https://www.npmjs.com/package/react) |
| **react-dom** | 18.2.0 | React DOM | [npm](https://www.npmjs.com/package/react-dom) |
| **vite** | 5.0.0 | Build tool | [npm](https://www.npmjs.com/package/vite) |
| **react-router-dom** | 7.13.0 | Routing | [npm](https://www.npmjs.com/package/react-router-dom) |
| **tailwindcss** | 3.4.0 | CSS framework | [npm](https://www.npmjs.com/package/tailwindcss) |
| **axios** | 1.13.5 | HTTP client | [npm](https://www.npmjs.com/package/axios) |
| **socket.io-client** | 4.8.3 | WebSocket client | [npm](https://www.npmjs.com/package/socket.io-client) |
| **framer-motion** | 12.33.0 | Animations | [npm](https://www.npmjs.com/package/framer-motion) |
| **lucide-react** | 0.563.0 | Icons | [npm](https://www.npmjs.com/package/lucide-react) |
| **@jitsi/react-sdk** | 1.4.4 | Video calls | [npm](https://www.npmjs.com/package/@jitsi/react-sdk) |
| **@google/generative-ai** | 0.21.0 | Gemini AI | [npm](https://www.npmjs.com/package/@google/generative-ai) |
| **@react-oauth/google** | 0.13.4 | Google OAuth | [npm](https://www.npmjs.com/package/@react-oauth/google) |
| **react-toastify** | 11.0.5 | Notifications | [npm](https://www.npmjs.com/package/react-toastify) |
| **emoji-picker-react** | 4.18.0 | Emoji picker | [npm](https://www.npmjs.com/package/emoji-picker-react) |
| **recharts** | 3.7.0 | Charts | [npm](https://www.npmjs.com/package/recharts) |
| **tesseract.js** | 7.0.0 | OCR | [npm](https://www.npmjs.com/package/tesseract.js) |

---

## 🔄 How It Works - Key Flows

### 1. User Registration & Login
```
User fills form → POST /api/auth/signup → Validate data → Hash password (bcrypt) 
→ Save to MongoDB → Generate JWT → Return token → Store in localStorage 
→ Redirect to dashboard
```

### 2. Job Application Process
```
Browse jobs → Click Apply → Upload resume → POST /api/jobs/:id/apply 
→ Create application → Socket.IO notifies recruiter → Recruiter reviews 
→ Update status → Socket.IO notifies seeker → Status updated
```

### 3. Real-time Chat
```
Open chat → Establish Socket connection → Join room → Type message 
→ Emit 'sendMessage' → Save to MongoDB → Emit to receiver 
→ Receiver gets message instantly
```

### 4. File Upload (Tiered Strategy)
```
Select file → Send multipart/form-data → Multer processes 
→ TRY Supabase (primary) → TRY Firebase (fallback) → TRY Local (last resort) 
→ Return URL → Save to MongoDB
```

### 5. AI Chatbot
```
User asks question → POST /api/bot-chat → Initialize Gemini AI 
→ Generate response → Return to frontend → Display in chat widget
```

---

## 🎨 User Interface Navigation

### Job Seeker Routes
- `/seeker/dashboard` - Main dashboard
- `/seeker/jobs` - Browse IT jobs
- `/seeker/non-it-jobs` - Browse Non-IT jobs
- `/seeker/applications` - Track applications
- `/seeker/saved-jobs` - Bookmarked jobs
- `/seeker/courses` - Learning courses
- `/seeker/companies` - Company directory
- `/seeker/communities` - Join communities
- `/seeker/chat` - Real-time messaging
- `/seeker/profile` - Profile builder

### Recruiter Routes
- `/recruiter/dashboard` - Analytics dashboard
- `/recruiter/post-job` - Create job posting
- `/recruiter/my-jobs` - Manage postings
- `/recruiter/job/:jobId/applicants` - View applicants
- `/recruiter/candidates` - Candidate search
- `/recruiter/chat` - Messaging
- `/recruiter/calendar` - Interview scheduling
- `/recruiter/company-profile` - Company management

---

## 🚀 Quick Start

### Step 1: Start MongoDB
```bash
mongod
```

### Step 2: Start Backend
```bash
cd backend
npm install
npm start
# ✅ Running on http://localhost:5000
```

### Step 3: Start Frontend
```bash
cd frontend
npm install
npm run dev
# ✅ Running on http://localhost:5173
```

### Step 4: Access Application
Open browser: **http://localhost:5173**

Test credentials:
- Email: `admin@jobportal.com`
- Password: `admin123`

---

## 💾 Database Collections

1. **Users** - User profiles, authentication
2. **Jobs** - Job listings
3. **Applications** - Job applications
4. **Courses** - Learning courses
5. **Communities** - User communities
6. **Messages** - Chat messages
7. **Companies** - Company profiles
8. **Enrollments** - Course enrollments

---

## 🔐 Security Features

✅ JWT token authentication  
✅ Password hashing (bcrypt)  
✅ Google OAuth 2.0  
✅ OTP verification  
✅ CORS protection  
✅ Helmet.js security headers  
✅ Input validation  
✅ Role-based access control  

---

## 📊 Core Features

### Job Seeker
- Browse & apply to jobs
- Upload resume & build profile
- Track application status
- Enroll in courses
- Join communities
- Chat with recruiters
- Video interviews
- AI career assistant

### Recruiter
- Post job listings
- View & manage applicants
- Schedule interviews
- Job analytics
- Company profile
- Chat with candidates
- Calendar management
- AI recruitment assistant

### Technical
- Real-time chat (Socket.IO)
- Video conferencing (Jitsi)
- AI integration (Gemini)
- Multi-cloud storage
- PDF/DOCX processing
- OCR capabilities
- Email notifications

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/google` - Google OAuth
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs/:id/apply` - Apply for job
- `POST /api/employer/jobs` - Post job

### Chat
- `GET /api/chat/conversations` - Get conversations
- `GET /api/chat/messages/:id` - Get messages
- `POST /api/chat/messages` - Send message

### AI
- `POST /api/bot-chat` - Chat with AI assistant

---

## 🛠️ Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/jobportal
JWT_SECRET=supersecret_milestone_token_2026
GOOGLE_CLIENT_ID=your_google_client_id
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### Frontend (.env)
```env
VITE_API_URL=/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 📚 Additional Documentation

- `PROJECT_FULL_REPORT.md` - Complete detailed documentation
- `QUICK_START_GUIDE.md` - Quick setup guide
- `PRESENTATION_GUIDE.md` - Full presentation guide
- `backend/API_DOCUMENTATION.md` - API reference

---

**🎉 Complete MERN Stack Job Portal with AI, Real-time Chat & Video Interviews**

*Last Updated: February 24, 2026*
