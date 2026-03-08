# Google Calendar Integration - Complete Guide

## 🎯 Three Connection Methods Available

Your job portal now supports **3 ways** to connect Google Calendar. Choose the best method for your needs:

| Method | Best For | Setup Time | Requires |
|--------|----------|------------|----------|
| **OAuth (Recommended)** | Individual recruiters | 2 minutes | Personal or Work Gmail |
| **Service Account** | Company-wide automation | 30 minutes | Google Workspace Admin |
| **Persistent OAuth** | Long-term connection | Same as OAuth | Any Gmail account |

---

## Method 1: OAuth Connection (RECOMMENDED) ✅

**What you have now** - Simple, secure, works with any Gmail account.

### How to Use:

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Connect Calendar:**
   - Login as recruiter at http://localhost:5173
   - Go to **Calendar Settings**: `/recruiter/calendar-settings`
   - Click **"Connect Google Calendar"**
   - Authorize in popup window
   - ✅ Done! Connection is saved permanently

4. **Schedule Interviews:**
   - Go to any job's applicants page
   - Click **"Schedule"** on an applicant
   - Pick date/time with calendar picker
   - Submit → Email + calendar invite sent automatically!

5. **Sync to Google Calendar:**
   - Go to `/recruiter/calendar` page
   - Click **"Connect Google Calendar"** (if not connected)
   - Click **"Sync to Google Calendar"**
   - All scheduled interviews pushed to your Google Calendar

### Features:
- ✅ One-time setup, stays connected forever
- ✅ Auto-refreshes tokens when expired
- ✅ Works with personal Gmail or Google Workspace
- ✅ Each recruiter connects their own calendar
- ✅ Disconnect anytime from settings page

### Connection Status:
Check at any time: `/recruiter/calendar-settings`

---

## Method 2: Service Account (Advanced) 🏢

**For companies** wanting backend-only calendar management without user interaction.

### Requirements:
- ✅ Google Workspace account (not personal Gmail)
- ✅ Workspace Admin access
- ✅ Domain-wide delegation enabled

### Setup Steps:

1. **Create Service Account:**
   - Follow: `backend/SERVICE_ACCOUNT_SETUP.md`
   - Download JSON key file
   - Enable Domain-wide delegation
   - Add OAuth scopes in Workspace Admin

2. **Configure Backend:**
   ```bash
   # Place JSON file
   backend/config/google-service-account.json
   
   # Update .env
   GOOGLE_CALENDAR_TYPE=service_account
   GOOGLE_SERVICE_ACCOUNT_PATH=./config/google-service-account.json
   GOOGLE_CALENDAR_ADMIN_EMAIL=admin@yourdomain.com
   ```

3. **Test Configuration:**
   ```bash
   cd backend
   node test_service_account.js
   ```

4. **Restart Backend:**
   ```bash
   npm run dev
   ```

### Features:
- ✅ No user interaction needed
- ✅ Backend handles all calendar operations
- ✅ Shared company calendar
- ✅ Never expires
- ❌ Requires Google Workspace (paid)
- ❌ Complex setup

---

## Method 3: Persistent OAuth (Already Active!) 🔒

**Good news:** OAuth tokens are **already stored permanently** in your database!

### How It Works:

When a recruiter connects their Google Calendar:
1. Tokens saved in MongoDB `User.googleCalendarTokens`
2. Tokens persist across browser sessions
3. Auto-refresh when expired (no re-authorization needed)
4. Works until manually disconnected

### Token Storage:
```javascript
// Stored in User model:
googleCalendarTokens: {
  access_token: String,
  refresh_token: String,
  scope: String,
  token_type: String,
  expiry_date: Number
}
```

### How to Disconnect:
1. Go to `/recruiter/calendar-settings`
2. Click **"Disconnect"**
3. Tokens removed from database
4. Can reconnect anytime

---

## 🚀 Quick Start (Recommended Path)

### For Testing/Development:
**Use OAuth (Method 1)**

1. ✅ Already configured in your project
2. ✅ Works with any Gmail account  
3. ✅ OAuth redirect URI already added: `http://localhost:5173/auth/google/callback`
4. ✅ Calendar API enabled in your Google Cloud project

**Just connect once and you're done!**

### For Production:
**Use OAuth for multiple recruiters OR Service Account for company calendar**

**OAuth for Production:**
1. Add production redirect URI in Google Cloud Console:
   ```
   https://yourdomain.com/auth/google/callback
   ```
2. Update `.env` with production URL
3. Each recruiter connects their own calendar

**Service Account for Production:**
1. Follow `SERVICE_ACCOUNT_SETUP.md`
2. Set `GOOGLE_CALENDAR_TYPE=service_account` in production `.env`
3. Backend manages single company calendar

---

## 📍 Important Pages

| Page | URL | Purpose |
|------|-----|---------|
| Calendar Settings | `/recruiter/calendar-settings` | Connect/disconnect, view status |
| Calendar View | `/recruiter/calendar` | See all interviews, sync button |
| Schedule Interview | `/recruiter/job-applicants/:jobId` | Schedule button on each applicant |

---

## 🎨 UI Features Implemented

All these features are **already working** in your frontend:

### Calendar Picker (Interview Scheduling):
- ✅ Beautiful date picker modal
- ✅ Time selection dropdown
- ✅ Meeting link input
- ✅ Notes field
- ✅ Animated with Framer Motion
- ✅ Auto-sends email + calendar invite

### Calendar Settings Page:
- ✅ Connection status card
- ✅ Connected email display
- ✅ One-click connect button
- ✅ Disconnect with confirmation modal
- ✅ Privacy & security information
- ✅ How it works guide

### Calendar Sync Component:
- ✅ Connection indicator badge
- ✅ Sync all interviews button
- ✅ Progress modal with animations
- ✅ Real-time status updates
- ✅ Error handling with toasts

---

## 🔧 Testing Your Setup

### Test OAuth Connection:
```bash
# 1. Start servers
cd backend && npm run dev
cd frontend && npm run dev

# 2. Open browser
http://localhost:5173

# 3. Login as recruiter

# 4. Go to Calendar Settings
http://localhost:5173/recruiter/calendar-settings

# 5. Click "Connect"
# Popup opens → Authorize → Done!

# 6. Status shows "Connected ✓"
```

### Test Interview Scheduling:
```bash
# 1. Go to any job's applicants
http://localhost:5173/recruiter/job-applicants/{jobId}

# 2. Click "Schedule" button

# 3. Pick date/time in calendar picker

# 4. Add meeting link (optional)

# 5. Submit

# 6. Check:
#    - Applicant receives email
#    - Your Google Calendar has event
#    - Dashboard calendar shows interview
```

### Test Service Account (Optional):
```bash
cd backend
node test_service_account.js

# Expected output:
# ✅ Service account file found
# ✅ Valid JSON structure
# ✅ Successfully initialized
# ✅ Calendar API accessible
```

---

## 🐛 Troubleshooting

### "OAuth client was not found"
**Fix:** Add redirect URI in Google Cloud Console
```
http://localhost:5173/auth/google/callback
```
Wait 2-5 minutes for Google to update.

### "Token is not valid"
**Fix:** Reconnect calendar from settings page.

### "Service account file not found"
**Fix:** Check path in `.env` matches actual file location:
```env
GOOGLE_SERVICE_ACCOUNT_PATH=./config/google-service-account.json
```

### Events not syncing
**Fix:** 
1. Check connection status at `/recruiter/calendar-settings`
2. If disconnected, click "Connect" again
3. Check backend console for error messages

---

## 📊 Comparison Summary

**Choose OAuth if:**
- ✅ Each recruiter has their own Gmail
- ✅ Want simple setup (5 minutes)
- ✅ Using personal Gmail accounts
- ✅ Don't have Google Workspace

**Choose Service Account if:**
- ✅ Have Google Workspace (paid)
- ✅ Want company-wide calendar
- ✅ Need backend-only automation
- ✅ Admin can do complex setup

**Persistent OAuth (Already Active):**
- ✅ Tokens saved in database automatically
- ✅ No extra setup needed
- ✅ Works until manually disconnected

---

## 🎉 You're All Set!

Your calendar integration is **fully functional** with all three methods available:

1. **OAuth**: Simple click-to-connect (recommended)
2. **Service Account**: Advanced company setup (optional)
3. **Persistent Tokens**: Already working behind the scenes

**Start using it now:**
1. Open http://localhost:5173
2. Login as recruiter
3. Go to Calendar Settings
4. Click "Connect Google Calendar"
5. Schedule your first interview!

---

## 📚 Additional Resources

- **OAuth Setup**: Already done ✅
- **Service Account Setup**: See `SERVICE_ACCOUNT_SETUP.md`
- **API Documentation**: Google Calendar API v3 docs
- **Frontend Components**: 
  - `GoogleCalendarSync.jsx` - Sync button
  - `CalendarSettings.jsx` - Settings page
  - `DateTimePicker.jsx` - Calendar picker
  - `GoogleCalendarCallback.jsx` - OAuth handler

**Need help?** All backend routes are in `backend/routes/calendarRoutes.js`
