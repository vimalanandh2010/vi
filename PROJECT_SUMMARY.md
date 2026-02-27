# 🚀 Future Milestone Job Portal - Project Summary

## 📋 Project Overview

**Future Milestone** is a full-stack job portal application that connects job seekers with employers. The platform supports multiple user roles (job seekers, employers, and admins) with features for job posting, application management, and profile customization.

---

## 🏗️ Architecture

### **Tech Stack**

#### **Frontend**
- **Framework**: React 19.2.0
- **Routing**: React Router DOM 7.12.0
- **Styling**: Tailwind CSS 4.1.18
- **Build Tool**: Vite (Rolldown)
- **Authentication**: Google OAuth (@react-oauth/google)
- **HTTP Client**: Axios 1.13.2
- **Icons**: Lucide React

#### **Backend**
- **Runtime**: Node.js
- **Framework**: Express 5.2.1
- **Database**: MongoDB (Mongoose 9.1.4)
- **Authentication**: JWT + Google OAuth
- **File Upload**: Multer 2.0.2 (Local Storage)
- **Email**: Nodemailer 7.0.12
- **Validation**: Express Validator 7.3.1

---

## 📁 Project Structure

```
job-portal/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── EmployerDashboard.jsx
│   │   │   ├── JobList.jsx
│   │   │   ├── JobDetails.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── ProfileSetup.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ... (more components)
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── displayLabels.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── .env
│   └── package.json
│
├── backend/
│   ├── config/
│   │   ├── cloudinary.js
│   │   └── multerConfig.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── role.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Job.js
│   │   ├── Application.js
│   │   └── Employer.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── employerRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/
│   │   ├── uploadService.js
│   │   └── emailService.js
│   ├── uploads/
│   │   ├── resumes/
│   │   ├── photos/
│   │   └── videos/
│   ├── scripts/
│   ├── index.js
│   ├── .env
│   └── package.json
```

---

## 👥 User Roles & Features

### **1. Job Seekers**
- ✅ Sign up with email/password or Google OAuth
- ✅ Complete profile setup (education, skills, experience)
- ✅ Upload resume (PDF, DOC, DOCX)
- ✅ Upload profile photo
- ✅ Browse and search jobs
- ✅ Apply to jobs
- ✅ Track application status
- ✅ View application history

### **2. Employers**
- ✅ Sign up with email/password or Google OAuth
- ✅ Post job listings
- ✅ Manage job postings
- ✅ View applicants for each job
- ✅ Review applicant profiles and resumes
- ✅ Update job status (open/closed)
- ✅ Employer dashboard

### **3. Admins**
- ✅ View all users
- ✅ Block/unblock users
- ✅ Manage all job postings
- ✅ View system statistics
- ✅ Admin dashboard

---

## 🔐 Authentication System

### **Local Authentication**
- Email/password registration
- Password hashing with bcryptjs
- JWT token-based authentication
- Protected routes with middleware

### **Google OAuth**
- One-click Google sign-in for Job Seekers and Employers
- Automatic profile creation
- Email verification via Google
- Seamless integration with local auth

### **Security Features**
- JWT secret key protection
- Password encryption
- Role-based access control (RBAC)
- Protected API endpoints
- Input validation

---

## 📊 Database Schema

### **User Model**
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  googleId: String,
  authProvider: 'local' | 'google',
  role: 'seeker' | 'employer' | 'admin',
  isBlocked: Boolean,
  resumeUrl: String,
  photoUrl: String,
  videoUrl: String,
  location: String,
  preferredRole: String,
  primarySkill: String,
  aboutMe: String,
  education: {
    tenth: { schoolName, score },
    twelfth: { schoolOrCollegeName, score },
    degree: { degreeName, collegeName, yearOfPassing, score }
  },
  experienceLevel: 'fresher' | 'experienced',
  phoneNumber: String,
  agreeToContact: Boolean,
  isEmailVerified: Boolean,
  timestamps: true
}
```

### **Job Model**
```javascript
{
  title: String,
  company: String,
  location: String,
  type: 'Full Time' | 'Part Time' | 'Remote' | 'Hybrid' | 'Contract' | 'Internship',
  salary: String,
  description: String,
  minSalary: Number,
  maxSalary: Number,
  experienceLevel: 'Fresher' | '1-3 Years' | '3-5 Years' | '5+ Years',
  tags: [String],
  postedBy: ObjectId (ref: User),
  timestamps: true
}
```

### **Application Model**
```javascript
{
  job: ObjectId (ref: Job),
  applicant: ObjectId (ref: User),
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected',
  coverLetter: String,
  appliedAt: Date,
  timestamps: true
}
```

---

## 📤 File Upload System

### **Current Implementation: Local Storage**
- **Storage Location**: `backend/uploads/`
- **Folder Structure**:
  - `resumes/` - Resume files (PDF, DOC, DOCX)
  - `photos/` - Profile photos (JPG, PNG, WEBP)
  - `videos/` - Intro videos (MP4, MOV, AVI, WEBM)

### **File Naming Convention**
- Format: `{timestamp}-{sanitized_filename}.{extension}`
- Example: `1770214810880-john_doe_resume.pdf`

### **File Size Limits**
- Resume: 5MB
- Photo: 5MB
- Video: 5MB

### **Features**
- ✅ Automatic folder creation
- ✅ File name sanitization
- ✅ File type validation
- ✅ File deletion support
- ✅ File listing functionality
- ✅ Served via Express static middleware

---

## 🌐 API Endpoints

### **Authentication Routes** (`/api/auth`)
```
POST   /signup          - Register new user
POST   /login           - Login user
POST   /google          - Google OAuth login
GET    /profile         - Get user profile (protected)
PUT    /profile         - Update user profile (protected)
POST   /resume          - Upload resume (protected)
POST   /photo           - Upload photo (protected)
POST   /video           - Upload video (protected)
```

### **Job Routes** (`/api/jobs`)
```
GET    /                - Get all jobs
GET    /:id             - Get job by ID
POST   /                - Create job (employer only)
PUT    /:id             - Update job (employer only)
DELETE /:id             - Delete job (employer only)
POST   /:id/apply       - Apply to job (seeker only)
```

### **Employer Routes** (`/api/employer`)
```
GET    /jobs            - Get employer's jobs
GET    /jobs/:id/applicants - Get job applicants
PUT    /applications/:id - Update application status
```

### **Admin Routes** (`/api/admin`)
```
GET    /users           - Get all users
PUT    /users/:id/block - Block/unblock user
GET    /stats           - Get system statistics
```

---

## 🎨 Frontend Features

### **Pages & Components**
1. **Home Page**
   - Hero section with search
   - Job categories
   - Featured jobs
   - Demo video
   - Companies section

2. **Authentication**
   - Login page (email + Google)
   - Signup page (email + Google)
   - Role selection modal

3. **Job Seeker Dashboard**
   - Profile overview
   - Applied jobs
   - Job recommendations
   - Application tracking

4. **Employer Dashboard**
   - Posted jobs
   - Applicant management
   - Job posting form
   - Analytics

5. **Admin Panel**
   - User management
   - Job moderation
   - System statistics

6. **Profile Pages**
   - Profile setup wizard
   - Profile editing
   - Resume upload
   - Photo upload

### **UI/UX Features**
- ✅ Dark/Light mode toggle
- ✅ Responsive design (mobile-first)
- ✅ Loading states
- ✅ Error handling
- ✅ Form validation
- ✅ Toast notifications
- ✅ Modal dialogs
- ✅ Protected routes

---

## 🔧 Configuration

### **Backend Environment Variables** (`.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jobportal
JWT_SECRET=supersecret_milestone_token_2026
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

### **Frontend Environment Variables** (`.env`)
```env
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
```

---

## 🚀 Running the Project

### **Backend**
```bash
cd backend
npm install
npm run dev    # Development mode with nodemon
npm start      # Production mode
```

### **Frontend**
```bash
cd frontend
npm install
npm run dev    # Development server
npm run build  # Production build
```

### **Access Points**
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017/jobportal

---

## 📈 Current Status

### **✅ Completed Features**
1. User authentication (local + Google OAuth)
2. Multi-role system (seeker, employer, admin)
3. Job posting and management
4. Job application system
5. Profile management
6. File upload system (local storage)
7. Responsive UI with dark mode
8. Protected routes and middleware
9. Email service integration
10. Admin panel

### **📊 Database Statistics**
- **Total Users**: 9
- **Uploaded Resumes**: 5 files
- **Storage**: Local file system
- **Database**: MongoDB (local)

### **🔄 Recent Changes**
- ✅ Removed Supabase dependency
- ✅ Implemented local file storage
- ✅ Cleaned up unused dependencies
- ✅ Fixed upload system
- ✅ Updated environment configuration

---

## 🛠️ Available Scripts

### **Backend Scripts**
```bash
npm start              # Start server
npm run dev            # Start with nodemon
node test-upload.js    # Test upload system
node check-connections.js  # Check all connections
```

### **Frontend Scripts**
```bash
npm run dev            # Start dev server
npm run build          # Build for production
npm run preview        # Preview production build
npm run lint           # Run ESLint
```

---

## 📦 Dependencies

### **Backend Key Dependencies**
- express: Web framework
- mongoose: MongoDB ODM
- bcryptjs: Password hashing
- jsonwebtoken: JWT authentication
- google-auth-library: Google OAuth
- multer: File upload handling
- nodemailer: Email service
- express-validator: Input validation
- cors: Cross-origin resource sharing

### **Frontend Key Dependencies**
- react: UI library
- react-router-dom: Routing
- axios: HTTP client
- @react-oauth/google: Google OAuth
- lucide-react: Icons
- tailwindcss: Styling

---

## 🎯 Future Enhancements (Potential)

1. **Advanced Search & Filters**
   - Location-based search
   - Salary range filters
   - Experience level filters

2. **Messaging System**
   - Direct messaging between employers and seekers
   - Application status notifications

3. **Analytics Dashboard**
   - Job view statistics
   - Application conversion rates
   - User engagement metrics

4. **Payment Integration**
   - Premium job postings
   - Featured listings
   - Subscription plans

5. **Cloud Storage**
   - AWS S3 or Cloudinary integration
   - Better file management
   - CDN for faster delivery

6. **Email Notifications**
   - Application status updates
   - New job alerts
   - Weekly job digests

7. **Resume Parser**
   - Automatic skill extraction
   - Experience parsing
   - Education detection

8. **Video Interviews**
   - Integrated video calling
   - Interview scheduling
   - Recording capabilities

---

## 🔒 Security Considerations

- ✅ Password hashing with bcryptjs
- ✅ JWT token authentication
- ✅ Environment variable protection
- ✅ Input validation and sanitization
- ✅ Role-based access control
- ✅ File type validation
- ✅ File size limits
- ⚠️ Consider adding rate limiting
- ⚠️ Consider adding CSRF protection
- ⚠️ Consider adding helmet.js for security headers

---

## 📝 Notes

1. **Supabase Removed**: The project originally used Supabase for file storage but has been migrated to local storage for simplicity and to avoid network issues.

2. **Google OAuth**: Fully configured and working with both frontend and backend integration.

3. **File Storage**: Currently using local file system. Files are stored in `backend/uploads/` and served via Express static middleware.

4. **Database**: MongoDB running locally on port 27017 with 9 registered users.

5. **Upload System**: Working perfectly with automatic folder creation, file validation, and proper naming conventions.

---

## 🎉 Project Highlights

- ✅ **Full-stack MERN application**
- ✅ **Multi-role authentication system**
- ✅ **Google OAuth integration**
- ✅ **File upload functionality**
- ✅ **Responsive modern UI**
- ✅ **Dark/Light mode**
- ✅ **RESTful API design**
- ✅ **Role-based access control**
- ✅ **Production-ready code structure**

---

**Last Updated**: February 22, 2026
**Status**: ✅ Fully Functional (with Modern Google Auth)
**Environment**: Development