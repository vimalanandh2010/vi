# Render Deployment Guide for Verification Removal Changes

## Quick Deployment Steps

### 1. Access Render Dashboard
- Go to: https://dashboard.render.com
- Login with your credentials

### 2. Check Auto-Deploy Status

**For Backend Service (`job-portal-backend`):**
1. Click on the backend service
2. Go to "Settings" tab
3. Scroll to "Build & Deploy" section
4. Check if "Auto-Deploy" is set to "Yes"

**For Frontend Service (`job-portal-frontend`):**
1. Click on the frontend service
2. Go to "Settings" tab
3. Scroll to "Build & Deploy" section
4. Check if "Auto-Deploy" is set to "Yes"

### 3. Deployment Options

#### Option A: Auto-Deploy Enabled (Easiest)
If auto-deploy is enabled, Render will automatically:
- Detect your git push
- Start building both services
- Deploy when build completes

**What to do:**
1. Wait 5-10 minutes
2. Check "Events" tab on each service
3. Look for "Deploy succeeded" message

#### Option B: Manual Deploy
If auto-deploy is disabled:

**Backend:**
1. Go to `job-portal-backend` service
2. Click "Manual Deploy" button (top right)
3. Select "Deploy latest commit"
4. Click "Deploy"
5. Monitor logs in "Logs" tab

**Frontend:**
1. Go to `job-portal-frontend` service
2. Click "Manual Deploy" button (top right)
3. Select "Deploy latest commit"
4. Click "Deploy"
5. Monitor logs in "Logs" tab

### 4. Monitor Deployment

**Backend Logs to Watch For:**
```
==> Cloning from https://github.com/your-repo...
==> Running 'npm install'
==> Running 'node index.js'
==> Server running on port 5000
==> MongoDB connected successfully
```

**Frontend Logs to Watch For:**
```
==> Cloning from https://github.com/your-repo...
==> Running 'npm install && npm run build'
==> vite v5.x.x building for production...
==> ✓ built in Xs
==> Build successful
```

### 5. Verify Deployment

After deployment completes, test these features:

#### Test Password Reset (No OTP):
1. Go to your frontend URL
2. Click "Forgot Password"
3. Enter email + new password
4. Should reset immediately without OTP

#### Test Job Posting (No Verification):
1. Login as recruiter
2. Go to "Post Job"
3. Fill job details
4. Should post successfully without verification check

#### Test Course Posting (No Verification):
1. Login as recruiter
2. Go to "Post Course"
3. Fill course details
4. Should post successfully without verification check

### 6. Troubleshooting

#### If Backend Deployment Fails:
1. Check "Logs" tab for errors
2. Common issues:
   - Missing environment variables
   - MongoDB connection issues
   - Port binding issues

**Fix:**
- Go to "Environment" tab
- Verify all required variables are set:
  - `MONGO_URI`
  - `JWT_SECRET`
  - `FRONTEND_URL`
  - `BACKEND_URL`
  - `GEMINI_API_KEY`
  - `EMAIL_USER`
  - `EMAIL_PASS`
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`

#### If Frontend Deployment Fails:
1. Check "Logs" tab for build errors
2. Common issues:
   - Build command failures
   - Missing dependencies
   - Environment variable issues

**Fix:**
- Go to "Environment" tab
- Verify variables are set:
  - `VITE_API_URL`
  - `VITE_SOCKET_URL`
  - `VITE_GOOGLE_CLIENT_ID`

#### If Deployment Succeeds but Features Don't Work:
1. **Clear Browser Cache**: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
2. **Check API Endpoints**: Open browser DevTools → Network tab
3. **Check Backend Logs**: Look for errors in Render logs
4. **Verify Environment Variables**: Make sure FRONTEND_URL and BACKEND_URL are correct

### 7. Rollback (If Needed)

If something goes wrong:

1. Go to service in Render Dashboard
2. Click "Manual Deploy"
3. Select "Deploy specific commit"
4. Choose previous commit: `d3cffb5` (before verification removal)
5. Click "Deploy"

### 8. Post-Deployment Checklist

- [ ] Backend service shows "Live" status
- [ ] Frontend service shows "Live" status
- [ ] Password reset works without OTP
- [ ] Job posting works without verification
- [ ] Course posting works without verification
- [ ] No console errors in browser
- [ ] No errors in Render logs

## Expected Deployment Timeline

| Service | Build Time | Deploy Time | Total |
|---------|-----------|-------------|-------|
| Backend | 2-3 min   | 1-2 min     | 3-5 min |
| Frontend| 4-5 min   | 1-2 min     | 5-7 min |

**Total Time**: ~10-12 minutes for both services

## Support

If you encounter issues:
1. Check Render status page: https://status.render.com
2. Review deployment logs carefully
3. Check environment variables
4. Verify git commit was pushed successfully
5. Contact Render support if infrastructure issues

## Quick Commands Reference

### Check Latest Commit Locally:
```bash
git log --oneline -1
```

### Force Redeploy (if needed):
```bash
git commit --allow-empty -m "Trigger Render redeploy"
git push origin main
```

### View Render Logs (via CLI):
```bash
# Install Render CLI first
npm install -g @render/cli

# Login
render login

# View logs
render logs -s job-portal-backend
render logs -s job-portal-frontend
```
