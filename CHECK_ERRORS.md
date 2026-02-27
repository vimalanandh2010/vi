# 🔍 Error Diagnostic Guide

## How to Report Errors

Please provide the following information:

### 1. Browser Console Errors
**How to check:**
1. Open your browser (Chrome/Firefox/Edge)
2. Press `F12` or `Right-click → Inspect`
3. Go to "Console" tab
4. Copy all red error messages

**Common errors to look for:**
- `Failed to fetch`
- `Cannot read property`
- `Module not found`
- `CORS error`
- `404 Not Found`
- `500 Internal Server Error`

### 2. Backend Terminal Errors
**Check your backend terminal for:**
- MongoDB connection errors
- Route errors
- Authentication errors
- File upload errors
- API endpoint errors

### 3. Frontend Terminal Errors
**Check your frontend terminal for:**
- Build errors
- Module resolution errors
- Dependency errors
- Vite errors

### 4. Network Errors
**How to check:**
1. Press `F12` → Network tab
2. Reload the page
3. Look for failed requests (red)
4. Click on failed request to see details

---

## Common Error Categories

### A. Authentication Errors
- [ ] Login not working
- [ ] Signup not working
- [ ] Google OAuth not working
- [ ] Token expired
- [ ] Unauthorized access

### B. Page Loading Errors
- [ ] Dashboard not loading
- [ ] Profile page blank
- [ ] Jobs page not showing
- [ ] Applications page error

### C. API Errors
- [ ] Cannot fetch data
- [ ] 404 errors
- [ ] 500 server errors
- [ ] CORS errors
- [ ] Timeout errors

### D. File Upload Errors
- [ ] Resume upload failing
- [ ] Photo upload failing
- [ ] Video upload failing
- [ ] File size errors

### E. Resume Analyzer Errors
- [ ] PDF extraction failing
- [ ] OCR errors
- [ ] AI analysis failing
- [ ] CORS errors with Supabase

### F. UI/Display Errors
- [ ] Components not rendering
- [ ] Styling broken
- [ ] Images not loading
- [ ] Animations not working

---

## Quick Diagnostic Commands

### Check Backend Status:
```bash
cd backend
npm start
```
**Expected:** Server running on port 5000

### Check Frontend Status:
```bash
cd frontend
npm run dev
```
**Expected:** Server running on port 5173

### Check MongoDB:
```bash
mongosh
use jobportal
db.users.countDocuments()
```
**Expected:** Returns number of users

### Check Dependencies:
```bash
# Backend
cd backend
npm list

# Frontend
cd frontend
npm list
```

---

## Error Report Template

Please copy and fill this template:

```
## Error Report

### 1. What were you trying to do?
[Describe the action: e.g., "Trying to login as job seeker"]

### 2. What happened instead?
[Describe the error: e.g., "Got 'Cannot read property' error"]

### 3. Browser Console Errors:
```
[Paste console errors here]
```

### 4. Backend Terminal Output:
```
[Paste backend errors here]
```

### 5. Frontend Terminal Output:
```
[Paste frontend errors here]
```

### 6. Which page/feature?
- [ ] Login/Signup
- [ ] Dashboard
- [ ] Profile Setup
- [ ] Jobs Page
- [ ] Applications
- [ ] Courses
- [ ] Resume Analyzer
- [ ] Other: ___________

### 7. Screenshots (if applicable):
[Attach or describe what you see]
```

---

## Automated Error Check

Run this in your browser console to check for common issues:

```javascript
// Copy and paste this in browser console (F12)
console.log('=== DIAGNOSTIC CHECK ===');

// Check if user is logged in
console.log('1. Auth Token:', localStorage.getItem('token') ? '✅ Present' : '❌ Missing');
console.log('2. User Data:', localStorage.getItem('user') ? '✅ Present' : '❌ Missing');
console.log('3. Role:', localStorage.getItem('role') || '❌ Not set');

// Check API connection
fetch('http://localhost:5000/api/auth/me', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
})
.then(r => console.log('4. Backend API:', r.ok ? '✅ Connected' : '❌ Error'))
.catch(e => console.log('4. Backend API: ❌ Not running'));

// Check Puter.js
console.log('5. Puter.js:', typeof window.puter !== 'undefined' ? '✅ Loaded' : '❌ Not loaded');

// Check React Router
console.log('6. Current Route:', window.location.pathname);

console.log('=== END DIAGNOSTIC ===');
```

---

## Common Fixes

### Fix 1: Backend Not Running
```bash
cd backend
npm install
npm start
```

### Fix 2: Frontend Not Running
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

### Fix 3: MongoDB Not Running
```bash
mongod
```

### Fix 4: Clear Cache
```bash
# Frontend
cd frontend
rm -rf node_modules
rm package-lock.json
npm install --legacy-peer-deps

# Backend
cd backend
rm -rf node_modules
rm package-lock.json
npm install
```

### Fix 5: Clear Browser Data
1. Press `Ctrl+Shift+Delete`
2. Clear cache and cookies
3. Reload page

### Fix 6: Reset Database
```bash
cd backend
node seedJobs.js
```

---

## Need Help?

After running diagnostics, share:
1. Console errors (copy/paste)
2. Terminal output (copy/paste)
3. What you were trying to do
4. Which page/feature

I'll help you fix all the errors! 🔧
