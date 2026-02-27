# Backend Summary - Safe to Keep

## ✅ Backend Status
- **Server**: Running on http://localhost:5000 (Express v5.2.1)
- **Database**: MongoDB (local) - Connected via Mongoose v9.1.4
- **Users**: 5 users in database
- **Authentication**: JWT + Google OAuth (google-auth-library v10.5.0)
- **File Storage**: Tiered Strategy (Supabase -> Firebase -> Local Fallback)

## 📁 Important Backend Files

### Configuration
- `backend/.env` - Environment variables (KEEP THIS!)
- `backend/index.js` - Main server file (Express 5.x)
- `backend/package.json` - Dependencies

### Routes
- `backend/routes/authRoutes.js` - Authentication (signup, login, profile)
- `backend/routes/jobRoutes.js` - Job listings and applications
- `backend/routes/courseRoutes.js` - Learning courses
- `backend/routes/employerRoutes.js` - Employer/recruiter features
- `backend/routes/adminRoutes.js` - Admin panel

### Models (MongoDB Schemas)
- `backend/models/User.js` - User accounts
- `backend/models/Job.js` - Job postings
- `backend/models/Application.js` - Job applications
- `backend/models/Course.js` - Courses
- `backend/models/Employer.js` - Employer profiles

### Middleware
- `backend/middleware/auth.js` - JWT verification
- `backend/middleware/role.js` - Role-based access

### Utils
- `backend/utils/uploadService.js` - Advanced Tiered Upload handling
- `backend/utils/supabaseUpload.js` - Supabase integration logic
- `backend/utils/emailService.js` - Email notifications

### Config
- `backend/config/multerConfig.js` - Multer memory storage configuration
- `backend/config/firebase.js` - Firebase Admin SDK initialization
- `backend/config/supabase.js` - Supabase client configuration

## 🗄️ Database Collections

### Users Collection
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  phoneNumber: String,
  role: String (seeker/employer/admin),
  resumeUrl: String,
  photoUrl: String,
  location: String,
  preferredRole: String,
  aboutMe: String,
  experienceLevel: String,
  education: Object,
  googleId: String,
  authProvider: String,
  isEmailVerified: Boolean,
  isBlocked: Boolean
}
```

### Jobs Collection
```javascript
{
  title: String,
  company: String,
  location: String,
  salary: String,
  type: String,
  description: String,
  requirements: [String],
  responsibilities: [String],
  benefits: [String],
  postedBy: ObjectId (User),
  status: String,
  applicationsCount: Number
}
```

### Applications Collection
```javascript
{
  jobId: ObjectId (Job),
  userId: ObjectId (User),
  status: String (pending/interview/accepted/rejected),
  appliedAt: Date
}
```

### Courses Collection
```javascript
{
  title: String,
  description: String,
  instructor: String,
  duration: String,
  level: String,
  category: String,
  thumbnailUrl: String,
  contentUrl: String,
  syllabus: [String]
}
```


## 🔑 Test Credentials

```
Admin Account:
Email: admin@jobportal.com
Password: admin123
Role: admin
```

## 🌐 API Base URL
```
http://localhost:5000/api
```

## 📦 Key Dependencies (Actual)
```json
{
  "express": "^5.2.1",
  "mongoose": "^9.1.4",
  "bcryptjs": "^3.0.3",
  "jsonwebtoken": "^9.0.3",
  "cors": "^2.8.5",
  "dotenv": "^17.2.3",
  "multer": "^2.0.2",
  "cloudinary": "^1.41.3",
  "@supabase/supabase-js": "^2.94.1",
  "google-auth-library": "^10.5.0",
  "nodemailer": "^7.0.12"
}
```

## 🚀 How to Start Backend
```bash
cd backend
npm install
node index.js
```

## 📝 Environment Variables (.env)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/jobportal
JWT_SECRET=supersecret_milestone_token_2026
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

## ✅ What's Working
- ✅ User registration and login
- ✅ JWT authentication
- ✅ Google OAuth
- ✅ Profile management
- ✅ Resume upload (local storage)
- ✅ Photo upload (local storage)
- ✅ Job listings
- ✅ Job applications
- ✅ Course management
- ✅ Employer dashboard
- ✅ Admin panel
- ✅ Role-based access control

## 📂 File Upload Structure
```
backend/
  uploads/
    resumes/
      - 1769959082462-test_resume.pdf
      - 1769969851850-Akshay_Vaishnav_s_CV.pdf
      - (more files...)
    photos/
      - (user profile photos)
    videos/
      - (course videos)
```

## 🔒 Security Features
- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation
- CORS enabled
- File upload restrictions

## 🎯 Next Steps for New Frontend
1. Create new React/Vue/Angular project
2. Install axios for API calls
3. Use API_DOCUMENTATION.md for endpoints
4. Connect to http://localhost:5000/api
5. Store JWT token in localStorage
6. Add Authorization header to requests

## ⚠️ DO NOT DELETE
- backend/ folder (entire backend)
- backend/.env (environment variables)
- backend/uploads/ (uploaded files)
- MongoDB database (jobportal)

## 🔄 Backend is Independent
The backend works independently and can connect to:
- React
- Vue
- Angular
- Next.js
- Mobile apps (React Native, Flutter)
- Any frontend framework!

---

**Backend is ready and waiting for your new frontend! 🚀**
