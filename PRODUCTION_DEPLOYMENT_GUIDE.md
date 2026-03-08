# 🚀 Production Deployment Guide

Complete guide for deploying your Job Portal to production hosting platforms.

---

## 📋 Pre-Deployment Checklist

Before deploying to production:

- [ ] All features tested locally
- [ ] Database backed up
- [ ] Environment variables documented
- [ ] API keys obtained for production
- [ ] Email service configured
- [ ] Domain name purchased (optional)
- [ ] SSL certificate ready (usually automatic with hosting)

---

## 🔧 Required Services Setup

### 1. **MongoDB Atlas** (Database)

**Free Tier:** 512MB storage, shared cluster

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create new cluster (M0 Free tier)
4. Database Access → Add Database User
5. Network Access → Add IP Address (0.0.0.0/0 for all)
6. Copy Connection String

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/jobportal?retryWrites=true&w=majority
```

---

### 2. **Email Service** (Choose ONE)

#### **Option A: Resend** ✅ Recommended

**Free Tier:** 3,000 emails/month

1. Sign up at [resend.com](https://resend.com)
2. Create API Key
3. Add to environment:

```env
EMAIL_SERVICE=resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_USER=onboarding@resend.dev
```

**📖 Detailed Guide:** [EMAIL_HOSTING_SETUP_GUIDE.md](./EMAIL_HOSTING_SETUP_GUIDE.md)

#### **Option B: Brevo (SendinBlue)**

**Free Tier:** 300 emails/day

```env
EMAIL_SERVICE=brevo
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-brevo-smtp-key
```

---

### 3. **Supabase** (File Storage)

**Free Tier:** 1GB storage

Already configured in your `.env` file.

---

### 4. **Google OAuth** (Social Login)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-frontend.com/auth/google/callback`
   - `http://localhost:5173/auth/google/callback` (for development)

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxx
```

---

### 5. **Gemini AI** (Resume Analysis)

1. Go to [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Create API Key

```env
GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxx
```

---

## 🌐 Hosting Platform Setup

### **Option 1: Render.com** ✅ Recommended for Full-Stack

#### Backend Deployment

1. **Connect Repository:**
   - Go to [render.com](https://render.com)
   - New → Web Service
   - Connect GitHub repository
   - Select backend folder

2. **Configure Service:**
   ```
   Name: job-portal-backend
   Region: Choose closest to users
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: node index.js
   Instance Type: Free
   ```

3. **Add Environment Variables:**
   - Click "Environment" tab
   - Add all variables from `.env` file
   - Important: Update `FRONTEND_URL` and `BACKEND_URL` to production URLs

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy the service URL (e.g., `https://job-portal-backend.onrender.com`)

#### Frontend Deployment

1. **Connect Repository:**
   - New → Static Site
   - Connect GitHub repository
   - Select frontend folder

2. **Configure Site:**
   ```
   Name: job-portal-frontend
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

3. **Add Environment Variables:**
   ```env
   VITE_API_URL=https://job-portal-backend.onrender.com/api
   ```

4. **Deploy:**
   - Click "Create Static Site"
   - Copy the site URL

5. **Update Backend CORS:**
   - Go to backend service → Environment
   - Update `FRONTEND_URL` to your frontend URL

---

### **Option 2: Railway.app** - Easy Alternative

1. **New Project:**
   - Go to [railway.app](https://railway.app)
   - New Project → Deploy from GitHub

2. **Deploy Backend:**
   - Select repository → backend folder
   - Add environment variables
   - Deploy automatically

3. **Deploy Frontend:**
   - Add service → Frontend
   - Build command: `npm run build`
   - Start command: `npm run preview` or use static server

---

### **Option 3: Vercel + Railway**

**Frontend on Vercel:**

1. Import GitHub repository
2. Framework Preset: Vite
3. Root Directory: frontend
4. Add environment variables
5. Deploy

**Backend on Railway:**
- Same as Railway option above for backend only

---

## 🔐 Complete Environment Variables

### Backend (.env)

```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/jobportal

# JWT
JWT_SECRET=your_super_secure_random_string_here_min_32_chars

# Email (Choose one option)
EMAIL_SERVICE=resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_USER=onboarding@resend.dev

# File Storage
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE=your-service-role-key

# Google OAuth
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# AI Services
GEMINI_API_KEY=AIzaSyDxxxxx

# URLs (Update these!)
FRONTEND_URL=https://your-frontend-domain.com
BACKEND_URL=https://your-backend-domain.com

# Optional
ALLOW_MASTER_OTP=false
GOOGLE_MAPS_API_KEY=your-maps-key
```

### Frontend (.env)

```env
VITE_API_URL=https://your-backend-domain.com/api
```

---

## ✅ Post-Deployment Verification

### 1. Test Backend Health

```bash
curl https://your-backend.onrender.com/api/health
```

Should return: `{"status":"ok"}`

### 2. Test Email Configuration

```bash
# SSH into Render shell or run locally with production env
node backend/scripts/verify_production_email.js
```

### 3. Test Frontend

1. Open your frontend URL
2. Try to register a new account
3. Check if welcome email arrives
4. Test login functionality
5. Try posting a job (recruiter)
6. Try applying to a job (job seeker)

### 4. Monitor Logs

**Render:**
- Dashboard → Your Service → Logs tab
- Look for errors or warnings

**Railway:**
- Project → Service → View Logs

---

## ⚠️ Common Deployment Issues

### Issue 1: "Application Error" or 503

**Cause:** Backend not starting properly

**Solution:**
- Check logs for error messages
- Verify `PORT` environment variable
- Ensure `Start Command` is correct: `node index.js`
- Check if all dependencies installed

### Issue 2: CORS Errors

**Cause:** Frontend URL not whitelisted in backend

**Solution:**
Update backend `FRONTEND_URL` environment variable:
```env
FRONTEND_URL=https://your-frontend.vercel.app
```

### Issue 3: MongoDB Connection Failed

**Cause:** Wrong connection string or IP not whitelisted

**Solution:**
- Check MongoDB Atlas → Network Access
- Add IP: `0.0.0.0/0` (allow all)
- Verify connection string format
- Ensure password doesn't contain special characters (or encode them)

### Issue 4: Emails Not Sending

**Cause:** Missing email credentials or wrong service

**Solution:**
- Check environment variables are set
- Run: `node backend/scripts/verify_production_email.js`
- See: [EMAIL_HOSTING_SETUP_GUIDE.md](./EMAIL_HOSTING_SETUP_GUIDE.md)

### Issue 5: Resume Upload Failing

**Cause:** Supabase storage not configured

**Solution:**
- Check Supabase storage bucket exists
- Verify storage policies allow uploads
- See: `backend/REQUIRED_STORAGE_POLICIES.sql`

### Issue 6: Google OAuth Not Working

**Cause:** Redirect URI not authorized

**Solution:**
- Google Cloud Console → OAuth 2.0
- Add authorized redirect URIs:
  - `https://your-frontend.com/auth/google/callback`
- Wait 5-10 minutes for changes to propagate

---

## 📊 Monitoring & Maintenance

### Health Checks

Add to your monitoring (UptimeRobot, Pingdom, etc.):
```
https://your-backend.com/api/health
```

### Log Monitoring

**Render:**
- Enable persistent logs (paid feature)
- Or use external logging service

**Railway:**
- Logs are available in dashboard
- Can export to external service

### Database Backups

**MongoDB Atlas:**
- Free tier: Automatic backups (1-day retention)
- Paid tier: Point-in-time recovery

**Manual Backup:**
```bash
mongodump --uri="your-mongodb-connection-string" --out=./backup
```

---

## 🔒 Security Checklist

- [ ] All API keys stored in environment variables (not in code)
- [ ] JWT_SECRET is random and secure (min 32 characters)
- [ ] MongoDB Atlas has IP whitelisting configured
- [ ] CORS configured with specific frontend URL (not *)
- [ ] HTTPS enabled (automatic with Render/Vercel)
- [ ] Rate limiting enabled for API endpoints
- [ ] Input validation on all forms
- [ ] SQL injection protection (using Mongoose)
- [ ] XSS protection (sanitizing inputs)

---

## 💰 Cost Estimation (Free Tier)

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **Render** | ✅ Yes | 750 hours/month, sleeps after 15min inactivity |
| **MongoDB Atlas** | ✅ Yes | 512MB storage, shared cluster |
| **Resend** | ✅ Yes | 3,000 emails/month, 100 emails/day |
| **Supabase** | ✅ Yes | 1GB storage, 50MB file size |
| **Vercel** | ✅ Yes | 100GB bandwidth/month |
| **Railway** | ✅ Trial | $5 credit free, then pay-as-you-go |

**Total Monthly Cost: $0** (with free tiers)

**Note:** Render free tier sleeps after 15 minutes of inactivity. First request after sleep takes 30-60 seconds.

---

## 🚀 Scaling Tips

When you outgrow free tier:

1. **Upgrade Render Instance:**
   - $7/month: 512MB RAM, no sleep
   - $25/month: 2GB RAM, better performance

2. **Add Redis Cache:**
   - Reduce database queries
   - Speed up API responses

3. **Use CDN:**
   - CloudFlare (free)
   - Serve static assets faster

4. **Optimize Images:**
   - Use WebP format
   - Compress before upload
   - Lazy loading

5. **Database Indexing:**
   - Add indexes to frequently queried fields
   - Already configured in your app

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Resend Documentation](https://resend.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

## 🆘 Need Help?

1. **Check Logs First:**
   - Backend logs show most errors clearly
   - Frontend console shows API errors

2. **Test Locally:**
   - Switch .env to production values
   - Test if issue reproduces locally

3. **Common Error Messages:**
   - "MongooseServerSelectionError" → MongoDB connection issue
   - "CORS" → Frontend URL not whitelisted
   - "401 Unauthorized" → JWT or auth issue
   - "500 Internal Server Error" → Check backend logs

---

**Ready to deploy?** Follow the steps for your chosen platform above! 🚀
