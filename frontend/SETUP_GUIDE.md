# Frontend Setup Guide

## ✅ Setup Complete!

Your frontend is fully configured and ready to use.

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── LandingPage.jsx          # Home page with hero, jobs, categories
│   │   ├── Login.jsx                # Login page with role selection
│   │   ├── Signup.jsx               # Signup page with role selection
│   │   ├── jobseeker/
│   │   │   ├── Dashboard.jsx        # Job Seeker dashboard
│   │   │   ├── components/          # Reusable components for job seekers
│   │   │   └── pages/               # Individual pages (Profile, Jobs, Courses)
│   │   └── recruiter/
│   │       ├── Dashboard.jsx        # Recruiter dashboard
│   │       ├── components/          # Reusable components for recruiters
│   │       └── pages/               # Individual pages (Post Job, Applications)
│   ├── utils/
│   │   └── api.js                   # Axios instance for backend API calls
│   ├── App.jsx                      # Main app with routing
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Global styles with Tailwind
├── package.json                     # Dependencies
├── vite.config.js                   # Vite configuration
├── tailwind.config.js               # Tailwind CSS configuration
└── postcss.config.js                # PostCSS configuration
```

---

## 🚀 How to Run

### 1. Install Dependencies (First Time Only)

```bash
cd frontend
npm install --legacy-peer-deps
```

### 2. Start Development Server

```bash
npm run dev
```

The app will run on: **http://localhost:5173**

---

## 🔗 Available Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Landing Page | Public |
| `/login` | Login Page | Public |
| `/signup` | Signup Page | Public |
| `/jobseeker/dashboard` | Job Seeker Dashboard | Protected (Job Seeker) |
| `/recruiter/dashboard` | Recruiter Dashboard | Protected (Recruiter) |

---

## 🎨 Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful icon library

---

## 🔌 Backend Connection

The frontend is configured to connect to your backend at:

**Backend URL:** `http://localhost:5000/api`

API configuration is in: `src/utils/api.js`

---

## 🎯 Features Implemented

### ✅ Landing Page
- Hero section with job search
- Statistics display (10K+ jobs, 5K+ companies)
- Browse by category (6 categories)
- Featured jobs section (6 job cards)
- How it works section
- Footer with links

### ✅ Authentication
- **Login Page**
  - Role selection (Job Seeker / Recruiter)
  - Email & password login
  - Google OAuth button (ready for integration)
  - Remember me checkbox
  - Forgot password link
  
- **Signup Page**
  - Role selection (Job Seeker / Recruiter)
  - Full name, email, phone, password fields
  - Password confirmation
  - Terms & conditions checkbox
  - Google OAuth button (ready for integration)

### ✅ Job Seeker Dashboard
- Welcome message with user name
- Quick stats cards (Applications, Saved Jobs, Courses, Profile Views)
- Profile building section
- Browse jobs section
- Courses section
- Logout functionality

### ✅ Recruiter Dashboard
- Welcome message with user name
- Quick stats cards (Active Jobs, Applications, Candidates, Hired)
- Post a job section
- View applications section
- Browse candidates section
- Logout functionality

---

## 🔐 Authentication Flow

1. User selects role (Job Seeker or Recruiter)
2. User enters credentials
3. Frontend sends request to backend: `POST /api/auth/login` or `POST /api/auth/register`
4. Backend returns JWT token and user data
5. Frontend stores in localStorage:
   - `token` - JWT authentication token
   - `user` - User object (name, email, etc.)
   - `role` - User role (jobseeker or recruiter)
6. User is redirected to appropriate dashboard

---

## 📝 Next Steps

### For Job Seeker Side:
Create pages in `src/pages/jobseeker/pages/`:
- `Profile.jsx` - Build and edit profile
- `BrowseJobs.jsx` - Search and browse jobs
- `Applications.jsx` - View application status
- `Courses.jsx` - Browse and enroll in courses
- `SavedJobs.jsx` - View saved/bookmarked jobs

### For Recruiter Side:
Create pages in `src/pages/recruiter/pages/`:
- `PostJob.jsx` - Create new job posting
- `Applications.jsx` - Review candidate applications
- `Candidates.jsx` - Browse and search candidates
- `MyJobs.jsx` - Manage posted jobs
- `Analytics.jsx` - View hiring analytics

### Reusable Components:
Create in respective `components/` folders:
- Job cards
- Application cards
- Profile cards
- Forms
- Modals
- Navigation menus

---

## 🛠️ Development Commands

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

---

## 🎨 Color Scheme

- **Primary (Blue):** `#2563eb` - Job Seeker theme
- **Secondary (Purple):** `#9333ea` - Recruiter theme
- **Success (Green):** `#16a34a`
- **Warning (Orange):** `#ea580c`
- **Background:** White with gradient accents
- **Text:** Gray scale (900, 700, 600, 400)

---

## 📦 Dependencies Installed

### Production Dependencies:
- `react` ^19.2.0
- `react-dom` ^19.2.0
- `react-router-dom` ^7.1.3
- `axios` ^1.7.9
- `lucide-react` ^0.468.0

### Development Dependencies:
- `vite` (rolldown-vite) ^7.2.5
- `@vitejs/plugin-react` ^5.1.1
- `tailwindcss` ^3.4.1
- `postcss` ^8.4.35
- `autoprefixer` ^10.4.17
- `eslint` ^9.39.1

---

## ✨ All Setup Complete!

Your frontend is ready to use. Just run:

```bash
cd frontend
npm run dev
```

Then open **http://localhost:5173** in your browser!

Make sure your backend is running on **http://localhost:5000**

---

## 🐛 Troubleshooting

### Issue: Dependencies not installing
**Solution:** Use `npm install --legacy-peer-deps`

### Issue: Port 5173 already in use
**Solution:** Kill the process or change port in `vite.config.js`

### Issue: Backend connection failed
**Solution:** Make sure backend is running on http://localhost:5000

### Issue: Tailwind styles not working
**Solution:** Make sure `index.css` has Tailwind directives and is imported in `main.jsx`

---

**Happy Coding! 🚀**
