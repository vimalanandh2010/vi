# Installation Guide

## Prerequisites

Required software:
- Node.js v16+ ([Download](https://nodejs.org/))
- npm 8+ (comes with Node.js)
- MongoDB ([Download](https://www.mongodb.com/try/download/community))
- Git ([Download](https://git-scm.com/))
- VS Code (recommended) ([Download](https://code.visualstudio.com/))

Verify installation:
```bash
node --version  # Should be v16.x.x or higher
npm --version   # Should be 8.x.x or higher
mongod --version
git --version
```

## Step 1: Clone Repository

```bash
git clone <repository-url>
cd futuremilestone
```

## Step 2: Backend Setup

### Install Dependencies
```bash
cd backend
npm install
```

### Configure Environment Variables
Create `backend/.env`:
```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/jobportal

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE=your_supabase_service_role_key

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# Email (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password

# AI
GEMINI_API_KEY=your_gemini_api_key

# OTP
ENFORCE_VERIFICATION=false
ALLOW_MASTER_OTP=true
```

### Start MongoDB
```bash
# Windows: Start MongoDB service from Services
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
# Or use MongoDB Atlas (cloud)
```

### Start Backend Server
```bash
cd backend
npm start
# Or for development: npm run dev
```

Expected output:
```
✅ Server running on port 5000
✅ MongoDB connected successfully
✅ Socket.IO initialized
```

Backend running at: **http://localhost:5000**

## Step 3: Frontend Setup

### Install Dependencies
Open new terminal:
```bash
cd frontend
npm install
```

### Configure Environment Variables
Create `frontend/.env`:
```env
# API
VITE_API_URL=/api
VITE_SOCKET_URL=http://localhost:5000

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Start Frontend Server
```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v5.0.0  ready in 500 ms
➜  Local:   http://localhost:5173/
```

Frontend running at: **http://localhost:5173**

## Step 4: Verify Installation

### Check Backend
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"OK","database":"Connected"}
```

### Check Frontend
Open browser: http://localhost:5173
You should see the Future Milestone landing page.

## Step 5: Optional Setup

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - http://localhost:5173
   - http://localhost:5000/auth/google/callback
6. Update `.env` files with Client ID and Secret

### Supabase Storage Setup
1. Create account at [Supabase](https://supabase.com/)
2. Create project
3. Create buckets: `resumes`, `photos`, `videos`
4. Set buckets to public
5. Update `backend/.env` with URL and keys

### Gemini AI Setup
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Update `GEMINI_API_KEY` in `backend/.env`

## Common Issues

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongod --version
# Start MongoDB
mongod
```

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# Mac/Linux
lsof -i :5000
kill -9 <process_id>
```

### npm install fails
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## Development Workflow

Run both servers in separate terminals:

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

Stop servers: Press `Ctrl + C`

## Next Steps
- Explore the application
- Test user registration and login
- Browse jobs and apply
- Test chat functionality
- Upload resume and profile photo
- Review [API Documentation](./04-API-REFERENCE.md)
- Check [Deployment Guide](./03-DEPLOYMENT.md)

---
[← Back to Overview](./01-OVERVIEW.md) | [Next: Deployment →](./03-DEPLOYMENT.md)
