# 📧 Email Setup Guide for Production Hosting

## Current Configuration
Your application currently uses **Resend API** for sending emails. This guide explains how to configure emails when hosting on platforms like Render, Vercel, Railway, etc.

---

## 🎯 Quick Answer: What You Need

After hosting, you need to set these **Environment Variables** on your hosting platform:

```env
EMAIL_SERVICE=resend
EMAIL_USER=onboarding@resend.dev
RESEND_API_KEY=your_resend_api_key_here
```

---

## 📋 Step-by-Step Setup

### **Option 1: Resend (Recommended - Currently Using)**

✅ **Pros:** Fast, reliable, free tier (3,000 emails/month), API-based, no SMTP issues

#### Steps:

1. **Get Your Resend API Key:**
   - Go to [resend.com](https://resend.com)
   - Sign up or log in
   - Click "API Keys" in the dashboard
   - Create a new API key
   - Copy the key (starts with `re_`)

2. **Add to Hosting Platform:**
   
   **For Render.com:**
   - Go to your Web Service → "Environment"
   - Add these variables:
     ```
     EMAIL_SERVICE = resend
     RESEND_API_KEY = re_your_key_here
     EMAIL_USER = onboarding@resend.dev
     ```

   **For Railway.app:**
   - Go to your project → "Variables"
   - Add the same three variables

   **For Vercel:**
   - Go to Project Settings → "Environment Variables"
   - Add the same three variables

3. **Verify Domain (Optional for Production):**
   - In Resend dashboard, add your custom domain
   - Add DNS records (SPF, DKIM)
   - Use `noreply@yourdomain.com` instead of `onboarding@resend.dev`

---

### **Option 2: Brevo (formerly Sendinblue)**

✅ **Pros:** Free tier (300 emails/day), simple SMTP, reliable

#### Steps:

1. **Get Brevo SMTP Credentials:**
   - Go to [brevo.com](https://www.brevo.com)
   - Sign up free
   - Go to "SMTP & API" → "SMTP"
   - Get your SMTP key

2. **Add to Hosting Platform:**
   ```env
   EMAIL_SERVICE=brevo
   EMAIL_USER=your-email@example.com
   EMAIL_PASS=your-brevo-smtp-key
   ```

3. **Test Connection:**
   - Your app will automatically use Brevo SMTP
   - Check logs to verify email sending

---

### **Option 3: Gmail SMTP**

⚠️ **Note:** Gmail has limits (100 emails/day for free accounts). Not recommended for production.

#### Steps:

1. **Enable 2-Step Verification:**
   - Go to Google Account → Security
   - Enable 2-Step Verification

2. **Create App Password:**
   - Go to Security → App passwords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Add to Hosting Platform:**
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-16-char-app-password
   ```

---

## 🔧 Complete Environment Variables for Production

Here's what you need to set on your hosting platform:

```env
# Database
MONGODB_URI=your_mongodb_atlas_connection_string

# JWT
JWT_SECRET=your_secure_random_string_here

# Email Configuration (Choose ONE option below)
EMAIL_SERVICE=resend
RESEND_API_KEY=re_your_api_key
EMAIL_USER=onboarding@resend.dev

# OR for Brevo:
# EMAIL_SERVICE=brevo
# EMAIL_USER=your-email@example.com
# EMAIL_PASS=your-brevo-smtp-key

# Frontend URL (Update with your actual domain)
FRONTEND_URL=https://your-frontend-domain.com
BACKEND_URL=https://your-backend-domain.com

# Other Services
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
GOOGLE_CLIENT_ID=your_google_oauth_id
GOOGLE_CLIENT_SECRET=your_google_oauth_secret
GEMINI_API_KEY=your_gemini_key
```

---

## 📱 Platform-Specific Instructions

### **Render.com**

1. Dashboard → Select your web service
2. Click "Environment" tab
3. Click "Add Environment Variable"
4. Add each variable one by one
5. Click "Save Changes"
6. Service will auto-redeploy

### **Railway.app**

1. Select your project
2. Click "Variables" tab
3. Click "New Variable"
4. Add all variables
5. Redeploy (automatic)

### **Vercel (for serverless)**

1. Project Settings → "Environment Variables"
2. Add variables for Production, Preview, Development
3. Redeploy from Git

### **Heroku**

1. Dashboard → Your app → Settings
2. Click "Reveal Config Vars"
3. Add each variable (KEY = VALUE)
4. Save (auto-redeploys)

---

## 🧪 Testing Email After Deployment

### Method 1: Use Your Test Script

```bash
# SSH into your server or use Render Shell
node backend/scripts/testEmailConnection.js
```

### Method 2: Test from Frontend

1. Go to your hosted site
2. Try to register a new account
3. Check if welcome email arrives
4. Try "Forgot Password" to test OTP emails

### Method 3: Check Application Logs

**Render:**
- Go to your service → "Logs" tab
- Look for: `✅ SMTP Service is ready` or `✅ [Resend API] Success`

**Railway:**
- Click "View Logs" → Check for email success messages

**Vercel:**
- Go to Deployments → Click latest → View Function Logs

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Email not sending, no errors"

**Solution:**
```env
# Make sure EMAIL_SERVICE matches your provider
EMAIL_SERVICE=resend  # Must be lowercase

# For Resend, API key must start with 're_'
RESEND_API_KEY=re_abc123...

# EMAIL_USER should be valid
EMAIL_USER=onboarding@resend.dev
```

### Issue 2: "Authentication failed" (SMTP)

**Solution:**
- For Gmail: Use App Password, not regular password
- For Brevo: Use SMTP key from dashboard, not account password
- Check EMAIL_USER and EMAIL_PASS are correct

### Issue 3: "Connection timeout"

**Solution:**
- Some platforms block outgoing SMTP (port 587/465)
- **Use Resend API instead** (HTTP-based, no SMTP blocking)

### Issue 4: "Emails go to spam"

**Solution:**
- Verify your domain in Resend/Brevo
- Add SPF and DKIM records to your DNS
- Use a custom domain email (not gmail.com)

---

## 🎯 Recommended Production Setup

**Best Practice:**

```env
# Use Resend with Custom Domain
EMAIL_SERVICE=resend
RESEND_API_KEY=re_your_production_key
EMAIL_USER=noreply@yourdomain.com

# Verify domain in Resend dashboard
# Add these DNS records:
# - SPF: resend.com
# - DKIM: (provided by Resend)
```

**Why?**
- ✅ No SMTP port blocking issues
- ✅ Fast API-based delivery
- ✅ Better deliverability with verified domain
- ✅ Free tier: 3,000 emails/month
- ✅ No connection timeouts

---

## 📊 Email Service Comparison

| Service | Free Tier | Type | Deliverability | Ease of Setup |
|---------|-----------|------|----------------|---------------|
| **Resend** ✅ | 3,000/month | API | Excellent | Very Easy |
| **Brevo** | 300/day | SMTP | Good | Easy |
| **Gmail** | 100/day | SMTP | Good | Medium |
| **SendGrid** | 100/day | API | Excellent | Easy |
| **Mailgun** | 5,000/month | API | Excellent | Medium |

---

## 🔍 How to Check Current Configuration

Run this in your backend terminal:

```bash
node -e "console.log('Service:', process.env.EMAIL_SERVICE); console.log('User:', process.env.EMAIL_USER);"
```

---

## 📝 Files That Send Emails in Your App

Your application sends emails in these scenarios:

1. **Welcome Email** - After registration
2. **OTP Email** - Login verification
3. **Application Confirmation** - Job application submitted
4. **Status Update** - Application status changes
5. **Interview Scheduled** - Interview invitation
6. **Interview Reminder** - 24 hours before interview
7. **Password Reset** - Forgot password

All handled by: `backend/utils/emailService.js`

---

## ✅ Final Checklist

Before going live:

- [ ] Email service credentials added to hosting platform
- [ ] Test email sending from production
- [ ] Check spam folder if emails don't arrive
- [ ] Verify domain for better deliverability (optional but recommended)
- [ ] Monitor email logs for errors
- [ ] Set up email failure alerts

---

## 🆘 Quick Support

If emails still don't work after setup:

1. Check hosting platform logs
2. Verify environment variables are set correctly
3. Test with this command:
   ```bash
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"from":"onboarding@resend.dev","to":"your-email@example.com","subject":"Test","html":"Test"}'
   ```

---

## 📚 Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Brevo SMTP Setup](https://help.brevo.com/hc/en-us/articles/209467485)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)

---

**Need Help?** Check your hosting platform's logs first - they usually show the exact error message.
