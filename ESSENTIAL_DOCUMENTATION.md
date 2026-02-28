# 🚀 Future Milestone - Essential Documentation

## 1. Project Overview

**Future Milestone** is a full-stack MERN job portal connecting job seekers with employers. The platform features multi-role authentication (job seekers, employers, admins), real-time chat, AI-powered career assistance, video interviews, and comprehensive profile management.

The application uses modern web technologies with a React frontend and Express backend, supporting both traditional email/password authentication and Google OAuth. It includes advanced features like resume parsing, ATS scoring, community forums, course enrollment, and real-time notifications.

**Current Status:** ✅ Fully functional in development with 9 registered users, deployed backend on Render, and ready for frontend deployment on Vercel.

### Key Features
- Multi-role authentication (Job Seekers, Employers, Admins)
- Google OAuth integration
- Real-time chat with Socket.IO
- AI career assistant powered by Google Gemini
- Resume upload and parsing
- Video interview scheduling (Jitsi integration)
- Community forums and discussions
- Course enrollment system
- Application tracking and analytics
- Dark/Light mode UI

---

## 2. Quick Start

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)
- npm or yarn

### Installation
```bash
# Clone repository
git clone <repository-url>

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the App
```bash
# Terminal 1 - Start MongoDB (if local)
mongod

# Terminal 2 - Start Backend
cd backend
npm start
# Backend: http://localhost:5000

# Terminal 3 - Start Frontend
cd frontend
npm run dev
# Frontend: http://localhost:5173
```

### Test Credentials
```
Email: admin@jobportal.com
Password: admin123
Role: Admin
```

---

## 3. Technology Stack

### Backend
- Express 4.18.2
- MongoDB (Mongoose 9.1.4)
- Socket.IO 4.8.3
- JWT (jsonwebtoken 9.0.3)
- Google Auth Library 10.5.0
- Multer 2.0.2
- Nodemailer 7.0.12

### Frontend
- React 18.2.0
- Vite 5.0.0
- React Router DOM 7.13.0
- Tailwind CSS 3.4.0
- Axios 1.13.5
- Socket.IO Client 4.8.3

### Services
- Google OAuth 2.0
- Google Gemini AI
- Supabase (storage)
- Jitsi (video calls)
- MongoDB Atlas (production)

---

## 4. Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/jobportal
JWT_SECRET=supersecret_milestone_token_2026
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 5. API Endpoints

### Authentication (`/api/auth`)
- `POST /signup` - Register new user
- `POST /login` - Login with email/password
- `POST /google` - Google OAuth login
- `GET /me` - Get current user (protected)
- `PUT /update` - Update profile (protected)
- `POST /resume` - Upload resume (protected)
- `POST /photo` - Upload photo (protected)

### Jobs (`/api/jobs`)
- `GET /` - Get all jobs (with filters)
- `GET /:id` - Get job details
- `POST /:id/apply` - Apply to job (protected)
- `GET /applied` - Get user's applications (protected)

### Employer (`/api/employer`)
- `POST /jobs` - Post new job (employer only)
- `GET /jobs` - Get employer's jobs (protected)
- `GET /jobs/:jobId/applications` - Get job applicants (protected)
- `PUT /applications/:id` - Update application status (protected)

### Courses (`/api/courses`)
- `GET /` - Get all courses
- `GET /:id` - Get course details
- `POST /:id/enroll` - Enroll in course (protected)

### Admin (`/api/admin`)
- `GET /users` - Get all users (admin only)
- `PUT /users/:id/block` - Block/unblock user (admin only)
- `POST /courses` - Upload course (admin only)

---

## 6. Database Collections

### Collections Overview
- **users** - User accounts (seekers, employers, admins) with profiles, education, and authentication data
- **jobs** - Job postings with company details, requirements, and salary information
- **applications** - Job applications linking users to jobs with status tracking
- **courses** - Learning courses with videos, thumbnails, and enrollment data
- **messages** - Chat messages between users with timestamps
- **communities** - Community forums with posts and member management
- **interviews** - Scheduled video interviews with time slots

---

## 7. Deployment

### Backend (Render)
- **Current URL:** https://backend-portal-56ud.onrender.com
- **Status:** ✅ Deployed and running
- **Database:** MongoDB Atlas
- **Config:** See `render.yaml`

### Frontend (Vercel)
- **Status:** Ready for deployment
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:** Set in Vercel dashboard

### Database (MongoDB Atlas)
- **Connection:** Cloud-hosted MongoDB
- **Backup:** Automatic daily backups
- **Access:** Whitelist IP addresses

---

## 8. Common Issues

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
mongod

# Verify connection string in .env
MONGODB_URI=mongodb://127.0.0.1:27017/jobportal
```

### Port Already in Use
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### CORS Error
- Verify `FRONTEND_URL` in backend `.env`
- Check CORS configuration in `backend/index.js`
- Ensure frontend is using correct API URL

### API Not Connecting
- Confirm backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env`
- Verify network requests in browser DevTools

### File Upload Fails
- Check `backend/uploads/` directory exists
- Verify file size limits (5MB max)
- Ensure correct file types (PDF, JPG, PNG, MP4)

---

## 9. Key Features

### For Job Seekers
1. **Profile Management** - Complete profile with education, skills, experience
2. **Resume Upload** - Upload and manage resume (PDF, DOC, DOCX)
3. **Job Search** - Browse and filter jobs by location, type, salary
4. **One-Click Apply** - Apply to jobs with saved profile
5. **Application Tracking** - Track status of all applications
6. **AI Career Assistant** - Get career advice from Gemini AI
7. **Course Enrollment** - Access learning courses
8. **Community Forums** - Join discussions and network
9. **Real-time Chat** - Message recruiters directly
10. **Video Interviews** - Join scheduled video calls

### For Recruiters
1. **Job Posting** - Create and manage job listings
2. **Applicant Management** - View and filter applicants
3. **Resume Review** - Download and review candidate resumes
4. **Application Status** - Update candidate status (pending, interview, accepted, rejected)
5. **Analytics Dashboard** - Track job views and applications
6. **Video Interviews** - Schedule and conduct video interviews
7. **Real-time Chat** - Message candidates directly
8. **ATS Scoring** - AI-powered resume scoring
9. **Bulk Actions** - Manage multiple applications
10. **Company Profile** - Showcase company information

---

## 10. Support

### Documentation
- **Full Documentation:** `PROJECT_FULL_REPORT.md`
- **API Reference:** `backend/API_DOCUMENTATION.md`
- **Quick Start:** `QUICK_START_GUIDE.md`
- **Architecture:** `ARCHITECTURE_SUMMARY.md`

### Development
- **Backend Logs:** Check `backend/server_logs.txt`
- **Frontend DevTools:** Use browser console
- **Database:** MongoDB Compass for GUI
- **API Testing:** Postman or Thunder Client

### Contact
- **GitHub Issues:** Report bugs and feature requests
- **Email:** Contact project maintainers
- **Documentation:** Check existing docs first

---

## 📊 Project Statistics

- **Total Users:** 9 registered
- **Backend Status:** ✅ Deployed on Render
- **Frontend Status:** ✅ Ready for deployment
- **Database:** MongoDB Atlas (cloud)
- **Storage:** Local + Supabase
- **Lines of Code:** 15,000+

---

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Role-based access control (RBAC)
- Protected API routes
- Input validation and sanitization
- File type and size validation
- Environment variable protection
- CORS configuration

---

## 🎯 Quick Commands Reference

### Backend
```bash
npm start              # Start server
npm run dev            # Start with nodemon
node test-upload.js    # Test file uploads
```

### Frontend
```bash
npm run dev            # Start dev server
npm run build          # Build for production
npm run preview        # Preview production build
```

### Database
```bash
mongod                 # Start MongoDB
mongo                  # Open MongoDB shell
```

---

## 📁 Project Structure

```
futuremilestone/
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth, validation
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   ├── uploads/         # File storage
│   └── index.js         # Server entry
│
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # State management
│   │   ├── api/         # API services
│   │   └── App.jsx      # Main app
│   └── package.json
│
└── docs/                # Documentation
```

---

## 🚀 Next Steps

1. **Setup Environment** - Configure all environment variables
2. **Start Development** - Run backend and frontend
3. **Test Features** - Try all major features
4. **Customize** - Add your branding and content
5. **Deploy** - Deploy to production (Render + Vercel)
6. **Monitor** - Set up logging and monitoring
7. **Scale** - Optimize for production traffic

---

## 💡 Pro Tips

- Use MongoDB Compass for database visualization
- Use Postman collections for API testing
- Enable React DevTools for debugging
- Check browser Network tab for API issues
- Use `console.log` strategically for debugging
- Keep environment variables secure
- Test on multiple browsers
- Use Git branches for features
- Document your changes
- Regular database backups

---

## 📝 Notes

- **File Storage:** Currently using local storage (`backend/uploads/`) with Supabase integration available
- **Google OAuth:** Fully configured and working
- **Real-time Features:** Socket.IO for chat and notifications
- **AI Integration:** Google Gemini for career assistance
- **Video Calls:** Jitsi Meet integration for interviews
- **Responsive Design:** Mobile-first approach with Tailwind CSS

---

**Last Updated:** February 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**License:** MIT

---

*For detailed information, refer to PROJECT_FULL_REPORT.md*
