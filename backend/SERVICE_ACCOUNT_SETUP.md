# Google Calendar - Service Account Setup Guide

## What is a Service Account?
A Service Account allows your backend to access Google Calendar **without user interaction** (no OAuth popup).

**Use Cases:**
- Company-wide calendar management
- Automated interview scheduling
- Backend-only calendar operations

**Requirements:**
- Google Workspace account (not personal Gmail)
- Admin access to Google Workspace

---

## Step 1: Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **future-milestone**
3. Go to **IAM & Admin** → **Service Accounts**
4. Click **+ CREATE SERVICE ACCOUNT**
5. Fill in:
   - **Name:** Job Portal Calendar Service
   - **Description:** Service account for automated calendar management
6. Click **CREATE AND CONTINUE**
7. Grant role: **Owner** (or Editor)
8. Click **DONE**

---

## Step 2: Create Service Account Key

1. Click on the newly created service account
2. Go to **Keys** tab
3. Click **ADD KEY** → **Create new key**
4. Select **JSON** format
5. Click **CREATE**
6. **JSON file downloads automatically** - keep it secure!

---

## Step 3: Enable Domain-Wide Delegation (Google Workspace Only)

1. In the Service Account details, check **Enable Google Workspace Domain-wide Delegation**
2. Click **SAVE**
3. Note the **Client ID** shown

### Configure in Google Workspace Admin:

1. Go to [Google Admin Console](https://admin.google.com/)
2. Navigate to **Security** → **API Controls** → **Domain-wide Delegation**
3. Click **Add new**
4. Enter **Client ID** from service account
5. Add **OAuth Scopes:**
   ```
   https://www.googleapis.com/auth/calendar
   https://www.googleapis.com/auth/calendar.events
   ```
6. Click **AUTHORIZE**

---

## Step 4: Add to Your Project

1. **Rename the downloaded JSON file** to:
   ```
   google-service-account.json
   ```

2. **Place it in:**
   ```
   backend/config/google-service-account.json
   ```

3. **Add to `.env` file:**
   ```env
   # Service Account Configuration
   GOOGLE_SERVICE_ACCOUNT_PATH=./config/google-service-account.json
   GOOGLE_CALENDAR_TYPE=service_account
   # Email to impersonate (your company calendar email)
   GOOGLE_CALENDAR_ADMIN_EMAIL=admin@yourdomain.com
   ```

4. **Add to `.gitignore`:**
   ```
   backend/config/google-service-account.json
   ```

---

## Step 5: Test Connection

Run the test script:
```bash
cd backend
node test_service_account.js
```

---

## Comparison: OAuth vs Service Account

| Feature | OAuth (Current) | Service Account |
|---------|----------------|-----------------|
| **Setup Complexity** | Easy | Complex |
| **User Interaction** | Required once | None |
| **Personal Gmail** | ✅ Yes | ❌ No |
| **Google Workspace** | ✅ Yes | ✅ Yes |
| **Auto-refresh** | ✅ Yes | ✅ Yes |
| **Shared Calendar** | Limited | Full access |
| **Best For** | Individual users | Company/Backend |

---

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `google-service-account.json` to Git
- Store it securely (encrypted storage recommended)
- Service accounts have full access - protect the key file
- Rotate keys periodically for security

---

## Troubleshooting

**Error: "Requested entity was not found"**
- Ensure Domain-wide Delegation is enabled
- Check service account email has calendar access

**Error: "Not authorized to access this resource"**
- Add proper OAuth scopes in Workspace Admin
- Wait 10-15 minutes for propagation

**Error: "File not found"**
- Check path in .env matches actual file location
- Use relative path from backend folder
