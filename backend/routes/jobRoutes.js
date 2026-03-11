const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const recruiterAuth = require('../middleware/recruiterAuth');
const Job = require('../models/Job');
const User = require('../models/User');
const { sendApplicationEmail } = require('../utils/emailService');
const multer = require('multer');
const Application = require('../models/Application');
const { uploadFile, deleteFile } = require('../utils/uploadService');
const { extractText } = require('../services/documentParser');
const { compareJDAndResume } = require('../services/geminiScannerService');
const { emitJobCountUpdate, emitNewJobPosted, emitApplicationStatusUpdate } = require('../utils/socket');
const { generateMeetingLink } = require('../utils/meetingGenerator');

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit for images
});

// Helper for dynamic slot engine
async function getNextAvailableSlot(recruiterId) {
    const mongoose = require('mongoose');
    const fs = require('fs');
    const path = require('path');
    const debugFile = path.join(__dirname, '..', 'slot_debug.log');

    // Explicitly cast to ObjectId
    const rId = new mongoose.Types.ObjectId(recruiterId);

    // Find recruiter's company to ensure company-wide slot uniqueness
    const recruiter = await User.findById(rId).select('company');
    const jobFilter = (recruiter && recruiter.company) ? { company: recruiter.company } : { postedBy: rId };
    const relevantJobIds = (await Job.find(jobFilter).select('_id')).map(j => j._id);

    fs.writeFileSync(debugFile, `[DEBUG_SLOT] recruiterId: ${recruiterId}, company: ${recruiter?.company || 'None'}, jobs: ${relevantJobIds.length}\n`);

    const scheduledApps = await Application.find({
        job: { $in: relevantJobIds },
        status: 'interview',
        interviewDate: { $exists: true, $ne: '' },
        interviewTime: { $exists: true, $ne: '' }
    }).select('interviewDate interviewTime');

    fs.appendFileSync(debugFile, `[DEBUG_SLOT] scheduledApps count: ${scheduledApps.length}\n`);

    // Create a set of "Date_Time" strings for easy collision lookup
    const bookedSlots = new Set();
    scheduledApps.forEach(app => {
        fs.appendFileSync(debugFile, `[DEBUG_SLOT] Stored application: ${app.interviewDate} at ${app.interviewTime}\n`);
        bookedSlots.add(`${app.interviewDate}_${app.interviewTime}`);
    });

    // 2. Setup dynamic slot generation parameters
    const startHour = 10;
    const startMin = 0;
    const endLimitMinutes = (17 * 60) + 30; // 17:30 is the last possible starting time
    const intervalMinutes = 45;

    // 3. Find the first available slot starting from TODAY
    let candidateDate = new Date();
    const now = new Date();
    const currentMinutesAtNow = (now.getHours() * 60) + now.getMinutes();

    // Search up to 90 days ahead
    for (let d = 0; d < 90; d++) {
        const dayOfWeek = candidateDate.getDay();

        // Skip Saturday (6) and Sunday (0)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            const dateStr = candidateDate.toISOString().split('T')[0];

            // Generate slots for this day
            let currentMinutes = (startHour * 60) + startMin;
            const isToday = candidateDate.toDateString() === now.toDateString();

            while (currentMinutes <= endLimitMinutes) {
                // Skip past times if today (with a 60-minute buffer for preparation)
                if (isToday && currentMinutes < (currentMinutesAtNow + 60)) {
                    currentMinutes += intervalMinutes;
                    continue;
                }

                const hour = Math.floor(currentMinutes / 60);
                const minute = currentMinutes % 60;
                const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

                // Check if this slot is already booked
                if (!bookedSlots.has(`${dateStr}_${timeStr}`)) {
                    return { date: dateStr, time: timeStr };
                }

                currentMinutes += intervalMinutes;
            }
        }

        // Move to the next day
        candidateDate.setDate(candidateDate.getDate() + 1);
    }

    // Fallback if no slot found in 90 days (should theoretically not happen)
    const fallbackDate = new Date();
    fallbackDate.setDate(fallbackDate.getDate() + 1);
    while (fallbackDate.getDay() === 0 || fallbackDate.getDay() === 6) {
        fallbackDate.setDate(fallbackDate.getDate() + 1);
    }
    return { date: fallbackDate.toISOString().split('T')[0], time: "10:00" };
}

async function isSlotAvailable(recruiterId, date, time, ignoreAppId = null) {
    if (!date || !time) return true;
    const recruiter = await User.findById(recruiterId).select('company');
    const jobFilter = (recruiter && recruiter.company) ? { company: recruiter.company } : { postedBy: recruiterId };
    const relevantJobIds = (await Job.find(jobFilter).select('_id')).map(j => j._id);

    const query = {
        job: { $in: relevantJobIds },
        status: 'interview',
        interviewDate: date,
        interviewTime: time
    };
    if (ignoreAppId) {
        query._id = { $ne: ignoreAppId };
    }
    const existing = await Application.findOne(query);
    return !existing;
}

// Route removed from here, moved to consolidated recruiter section

// Consolidated /recruiter/jobs route
router.get('/company/:companyId', async (req, res) => {
    try {
        const jobs = await Job.find({ company: req.params.companyId, status: 'active' })
            .sort({ createdAt: -1 })
            .populate('company', 'name logo location');
        res.json(jobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
router.get('/recruiter/jobs', recruiterAuth, async (req, res) => {
    try {
        console.log(`[JobRoutes] Fetching jobs for recruiter: ${req.user.id}`);
        const jobs = await Job.find({ postedBy: req.user.id })
            .sort({ createdAt: -1 })
            .populate({
                path: 'applicants',
                populate: { path: 'user', select: 'firstName lastName email' },
                options: { strictPopulate: false }
            });

        const jobsWithStats = jobs.map(job => {
            const jobObj = job.toObject({ virtuals: true });
            return {
                ...jobObj,
                applicantCount: jobObj.applicants ? jobObj.applicants.length : 0
            };
        });

        res.json(jobsWithStats);
    } catch (err) {
        console.error(`[JobRoutes] ERROR in /recruiter/jobs:`, err);
        console.error(err.stack);
        res.status(500).json({
            message: 'Internal Server Error while fetching recruiter jobs',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// @route   POST /api/jobs
// @desc    Post a new job (Employer only)
router.post('/', auth, upload.single('poster'), async (req, res) => {
    console.log('[DEBUG] Job Post Request - Body:', req.body);
    console.log('[DEBUG] Job Post Request - File:', req.file ? req.file.originalname : 'No file');
    try {
        if (req.user.role !== 'employer') {
            const user = await User.findById(req.user.id);
            if (user.role !== 'employer') {
                return res.status(403).json({ message: 'Access denied. Employers only.' });
            }
        }

        // Fetch user with company details
        const user = await User.findById(req.user.id).populate('company');

        // Defensive check: Ensure user has a company linked
        if (!user.company) {
            console.warn(`[JobRoutes] User ${req.user.id} attempted to post job without company profile`);
            return res.status(403).json({
                message: 'Your company profile is missing. Please set up your company profile before posting a job.'
            });
        }

        /* 
        if (user.company.verificationStatus !== 'verified' && process.env.ENFORCE_VERIFICATION === 'true') {
            return res.status(403).json({ message: 'Your company must be verified before you can post jobs.' });
        }
        */

        let { title, location, type, salary, minSalary, maxSalary, experienceLevel, description, tags, requirements, category } = req.body;

        // Validate required fields
        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Job title is required' });
        }
        if (!location || !location.trim()) {
            return res.status(400).json({ message: 'Job location is required' });
        }

        // Process tags and requirements if they come as strings
        if (typeof tags === 'string') {
            tags = tags.split(',').map(t => t.trim()).filter(t => t);
        }
        if (typeof requirements === 'string') {
            requirements = requirements.split(',').map(r => r.trim()).filter(r => r);
        }

        let posterUrl = '';
        if (req.file) {
            try {
                posterUrl = await uploadFile(req.file, 'job-posters');
                console.log('✅ [JobRoutes] Poster uploaded:', posterUrl);
            } catch (uploadErr) {
                console.warn('⚠️ [JobRoutes] Poster upload failed, continuing without poster:', uploadErr.message);
                // Continue without poster - don't fail the entire job posting
            }
        }

        const companyId = user.company?._id || user.company;
        const companyDisplayName = user.company?.name || user.companyName || 'Unknown';

        if (!companyId) {
            return res.status(403).json({ message: 'No company linked to your account. Please set up your company profile.' });
        }

        const newJob = new Job({
            title,
            company: companyId,
            companyName: companyDisplayName,
            location,
            type,
            salary,
            minSalary: minSalary ? Number(minSalary) : undefined,
            maxSalary: maxSalary ? Number(maxSalary) : undefined,
            experienceLevel,
            description,
            tags,
            requirements,
            category: category || 'IT',
            posterUrl,
            postedBy: req.user.id
        });

        const job = await newJob.save();
        
        // 🔴 REAL-TIME: Emit new job posted event
        try {
            emitNewJobPosted({
                id: job._id,
                title: job.title,
                company: companyDisplayName,
                category: job.category,
                location: job.location,
                type: job.type
            });
            
            // Update all clients with new job counts
            const categories = ['IT', 'Non-IT', 'Remote', 'Engineering', 'Data Science', 'Design', 'Finance', 'Hardware', 'Product', 'Sales', 'Marketing'];
            const counts = await Promise.all(categories.map(async (cat) => {
                const count = await Job.countDocuments({
                    $or: [
                        { category: cat },
                        { tags: new RegExp(`^${cat}$`, 'i') },
                        { title: new RegExp(cat, 'i') }
                    ],
                    status: 'active'
                });
                return { name: cat, count };
            }));
            emitJobCountUpdate(counts);
        } catch (socketErr) {
            console.error('[JobRoutes] Socket emission error:', socketErr.message);
        }
        
        res.status(201).json(job);
    } catch (err) {
        const fs = require('fs');
        const path = require('path');
        const errorLogPath = path.join(__dirname, '..', 'job_post_error.log');
        const errorDetail = {
            timestamp: new Date().toISOString(),
            message: err.message,
            stack: err.stack,
            name: err.name,
            errors: err.errors,
            body: req.body,
            user: req.user
        };
        fs.appendFileSync(errorLogPath, JSON.stringify(errorDetail, null, 2) + '\n---\n');

        console.error('[JobRoutes] POST / Error Detail:', errorDetail);

        res.status(500).json({
            message: 'Internal Server Error while posting job',
            error: err.message,
            errors: err.errors,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// @route   POST /api/jobs/bulk-upload
// @desc    Bulk upload jobs from JSON (Recruiter only)
router.post('/bulk-upload', recruiterAuth, async (req, res) => {
    try {
        const jobsData = req.body;
        if (!Array.isArray(jobsData)) {
            return res.status(400).json({ message: 'Payload must be an array of jobs' });
        }

        const user = await User.findById(req.user.id).populate('company');
        if (!user || !user.company) {
            return res.status(403).json({ 
                message: 'No company linked to your account. Please set up your company profile first.' 
            });
        }

        const companyId = user.company._id;
        const companyName = user.company.name;

        const jobsToInsert = jobsData.map(job => {
            // Process tags and requirements
            let tags = job.tags || [];
            if (typeof tags === 'string') {
                tags = tags.split(',').map(t => t.trim()).filter(Boolean);
            }
            
            let requirements = job.requirements || [];
            if (typeof requirements === 'string') {
                requirements = requirements.split(',').map(r => r.trim()).filter(Boolean);
            }

            return {
                title: job.title,
                location: job.location || 'Remote',
                type: job.type || 'Full Time',
                salary: job.salary,
                minSalary: job.minSalary,
                maxSalary: job.maxSalary,
                experienceLevel: job.experienceLevel || 'Mid Level',
                description: job.description || '',
                category: job.category || 'IT',
                tags,
                requirements,
                company: companyId,
                companyName: companyName,
                postedBy: req.user.id,
                status: 'active'
            };
        });

        const createdJobs = await Job.insertMany(jobsToInsert);

        res.status(201).json({
            message: `Successfully uploaded ${createdJobs.length} jobs`,
            count: createdJobs.length,
            jobs: createdJobs
        });
    } catch (err) {
        console.error('[JobRoutes] Bulk Upload Error:', err);
        res.status(500).json({ 
            message: 'Internal Server Error during bulk upload', 
            error: err.message 
        });
    }
});

// @route   GET /api/jobs/my-postings
// @desc    Get all jobs posted by the logged-in employer
router.get('/my-postings', auth, async (req, res) => {
    try {
        const jobs = await Job.find({ postedBy: req.user.id }).sort({ createdAt: -1 });
        const jobsWithApplicants = await Promise.all(jobs.map(async (job) => {
            const applicantCount = await Application.countDocuments({ job: job._id });
            return {
                ...job.toObject(),
                applicants: applicantCount
            };
        }));
        res.json(jobsWithApplicants);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET category counts (Optimized)
router.get('/categories', async (req, res) => {
    try {
        const categories = ['IT', 'Non-IT', 'Remote', 'Engineering', 'Data Science', 'Design', 'Finance', 'Hardware', 'Product', 'Sales', 'Marketing'];
        const counts = await Promise.all(categories.map(async (cat) => {
            const count = await Job.countDocuments({
                $or: [
                    { category: cat },
                    { tags: new RegExp(`^${cat}$`, 'i') },
                    { title: new RegExp(cat, 'i') }
                ],
                status: 'active'
            });
            return { name: cat, count: `${count}+ Jobs` };
        }));
        res.json(counts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET category stats with real-time demand calculation
router.get('/categories/stats', async (req, res) => {
    try {
        const categories = ['IT', 'Non-IT', 'Remote', 'Engineering', 'Data Science', 'Design', 'Finance', 'Hardware', 'Product', 'Sales', 'Marketing'];
        
        // Color mapping for category bars
        const categoryColors = {
            'IT': '#4F46E5',
            'Non-IT': '#F59E0B',
            'Remote': '#10B981',
            'Engineering': '#8B5CF6',
            'Data Science': '#EC4899',
            'Design': '#06B6D4',
            'Finance': '#EAB308',
            'Hardware': '#8B5CF6',
            'Product': '#3B82F6',
            'Sales': '#F97316',
            'Marketing': '#10B981'
        };

        const stats = await Promise.all(categories.map(async (cat) => {
            // Current count
            const currentCount = await Job.countDocuments({
                $or: [
                    { category: cat },
                    { tags: new RegExp(`^${cat}$`, 'i') },
                    { title: new RegExp(cat, 'i') }
                ],
                status: 'active'
            });

            // Count from 7 days ago (for demand calculation)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            const previousCount = await Job.countDocuments({
                $or: [
                    { category: cat },
                    { tags: new RegExp(`^${cat}$`, 'i') },
                    { title: new RegExp(cat, 'i') }
                ],
                status: 'active',
                createdAt: { $lt: sevenDaysAgo }
            });

            // Calculate demand percentage (growth rate)
            let demandPercentage = 15; // Base demand for 0 jobs
            
            if (currentCount === 0) {
                // No jobs = very low demand (10-20%)
                demandPercentage = Math.floor(Math.random() * 11) + 10; // 10-20%
            } else if (currentCount > 0) {
                // Base demand based on job availability
                if (currentCount <= 2) {
                    demandPercentage = 40 + (currentCount * 5); // 40-50% for 1-2 jobs
                } else if (currentCount <= 5) {
                    demandPercentage = 50 + (currentCount * 3); // 53-65% for 3-5 jobs
                } else if (currentCount <= 10) {
                    demandPercentage = 65 + (currentCount * 2); // 67-85% for 6-10 jobs
                } else {
                    demandPercentage = 85; // 85%+ for 10+ jobs
                }
                
                // Add growth bonus if there's weekly growth
                if (previousCount > 0) {
                    const growth = ((currentCount - previousCount) / previousCount) * 100;
                    const growthBonus = Math.min(15, Math.max(-10, Math.round(growth / 2)));
                    demandPercentage = Math.min(95, Math.max(40, demandPercentage + growthBonus));
                } else if (currentCount > 0) {
                    // New category with jobs - add small bonus
                    demandPercentage = Math.min(90, demandPercentage + 5);
                }
            }

            return {
                name: cat,
                count: currentCount,
                displayCount: `${currentCount}+ Jobs`,
                demandPercentage,
                color: categoryColors[cat] || '#6B7280',
                tags: [] // Will be populated with top skills if needed
            };
        }));

        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET Top Companies (Aggregation)
router.get('/top-companies', async (req, res) => {
    try {
        const companies = await Job.aggregate([
            {
                $group: {
                    _id: "$company",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 6 }
        ]);

        const formattedCompanies = companies.map((c, idx) => ({
            id: idx + 1,
            name: c._id,
            openings: c.count,
            logo: ['🔵', '🟦', '🟧', '⚫', '🔷', '🔴'][idx % 6] // Placeholder logos
        }));

        res.json(formattedCompanies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET all jobs (with optional search)
router.get('/', async (req, res) => {
    try {
        const { search, location, type, minSalary, experienceLevel, datePosted, category } = req.query;
        let query = {};

        if (category) {
            const itCategories = ['IT', 'Engineering', 'Data & Analytics', 'IT & Technology', 'Data Science', 'Hardware', 'Software Engineering', 'DevOps'];

            if (category === 'IT') {
                query.category = { $in: itCategories };
            } else if (category === 'Non-IT') {
                query.category = { $nin: itCategories };
            } else {
                query.category = category;
            }
        }

        if (search) {
            query.$or = [
                { title: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
                { tags: new RegExp(search, 'i') }
            ];
        }

        if (location) query.location = new RegExp(location, 'i');
        if (type) query.type = type;
        if (experienceLevel) query.experienceLevel = experienceLevel;
        if (minSalary) {
            query.maxSalary = { $gte: Number(minSalary) };
        }

        if (datePosted) {
            const now = new Date();
            let pastDate = new Date(now);
            if (datePosted === '24h') pastDate.setDate(now.getDate() - 1);
            if (datePosted === '7d') pastDate.setDate(now.getDate() - 7);
            if (datePosted === '30d') pastDate.setDate(now.getDate() - 30);

            query.createdAt = { $gte: pastDate };
        }

        const jobs = await Job.find(query).sort({ createdAt: -1 })
            .populate('postedBy', 'firstName lastName') // fullName removed as it doesn't exist
            .populate({
                path: 'company',
                select: 'name logo verificationLevel verificationStatus verified',
                options: { strictPopulate: false }
            });
        res.json(jobs);
    } catch (err) {
        console.error(`[JobRoutes] ERROR fetching jobs:`, err.message);
        res.status(500).json({
            message: 'Internal Server Error while fetching jobs',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});


// SEED jobs
router.get('/seed', async (req, res) => {
    try {
        const User = require('../models/User');
        let adminUser = await User.findOne({ email: /admin/i });
        if (!adminUser) {
            adminUser = await User.findOne();
        }

        if (!adminUser) {
            return res.status(400).json({ message: 'Create at least one user before seeding jobs' });
        }

        const mockJobs = [
            { title: 'Senior Frontend Developer', company: 'Tech Corp', location: 'Bangalore', type: 'Full Time', tags: ['React', 'Tailwind'], salary: '₹25L - ₹35L', category: 'IT', postedBy: adminUser._id },
            { title: 'Product Designer', company: 'Design Studio', location: 'Mumbai', type: 'Remote', tags: ['Figma', 'UI/UX'], salary: '₹18L - ₹28L', category: 'IT', postedBy: adminUser._id },
            { title: 'Backend Engineer', company: 'Data Systems', location: 'Pune', type: 'Hybrid', tags: ['Node.js', 'AWS'], salary: '₹22L - ₹30L', category: 'IT', postedBy: adminUser._id },
            { title: 'Marketing Manager', company: 'Growth Inc', location: 'Delhi', type: 'Full Time', tags: ['SEO', 'Marketing'], salary: '₹15L - ₹20L', category: 'Non-IT', postedBy: adminUser._id },
            { title: 'HR Operations Lead', company: 'People First', location: 'Bangalore', type: 'Full Time', tags: ['HR', 'Operations'], salary: '₹12L - ₹18L', category: 'Non-IT', postedBy: adminUser._id },
            { title: 'Sales Executive', company: 'Global Traders', location: 'Chennai', type: 'On-site', tags: ['Sales', 'BDE'], salary: '₹8L - ₹12L', category: 'Non-IT', postedBy: adminUser._id },
        ];

        await Job.deleteMany(); // Clear existing
        const seededJobs = await Job.insertMany(mockJobs);
        res.json({ message: 'Jobs seeded successfully', count: seededJobs.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Application model already required at top

// @route   POST /api/jobs/:id/view
// @desc    Increment job view count
router.post('/:id/view', auth, async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.user.id;

        // Prevent crashing if job id is invalid
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: 'Invalid Job ID' });
        }

        await Job.findByIdAndUpdate(jobId, {
            $inc: { views: 1 },
            $addToSet: { uniqueViews: userId }
        }).catch(() => { }); // Ignore errors silently to not disrupt the frontend

        res.json({ success: true });
    } catch (err) {
        console.error(`[JobRoutes] View Tracking Error: ${err.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/jobs/apply/:id
// @desc    Apply for a job
router.post('/apply/:id', auth, async (req, res) => {
    try {
        const jobId = req.params.id;

        // Validate ObjectId
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            console.log(`[JobRoutes] Invalid ID in /apply/:id route: ${jobId}`);
            return res.status(400).json({ message: 'Invalid Job ID' });
        }

        const userId = req.user.id;
        console.log(`[JobRoutes] Application attempt for Job: ${jobId} by User: ${userId}`);

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        // Check for duplicate application
        const existingApp = await Application.findOne({ job: jobId, user: userId });
        if (existingApp) return res.status(400).json({ message: 'You have already applied for this job' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const application = new Application({
            job: jobId,
            user: userId,
            resumeUrl: user.resumeUrl // Snapshot the resume URL
        });

        // ============================================
        // Finalize Application Save & Confirm
        // ============================================
        await application.save();

        // 📧 IMMEDIATELY trigger common application email (don't wait for scan)
        sendApplicationEmail(user.email, user.firstName, job.title, job.company).catch(e => {
            console.error(`[JobRoutes] Failed to send initial application email: ${e.message}`);
        });

        // ============================================
        // Automatic ATS Analysis in background (non-blocking)
        // ============================================
        // We do not 'await' this specifically to keep the response fast, 
        // the scan still runs and updates correctly.
        setImmediate(async () => {
            try {
                const resumeUrlToScan = user.resumeUrl;
                if (!resumeUrlToScan) return;

                console.log(`[JobRoutes] Background Auto-scanning resume: ${resumeUrlToScan}`);
                let resumeText = await extractText(resumeUrlToScan).catch(() => null);

                if (resumeText) {
                    const jdText = `Title: ${job.title}\nDescription: ${job.description}\nRequirements: ${job.requirements || ''}`;
                    const analysis = await compareJDAndResumeLocal(jdText, resumeText);

                    const atsScore = analysis.ats_score || analysis.matchPercentage || 0;
                    application.aiMatchScore = atsScore;
                    application.aiAnalysis = analysis;

                    // ATS Score-based Status Logic:
                    // >= 70%: Auto-shortlisted for interview
                    // 50-69%: Shortlisted (needs manual review)
                    // < 50%: Rejected
                    if (atsScore >= 70) {
                        application.status = 'interview';
                        console.log(`[JobRoutes] ✅ Auto-shortlisted for INTERVIEW (score: ${atsScore})`);
                    } else if (atsScore >= 50) {
                        application.status = 'shortlisted';
                        console.log(`[JobRoutes] 📋 Shortlisted for manual review (score: ${atsScore})`);
                    } else {
                        application.status = 'rejected';
                        console.log(`[JobRoutes] ❌ Auto-rejected (score: ${atsScore})`);
                        // Rejection update email (also handled safely)
                        await sendStatusUpdateEmail(user.email, user.firstName, job.title, job.companyName || job.company, 'rejected', atsScore).catch(() => { });
                    }
                    await application.save().catch(() => { });
                    
                    // 🔴 REAL-TIME: Emit application status update from auto-scan
                    try {
                        emitApplicationStatusUpdate(userId, {
                            applicationId: application._id,
                            jobId: job._id,
                            jobTitle: job.title,
                            company: job.companyName || job.company,
                            status: application.status,
                            oldStatus: 'applied',
                            aiMatchScore: atsScore,
                            updatedAt: new Date()
                        });
                    } catch (socketErr) {
                        console.error(`[JobRoutes] Socket emission error on auto-scan: ${socketErr.message}`);
                    }
                }
            } catch (atsError) {
                console.error(`[JobRoutes] Background ATS scan failed: ${atsError.message}`);
            }
        });

        res.status(201).json({
            message: 'Application submitted successfully',
            application,
            info: 'Email notification sent. ATS analysis running in background.'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/jobs/applied
// @desc    Get all jobs applied by the current user
router.get('/applied', auth, async (req, res) => {
    try {
        const applications = await Application.find({ user: req.user.id })
            .populate({
                path: 'job',
                populate: { path: 'company', select: 'name logo' }
            })
            .sort({ createdAt: -1 });
        res.json(applications);
    } catch (err) {
        console.error(`[JobRoutes] Error in /applied: ${err.message}`);
        res.status(500).json({
            message: `Internal Server Error: ${err.message}`
        });
    }
});

// GET single job moved to bottom


// @route   PUT /api/jobs/:id
// @desc    Update a job
router.put('/:id', auth, upload.single('poster'), async (req, res) => {
    try {
        const jobId = req.params.id;
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: 'Invalid Job ID' });
        }

        let job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        // Make sure user owns the job
        if (job.postedBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        let { title, company, location, type, salary, minSalary, maxSalary, experienceLevel, description, tags, requirements, status, category } = req.body;

        const jobFields = {};

        // Process tags and requirements if they come as strings
        if (tags !== undefined) {
            if (typeof tags === 'string') {
                jobFields.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            } else {
                jobFields.tags = tags;
            }
        }
        if (requirements !== undefined) {
            if (typeof requirements === 'string') {
                jobFields.requirements = requirements.split(',').map(req => req.trim()).filter(req => req);
            } else {
                jobFields.requirements = requirements;
            }
        }
        if (category) jobFields.category = category;
        if (title) jobFields.title = title;
        if (company) jobFields.company = company;
        if (location) jobFields.location = location;
        if (type) jobFields.type = type;
        if (salary) jobFields.salary = salary;
        if (minSalary) jobFields.minSalary = minSalary;
        if (maxSalary) jobFields.maxSalary = maxSalary;
        if (experienceLevel) jobFields.experienceLevel = experienceLevel;
        if (description) jobFields.description = description;
        if (tags) jobFields.tags = tags;
        if (requirements) jobFields.requirements = requirements;
        if (status) jobFields.status = status;

        if (req.file) {
            // Delete old poster if exists
            if (job.posterUrl) {
                await deleteFile(job.posterUrl);
            }
            jobFields.posterUrl = await uploadFile(req.file, 'job-posters');
        }

        job = await Job.findByIdAndUpdate(
            req.params.id,
            { $set: jobFields },
            { new: true }
        );
        
        // 🔴 REAL-TIME: Emit job count update after job modification
        try {
            const categories = ['IT', 'Non-IT', 'Remote', 'Engineering', 'Data Science', 'Design', 'Finance', 'Hardware', 'Product', 'Sales', 'Marketing'];
            const counts = await Promise.all(categories.map(async (cat) => {
                const count = await Job.countDocuments({
                    $or: [
                        { category: cat },
                        { tags: new RegExp(`^${cat}$`, 'i') },
                        { title: new RegExp(cat, 'i') }
                    ],
                    status: 'active'
                });
                return { name: cat, count };
            }));
            emitJobCountUpdate(counts);
        } catch (socketErr) {
            console.error('[JobRoutes] Socket emission error on job update:', socketErr.message);
        }

        res.json(job);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
router.delete('/:id', auth, async (req, res) => {
    try {
        const jobId = req.params.id;
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: 'Invalid Job ID' });
        }

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        // Make sure user owns the job
        if (job.postedBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await Job.findByIdAndDelete(req.params.id);
        
        // 🔴 REAL-TIME: Emit job count update after deletion
        try {
            const categories = ['IT', 'Non-IT', 'Remote', 'Engineering', 'Data Science', 'Design', 'Finance', 'Hardware', 'Product', 'Sales', 'Marketing'];
            const counts = await Promise.all(categories.map(async (cat) => {
                const count = await Job.countDocuments({
                    $or: [
                        { category: cat },
                        { tags: new RegExp(`^${cat}$`, 'i') },
                        { title: new RegExp(cat, 'i') }
                    ],
                    status: 'active'
                });
                return { name: cat, count };
            }));
            emitJobCountUpdate(counts);
        } catch (socketErr) {
            console.error('[JobRoutes] Socket emission error on job delete:', socketErr.message);
        }
        
        res.json({ message: 'Job removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/jobs/save/:id
// @desc    Save/Bookmark a job
router.post('/save/:id', auth, async (req, res) => {
    try {
        const jobId = req.params.id;
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: 'Invalid Job ID' });
        }

        const user = await User.findById(req.user.id);

        const isSaved = user.savedJobs.some(id => id.toString() === jobId.toString());

        if (isSaved) {
            // Unsave if already saved
            user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId.toString());
            await user.save();
            return res.json({ message: 'Job removed from saved list', saved: false });
        }

        user.savedJobs.push(jobId);
        await user.save();
        res.json({ message: 'Job saved successfully', saved: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/jobs/saved
// @desc    Get all jobs saved by the current user
router.get('/saved-details', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('savedJobs');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.savedJobs || []);
    } catch (err) {
        console.error(`[JobRoutes] Error in /saved-details: ${err.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
});


const { sendStatusUpdateEmail, sendInterviewSlotEmail, sendInterviewCancelledEmail } = require('../utils/emailService');

// Route moved to top

// Consolidated route moved to recruiter section below


// GET single job (Placed at the end to avoid shadowing)
router.get('/:id', async (req, res, next) => {
    const jobId = req.params.id;
    const mongoose = require('mongoose');

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return next();
    }

    try {
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.json(job);
    } catch (err) {
        console.error(`[JobRoutes] Error in /:id: ${err.message}`);
        res.status(500).json({ message: err.message });
    }
});

// --- Recruiter Applicant Management ---

// @route   GET /api/jobs/recruiter/applicants
// @desc    Get all applicants for all jobs posted by the logged-in recruiter
router.get('/recruiter/applicants', recruiterAuth, async (req, res) => {
    try {
        // 1. Find all jobs posted by this recruiter
        const recruiterJobs = await Job.find({ postedBy: req.user.id }).select('_id');
        const jobIds = recruiterJobs.map(job => job._id);

        // 2. Find all applications for these jobs
        const applications = await Application.find({ job: { $in: jobIds } })
            .populate('user', '-password')
            .populate('job', 'title company location type description requirements')
            .sort({ createdAt: -1 });

        res.json(applications);
    } catch (err) {
        console.error(`[JobRoutes] Error in /recruiter/applicants: ${err.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Duplicate route removed (consolidated at top)

// @route   GET /api/jobs/applicants/:jobId
// @desc    Get applicants for a specific job
router.get('/applicants/:jobId', recruiterAuth, async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.postedBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const applications = await Application.find({ job: req.params.jobId })
            .populate('user', '-password')
            .populate('job', 'title description requirements type')
            .sort({ createdAt: -1 });

        res.json(applications);
    } catch (err) {
        console.error(`[JobRoutes] Error in /applicants/:jobId: ${err.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PATCH /api/jobs/application/:id/status
// @desc    Update application status
router.patch('/application/:id/status', recruiterAuth, async (req, res) => {
    const { status, interviewDate, interviewTime, interviewNotes, meetingLink } = req.body;
    try {
        let application = await Application.findById(req.params.id).populate('job user');
        if (!application) return res.status(404).json({ message: 'Application not found' });

        // Check if the current recruiter owns the job this application is for
        if (application.job.postedBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const oldStatus = application.status;
        application.status = status;
        if (interviewDate) application.interviewDate = interviewDate;
        if (interviewTime) application.interviewTime = interviewTime;
        if (interviewNotes) application.interviewNotes = interviewNotes;
        
        // Handle meeting link for interview status
        if (status === 'interview') {
            if (meetingLink) {
                // Use provided meeting link
                application.meetingLink = meetingLink;
            } else if (!application.meetingLink) {
                // Auto-generate Jitsi Meet link if no link provided
                const autoLink = generateMeetingLink({
                    applicationId: application._id.toString(),
                    candidateName: application.user.firstName,
                    jobTitle: application.job.title
                });
                application.meetingLink = autoLink;
                console.log(`🎥 Auto-generated Jitsi link for interview: ${autoLink}`);
            }
        } else {
            // Ensure no stale meeting link remains for non-interview statuses
            application.meetingLink = '';
        }

        // If moving to 'interview', trigger dynamic slot engine ONLY if no slot assigned yet
        if (status === 'interview') {
            if (!application.interviewDate || !application.interviewTime) {
                const nextSlot = await getNextAvailableSlot(req.user.id);
                application.interviewDate = nextSlot.date;
                application.interviewTime = nextSlot.time;
            } else {
                // Validate the provided/existing slot for collisions
                const available = await isSlotAvailable(req.user.id, application.interviewDate, application.interviewTime, application._id);
                if (!available) {
                    return res.status(400).json({ message: 'This interview slot is already booked for another candidate. Please select a different time.' });
                }
            }
        }

        await application.save();

        // Send email notification
        if (status === 'interview') {
            try {
                await sendInterviewSlotEmail(
                    application.user.email,
                    application.user.firstName,
                    application.job.title,
                    application.job.companyName || application.job.company,
                    application.interviewDate,
                    application.interviewTime,
                    application.interviewNotes || '',
                    application._id,
                    application.meetingLink
                );
            } catch (emailErr) {
                console.error(`[JobRoutes] Failed to send interview email: ${emailErr.message}`);
            }
        } else if (status !== 'viewed' && status !== oldStatus) {
            try {
                await sendStatusUpdateEmail(
                    application.user.email,
                    application.user.firstName,
                    application.job.title,
                    application.job.companyName || application.job.company,
                    status,
                    status === 'rejected' ? application.aiMatchScore : null
                );
            } catch (emailErr) {
                console.error(`[JobRoutes] Failed to send status update email: ${emailErr.message}`);
            }
        }
        
        // 🔴 REAL-TIME: Emit application status update to job seeker
        try {
            emitApplicationStatusUpdate(application.user._id.toString(), {
                applicationId: application._id,
                jobId: application.job._id,
                jobTitle: application.job.title,
                company: application.job.companyName || application.job.company,
                status: application.status,
                oldStatus,
                interviewDate: application.interviewDate,
                interviewTime: application.interviewTime,
                meetingLink: application.meetingLink,
                updatedAt: new Date()
            });
        } catch (socketErr) {
            console.error(`[JobRoutes] Socket emission error on status update: ${socketErr.message}`);
        }

        res.json(application);
    } catch (err) {
        console.error(`[JobRoutes] Error in /application/:id/status: ${err.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PATCH /api/jobs/application/:id/analysis
// @desc    Update application AI analysis
router.patch('/application/:id/analysis', recruiterAuth, async (req, res) => {
    const { aiMatchScore, aiAnalysis } = req.body;
    try {
        let application = await Application.findById(req.params.id).populate('job');
        if (!application) return res.status(404).json({ message: 'Application not found' });

        // Check ownership
        if (application.job.postedBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        application.aiMatchScore = aiMatchScore;
        application.aiAnalysis = aiAnalysis;
        await application.save();

        res.json(application);
    } catch (err) {
        console.error(`[JobRoutes] Error in /application/:id/analysis: ${err.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/jobs/application/:id/scan
// @desc    Scan application with AI (Gemini or local fallback)
router.post('/application/:id/scan', recruiterAuth, async (req, res) => {
    try {
        const { forceRescan = false, autoClassify = false } = req.body;

        const application = await Application.findById(req.params.id)
            .populate('job')
            .populate('user', 'firstName lastName email resumeUrl skills primarySkill aboutMe location experienceLevel education preferredRole');

        if (!application) return res.status(404).json({ message: 'Application not found' });

        // Check ownership
        if (application.job.postedBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // If score exists and not forcing a rescan, return existing
        if (!forceRescan && application.aiMatchScore != null && application.aiMatchScore !== -1) {
            return res.json({
                message: 'Using existing scan results',
                analysis: application.aiAnalysis,
                applicationStatus: application.status,
                aiMatchScore: application.aiMatchScore
            });
        }

        let resumeText = null;

        // ===================================================
        // Step 1: Try to download and parse resume from URLs
        // ===================================================
        const urlsToTry = [];
        if (application.resumeUrl) urlsToTry.push(application.resumeUrl);
        if (application.user?.resumeUrl && application.user.resumeUrl !== application.resumeUrl) {
            urlsToTry.push(application.user.resumeUrl);
        }

        for (const url of urlsToTry) {
            try {
                console.log(`[JobRoutes] Trying resume URL: ${url}`);
                resumeText = await extractText(url);
                if (url !== application.resumeUrl) {
                    application.resumeUrl = url;
                }
                break;
            } catch (fetchErr) {
                console.warn(`[JobRoutes] Failed to fetch resume from ${url}: ${fetchErr.message}. Trying next...`);
            }
        }

        // ===================================================
        // Step 2: If URLs failed, build resume text from profile
        // ===================================================
        if (!resumeText) {
            console.log(`[JobRoutes] All URLs failed. Using candidate profile data as resume text.`);
            const u = application.user;
            const skillList = [
                ...(u.skills || []),
                ...(u.primarySkill ? u.primarySkill.split(',').map(s => s.trim()) : [])
            ].filter(Boolean).join(', ');

            const eduText = (u.education || []).map(edu =>
                `${edu.level || ''}: ${edu.degreeName || edu.schoolName || edu.collegeName || ''} ${edu.score ? '(Score: ' + edu.score + ')' : ''}`
            ).join('. ');

            resumeText = `
                Candidate: ${u.firstName || ''} ${u.lastName || ''}
                Preferred Role: ${u.preferredRole || 'Software Developer'}
                Location: ${u.location || 'Not specified'}
                Experience Level: ${u.experienceLevel || 'Entry Level'}
                Skills: ${skillList || 'Not listed'}
                About: ${u.aboutMe || 'No bio provided'}
                Education: ${eduText || 'Not listed'}
            `.trim();

            if (resumeText.length < 30) {
                application.aiMatchScore = -1;
                await application.save();
                return res.status(400).json({ message: 'No resume or profile data available to scan for this candidate.' });
            }
        }

        // Prepare JD text
        const jobSkills = [
            ...(application.job.requiredSkills || []),
            ...(application.job.tags || []),
            ...(application.job.requirements || [])
        ].filter(Boolean).join(', ');

        const jdText = `
            Title: ${application.job.title}
            Category: ${application.job.category || ''}
            Location: ${application.job.location || ''}
            Experience Level: ${application.job.experienceLevel || ''}
            Description: ${application.job.description}
            Required Skills / Keywords: ${jobSkills || 'Not specified'}
        `;

        // Run ATS analysis
        const analysis = await compareJDAndResume(jdText, resumeText);

        // Save results
        application.aiMatchScore = analysis.ats_score || analysis.matchPercentage || 0;
        application.aiAnalysis = analysis;

        // =====================================================
        // Auto Status Assignment based on score:
        // Only if autoClassify is true and in early stage
        // =====================================================
        if (autoClassify) {
            const isEarlyStage = ['applied', 'viewed', 'shortlisted'].includes(application.status);
            if (isEarlyStage) {
                if (application.aiMatchScore >= 60) {
                    application.status = 'interview';

                    // Auto-schedule interview and generate meeting link
                    if (!application.interviewDate || !application.interviewTime) {
                        const nextSlot = await getNextAvailableSlot(req.user.id);
                        if (nextSlot) {
                            application.interviewDate = nextSlot.date;
                            application.interviewTime = nextSlot.time;
                        }
                    }

                    // Auto-generate Jitsi meeting link if not set
                    if (!application.meetingLink) {
                        const autoLink = generateMeetingLink({
                            applicationId: application._id.toString(),
                            candidateName: application.user.firstName,
                            jobTitle: application.job.title
                        });
                        application.meetingLink = autoLink;
                        console.log(`🎥 Auto-generated Jitsi link during AI scan: ${autoLink}`);
                    }

                    console.log(`[JobRoutes] Auto-scheduled interview (score: ${application.aiMatchScore})`);

                    // Send interview email silently
                    try {
                        await sendInterviewSlotEmail(
                            application.user.email,
                            application.user.firstName,
                            application.job.title,
                            application.job.companyName || application.job.company,
                            application.interviewDate,
                            application.interviewTime,
                            'Congratulations! Your profile has been automatically shortlisted for an interview based on our AI scan.',
                            application._id,
                            application.meetingLink
                        );
                    } catch (emailErr) {
                        console.error(`[JobRoutes] Failed to send auto-interview email: ${emailErr.message}`);
                    }

                } else {
                    application.status = 'rejected';
                    console.log(`[JobRoutes] Auto-rejected (score: ${application.aiMatchScore})`);

                    // Send automated rejection email
                    try {
                        await sendStatusUpdateEmail(
                            application.user.email,
                            application.user.firstName,
                            application.job.title,
                            application.job.companyName || application.job.company,
                            'rejected',
                            application.aiMatchScore
                        );
                    } catch (emailErr) {
                        console.error(`[JobRoutes] Auto-rejection scan email failed: ${emailErr.message}`);
                    }
                }
            }
        }

        await application.save();

        res.json({
            message: 'Scan completed successfully',
            analysis,
            applicationStatus: application.status
        });
    } catch (err) {
        console.error(`[JobRoutes] Error in /application/:id/scan: ${err.message}`);
        res.status(500).json({
            message: 'AI scanning failed',
            error: err.message
        });
    }
});

// @route   GET /api/jobs/application/:id
// @desc    Get detailed application/candidate profile
router.get('/application/:id', auth, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('user', '-password')
            .populate('job');

        if (!application) return res.status(404).json({ message: 'Application not found' });

        // Logic check: Candidate who applied OR Recruiter who posted the job
        const isCandidate = application.user._id.toString() === req.user.id;
        const isRecruiter = application.job.postedBy.toString() === req.user.id;

        if (!isCandidate && !isRecruiter) {
            return res.status(401).json({ message: 'User not authorized to view this application' });
        }

        res.json(application);
    } catch (err) {
        console.error(`[JobRoutes] Error in /application/:id: ${err.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
});

// --- Job Analytics Endpoints ---

// @route   POST /api/jobs/:id/view
// @desc    Track job view (increments view count)
router.post('/:id/view', auth, async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.user.id;

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        // Increment total views
        job.views += 1;

        // Track unique views
        if (!job.uniqueViews.includes(userId)) {
            job.uniqueViews.push(userId);
        }

        // Track daily views
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dailyViewIndex = job.analytics.dailyViews.findIndex(
            dv => dv.date.toDateString() === today.toDateString()
        );

        if (dailyViewIndex >= 0) {
            job.analytics.dailyViews[dailyViewIndex].count += 1;
        } else {
            job.analytics.dailyViews.push({ date: today, count: 1 });
        }

        await job.save();
        res.json({ message: 'View tracked', views: job.views });
    } catch (err) {
        console.error(`[JobRoutes] Error in /:id/view: ${err.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/jobs/recruiter/analytics/:jobId
// @desc    Get detailed analytics for a specific job
router.get('/recruiter/analytics/:jobId', recruiterAuth, async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.postedBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // Get applications for this job
        const applications = await Application.find({ job: req.params.jobId })
            .populate('user', 'experienceLevel createdAt');

        // Calculate analytics
        const totalApplications = applications.length;
        const uniqueViewsCount = job.uniqueViews.length;
        const viewToApplicationRate = job.views > 0
            ? ((totalApplications / job.views) * 100).toFixed(2)
            : 0;

        // Calculate applicant quality distribution
        const applicantQuality = {
            entry: 0,
            mid: 0,
            senior: 0,
            expert: 0
        };

        applications.forEach(app => {
            const level = app.user?.experienceLevel?.toLowerCase() || '';
            console.log(`[JobAnalytics] Calculating quality for applicant - Level: "${level}"`);

            if (level.includes('entry') || level.includes('beginner') || level.includes('junior') || level.includes('fresher')) {
                applicantQuality.entry++;
            } else if (level.includes('mid') || level.includes('intermediate') || level.includes('1-3') || level.includes('3-5')) {
                applicantQuality.mid++;
            } else if (level.includes('senior') || level.includes('lead') || level.includes('manager') || level.includes('5-10')) {
                applicantQuality.senior++;
            } else if (level.includes('expert') || level.includes('principal') || level.includes('director') || level.includes('10+')) {
                applicantQuality.expert++;
            } else {
                // If it doesn't clearly match any, maybe log it or put it in entry/mid by default?
                // For now, if no match, default to entry if they have no experience string
                console.log(`[JobAnalytics] Level "${level}" did not match any category, defaulting to entry.`);
                applicantQuality.entry++;
            }
        });

        // Calculate average time to apply (from job posting to application)
        let totalTimeToApply = 0;
        applications.forEach(app => {
            const timeDiff = new Date(app.createdAt) - new Date(job.createdAt);
            totalTimeToApply += timeDiff / (1000 * 60 * 60); // Convert to hours
        });
        const averageTimeToApply = totalApplications > 0
            ? (totalTimeToApply / totalApplications).toFixed(2)
            : 0;

        // Update job analytics
        job.analytics.totalApplications = totalApplications;
        job.analytics.viewToApplicationRate = parseFloat(viewToApplicationRate);
        job.analytics.averageTimeToApply = parseFloat(averageTimeToApply);
        job.analytics.applicantQuality = applicantQuality;

        await job.save();

        const analytics = {
            jobId: job._id,
            jobTitle: job.title,
            company: job.company,
            postedDate: job.createdAt,
            totalViews: job.views,
            uniqueViews: uniqueViewsCount,
            totalApplications,
            viewToApplicationRate: parseFloat(viewToApplicationRate),
            averageTimeToApply: parseFloat(averageTimeToApply),
            applicantQuality,
            dailyViews: job.analytics.dailyViews,
            dailyApplications: job.analytics.dailyApplications,
            status: job.status,
            location: job.location,
            type: job.type,
            salary: job.salary
        };

        res.json(analytics);
    } catch (err) {
        console.error(`[JobRoutes] Error in /recruiter/analytics/:jobId: ${err.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/jobs/recruiter/analytics
// @desc    Get analytics summary for all recruiter jobs
router.get('/recruiter/analytics', recruiterAuth, async (req, res) => {
    try {
        const jobs = await Job.find({ postedBy: req.user.id }).sort({ createdAt: -1 });

        const analyticsPromises = jobs.map(async (job) => {
            const applications = await Application.countDocuments({ job: job._id });

            return {
                jobId: job._id,
                title: job.title,
                company: job.company,
                views: job.views,
                uniqueViews: job.uniqueViews.length,
                applications,
                viewToApplicationRate: job.views > 0
                    ? ((applications / job.views) * 100).toFixed(2)
                    : 0,
                status: job.status,
                createdAt: job.createdAt,
                location: job.location,
                type: job.type
            };
        });

        const analytics = await Promise.all(analyticsPromises);

        // Calculate overall statistics
        const totalViews = analytics.reduce((sum, a) => sum + a.views, 0);
        const totalApplications = analytics.reduce((sum, a) => sum + a.applications, 0);
        const avgViewToAppRate = analytics.length > 0
            ? (analytics.reduce((sum, a) => sum + parseFloat(a.viewToApplicationRate), 0) / analytics.length).toFixed(2)
            : 0;

        res.json({
            jobs: analytics,
            summary: {
                totalJobs: jobs.length,
                totalViews,
                totalApplications,
                averageViewToApplicationRate: parseFloat(avgViewToAppRate),
                activeJobs: jobs.filter(j => j.status === 'active').length
            }
        });
    } catch (err) {
        console.error(`[JobRoutes] Error in /recruiter/analytics: ${err.message}`);
        console.error(err.stack);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/jobs/recruiter/performance
// @desc    Get performance metrics and rankings
router.get('/recruiter/performance', recruiterAuth, async (req, res) => {
    try {
        const jobs = await Job.find({ postedBy: req.user.id });

        const performanceData = await Promise.all(jobs.map(async (job) => {
            const applications = await Application.countDocuments({ job: job._id });
            const conversionRate = job.views > 0 ? (applications / job.views) * 100 : 0;

            return {
                jobId: job._id,
                title: job.title,
                views: job.views,
                applications,
                conversionRate: conversionRate.toFixed(2),
                daysActive: Math.floor((new Date() - new Date(job.createdAt)) / (1000 * 60 * 60 * 24)),
                status: job.status
            };
        }));

        // Sort by different metrics
        const topByViews = [...performanceData].sort((a, b) => b.views - a.views).slice(0, 5);
        const topByApplications = [...performanceData].sort((a, b) => b.applications - a.applications).slice(0, 5);
        const topByConversion = [...performanceData].sort((a, b) => b.conversionRate - a.conversionRate).slice(0, 5);

        res.json({
            topByViews,
            topByApplications,
            topByConversion,
            allJobs: performanceData
        });
    } catch (err) {
        console.error(`[JobRoutes] Error in /recruiter/performance: ${err.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/jobs/recruiter/candidate-action
// @desc    Consolidated candidate action (shortlist, interview, message, reject)
router.post('/recruiter/candidate-action', recruiterAuth, async (req, res) => {
    const { applicationId, action, interviewDate, interviewTime, interviewNotes, meetingLink } = req.body;

    try {
        const application = await Application.findById(applicationId).populate('job user');
        if (!application) return res.status(404).json({ message: 'Application not found' });

        // Verify recruiter owns this job
        if (application.job.postedBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        let responseData = { success: true, action };

        switch (action) {
            case 'shortlist': {
                // Automate slot assignment for shortlist as well
                const nextSlot = await getNextAvailableSlot(req.user.id);
                application.status = 'shortlisted';

                if (nextSlot) {
                    application.interviewDate = nextSlot.date;
                    application.interviewTime = nextSlot.time;
                    responseData.interviewDate = nextSlot.date;
                    responseData.interviewTime = nextSlot.time;

                    // Auto-generate Jitsi Meet link for shortlist if missing
                    if (!application.meetingLink) {
                        const autoLink = generateMeetingLink({
                            applicationId: application._id.toString(),
                            candidateName: application.user.firstName,
                            jobTitle: application.job.title
                        });
                        application.meetingLink = autoLink;
                        console.log(`🎥 Auto-generated Jitsi link for shortlist: ${autoLink}`);
                    }
                }

                await application.save();
                responseData.applicationStatus = 'shortlisted';

                // Send a notification/invite email if slot was assigned
                if (nextSlot) {
                    try {
                        await sendInterviewSlotEmail(
                            application.user.email,
                            application.user.firstName,
                            application.job.title,
                            application.job.companyName || application.job.company,
                            nextSlot.date,
                            nextSlot.time,
                            'Congratulations! You have been shortlisted for an interview.',
                            applicationId,
                            application.meetingLink || ''
                        );
                    } catch (emailErr) {
                        console.error(`[CandidateAction] Shortlist auto-email failed: ${emailErr.message}`);
                    }
                }
                break;
            }

            case 'interview': {
                // Dynamic Slot Engine uses getNextAvailableSlot helper
                let assignedDate = interviewDate;
                let assignedTime = interviewTime;

                // Only auto-compute if recruiter did NOT manually provide both date AND time
                if (!assignedDate || !assignedTime) {
                    const nextSlot = await getNextAvailableSlot(req.user.id);
                    assignedDate = nextSlot.date;
                    assignedTime = nextSlot.time;
                } else {
                    const available = await isSlotAvailable(req.user.id, assignedDate, assignedTime, applicationId);
                    if (!available) {
                        return res.status(400).json({ message: 'This interview slot is already booked for another candidate. Please select a different time.' });
                    }
                }

                application.status = 'interview';
                application.interviewDate = assignedDate;
                application.interviewTime = assignedTime;

                // Handle meeting link - use provided, existing, or auto-generate Jitsi link
                if (meetingLink) {
                    application.meetingLink = meetingLink;
                } else if (!application.meetingLink) {
                    // Auto-generate Jitsi Meet link
                    const autoLink = generateMeetingLink({
                        applicationId: application._id.toString(),
                        candidateName: application.user.firstName,
                        jobTitle: application.job.title
                    });
                    application.meetingLink = autoLink;
                    console.log(`🎥 Auto-generated Jitsi link for interview: ${autoLink}`);
                }

                application.interviewNotes = interviewNotes || '';
                await application.save();
                responseData.applicationStatus = 'interview';
                responseData.interviewDate = assignedDate;
                responseData.interviewTime = assignedTime;
                responseData.meetingLink = application.meetingLink;

                // Send interview confirmation email to candidate
                try {
                    await sendInterviewSlotEmail(
                        application.user.email,
                        application.user.firstName,
                        application.job.title,
                        application.job.companyName || application.job.company,
                        assignedDate,
                        assignedTime,
                        interviewNotes || '',
                        applicationId,
                        application.meetingLink
                    );
                } catch (emailErr) {
                    console.error(`[CandidateAction] Interview email failed: ${emailErr.message}`);
                }
                break;
            }

            case 'message': {
                const Chat = require('../models/Chat');
                let chat = await Chat.findOne({
                    participants: { $all: [req.user.id, application.user._id], $size: 2 }
                });
                if (!chat) {
                    chat = new Chat({
                        participants: [req.user.id, application.user._id],
                        messages: []
                    });
                    await chat.save();
                }
                responseData.chatId = chat._id;
                break;
            }

            case 'reject':
                application.status = 'rejected';
                await application.save();
                responseData.applicationStatus = 'rejected';
                break;

            case 'selected':
                application.status = 'selected';
                await application.save();
                responseData.applicationStatus = 'selected';
                break;

            case 'rejected after interview':
                application.status = 'rejected after interview';
                await application.save();
                responseData.applicationStatus = 'rejected after interview';
                break;

            default:
                return res.status(400).json({ message: 'Invalid action' });
        }

        // Send email notification for status changes
        if (['shortlist', 'interview', 'reject', 'selected', 'rejected after interview'].includes(action)) {
            try {
                await sendStatusUpdateEmail(
                    application.user.email,
                    application.user.firstName,
                    application.job.title,
                    application.job.companyName || application.job.company,
                    application.status,
                    application.status === 'rejected' ? application.aiMatchScore : null
                );
            } catch (emailErr) {
                console.error(`[CandidateAction] Email send failed: ${emailErr.message}`);
            }
        }

        res.json(responseData);
    } catch (err) {
        console.error(`[CandidateAction] Error: ${err.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/jobs/recruiter/interviews
// @desc    Get all scheduled interviews for the recruiter's calendar (only current/upcoming)
router.get('/recruiter/interviews', recruiterAuth, async (req, res) => {
    try {
        const recruiterJobs = await Job.find({ postedBy: req.user.id }).select('_id title companyName');
        const jobMap = {};
        recruiterJobs.forEach(j => { jobMap[j._id.toString()] = j; });
        const jobIds = recruiterJobs.map(j => j._id);

        const allInterviews = await Application.find({
            job: { $in: jobIds },
            status: { $in: ['interview', 'scheduled', 'shortlisted'] },
            interviewDate: { $exists: true, $ne: '' }
        })
            .populate('user', 'firstName lastName email photoUrl experienceLevel')
            .populate('job', 'title companyName')
            .sort({ interviewDate: 1, interviewTime: 1 });

        // Filter out past interviews - only return current/upcoming
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const interviews = allInterviews.filter(interview => {
            if (!interview.interviewDate) return false;
            
            // If interview date is in the future, include it
            if (interview.interviewDate > today) return true;
            
            // If interview date is today, check if time hasn't passed
            if (interview.interviewDate === today) {
                return interview.interviewTime >= currentTime;
            }
            
            // Past date, exclude
            return false;
        });

        res.json({ success: true, interviews });
    } catch (err) {
        console.error(`[RecruiterInterviews] Error: ${err.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/jobs/recruiter/next-slot
// @desc    Get the next available interview slot for pre-filling UI
router.get('/recruiter/next-slot', recruiterAuth, async (req, res) => {
    try {
        const nextSlot = await getNextAvailableSlot(req.user.id);
        res.json({ success: true, nextSlot });
    } catch (err) {
        console.error(`[JobRoutes] Error in /recruiter/next-slot: ${err.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/:id/recommendations', async (req, res) => {
    try {
        console.log(`[JobRoutes] Fetching recommendations for Job ID: ${req.params.id}`);
        const recommendations = await getRecommendedCandidates(req.params.id);
        console.log(`[JobRoutes] Found ${recommendations.length} recommendations`);
        res.json(recommendations);
    } catch (error) {
        console.error(`[JobRoutes] Recommendation Error: ${error.message}`, error);
        res.status(500).json({ message: error.message });
    }
});

// @route   PATCH /api/jobs/application/:id/cancel-interview
// @desc    Seeker cancels their scheduled interview
router.patch('/application/:id/cancel-interview', auth, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('job')
            .populate('user', 'firstName lastName');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Verify the user making the request owns the application
        if (application.user._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to modify this application' });
        }

        // Optional: Ensure it's currently at interview stage
        if (application.status !== 'interview' && application.status !== 'scheduled') {
            return res.status(400).json({ message: 'Cannot cancel an interview for this status' });
        }

        application.status = 'cancelled';
        application.interviewDate = '';
        application.interviewTime = '';
        application.meetingLink = '';
        await application.save();

        // Get recruiter to send email
        const job = await Job.findById(application.job._id).populate('postedBy', 'email');
        if (job && job.postedBy && job.postedBy.email) {
            const seekerName = `${application.user.firstName} ${application.user.lastName}`.trim();
            await sendInterviewCancelledEmail(job.postedBy.email, seekerName, job.title);
        }

        res.json({ message: 'Interview cancelled successfully', application });
    } catch (err) {
        console.error(`[CancelInterview] Error: ${err.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;

