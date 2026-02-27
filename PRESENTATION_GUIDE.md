# 🎯 Future Milestone - Complete Presentation Guide

> **Interactive Documentation with Navigation Links**  
> Last Updated: February 24, 2026

---

## 📑 Table of Contents (Click to Navigate)

1. [🏗️ System Architecture](#system-architecture)
2. [📦 Complete Package List](#complete-package-list)
3. [🔄 How Everything Works](#how-everything-works)
4. [🚀 Quick Start](#quick-start)
5. [🎨 User Interface Flow](#user-interface-flow)
6. [🔐 Security & Authentication](#security-authentication)
7. [💾 Database Design](#database-design)
8. [🌐 API Reference](#api-reference)
9. [🛠️ Development Guide](#development-guide)
10. [📊 Feature Breakdown](#feature-breakdown)

---

<a name="system-architecture"></a>
## 🏗️ System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER                              │
│  (Chrome, Firefox, Safari, Edge)                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP/HTTPS Requests
                     │ WebSocket Connection
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (React + Vite)                         │
│  Port: 5173                                                  │
│  ├── React Components (UI)                                  │
│  ├── React Router (Navigation)                              │
│  ├── Context API (State Management)                         │
│  ├── Axios (HTTP Client)                                    │
│  └── Socket.IO Client (Real-time)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ REST API Calls
                     │ Socket Events
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Node.js + Express)                     │
│  Port: 5000                                                  │
│  ├── Express Server (API Routes)                            │
│  ├── Socket.IO Server (Real-time)                           │
│  ├── JWT Authentication                                      │
│  ├── Multer (File Upload)                                   │
│  ├── Mongoose (ODM)                                         │
│  └── Business Logic                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Database Queries
                     │ CRUD Operations
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              MONGODB DATABASE                                │
│  Port: 27017                                                 │
│  ├── Users Collection                                        │
│  ├── Jobs Collection                                         │
│  ├── Applications Collection                                 │
│  ├── Courses Collection                                      │
│  ├── Communities Collection                                  │
│  ├── Messages Collection                                     │
│  └── Companies Collection                                    │
└─────────────────────────────────────────────────────────────┘

         ┌──────────────────────────────────────┐
         │    EXTERNAL SERVICES                  │
         ├──────────────────────────────────────┤
         │  • Google OAuth (Authentication)      │
         │  • Google Gemini AI (Chatbot)        │
         │  • Cloudinary (Image/Video Storage)  │
         │  • Supabase (File Storage)           │
         │  • Firebase (Backup Storage)         │
         │  • Jitsi (Video Conferencing)        │
         │  • Nodemailer (Email Service)        │
         └──────────────────────────────────────┘
```

### Technology Stack Breakdown

#### **Frontend Layer**
- **React 18.2.0** - Component-based UI library
- **Vite 5.0.0** - Lightning-fast build tool
- **React Router DOM 7.13.0** - Client-side routing
- **Tailwind CSS 3.4.0** - Utility-first styling
- **Socket.IO Client 4.8.3** - Real-time communication
- **Axios 1.13.5** - HTTP requests
- **Framer Motion 12.33.0** - Animations

#### **Backend Layer**
- **Node.js** - JavaScript runtime
- **Express 4.18.2** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose 9.1.4** - MongoDB ODM
- **Socket.IO 4.8.3** - WebSocket server
- **JWT** - Token-based authentication
- **Bcrypt** - Password hashing

---

<a name="complete-package-list"></a>
## 📦 Complete Package List

### Backend Dependencies (98 Total Files)

#### 🔧 Core Framework & Server
| Package | Version | Purpose | Download Link |
|---------|---------|---------|---------------|
| express | ^4.18.2 | Web application framework | [npm](https://www.npmjs.com/package/express) |
| cors | ^2.8.5 | Cross-Origin Resource Sharing | [npm](https://www.npmjs.com/package/cors) |
| helmet | ^8.1.0 | Security middleware | [npm](https://www.npmjs.com/package/helmet) |
| dotenv | ^17.3.1 | Environment variables | [npm](https://www.npmjs.com/package/dotenv) |
| nodemon | ^3.1.11 | Auto-restart dev server | [npm](https://www.npmjs.com/package/nodemon) |

#### 🗄️ Database & ODM
| Package | Version | Purpose | Download Link |
|---------|---------|---------|---------------|
| mongoose | ^9.1.4 | MongoDB object modeling | [npm](https://www.npmjs.com/package/mongoose) |

#### 🔐 Authentication & Security
| Package | Version | Purpose | Download Link |
|---------|---------|---------|---------------|
| jsonwebtoken | ^9.0.3 | JWT token generation | [npm](https://www.npmjs.com/package/jsonwebtoken) |
| bcryptjs | ^3.0.3 | Password hashing | [npm](https://www.npmjs.com/package/bcryptjs) |
| google-auth-library | ^10.5.0 | Google OAuth | [npm](https://www.npmjs.com/package/google-auth-library) |
| passport | ^0.7.0 | Authentication middleware | [npm](https://www.npmjs.com/package/passport) |
| passport-google-oauth20 | ^2.0.0 | Google OAuth strategy | [npm](https://www.npmjs.com/package/passport-google-oauth20) |
| express-validator | ^7.3.1 | Input validation | [npm](https://www.npmjs.com/package/express-validator) |

#### 📁 File Upload & Storage
| Package | Version | Purpose | Download Link |
|---------|---------|---------|---------------|
| multer | ^2.0.2 | File upload handling | [npm](https://www.npmjs.com/package/multer) |
| cloudinary | ^1.41.3 | Cloud storage | [npm](https://www.npmjs.com/package/cloudinary) |
| @supabase/supabase-js | ^2.94.1 | Supabase client | [npm](https://www.npmjs.com/package/@supabase/supabase-js) |
| multer-storage-cloudinary | ^4.0.0 | Cloudinary storage engine | [npm](https://www.npmjs.com/package/multer-storage-cloudinary) |

#### 💬 Real-time Communication
| Package | Version | Purpose | Download Link |
|---------|---------|---------|---------------|
| socket.io | ^4.8.3 | WebSocket server | [npm](https://www.npmjs.com/package/socket.io) |
| socket.io-client | ^4.8.3 | WebSocket client | [npm](https://www.npmjs.com/package/socket.io-client) |
| simple-peer | ^9.11.1 | WebRTC connections | [npm](https://www.npmjs.com/package/simple-peer) |

#### 🤖 AI & Machine Learning
| Package | Version | Purpose | Download Link |
|---------|---------|---------|---------------|
| @google/genai | ^1.42.0 | Google Generative AI | [npm](https://www.npmjs.com/package/@google/genai) |
| @google/generative-ai | ^0.24.1 | Gemini AI SDK | [npm](https://www.npmjs.com/package/@google/generative-ai) |

#### 📄 Document Processing
| Package | Version | Purpose | Download Link |
|---------|---------|---------|---------------|
| pdf-parse | ^2.4.5 | PDF text extraction | [npm](https://www.npmjs.com/package/pdf-parse) |
| pdfjs-dist | ^5.4.624 | PDF.js library | [npm](https://www.npmjs.com/package/pdfjs-dist) |
| mammoth | ^1.11.0 | DOCX to HTML | [npm](https://www.npmjs.com/package/mammoth) |

#### 📧 Email & Notifications
| Package | Version | Purpose | Download Link |
|---------|---------|---------|---------------|
| nodemailer | ^7.0.12 | Email sending | [npm](https://www.npmjs.com/package/nodemailer) |

#### 🛠️ Utilities
| Package | Version | Purpose | Download Link |
|---------|---------|---------|---------------|
| axios | ^1.13.5 | HTTP client | [npm](https://www.npmjs.com/package/axios) |
| uuid | ^13.0.0 | Unique ID generation | [npm](https://www.npmjs.com/package/uuid) |
| moment | ^2.30.1 | Date manipulation | [npm](https://www.npmjs.com/package/moment) |
| dayjs | ^1.11.19 | Date library | [npm](https://www.npmjs.com/package/dayjs) |
| date-fns | ^4.1.0 | Date utilities | [npm](https://www.npmjs.com/package/date-fns) |
| form-data | ^4.0.5 | Form data handling | [npm](https://www.npmjs.com/package/form-data) |

#### 📅 Calendar & Scheduling
| Package | Version | Purpose | Download Link |
|---------|---------|---------|---------------|
| @fullcalendar/core | ^6.1.20 | Calendar core | [npm](https://www.npmjs.com/package/@fullcalendar/core) |
| @fullcalendar/daygrid | ^6.1.20 | Day grid view | [npm](https://www.npmjs.com/package/@fullcalendar/daygrid) |
| node-ical | ^0.25.4 | iCal parser | [npm](https://www.npmjs.com/package/node-ical) |

#### 🎥 Video Conferencing
| Package | Version | Purpose | Download Link |
|---------|---------|---------|---------------|
| @zegocloud/zego-uikit-prebuilt | ^2.17.2 | Video call UI | [npm](https://www.npmjs.com/package/@zegocloud/zego-uikit-prebuilt) |

---

### Frontend Dependencies

#### ⚛️ Core Framework
| Package | Version | Purpose | Download Link |
|---------|---------|---------|---------------|
| react | ^18.2.0 | UI library | [npm](https://www.npmjs.com/package/react) |
| react-dom | ^18.2.0 | React DOM renderer | [npm](https://www.npmjs.com/package/react-dom) |
| vite | ^5.0.0 | Build tool | [npm](https://www.npmjs.com/package/vite) |
| @vitejs/plugin-react | ^5.1.3 | Vite React plugin | [npm](https://www.npmjs.com/package/@vitejs/plugin-react) |

#### 🧭 Routing & Navigation
| Package | Version | Purpose | Download Link |
|---------|---------|---------|---------------|
| react-router-dom | ^7.13.0 | Client-side routing | [npm](https://www.npmjs.com/package/react-router-dom) |

#### 🎨 Styling & UI
| Package | Version | Purpose | Download Link |
|---------|---------|---------|---------------|
| tailwindcss | ^3.4.0 | CSS framework | [npm](https://www.npmjs.com/package/tailwindcss) |
| postcss | ^8.4.0 | CSS transformation | [npm](https://www.npmjs.com/package/postcss) |
| autoprefixer | ^10.4.0 | CSS prefixing | [npm](https://www.npmjs.com/package/autoprefixer) |
| lucide-react | ^0.563.0 | Icon library | [npm](https://www.npmjs.com/package/lucide-react) |
| framer-motion | ^12.33.0 | Animation library | [npm](https://www.npmjs.com/package/framer-motion) |
| clsx | ^2.1.1 | Conditional classes | [npm](https://www.npmjs.com/package/clsx) |
| tailwind-merge | ^3.4.0 | Tailwind merging | [npm](https://www.npmjs.com/package/tailwind-merge) |

#### 🌐 HTTP & API
| Package | Version | Purpose | Download Link |
|---------|---------|---------|---------------|
| axios | ^1.13.5 | HTTP client | [npm](https://www.npmjs.com/package/axios) |
| cors | ^2.8.6 | CORS handling | [npm](https://www.npmjs.com/package/cors) |

#### 💬 Real-time & Communication
| Package | Version | Purpose | Download Link |
|---------|---------|---------|---------------|
| socket.io-client | ^4.8.3 | WebSocket client | [npm](https://www.npmjs.com/package/socket.io-client) |
| @jitsi/react-sdk | ^1.4.4 | Video conferencing | [npm](https://www.npmjs.com/package/@jitsi/react-sdk) |

#### 🤖 AI Integration
| Package | Version | Purpose | Download Link |
|---------|---------|---------|---------------|
| @google/generative-ai | ^0.21.0 | Gemini AI | [npm](https://www.npmjs.com/package/@google/generative-ai) |

#### 🔐 Authentication
| Package | Version | Purpose | Download Link |
|---------|---------|---------|---------------|
| @react-oauth/google | ^0.13.4 | Google OAuth | [npm](https://www.npmjs.com/package/@react-oauth/google) |

#### 🎯 UI Components & Features
| Package | Version | Purpose | Download Link |
|---------|---------|---------|---------------|
| react-toastify | ^11.0.5 | Toast notifications | [npm](https://www.npmjs.com/package/react-toastify) |
| emoji-picker-react | ^4.18.0 | Emoji picker | [npm](https://www.npmjs.com/package/emoji-picker-react) |
| recharts | ^3.7.0 | Charts & graphs | [npm](https://www.npmjs.com/package/recharts) |

#### 📄 Document Processing
| Package | Version | Purpose | Download Link |
|---------|---------|---------|---------------|
| pdfjs-dist | ^5.4.624 | PDF rendering | [npm](https://www.npmjs.com/package/pdfjs-dist) |
| tesseract.js | ^7.0.0 | OCR | [npm](https://www.npmjs.com/package/tesseract.js) |

---

### Installation Commands

#### Backend Setup
```bash
cd backend
npm install
```

#### Frontend Setup
```bash
cd frontend
npm install
```

#### Clerk React Setup (Optional)
```bash
cd clerk-react
npm install
```

---

<a name="how-everything-works"></a>
## 🔄 How Everything Works

### 1. User Registration & Login Flow

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: User Opens Application                             │
│  Browser → http://localhost:5173                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Role Selection Page                                │
│  User chooses: Job Seeker OR Recruiter                     │
│  Click → Redirects to /seeker or /recruiter                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Signup/Login Page                                  │
│  User fills form:                                           │
│  • Email, Password, Name                                    │
│  • OR Click "Sign in with Google"                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Frontend Sends Request                             │
│  POST /api/auth/signup                                      │
│  Body: { email, password, firstName, lastName, role }      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: Backend Validates Data                             │
│  • Check if email already exists                            │
│  • Validate password strength                               │
│  • Hash password with bcrypt (10 rounds)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 6: Save to MongoDB                                    │
│  User document created in Users collection                  │
│  { _id, email, password (hashed), role, createdAt }        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 7: Generate JWT Token                                 │
│  jwt.sign({ userId, role }, JWT_SECRET, { expiresIn })    │
│  Token contains: user ID, role, expiration                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 8: Return Response                                    │
│  { success: true, token, user: { id, email, role } }       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 9: Frontend Stores Token                              │
│  localStorage.setItem('token', token)                       │
│  localStorage.setItem('user', JSON.stringify(user))         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 10: Redirect to Dashboard                             │
│  Seeker → /seeker/dashboard                                 │
│  Recruiter → /recruiter/dashboard                           │
└─────────────────────────────────────────────────────────────┘
```

### 2. Job Application Process

```
[Job Seeker] → Browse Jobs → Click "Apply" → Upload Resume
                                    ↓
                    Frontend sends POST /api/jobs/:id/apply
                                    ↓
                    Backend creates Application document
                                    ↓
                    Links: jobId + userId + resumeUrl
                                    ↓
                    Status: "pending"
                                    ↓
                    Socket.IO emits notification to recruiter
                                    ↓
                    Recruiter sees new application in dashboard
                                    ↓
                    Recruiter reviews → Updates status
                                    ↓
                    PUT /api/employer/applications/:id
                                    ↓
                    Status changed to: "interview" or "accepted"
                                    ↓
                    Socket.IO notifies job seeker
                                    ↓
                    Seeker sees update in "My Applications"
```

### 3. Real-time Chat System

```
┌─────────────────────────────────────────────────────────────┐
│  User A Opens Chat Page                                     │
│  Component mounts → useEffect runs                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Establish Socket Connection                                │
│  const socket = io('http://localhost:5000')                │
│  socket.emit('joinPrivateChat', userId)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend Socket.IO Server                                   │
│  socket.on('joinPrivateChat', (userId) => {                │
│    socket.join(userId.toString())                           │
│  })                                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  User A Types Message                                       │
│  "Hello, I'm interested in the job"                        │
│  Clicks Send                                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Frontend Emits Event                                       │
│  socket.emit('sendMessage', {                               │
│    senderId: userA_id,                                      │
│    receiverId: userB_id,                                    │
│    message: "Hello, I'm interested in the job"            │
│  })                                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend Receives Event                                     │
│  socket.on('sendMessage', async (data) => {                │
│    // Save to MongoDB                                       │
│    const message = await Message.create(data)               │
│    // Emit to receiver                                      │
│    io.to(receiverId).emit('newMessage', message)           │
│  })                                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  User B Receives Message (Real-time)                        │
│  socket.on('newMessage', (message) => {                    │
│    setMessages(prev => [...prev, message])                  │
│  })                                                          │
│  Message appears instantly in User B's chat                 │
└─────────────────────────────────────────────────────────────┘
```

### 4. File Upload System (Tiered Strategy)

```
User Selects File (Resume/Photo/Video)
            ↓
Frontend: <input type="file" onChange={handleUpload} />
            ↓
Create FormData object
const formData = new FormData()
formData.append('file', selectedFile)
            ↓
POST /api/upload (multipart/form-data)
            ↓
Backend: Multer middleware processes upload
            ↓
┌─────────────────────────────────────┐
│  TRY 1: Supabase Storage (Primary)  │
│  Upload to Supabase bucket          │
│  Get public URL                     │
└────────────┬────────────────────────┘
             │ Success? ✅
             ▼
┌─────────────────────────────────────┐
│  Return URL to frontend             │
│  Save URL to MongoDB                │
└─────────────────────────────────────┘

If Supabase fails ❌
             ↓
┌─────────────────────────────────────┐
│  TRY 2: Firebase Storage (Fallback) │
│  Upload to Firebase bucket          │
│  Get download URL                   │
└────────────┬────────────────────────┘
             │ Success? ✅
             ▼
┌─────────────────────────────────────┐
│  Return URL to frontend             │
│  Save URL to MongoDB                │
└─────────────────────────────────────┘

If Firebase fails ❌
             ↓
┌─────────────────────────────────────┐
│  TRY 3: Local Storage (Last Resort) │
│  Save to backend/uploads/           │
│  URL: /uploads/filename.ext         │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Return URL to frontend             │
│  Save URL to MongoDB                │
└─────────────────────────────────────┘
```

### 5. AI Chatbot Integration

```
User Opens AI Chat Widget
            ↓
User types: "How do I improve my resume?"
            ↓
Frontend sends POST /api/bot-chat
Body: {
  message: "How do I improve my resume?",
  role: "seeker",
  context: { userId, previousMessages }
}
            ↓
Backend receives request
            ↓
Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: "gemini-pro" })
            ↓
Build prompt with context
const prompt = `You are a career assistant for job seekers.
User question: ${message}
Provide helpful, actionable advice.`
            ↓
Send to Gemini API
const result = await model.generateContent(prompt)
const response = result.response.text()
            ↓
Return AI response to frontend
{ success: true, response: "Here are 5 tips..." }
            ↓
Frontend displays response in chat widget
User sees AI-generated advice instantly
```

### 6. Video Interview System

```
Recruiter schedules interview
            ↓
POST /api/interviews/schedule
Body: { applicationId, scheduledTime }
            ↓
Interview record created in database
            ↓
Email notification sent to job seeker
            ↓
Seeker clicks "Join Interview" link
            ↓
Navigate to /interview/:applicationId
            ↓
Frontend loads Jitsi React SDK
import { JitsiMeeting } from '@jitsi/react-sdk'
            ↓
Initialize Jitsi room
<JitsiMeeting
  roomName={`interview_${applicationId}`}
  configOverwrite={{
    startWithAudioMuted: true,
    startWithVideoMuted: false
  }}
/>
            ↓
Both recruiter and seeker join same room
            ↓
Real-time video/audio communication starts
            ↓
Interview conducted
            ↓
After interview: Recruiter updates application status
```

---

<a name="quick-start"></a>
## 🚀 Quick Start

### Prerequisites
```bash
# Check installations
node --version    # Should be v16+
npm --version     # Should be 8+
mongod --version  # MongoDB should be installed
```

### Step 1: Start MongoDB
```bash
# Windows
mongod

# Or use MongoDB Compass (GUI)
# Connect to: mongodb://127.0.0.1:27017
```

### Step 2: Start Backend
```bash
# Open Terminal 1
cd backend
npm install
npm start

# ✅ Server running on http://localhost:5000
```

### Step 3: Start Frontend
```bash
# Open Terminal 2
cd frontend
npm install
npm run dev

# ✅ Frontend running on http://localhost:5173
```

### Step 4: Access Application
Open browser: **http://localhost:5173**

### Test Credentials
```
Email: admin@jobportal.com
Password: admin123
Role: Admin (Full Access)
```

---

<a name="user-interface-flow"></a>
## 🎨 User Interface Flow & Navigation

### Landing Page Flow

```
User visits http://localhost:5173
            ↓
┌─────────────────────────────────────┐
│     ROLE SELECTION PAGE (/)         │
│  "Are you a Job Seeker or          │
│   Recruiter?"                       │
│                                     │
│  [Job Seeker Button] [Recruiter]   │
└─────────────────────────────────────┘
            ↓                    ↓
    Click Job Seeker      Click Recruiter
            ↓                    ↓
┌──────────────────────┐  ┌──────────────────────┐
│  /seeker (Landing)   │  │ /recruiter (Landing) │
│  • Features          │  │ • Features           │
│  • Benefits          │  │ • Benefits           │
│  • [Login] [Signup]  │  │ • [Login] [Signup]   │
└──────────────────────┘  └──────────────────────┘
```

### Job Seeker Navigation Flow

```
After Login → /seeker/dashboard
            ↓
┌─────────────────────────────────────────────────────────────┐
│  SEEKER DASHBOARD                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Sidebar Navigation:                                 │   │
│  │  • 🏠 Home                    → /seeker/home        │   │
│  │  • 📊 Dashboard               → /seeker/dashboard   │   │
│  │  • 💼 Browse Jobs (IT)        → /seeker/jobs        │   │
│  │  • 🏢 Browse Jobs (Non-IT)    → /seeker/non-it-jobs│   │
│  │  • 📝 My Applications         → /seeker/applications│   │
│  │  • ⭐ Saved Jobs              → /seeker/saved-jobs  │   │
│  │  • 🎓 Courses                 → /seeker/courses     │   │
│  │  • 🏢 Companies               → /seeker/companies   │   │
│  │  • 👥 Communities             → /seeker/communities │   │
│  │  • 💬 Chat                    → /seeker/chat        │   │
│  │  • 👤 Profile                 → /seeker/profile     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Main Content Area:                                         │
│  • Application stats (Applied, Pending, Accepted)          │
│  • Recent job recommendations                               │
│  • Profile completion percentage                            │
│  • Quick actions (Upload Resume, Update Profile)           │
└─────────────────────────────────────────────────────────────┘
```

### Job Browsing & Application Flow

```
Click "Browse Jobs" → /seeker/jobs
            ↓
┌─────────────────────────────────────────────────────────────┐
│  JOBS PAGE                                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Filters:                                             │  │
│  │  • Location: [Dropdown]                              │  │
│  │  • Job Type: [Full-time, Part-time, Contract]       │  │
│  │  • Experience: [Entry, Mid, Senior]                 │  │
│  │  • Salary Range: [Slider]                           │  │
│  │  • Search: [Text input]                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Job Cards:                                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Software Engineer                                    │  │
│  │  Company: Tech Corp | Location: Remote              │  │
│  │  Salary: $80k-$120k | Type: Full-time               │  │
│  │  [View Details] [Apply Now] [Save]                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
            ↓
    Click "View Details"
            ↓
┌─────────────────────────────────────────────────────────────┐
│  JOB DETAILS PAGE                                           │
│  • Full job description                                     │
│  • Requirements & qualifications                            │
│  • Responsibilities                                         │
│  • Benefits                                                 │
│  • Company information                                      │
│  • [Apply Now Button]                                      │
└─────────────────────────────────────────────────────────────┘
            ↓
    Click "Apply Now"
            ↓
┌─────────────────────────────────────────────────────────────┐
│  APPLICATION MODAL                                          │
│  • Resume: [Upload or Select Existing]                    │
│  • Cover Letter: [Text Area]                              │
│  • [Submit Application]                                    │
└─────────────────────────────────────────────────────────────┘
            ↓
    Submit Application
            ↓
    ✅ Success Toast: "Application submitted successfully!"
            ↓
    Application appears in "My Applications"
```

### Recruiter Navigation Flow

```
After Login → /recruiter/dashboard
            ↓
┌─────────────────────────────────────────────────────────────┐
│  RECRUITER DASHBOARD                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Sidebar Navigation:                                 │   │
│  │  • 🏠 Home                    → /recruiter/home     │   │
│  │  • 📊 Dashboard               → /recruiter/dashboard│   │
│  │  • ➕ Post Job                → /recruiter/post-job │   │
│  │  • 📋 My Jobs                 → /recruiter/my-jobs  │   │
│  │  • 👥 Candidates              → /recruiter/candidates│  │
│  │  • 📚 Post Course             → /recruiter/post-course│ │
│  │  • 🎓 My Courses              → /recruiter/my-courses│  │
│  │  • 💬 Chat                    → /recruiter/chat     │   │
│  │  • 👥 Communities             → /recruiter/communities│ │
│  │  • 📅 Calendar                → /recruiter/calendar │   │
│  │  • 🏢 Company Profile         → /recruiter/company-profile│
│  │  • 👤 Profile                 → /recruiter/profile  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Main Content Area:                                         │
│  • Active job postings count                                │
│  • Total applications received                              │
│  • Pending interviews                                       │
│  • Analytics charts (Applications over time)               │
│  • Recent applicants                                        │
└─────────────────────────────────────────────────────────────┘
```

### Job Posting Flow (Recruiter)

```
Click "Post Job" → /recruiter/post-job
            ↓
┌─────────────────────────────────────────────────────────────┐
│  POST JOB FORM                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Job Title: [Input]                                  │  │
│  │  Company: [Select from dropdown]                     │  │
│  │  Location: [Input]                                   │  │
│  │  Job Type: [Full-time/Part-time/Contract]           │  │
│  │  Category: [IT/Non-IT]                               │  │
│  │  Salary Range: [Input]                               │  │
│  │  Experience Level: [Entry/Mid/Senior]               │  │
│  │  Description: [Rich Text Editor]                     │  │
│  │  Requirements: [List Input]                          │  │
│  │  Responsibilities: [List Input]                      │  │
│  │  Benefits: [List Input]                              │  │
│  │  Skills Required: [Tag Input]                        │  │
│  │  [Post Job Button]                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
            ↓
    Click "Post Job"
            ↓
    POST /api/employer/jobs
            ↓
    ✅ Job created in database
            ↓
    Redirect to /recruiter/my-jobs
            ↓
    Job appears in "My Jobs" list
```

### Applicant Review Flow (Recruiter)

```
Navigate to "My Jobs" → /recruiter/my-jobs
            ↓
┌─────────────────────────────────────────────────────────────┐
│  MY JOBS PAGE                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Software Engineer                                    │  │
│  │  Posted: 2 days ago | Applications: 15              │  │
│  │  Status: Active                                       │  │
│  │  [View Applicants] [Edit] [Close Job]               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
            ↓
    Click "View Applicants"
            ↓
    Navigate to /recruiter/job/:jobId/applicants
            ↓
┌─────────────────────────────────────────────────────────────┐
│  APPLICANTS PAGE                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  John Doe                                             │  │
│  │  Applied: 1 day ago | Status: Pending               │  │
│  │  Skills: React, Node.js, MongoDB                     │  │
│  │  Experience: 3 years                                 │  │
│  │  [View Resume] [View Profile] [Schedule Interview]  │  │
│  │  Status: [Dropdown: Pending/Interview/Accepted/     │  │
│  │           Rejected]                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
            ↓
    Click "View Resume"
            ↓
    PDF viewer opens with resume
            ↓
    Click "Schedule Interview"
            ↓
┌─────────────────────────────────────────────────────────────┐
│  SCHEDULE INTERVIEW MODAL                                   │
│  • Date: [Date Picker]                                     │
│  • Time: [Time Picker]                                     │
│  • Duration: [Dropdown]                                    │
│  • Notes: [Text Area]                                      │
│  • [Send Interview Invite]                                 │
└─────────────────────────────────────────────────────────────┘
            ↓
    Interview scheduled
            ↓
    Email sent to applicant
            ↓
    Status updated to "Interview Scheduled"
```

### Chat Interface Flow

```
Click "Chat" → /seeker/chat or /recruiter/chat
            ↓
┌─────────────────────────────────────────────────────────────┐
│  CHAT PAGE                                                  │
│  ┌──────────────┬──────────────────────────────────────┐   │
│  │ Conversations│  Chat Window                         │   │
│  │              │                                       │   │
│  │ 🟢 John Doe  │  John Doe                            │   │
│  │   "Hi..."    │  ┌────────────────────────────────┐ │   │
│  │              │  │ Hi, I'm interested in the job  │ │   │
│  │ 🔴 Jane Smith│  │ you posted.                    │ │   │
│  │   "Thanks"   │  │                    10:30 AM ✓✓ │ │   │
│  │              │  └────────────────────────────────┘ │   │
│  │ 🟢 Bob Wilson│  ┌────────────────────────────────┐ │   │
│  │   "Hello"    │  │ Great! Let's schedule a call.  │ │   │
│  │              │  │ 10:32 AM ✓✓                    │ │   │
│  │              │  └────────────────────────────────┘ │   │
│  │              │                                       │   │
│  │              │  [Type a message...] [😊] [Send]    │   │
│  └──────────────┴──────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

Features:
• Real-time message delivery (Socket.IO)
• Online/offline status indicators
• Read receipts (✓✓)
• Emoji picker
• Message history
• Search conversations
```

### Community Features Flow

```
Click "Communities" → /seeker/communities
            ↓
┌─────────────────────────────────────────────────────────────┐
│  COMMUNITIES LIST                                           │
│  [Create Community Button]                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🚀 Tech Enthusiasts                                  │  │
│  │  Members: 1,234 | Posts: 567                         │  │
│  │  "Discuss latest tech trends"                        │  │
│  │  [Join] [View]                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  💼 Career Advice                                     │  │
│  │  Members: 890 | Posts: 234                           │  │
│  │  "Get career guidance"                               │  │
│  │  [Joined ✓] [View]                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
            ↓
    Click "View" on a community
            ↓
    Navigate to /seeker/communities/:id
            ↓
┌─────────────────────────────────────────────────────────────┐
│  COMMUNITY DETAIL PAGE                                      │
│  Tech Enthusiasts                                           │
│  Members: 1,234 | [Leave Community]                        │
│                                                             │
│  [Create Post Button]                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  👤 John Doe • 2 hours ago                           │  │
│  │  "What's the best way to learn React?"              │  │
│  │  💬 15 Comments | 👍 23 Likes                        │  │
│  │  [Comment] [Like]                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  👤 Jane Smith • 5 hours ago                         │  │
│  │  "Check out this amazing tutorial..."               │  │
│  │  💬 8 Comments | 👍 45 Likes                         │  │
│  │  [Comment] [Like]                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
            ↓
    Click "Create Post"
            ↓
┌─────────────────────────────────────────────────────────────┐
│  CREATE POST MODAL                                          │
│  Title: [Input]                                            │
│  Content: [Rich Text Editor]                               │
│  Tags: [Tag Input]                                         │
│  [Post Button]                                             │
└─────────────────────────────────────────────────────────────┘
            ↓
    Post created and appears in community feed
```

---

<a name="security-authentication"></a>
## 🔐 Security & Authentication

### JWT Token Structure

```javascript
// Token Payload
{
  userId: "507f1f77bcf86cd799439011",
  role: "seeker",
  email: "user@example.com",
  iat: 1709654400,  // Issued at
  exp: 1709740800   // Expires in 24 hours
}

// Token Generation (Backend)
const token = jwt.sign(
  { userId: user._id, role: user.role, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Token Verification (Middleware)
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### Password Security

```javascript
// Password Hashing (Registration)
const bcrypt = require('bcryptjs');
const saltRounds = 10;

// Hash password before saving
const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
user.password = hashedPassword;
await user.save();

// Password Verification (Login)
const isMatch = await bcrypt.compare(plainPassword, user.password);
if (!isMatch) {
  return res.status(401).json({ error: 'Invalid credentials' });
}
```

### Protected Routes

```javascript
// Frontend: ProtectedRoute Component
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return <Outlet />;
};

// Usage in App.jsx
<Route element={<ProtectedRoute allowedRoles={['seeker']} />}>
  <Route path="/seeker/dashboard" element={<Dashboard />} />
</Route>
```

### API Security Measures

1. **CORS Configuration**
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));
```

2. **Helmet.js Security Headers**
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:5000", "ws://localhost:5000"]
    }
  }
}));
```

3. **Input Validation**
```javascript
const { body, validationResult } = require('express-validator');

router.post('/signup',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process signup...
  }
);
```

---

<a name="database-design"></a>
## 💾 Database Design

### MongoDB Collections Schema

#### 1. Users Collection
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  password: "$2a$10$hashed_password_here",
  phoneNumber: "+1234567890",
  role: "seeker", // enum: ['seeker', 'employer', 'recruiter', 'admin']
  
  // Profile Information
  resumeUrl: "https://supabase.co/storage/resumes/john_resume.pdf",
  photoUrl: "https://supabase.co/storage/photos/john_photo.jpg",
  location: "San Francisco, CA",
  aboutMe: "Passionate software developer...",
  
  // Skills & Experience
  skills: ["JavaScript", "React", "Node.js", "MongoDB"],
  primarySkill: "Full Stack Development",
  experienceLevel: "mid", // enum: ['entry', 'mid', 'senior']
  
  // Education
  education: [
    {
      institutionName: "Stanford University",
      degreeName: "B.S. Computer Science",
      yearOfPassing: 2020,
      score: "3.8 GPA"
    }
  ],
  
  // Work Experience
  experience: [
    {
      company: "Tech Corp",
      role: "Software Engineer",
      duration: "2020-2023",
      description: "Developed web applications..."
    }
  ],
  
  // Projects
  projects: [
    {
      title: "E-commerce Platform",
      description: "Built a full-stack e-commerce site",
      technologies: ["React", "Node.js", "MongoDB"],
      url: "https://github.com/johndoe/ecommerce"
    }
  ],
  
  // Authentication
  googleId: "google_oauth_id_here",
  authProvider: "local", // enum: ['local', 'google']
  isEmailVerified: true,
  
  // Status
  isBlocked: false,
  
  // Timestamps
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-02-20T14:45:00Z")
}
```

#### 2. Jobs Collection
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  title: "Senior Full Stack Developer",
  company: ObjectId("507f1f77bcf86cd799439020"), // ref: Company
  companyName: "Tech Innovations Inc",
  
  // Job Details
  location: "Remote",
  salary: "$120,000 - $150,000",
  type: "Full-time", // enum: ['Full-time', 'Part-time', 'Contract', 'Internship']
  category: "IT", // enum: ['IT', 'Non-IT']
  experienceLevel: "senior",
  
  // Description
  description: "We are looking for an experienced full stack developer...",
  requirements: [
    "5+ years of experience",
    "Strong knowledge of React and Node.js",
    "Experience with MongoDB"
  ],
  responsibilities: [
    "Design and develop web applications",
    "Collaborate with cross-functional teams",
    "Mentor junior developers"
  ],
  benefits: [
    "Health insurance",
    "401(k) matching",
    "Flexible work hours",
    "Remote work options"
  ],
  
  // Skills
  skills: ["React", "Node.js", "MongoDB", "AWS", "Docker"],
  
  // Metadata
  postedBy: ObjectId("507f1f77bcf86cd799439015"), // ref: User (recruiter)
  status: "active", // enum: ['active', 'closed', 'draft']
  applicationsCount: 45,
  views: 1234,
  
  // Timestamps
  createdAt: ISODate("2024-02-01T09:00:00Z"),
  updatedAt: ISODate("2024-02-20T16:30:00Z")
}
```

#### 3. Applications Collection
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439013"),
  job: ObjectId("507f1f77bcf86cd799439012"), // ref: Job
  user: ObjectId("507f1f77bcf86cd799439011"), // ref: User
  
  // Application Details
  status: "interview", // enum: ['pending', 'reviewed', 'interview', 'accepted', 'rejected']
  coverLetter: "I am excited to apply for this position...",
  resumeUrl: "https://supabase.co/storage/resumes/john_resume.pdf",
  
  // AI Analysis
  aiMatchScore: 85,
  aiAnalysis: {
    skillsMatch: 90,
    experienceMatch: 80,
    summary: "Strong candidate with relevant experience"
  },
  
  // Interview Details
  interviewScheduled: ISODate("2024-02-25T14:00:00Z"),
  interviewNotes: "Candidate showed strong technical skills",
  
  // Recruiter Notes
  notes: "Impressive portfolio, good communication skills",
  
  // Timestamps
  appliedAt: ISODate("2024-02-10T11:20:00Z"),
  updatedAt: ISODate("2024-02-20T15:00:00Z")
}
```

#### 4. Messages Collection
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439014"),
  conversationId: "507f1f77bcf86cd799439011_507f1f77bcf86cd799439015",
  senderId: ObjectId("507f1f77bcf86cd799439011"), // ref: User
  receiverId: ObjectId("507f1f77bcf86cd799439015"), // ref: User
  
  // Message Content
  message: "Hi, I'm interested in the Software Engineer position",
  
  // Status
  isRead: false,
  
  // Timestamp
  timestamp: ISODate("2024-02-20T10:30:00Z")
}
```

#### 5. Communities Collection
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439016"),
  name: "Tech Enthusiasts",
  description: "A community for tech lovers to discuss latest trends",
  category: "Technology",
  
  // Members
  createdBy: ObjectId("507f1f77bcf86cd799439011"), // ref: User
  members: [
    ObjectId("507f1f77bcf86cd799439011"),
    ObjectId("507f1f77bcf86cd799439015"),
    // ... more member IDs
  ],
  memberCount: 1234,
  
  // Settings
  isPrivate: false,
  imageUrl: "https://supabase.co/storage/communities/tech_enthusiasts.jpg",
  
  // Timestamps
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-02-20T12:00:00Z")
}
```

#### 6. Companies Collection
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439020"),
  name: "Tech Innovations Inc",
  description: "Leading technology company specializing in AI solutions",
  
  // Details
  industry: "Technology",
  size: "500-1000 employees",
  location: "San Francisco, CA",
  website: "https://techinnovations.com",
  
  // Media
  logoUrl: "https://supabase.co/storage/logos/tech_innovations.png",
  
  // Verification
  isVerified: true,
  
  // Owner
  ownerId: ObjectId("507f1f77bcf86cd799439015"), // ref: User (recruiter)
  
  // Stats
  jobCount: 15,
  
  // Timestamps
  createdAt: ISODate("2023-06-01T00:00:00Z"),
  updatedAt: ISODate("2024-02-20T09:00:00Z")
}
```

### Database Relationships

```
Users (1) ──────── (Many) Applications
Users (1) ──────── (Many) Jobs (as postedBy)
Users (Many) ───── (Many) Communities (as members)
Jobs (1) ───────── (Many) Applications
Companies (1) ──── (Many) Jobs
Users (1) ──────── (Many) Messages (as sender)
Users (1) ──────── (Many) Messages (as receiver)
```

---

<a name="api-reference"></a>
## 🌐 API Reference

### Authentication Endpoints

#### POST /api/auth/signup
Register a new user

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "role": "seeker"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "seeker"
  }
}
```

#### POST /api/auth/login
Login existing user

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "seeker"
  }
}
```

#### POST /api/auth/google
Google OAuth login

**Request Body:**
```json
{
  "credential": "google_oauth_credential_token"
}
```

#### GET /api/auth/me
Get current user (Protected)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "seeker",
    "resumeUrl": "https://...",
    "skills": ["JavaScript", "React"]
  }
}
```

### Job Endpoints

#### GET /api/jobs
Get all jobs with filters

**Query Parameters:**
- `category` - IT or Non-IT
- `type` - Full-time, Part-time, Contract, Internship
- `location` - City or Remote
- `experienceLevel` - entry, mid, senior
- `search` - Search term

**Example:**
```
GET /api/jobs?category=IT&type=Full-time&location=Remote
```

**Response (200):**
```json
{
  "success": true,
  "jobs": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Senior Full Stack Developer",
      "companyName": "Tech Innovations Inc",
      "location": "Remote",
      "salary": "$120,000 - $150,000",
      "type": "Full-time",
      "category": "IT",
      "skills": ["React", "Node.js", "MongoDB"],
      "applicationsCount": 45,
      "createdAt": "2024-02-01T09:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "pages": 15
}
```

#### GET /api/jobs/:id
Get job details by ID

**Response (200):**
```json
{
  "success": true,
  "job": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Senior Full Stack Developer",
    "companyName": "Tech Innovations Inc",
    "location": "Remote",
    "salary": "$120,000 - $150,000",
    "type": "Full-time",
    "description": "We are looking for...",
    "requirements": ["5+ years experience", "..."],
    "responsibilities": ["Design and develop...", "..."],
    "benefits": ["Health insurance", "..."],
    "skills": ["React", "Node.js", "MongoDB"],
    "postedBy": {
      "_id": "507f1f77bcf86cd799439015",
      "firstName": "Jane",
      "lastName": "Smith"
    }
  }
}
```

#### POST /api/jobs/:id/apply
Apply for a job (Protected - Seeker only)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "coverLetter": "I am excited to apply...",
  "resumeUrl": "https://supabase.co/storage/resumes/john_resume.pdf"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "application": {
    "_id": "507f1f77bcf86cd799439013",
    "job": "507f1f77bcf86cd799439012",
    "user": "507f1f77bcf86cd799439011",
    "status": "pending",
    "appliedAt": "2024-02-20T10:30:00Z"
  }
}
```

### Employer/Recruiter Endpoints

#### POST /api/employer/jobs
Post a new job (Protected - Recruiter only)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Senior Full Stack Developer",
  "company": "507f1f77bcf86cd799439020",
  "location": "Remote",
  "salary": "$120,000 - $150,000",
  "type": "Full-time",
  "category": "IT",
  "description": "We are looking for...",
  "requirements": ["5+ years experience"],
  "responsibilities": ["Design and develop..."],
  "benefits": ["Health insurance"],
  "skills": ["React", "Node.js", "MongoDB"],
  "experienceLevel": "senior"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Job posted successfully",
  "job": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Senior Full Stack Developer",
    "status": "active",
    "createdAt": "2024-02-20T10:00:00Z"
  }
}
```

#### GET /api/employer/jobs
Get recruiter's posted jobs (Protected)

**Response (200):**
```json
{
  "success": true,
  "jobs": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Senior Full Stack Developer",
      "applicationsCount": 45,
      "status": "active",
      "createdAt": "2024-02-01T09:00:00Z"
    }
  ]
}
```

#### GET /api/employer/jobs/:jobId/applications
Get applicants for a job (Protected - Recruiter only)

**Response (200):**
```json
{
  "success": true,
  "applications": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "user": {
        "_id": "507f1f77bcf86cd799439011",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "skills": ["React", "Node.js"],
        "experienceLevel": "mid"
      },
      "status": "pending",
      "resumeUrl": "https://...",
      "coverLetter": "I am excited...",
      "aiMatchScore": 85,
      "appliedAt": "2024-02-10T11:20:00Z"
    }
  ]
}
```

#### PUT /api/employer/applications/:id
Update application status (Protected - Recruiter only)

**Request Body:**
```json
{
  "status": "interview",
  "notes": "Impressive portfolio",
  "interviewScheduled": "2024-02-25T14:00:00Z"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Application updated successfully",
  "application": {
    "_id": "507f1f77bcf86cd799439013",
    "status": "interview",
    "interviewScheduled": "2024-02-25T14:00:00Z"
  }
}
```

### Chat Endpoints

#### GET /api/chat/conversations
Get user's conversations (Protected)

**Response (200):**
```json
{
  "success": true,
  "conversations": [
    {
      "conversationId": "507f1f77bcf86cd799439011_507f1f77bcf86cd799439015",
      "otherUser": {
        "_id": "507f1f77bcf86cd799439015",
        "firstName": "Jane",
        "lastName": "Smith",
        "photoUrl": "https://..."
      },
      "lastMessage": {
        "message": "Thanks for your interest",
        "timestamp": "2024-02-20T15:30:00Z",
        "isRead": true
      },
      "unreadCount": 0
    }
  ]
}
```

#### GET /api/chat/messages/:conversationId
Get messages in a conversation (Protected)

**Response (200):**
```json
{
  "success": true,
  "messages": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "senderId": "507f1f77bcf86cd799439011",
      "receiverId": "507f1f77bcf86cd799439015",
      "message": "Hi, I'm interested in the position",
      "isRead": true,
      "timestamp": "2024-02-20T10:30:00Z"
    }
  ]
}
```

#### POST /api/chat/messages
Send a message (Protected)

**Request Body:**
```json
{
  "receiverId": "507f1f77bcf86cd799439015",
  "message": "Hi, I'm interested in the Software Engineer position"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": {
    "_id": "507f1f77bcf86cd799439014",
    "senderId": "507f1f77bcf86cd799439011",
    "receiverId": "507f1f77bcf86cd799439015",
    "message": "Hi, I'm interested in the Software Engineer position",
    "timestamp": "2024-02-20T10:30:00Z"
  }
}
```

### AI Chatbot Endpoint

#### POST /api/bot-chat
Chat with AI assistant (Protected)

**Request Body:**
```json
{
  "message": "How do I improve my resume?",
  "role": "seeker",
  "context": {
    "userId": "507f1f77bcf86cd799439011",
    "previousMessages": []
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "response": "Here are 5 tips to improve your resume:\n1. Use action verbs...\n2. Quantify achievements...\n3. Tailor to job description...\n4. Keep it concise...\n5. Proofread carefully..."
}
```

---

<a name="development-guide"></a>
## 🛠️ Development Guide

### Environment Setup

#### Backend .env Configuration
```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/jobportal

# JWT
JWT_SECRET=supersecret_milestone_token_2026

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Supabase
SUPABASE_URL=https://your_project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Firebase
FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# AI
GEMINI_API_KEY=your_gemini_api_key
```

#### Frontend .env Configuration
```env
VITE_API_URL=/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### Development Commands

#### Backend
```bash
# Install dependencies
cd backend
npm install

# Start development server (with auto-restart)
npm run dev

# Start production server
npm start

# Check for errors
node index.js
```

#### Frontend
```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Testing the Application

#### 1. Test Authentication
```bash
# Using curl
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123",
    "role": "seeker"
  }'
```

#### 2. Test Protected Endpoints
```bash
# Get current user
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 3. Test Job Posting
```bash
# Post a job (as recruiter)
curl -X POST http://localhost:5000/api/employer/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Software Engineer",
    "location": "Remote",
    "type": "Full-time",
    "category": "IT",
    "description": "We are hiring...",
    "salary": "$80k-$120k"
  }'
```

### Debugging Tips

#### Backend Debugging
```javascript
// Add console logs
console.log('[DEBUG] Request body:', req.body);
console.log('[DEBUG] User:', req.user);

// Check MongoDB connection
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});
```

#### Frontend Debugging
```javascript
// Use React DevTools
// Check component state and props

// Console log API responses
axios.get('/api/jobs')
  .then(res => console.log('Jobs:', res.data))
  .catch(err => console.error('Error:', err));

// Check localStorage
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('user')));
```

#### Socket.IO Debugging
```javascript
// Backend
io.on('connection', (socket) => {
  console.log('[Socket] User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('[Socket] User disconnected:', socket.id);
  });
});

// Frontend
socket.on('connect', () => {
  console.log('[Socket] Connected to server');
});

socket.on('disconnect', () => {
  console.log('[Socket] Disconnected from server');
});
```

### Common Issues & Solutions

#### Issue 1: MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
```bash
# Start MongoDB
mongod

# Or check if MongoDB is running
ps aux | grep mongod
```

#### Issue 2: Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

#### Issue 3: CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
```javascript
// backend/index.js
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

#### Issue 4: JWT Token Invalid
```
Error: jwt malformed
```
**Solution:**
```javascript
// Check token format
const token = req.headers.authorization?.split(' ')[1];
console.log('Token:', token);

// Verify JWT_SECRET matches in .env
console.log('JWT_SECRET:', process.env.JWT_SECRET);
```

---

<a name="feature-breakdown"></a>
## 📊 Feature Breakdown

### 1. Job Seeker Features

#### Profile Management
- ✅ Create and edit profile
- ✅ Upload resume (PDF/DOCX)
- ✅ Upload profile photo
- ✅ Add education details
- ✅ Add work experience
- ✅ Add skills and certifications
- ✅ Add projects portfolio
- ✅ Set job preferences

#### Job Search & Application
- ✅ Browse IT jobs
- ✅ Browse Non-IT jobs
- ✅ Advanced search filters
- ✅ Save/bookmark jobs
- ✅ Apply to jobs with one click
- ✅ Track application status
- ✅ View application history
- ✅ Receive application updates

#### Learning & Development
- ✅ Browse available courses
- ✅ Enroll in courses
- ✅ Track course progress
- ✅ Access course materials
- ✅ View course certificates

#### Communication
- ✅ Real-time chat with recruiters
- ✅ Receive interview invitations
- ✅ Join video interviews
- ✅ Get email notifications
- ✅ AI career assistant chatbot

#### Community
- ✅ Join communities
- ✅ Create posts
- ✅ Comment on discussions
- ✅ Like and share content
- ✅ Network with peers

### 2. Recruiter Features

#### Job Management
- ✅ Post job listings
- ✅ Edit job postings
- ✅ Close/reopen jobs
- ✅ View job analytics
- ✅ Track application metrics
- ✅ Duplicate job postings

#### Applicant Management
- ✅ View all applicants
- ✅ Filter and search candidates
- ✅ View candidate profiles
- ✅ Download resumes
- ✅ Update application status
- ✅ Add notes to applications
- ✅ AI-powered candidate matching

#### Interview Management
- ✅ Schedule interviews
- ✅ Send interview invitations
- ✅ Conduct video interviews
- ✅ Calendar integration
- ✅ Interview reminders
- ✅ Record interview notes

#### Company Management
- ✅ Create company profile
- ✅ Update company information
- ✅ Upload company logo
- ✅ Manage company jobs
- ✅ Company verification badge

#### Communication
- ✅ Chat with candidates
- ✅ Send bulk messages
- ✅ Email notifications
- ✅ AI recruitment assistant

#### Analytics & Reporting
- ✅ Job performance metrics
- ✅ Application statistics
- ✅ Candidate pipeline view
- ✅ Time-to-hire analytics
- ✅ Source tracking

### 3. Admin Features

#### User Management
- ✅ View all users
- ✅ Block/unblock users
- ✅ Verify companies
- ✅ Manage user roles
- ✅ View user activity

#### Content Management
- ✅ Manage all jobs
- ✅ Manage all courses
- ✅ Moderate communities
- ✅ Remove inappropriate content

#### System Management
- ✅ View system health
- ✅ Monitor database
- ✅ Check API status
- ✅ View error logs
- ✅ System configuration

### 4. Technical Features

#### Real-time Features
- ✅ Socket.IO integration
- ✅ Live chat messaging
- ✅ Real-time notifications
- ✅ Online status indicators
- ✅ Typing indicators

#### AI Integration
- ✅ Google Gemini AI
- ✅ Resume parsing
- ✅ Job matching algorithm
- ✅ Chatbot assistants
- ✅ Skill extraction

#### File Management
- ✅ Multi-cloud storage (Supabase, Firebase, Local)
- ✅ PDF processing
- ✅ DOCX processing
- ✅ Image optimization
- ✅ Video upload support

#### Security
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Google OAuth 2.0
- ✅ OTP verification
- ✅ Role-based access control
- ✅ Input validation
- ✅ CORS protection
- ✅ Helmet.js security headers

---

## 🎯 Summary

### What Makes This Project Special?

1. **Full-Stack Architecture** - Complete MERN stack implementation
2. **Real-time Communication** - Socket.IO for instant messaging
3. **AI Integration** - Google Gemini for intelligent assistance
4. **Multi-cloud Storage** - Tiered fallback system for reliability
5. **Video Conferencing** - Built-in Jitsi integration
6. **Comprehensive ATS** - Full applicant tracking system
7. **Community Features** - Social networking for professionals
8. **Mobile-Responsive** - Works on all devices
9. **Scalable Architecture** - Ready for production deployment
10. **Modern Tech Stack** - Latest versions of all technologies

### Quick Reference Links

- **Backend API**: http://localhost:5000
- **Frontend App**: http://localhost:5173
- **MongoDB**: mongodb://127.0.0.1:27017
- **API Health**: http://localhost:5000/api/health

### Package Installation Summary

```bash
# Backend (98 files)
cd backend && npm install

# Frontend
cd frontend && npm install

# Clerk React (Optional)
cd clerk-react && npm install
```

### Key Technologies

| Category | Technology |
|----------|-----------|
| Frontend | React 18 + Vite 5 |
| Backend | Node.js + Express 4 |
| Database | MongoDB + Mongoose 9 |
| Real-time | Socket.IO 4.8 |
| Auth | JWT + Google OAuth |
| AI | Google Gemini |
| Storage | Cloudinary + Supabase + Firebase |
| Video | Jitsi React SDK |
| Styling | Tailwind CSS 3 |

---

**🎉 You're all set! This comprehensive guide covers everything about the Future Milestone project.**

*For more details, refer to:*
- `PROJECT_FULL_REPORT.md` - Complete documentation
- `QUICK_START_GUIDE.md` - Quick setup guide
- `backend/API_DOCUMENTATION.md` - API reference

**Last Updated:** February 24, 2026
