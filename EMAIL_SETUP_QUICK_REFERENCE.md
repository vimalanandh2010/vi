# 📧 Email Setup - Quick Reference Card

## 🎯 What You Need to Know

After hosting your app, emails WON'T work automatically. You need to configure an email service.

---

## ⚡ FASTEST SETUP (5 Minutes)

### ✅ Resend (Recommended)

**Why?** No SMTP blocking, fast API, 3,000 free emails/month

1. **Get API Key:**
   - Visit: https://resend.com
   - Sign up free
   - Dashboard → API Keys → Create
   - Copy key (starts with `re_`)

2. **Add to Your Host:**
   
   **Render.com:**
   ```
   Dashboard → Your Service → Environment → Add Variable
   
   EMAIL_SERVICE = resend
   RESEND_API_KEY = re_paste_your_key_here
   EMAIL_USER = onboarding@resend.dev
   ```

   **Railway.app:**
   ```
   Project → Variables → New Variable
   
   EMAIL_SERVICE = resend
   RESEND_API_KEY = re_paste_your_key_here
   EMAIL_USER = onboarding@resend.dev
   ```

   **Vercel:**
   ```
   Settings → Environment Variables
   
   EMAIL_SERVICE = resend
   RESEND_API_KEY = re_paste_your_key_here
   EMAIL_USER = onboarding@resend.dev
   ```

3. **Test:**
   - Deploy your app
   - Try registering a new account
   - Check welcome email arrives

✅ **DONE!**

---

## 🔄 Alternative: Brevo (SendinBlue)

**Why?** Free 300 emails/day, reliable SMTP

1. **Get SMTP Key:**
   - Visit: https://app.brevo.com
   - Sign up free
   - Settings → SMTP & API → SMTP
   - Generate new SMTP key

2. **Add to Your Host:**
   ```
   EMAIL_SERVICE = brevo
   EMAIL_USER = your-email@example.com
   EMAIL_PASS = paste_brevo_smtp_key_here
   ```

---

## ❌ DON'T Use Gmail (For Production)

Gmail limits: 100 emails/day only. Your app sends more!

---

## 🧪 Test Your Setup

### Method 1: Backend Script
```bash
# SSH into your server or use Render Shell
cd backend
node scripts/verify_production_email.js
```

### Method 2: Live Test
1. Go to your hosted website
2. Click "Sign Up"
3. Register with your real email
4. Check inbox for welcome email
5. ✅ If received = Working!

---

## 🔍 Check Logs If Not Working

**Render:**
- Dashboard → Your Service → Logs
- Look for: "✅ SMTP Service is ready" or "❌ Email Error"

**Railway:**
- Project → View Logs
- Search for "email" or "SMTP"

**Common Error Messages:**
- `EMAIL_USER or EMAIL_PASS is NOT SET` → Add environment variables
- `Authentication failed` → Wrong API key or password
- `Connection timeout` → SMTP blocked (use Resend API instead)

---

## 📊 Service Comparison

| Service | Free Limit | Setup Time | Reliability |
|---------|-----------|------------|-------------|
| **Resend** ✅ | 3,000/month | 5 min | Excellent |
| **Brevo** | 300/day | 7 min | Good |
| **Gmail** ❌ | 100/day | 10 min | Limited |

---

## 🎯 Production Checklist

After adding email credentials:

- [ ] Environment variables added to hosting platform
- [ ] App redeployed (automatic on Render/Railway)
- [ ] Test email sent successfully
- [ ] Check spam folder if not in inbox
- [ ] Monitor logs for email errors

---

## 🆘 Still Not Working?

1. **Verify credentials are correct:**
   ```bash
   # In Render Shell or locally:
   echo $EMAIL_SERVICE
   echo $RESEND_API_KEY
   echo $EMAIL_USER
   ```

2. **Check if variables are set:**
   - Hosting dashboard → Environment Variables
   - Make sure no typos in variable names

3. **Redeploy:**
   - Some platforms need manual redeploy after adding variables
   - Render: Auto-redeploys
   - Railway: Auto-redeploys
   - Vercel: Redeploy from Git

4. **Test API directly:**
   ```bash
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"from":"onboarding@resend.dev","to":"your-email@example.com","subject":"Test","html":"It works!"}'
   ```

---

## 🔗 Full Documentation

For detailed setup, troubleshooting, and advanced configurations:

📖 **[EMAIL_HOSTING_SETUP_GUIDE.md](./EMAIL_HOSTING_SETUP_GUIDE.md)**

---

## 💡 Pro Tips

1. **Use Resend** - It just works™
2. **Don't use Gmail** in production
3. **Check spam folder** when testing
4. **Verify domain** (optional) for better email deliverability
5. **Monitor email logs** in production

---

**Need help?** Check your hosting platform logs first - they show exact error messages!
