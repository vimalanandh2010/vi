# 🌱 Job Seeding Instructions

## Overview
This seed script populates your database with 25+ diverse job listings across multiple categories.

---

## 📋 Job Categories Included

1. **IT & Technology** (4 jobs)
   - Senior Full Stack Developer
   - DevOps Engineer
   - UI/UX Designer
   - Data Scientist

2. **Healthcare** (3 jobs)
   - Registered Nurse - ICU
   - Medical Laboratory Technician
   - Physical Therapist

3. **Education** (2 jobs)
   - High School Math Teacher
   - Elementary School Teacher

4. **Marketing** (1 job)
   - Digital Marketing Manager

5. **Sales** (1 job)
   - Sales Representative

6. **Finance** (2 jobs)
   - Financial Analyst
   - Accountant

7. **Engineering** (2 jobs)
   - Mechanical Engineer
   - Civil Engineer

8. **Hospitality** (2 jobs)
   - Hotel Manager
   - Executive Chef

9. **Customer Service** (1 job)
   - Customer Service Representative

10. **Human Resources** (1 job)
    - HR Manager

11. **Legal** (1 job)
    - Paralegal

12. **Retail** (1 job)
    - Store Manager

13. **Internships** (2 jobs)
    - Software Engineering Intern
    - Marketing Intern

---

## 🚀 How to Run the Seed Script

### Step 1: Make sure MongoDB is running
```bash
# Check if MongoDB is running
mongod
```

### Step 2: Navigate to backend folder
```bash
cd backend
```

### Step 3: Run the seed script
```bash
node seedJobs.js
```

### Expected Output:
```
✅ Connected to MongoDB
🗑️  Cleared existing jobs
✅ Successfully seeded 25 jobs!

📊 Jobs by Category:
   IT & Technology: 4 jobs
   Healthcare: 3 jobs
   Education: 2 jobs
   Marketing: 1 jobs
   Sales: 1 jobs
   Finance: 2 jobs
   Engineering: 2 jobs
   Hospitality: 2 jobs
   Customer Service: 1 jobs
   Human Resources: 1 jobs
   Legal: 1 jobs
   Retail: 1 jobs
   Internship: 2 jobs

🎉 Database seeding completed successfully!
🔌 Database connection closed
```

---

## ✅ Verification Steps

### 1. Automated Verification
After running the seed script, you should see:
- ✅ Connection to MongoDB successful
- ✅ Existing jobs cleared
- ✅ 25+ jobs inserted
- ✅ Category breakdown displayed
- ✅ Success message

### 2. Manual Verification - Database
Check MongoDB directly:
```bash
# Open MongoDB shell
mongosh

# Use your database
use jobportal

# Count jobs
db.jobs.countDocuments()
# Should return: 25

# View all categories
db.jobs.distinct("category")
# Should return array of all categories

# View sample jobs
db.jobs.find().limit(5).pretty()
```

### 3. Manual Verification - Frontend
1. Start your backend:
   ```bash
   cd backend
   npm start
   ```

2. Start your frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Navigate to the Jobs page in your application

4. Verify:
   - ✅ Job list shows diverse roles (not just MERN stack)
   - ✅ Multiple categories visible
   - ✅ Different job types (Full-time, Part-time, Internship)
   - ✅ Various locations
   - ✅ Different salary ranges

### 4. Test Filter Functionality
1. Go to Jobs page
2. Test category filters:
   - Filter by "Healthcare" → Should show 3 jobs
   - Filter by "Education" → Should show 2 jobs
   - Filter by "Engineering" → Should show 2 jobs
   - Filter by "IT & Technology" → Should show 4 jobs
3. Test job type filters:
   - Filter by "Internship" → Should show 2 jobs
   - Filter by "Full-time" → Should show most jobs
4. Test location filters
5. Test search functionality

---

## 📊 Job Data Structure

Each job includes:
```javascript
{
  title: String,              // Job title
  company: String,            // Company name
  location: String,           // Job location
  type: String,               // Full-time, Part-time, Contract, Internship
  category: String,           // Job category
  salary: String,             // Salary range
  description: String,        // Job description
  requirements: [String],     // Array of requirements
  skills: [String],          // Array of required skills
  experience: String,         // Experience level
  postedDate: Date,          // Auto-generated
  deadline: Date,            // Application deadline
  isActive: Boolean          // Job status
}
```

---

## 🔄 Re-running the Seed Script

You can run the seed script multiple times:
- It will **clear all existing jobs** first
- Then insert fresh job data
- Safe to run anytime you want to reset job data

```bash
node seedJobs.js
```

---

## 🛠️ Customization

### Add More Jobs
Edit `seedJobs.js` and add new job objects to the `jobs` array:

```javascript
{
    title: 'Your Job Title',
    company: 'Company Name',
    location: 'City, State',
    type: 'Full-time',
    category: 'Your Category',
    salary: '$XX,XXX - $XX,XXX',
    description: 'Job description here',
    requirements: ['Requirement 1', 'Requirement 2'],
    skills: ['Skill 1', 'Skill 2'],
    experience: 'X+ years',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true
}
```

### Add New Categories
Simply use a new category name in the job object:
```javascript
category: 'Your New Category'
```

### Modify Existing Jobs
Find the job in the `jobs` array and update its properties.

---

## 🐛 Troubleshooting

### Error: Cannot connect to MongoDB
**Solution:** Make sure MongoDB is running
```bash
mongod
```

### Error: Module not found
**Solution:** Install dependencies
```bash
npm install
```

### Error: MONGODB_URI not defined
**Solution:** Make sure `.env` file exists with:
```
MONGODB_URI=mongodb://127.0.0.1:27017/jobportal
```

### Jobs not showing in frontend
**Solution:** 
1. Check backend is running
2. Check API endpoint is working: http://localhost:5000/api/jobs
3. Check browser console for errors
4. Verify frontend is fetching from correct API URL

---

## 📝 Notes

- The seed script uses the Job model schema
- All jobs are set to `isActive: true` by default
- Deadlines are set 15-60 days in the future
- No `postedBy` field (can be added later when linking to users)
- Jobs are diverse across industries, not just tech

---

## ✅ Success Checklist

After running the seed script, verify:
- [ ] Script ran without errors
- [ ] 25+ jobs inserted into database
- [ ] Multiple categories present
- [ ] Jobs visible in frontend
- [ ] Filter functionality works
- [ ] Search functionality works
- [ ] Job details display correctly

---

## 🎉 You're Done!

Your database now has diverse job listings ready for testing!

To view jobs in your app:
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Navigate to Jobs page
4. Browse and filter jobs!
