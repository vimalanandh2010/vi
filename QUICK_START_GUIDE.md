# 🚀 Future Milestone - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Prerequisites Check
```bash
node --version    # Should be v16+
mongod --version  # Should be installed
npm --version     # Should be installed
```

### 2. Start MongoDB
```bash
# Windows
mongod

# Or use MongoDB Compass GUI
```

### 3. Start Backend (Terminal 1)
```bash
cd backend
npm install
npm start
```
✅ Backend running on: http://localhost:5000

### 4. Start Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
✅ Frontend running on: http://localhost:5173

### 5. Open Browser
Navigate to: **http://localhost:5173**

---

## 🎯 Quick Test

### Test Login
```
Email: admin@jobportal.com
Password: admin123
Role: Admin
```

### Test Features
1. ✅ Browse jobs
2. ✅ Apply to a job
3. ✅ Upload resume
4. ✅ Chat with AI assistant
5. ✅ Join a community

---

## 📦 Package Summary

### Backend (Node.js + Express)
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + Google OAuth
- **Real-time:** Socket.IO
- **Storage:** Cloudinary, Supabase, Firebase
- **AI:** Google Gemini

### Frontend (React + Vite)
- **Framework:** React 18
- **Build:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **State:** Context API
- **Real-time:** Socket.IO Client

---

## 🔑 Key Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/jobportal
JWT_SECRET=supersecret_milestone_token_2026
GOOGLE_CLIENT_ID=your_google_client_id
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend (.env)
```env
VITE_API_URL=/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 🌟 Core Features

### For Job Seekers
- 🔍 Browse & search jobs (IT & Non-IT)
- 📝 Apply to jobs with one click
- 📄 Upload & manage resume
- 💬 Chat with recruiters
- 🎓 Enroll in courses
- 👥 Join communities
- 🤖 AI career assistant

### For Recruiters
- 📢 Post job listings
- 👀 View & manage applicants
- 📊 Track application analytics
- 🎥 Schedule video interviews
- 🏢 Manage company profile
- 💬 Chat with candidates
- 🤖 AI recruitment assistant

---

## 📁 Project Structure

```
futuremilestone/
├── backend/              # API Server
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth, validation
│   ├── config/          # Configuration files
│   ├── utils/           # Helper functions
│   └── index.js         # Server entry point
│
├── frontend/            # React App
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── components/ # Reusable components
│   │   ├── context/    # State management
│   │   ├── api/        # API services
│   │   └── App.jsx     # Main app component
│   └── package.json
│
└── clerk-react/         # Clerk Auth (Optional)
```

---

## 🔌 API Endpoints Quick Reference

### Authentication
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/google` - Google OAuth
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs/:id/apply` - Apply to job
- `POST /api/employer/jobs` - Post job (recruiter)

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses/:id/enroll` - Enroll in course

### Chat
- `GET /api/chat/conversations` - Get conversations
- `POST /api/chat/messages` - Send message

### AI
- `POST /api/ai/chat` - Chat with AI assistant

---

## 🛠️ Common Commands

### Backend
```bash
npm start          # Start server
npm run dev        # Start with nodemon (auto-restart)
```

### Frontend
```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if MongoDB is running
mongod

# Check if port 5000 is available
netstat -ano | findstr :5000
```

### Frontend won't start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Can't connect to API
- ✅ Check backend is running on port 5000
- ✅ Check VITE_API_URL in frontend/.env
- ✅ Check CORS settings in backend

### MongoDB connection error
- ✅ Start MongoDB: `mongod`
- ✅ Check MONGODB_URI in backend/.env
- ✅ Verify MongoDB is running on port 27017

---

## 📊 Tech Stack at a Glance

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Database | MongoDB |
| Auth | JWT + Google OAuth |
| Real-time | Socket.IO |
| Styling | Tailwind CSS |
| AI | Google Gemini |
| Storage | Cloudinary, Supabase |
| Video | Jitsi |

---

## 🎓 Learning Resources

### For Developers
- **React:** https://react.dev
- **Express:** https://expressjs.com
- **MongoDB:** https://docs.mongodb.com
- **Socket.IO:** https://socket.io/docs
- **Tailwind:** https://tailwindcss.com

### Project Documentation
- `PROJECT_FULL_REPORT.md` - Complete documentation
- `backend/API_DOCUMENTATION.md` - API reference
- `backend/BACKEND_SUMMARY.md` - Backend overview
- `frontend/SETUP_GUIDE.md` - Frontend setup

---

## 🚀 Next Steps

1. ✅ **Explore the platform** - Try all features
2. ✅ **Read full documentation** - Check PROJECT_FULL_REPORT.md
3. ✅ **Customize** - Add your branding
4. ✅ **Deploy** - Follow deployment guide
5. ✅ **Scale** - Add more features

---

## 💡 Pro Tips

- Use **Postman** to test API endpoints
- Use **MongoDB Compass** to view database
- Use **React DevTools** for debugging
- Check **browser console** for errors
- Use **Network tab** to debug API calls

---

## 📞 Need Help?

- 📖 Read: `PROJECT_FULL_REPORT.md`
- 🐛 Issues: Check troubleshooting section
- 💬 Questions: Review documentation
- 🔍 Search: Check existing issues

---

**Happy Coding! 🎉**

*Last Updated: February 24, 2026*
