# Deployment Guide

## Overview

This guide covers deploying Future Milestone to production using:
- **Backend**: Render
- **Frontend**: Vercel
- **Database**: MongoDB Atlas

## Prerequisites

- GitHub account with repository access
- Render account ([render.com](https://render.com))
- Vercel account ([vercel.com](https://vercel.com))
- MongoDB Atlas account ([mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas))

---

## Part 1: MongoDB Atlas Setup

### 1.1 Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Click "Build a Database"
4. Choose "Shared" (Free tier)
5. Select cloud provider and region
6. Click "Create Cluster"

### 1.2 Configure Database Access

1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose authentication method: Password
4. Create username and strong password
5. Set user privileges: "Read and write to any database"
6. Click "Add User"

### 1.3 Configure Network Access

1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 1.4 Get Connection String

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

## Part 2: Backend Deployment on Render

### 2.1 Prepare Backend for Deployment

Ensure your `backend/package.json` has:
```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
```

### 2.2 Push Code to GitHub

```bash
# Add all changes
git add .

# Commit changes
git commit -m "Prepare for deployment"

# Push to GitHub
git push origin main
```

### 2.3 Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure service:
   - **Name**: `futuremilestone-backend` (or your choice)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### 2.4 Configure Environment Variables

In Render dashboard, go to "Environment" tab and add:

```env
NODE_ENV=production
PORT=5000

# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/jobportal?retryWrites=true&w=majority
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/jobportal?retryWrites=true&w=majority

# JWT Secret (generate a strong random string)
JWT_SECRET=your_production_jwt_secret_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE=your_supabase_service_role_key

# URLs (update after frontend deployment)
FRONTEND_URL=https://your-frontend-url.vercel.app
BACKEND_URL=https://your-backend-url.onrender.com

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

### 2.5 Deploy

1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Once deployed, you'll get a URL like: `https://your-app.onrender.com`

### 2.6 Verify Backend Deployment

Visit: `https://your-backend-url.onrender.com/api/health`

Should return:
```json
{
  "status": "OK",
  "database": "Connected"
}
```

---

## Part 3: Frontend Deployment on Vercel

### 3.1 Prepare Frontend for Deployment

Update `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_SOCKET_URL=https://your-backend-url.onrender.com
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3.2 Deploy to Vercel

#### Option A: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? futuremilestone-frontend
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

#### Option B: Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   VITE_SOCKET_URL=https://your-backend-url.onrender.com
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```
6. Click "Deploy"

### 3.3 Update Backend CORS

After frontend deployment, update `FRONTEND_URL` in Render:

1. Go to Render dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Update `FRONTEND_URL` to your Vercel URL
5. Save changes (triggers automatic redeploy)

---

## Part 4: Post-Deployment Configuration

### 4.1 Update Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "Credentials"
4. Edit OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `https://your-frontend-url.vercel.app`
   - `https://your-backend-url.onrender.com/auth/google/callback`
6. Save

### 4.2 Configure Supabase CORS

1. Go to Supabase dashboard
2. Go to Storage settings
3. Add allowed origins:
   - `https://your-frontend-url.vercel.app`
   - `https://your-backend-url.onrender.com`

### 4.3 Test Production Deployment

1. Visit your frontend URL
2. Test user registration
3. Test login
4. Test file uploads
5. Test job posting and application
6. Test real-time chat
7. Test video interviews

---

## Part 5: Continuous Deployment

### 5.1 Automatic Deployments

Both Render and Vercel support automatic deployments:

**Render:**
- Automatically deploys when you push to `main` branch
- Configure in "Settings" → "Build & Deploy"

**Vercel:**
- Automatically deploys on every push
- Preview deployments for pull requests
- Production deployment for `main` branch

### 5.2 Deployment Workflow

```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push origin main

# Render and Vercel will automatically deploy
```

---

## Part 6: Monitoring & Maintenance

### 6.1 Monitor Render Logs

1. Go to Render dashboard
2. Select your service
3. Click "Logs" tab
4. Monitor for errors

### 6.2 Monitor Vercel Deployments

1. Go to Vercel dashboard
2. Select your project
3. View deployment history
4. Check build logs

### 6.3 MongoDB Atlas Monitoring

1. Go to Atlas dashboard
2. View cluster metrics
3. Monitor database performance
4. Set up alerts

---

## Troubleshooting

### Backend Not Starting

**Check:**
- Environment variables are set correctly
- MongoDB connection string is valid
- Build logs in Render dashboard

**Solution:**
```bash
# Test MongoDB connection locally
node -e "require('mongoose').connect('your_connection_string').then(() => console.log('Connected')).catch(err => console.error(err))"
```

### Frontend Can't Connect to Backend

**Check:**
- `VITE_API_URL` is correct
- Backend CORS allows frontend URL
- Backend is running

**Solution:**
Update `FRONTEND_URL` in Render environment variables

### File Uploads Failing

**Check:**
- Supabase credentials are correct
- Storage buckets exist and are public
- CORS is configured

**Solution:**
Test Supabase connection and check bucket policies

### Real-time Chat Not Working

**Check:**
- WebSocket connections are allowed
- `VITE_SOCKET_URL` is correct
- Render supports WebSockets (it does)

**Solution:**
Check Socket.IO configuration and CORS settings

---

## Current Deployment Status

- **Backend**: https://backend-portal-56ud.onrender.com
- **Frontend**: Ready for deployment
- **Database**: MongoDB Atlas
- **Status**: Production-ready

---

## Cost Breakdown

### Free Tier Limits

**Render Free:**
- 750 hours/month
- Spins down after 15 minutes of inactivity
- Spins up on request (30-60 seconds)

**Vercel Free:**
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS

**MongoDB Atlas Free:**
- 512 MB storage
- Shared RAM
- No backup

### Upgrade Recommendations

For production with traffic:
- **Render**: $7/month (always on, no spin down)
- **Vercel**: Free tier usually sufficient
- **MongoDB Atlas**: $9/month (2GB storage, backups)

---

[← Back to Installation](./02-INSTALLATION.md) | [Next: API Reference →](./04-API-REFERENCE.md)
