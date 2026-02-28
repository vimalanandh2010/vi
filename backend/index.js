const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const http = require('http');
const { initSocket } = require('./utils/socket');
const startInterviewReminders = require('./cron/interviewReminders');
const { router: chatRouter, setSocketIO } = require('./chat-module/routes');
const { router: communityChatRouter } = require('./community-chat/routes');

const envResult = dotenv.config({ path: path.resolve(__dirname, '.env') });
if (envResult.error) {
    if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️ No .env file found. Using system environment variables.');
    } else {
        console.log('✅ Using Render Environment Variables');
    }
} else {
    console.log('✅ .env file loaded successfully');
}

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Body Parsers (Move to TOP to avoid parsing issues)
app.set("trust proxy", 1);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Debug middleware to log ALL bodies (Temporary)
app.use((req, res, next) => {
    if (req.method === 'POST') {
        console.log(`[DEBUG] POST ${req.url} Body keys:`, Object.keys(req.body));
    }
    next();
});

// Initialize Socket.IO
const io = initSocket(server);

// Configure strictly User ID based Socket.io for the new chat module
setSocketIO(io);
io.on('connection', (socket) => {
    // Join a private room natively using User_ID
    socket.on('joinPrivateChat', (userId) => {
        if (userId) {
            socket.join(userId.toString());
            console.log(`[Socket] User joined private User_ID chat room: ${userId}`);
        }
    });

    // Support legacy Community Group Rooms (optional, user requested explicit 1-on-1 focus but good to keep alive if needed)
    socket.on('joinCommunity', (communityId) => {
        if (communityId) {
            socket.join(`community_${communityId}`);
            console.log(`[Socket] User joined community: ${communityId}`);
        }
    });
});

// Security Middleware - Hardened but tuned for OAuth & Fonts
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "default-src": ["'self'"],
            "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://accounts.google.com", "https://www.gstatic.com", "https://apis.google.com"],
            "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
            "font-src": ["'self'", "https://fonts.gstatic.com", "https://fonts.googleapis.com", "data:"],
            "img-src": ["'self'", "data:", "https://lh3.googleusercontent.com", "https://*.supabase.co", "https://www.google.com"],
            "connect-src": [
                "'self'",
                "http://localhost:5000",
                "http://localhost:5173",
                "ws://localhost:5000",
                "ws://localhost:5173",
                "https://accounts.google.com",
                "https://*.supabase.co",
                "https://*.onrender.com",
                "wss://*.onrender.com",
                "https://backend-portal-56ud.onrender.com",
                "wss://backend-portal-56ud.onrender.com",
                process.env.FRONTEND_URL?.trim().replace(/[\r\n]/g, ""),
                process.env.BACKEND_URL?.trim().replace(/[\r\n]/g, "")
            ].filter(Boolean),
            "frame-src": ["'self'", "https://accounts.google.com", "https://*.supabase.co"],
            "object-src": ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Middleware (Remaining)
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            /^http:\/\/localhost:\d+$/,
            /^http:\/\/127\.0\.0\.1:\d+$/,
            process.env.FRONTEND_URL?.trim().replace(/[\r\n]/g, ""),
            process.env.FRONTEND_URL?.trim().replace(/[\r\n]/g, "").replace(/\/$/, ""), // Remove trailing slash if present
            "https://frontend-portal-b2az.onrender.com" // Actual production frontend URL
        ].filter(Boolean);

        const isAllowed = allowedOrigins.some(pattern => {
            if (pattern instanceof RegExp) return pattern.test(origin);
            return pattern === origin;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            console.log('CORS blocked for origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
    credentials: true
}));
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});
app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, 'public')));
const passport = require('./config/passport');
app.use(passport.initialize());

// MongoDB Connection
// MongoDB Connection
// MongoDB Connection
const connectDB = async (retryCount = 0) => {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!uri) {
            console.error('❌ MongoDB URI is missing in .env');
            return;
        }
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error(`❌ MongoDB Connection Error (Attempt ${retryCount + 1}):`, err.message);
        const retryDelay = Math.min(Math.pow(2, retryCount) * 1000, 30000); // Exponential backoff max 30s
        console.log(`🔄 Retrying in ${retryDelay / 1000}s...`);
        setTimeout(() => connectDB(retryCount + 1), retryDelay);
    }
};

connectDB();

mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB Disconnected!');
});

mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB Reconnected!');
});

// Start Background Cron Jobs
startInterviewReminders();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/jobseeker', require('./routes/jobseekerRoutes'));
app.use('/api/employer', require('./routes/employerRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/chat', chatRouter); // NEW STRICT 1-on-1 CHAT MODULE
app.use('/api/community-chat', communityChatRouter); // Retain isolation
app.use('/api/community', require('./routes/communityRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/companies', require('./routes/companyRoutes'));
app.use('/api/verification', require('./routes/verificationRoutes'));
app.use('/api/community-hub', require('./community-module/routes')); // Community Feed based on prompt
app.use('/api/bot-chat', require('./routes/chatbotRoutes')); // Seeker AI Helper Chatbot

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        email: 'ready', // Assuming email is ready as per logs
        timestamp: new Date().toISOString()
    });
});
app.get('/api/seed-matching', async (req, res) => {
    try {
        const User = require('./models/User');
        const Job = require('./models/Job');
        const Application = require('./models/Application');
        const Company = require('./models/Company');

        // 1. Create Recruiter
        const recruiter = await User.findOneAndUpdate(
            { email: 'recruiter_dummy@example.com' },
            {
                firstName: 'Vimalanandh',
                lastName: 'Recruiter',
                role: 'employer',
                companyName: 'Future Milestone Tech'
            },
            { upsert: true, new: true }
        );

        // 2. Create Company
        const company = await Company.findOneAndUpdate(
            { name: 'Future Milestone Tech' },
            {
                name: 'Future Milestone Tech',
                location: 'Bangalore, India',
                website: 'https://futuremilestone.com',
                description: 'A leading tech company focusing on AI and full-stack solutions.'
            },
            { upsert: true, new: true }
        );

        // 3. Create Job
        const job = await Job.findOneAndUpdate(
            { title: 'Lead Full Stack Engineer', postedBy: recruiter._id },
            {
                title: 'Lead Full Stack Engineer',
                company: company._id,
                companyName: company.name,
                location: 'Remote',
                type: 'Full-time',
                category: 'IT',
                salary: '₹30L - ₹45L',
                description: 'We are looking for a Lead Full Stack Engineer to lead our development team...',
                requirements: ['10+ years of experience', 'Expert in MERN stack', 'Lead team of 10+'],
                skills: ['React', 'Node.js', 'MongoDB', 'AWS', 'System Design'],
                experienceLevel: 'senior',
                postedBy: recruiter._id,
                isActive: true
            },
            { upsert: true, new: true }
        );

        // 4. Create Seeker
        const seeker = await User.findOneAndUpdate(
            { email: 'vimalanandh_dummy@example.com' },
            {
                firstName: 'Vimalanandh',
                lastName: 'K',
                role: 'seeker',
                location: 'Namakkal',
                experienceLevel: 'senior',
                aboutMe: 'Motivated MERN stack developer with 2+ years of experience in building scalable web applications. Passionate about AI integration and clean code.',
                primarySkill: 'MERN Stack',
                skills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'Tailwind CSS', 'Redux', 'Socket.io'],
                experience: [
                    {
                        company: 'Tech Solutions Inc',
                        role: 'Senior Software Developer',
                        duration: 'Jan 2022 - Present',
                        description: 'Architected and implemented high-performance React components. Led a team of 3 developers for a fintech project.'
                    }
                ],
                education: [
                    {
                        institutionName: 'KSR College of Engineering',
                        degreeName: 'B.E. in Information Technology',
                        yearOfPassing: 2022,
                        score: '8.5 CGPA'
                    }
                ],
                projects: [
                    {
                        title: 'AI-Powered Job Portal',
                        description: 'A comprehensive job portal with AI-driven resume matching and chat functionality.',
                        technologies: ['React', 'Node.js', 'Mongoose', 'Socket.io', 'Puter.js']
                    }
                ]
            },
            { upsert: true, new: true }
        );

        // 5. Create Application
        const application = await Application.findOneAndUpdate(
            { job: job._id, user: seeker._id },
            {
                job: job._id,
                user: seeker._id,
                status: 'applied',
                aiMatchScore: 92,
                aiAnalysis: {
                    skillsMatch: 95,
                    experienceMatch: 90,
                    summary: 'Highly qualified candidate with direct experience in the required stack.'
                },
                resumeUrl: 'https://res.cloudinary.com/demo/image/upload/sample.pdf'
            },
            { upsert: true, new: true }
        );

        res.json({
            success: true,
            message: 'Dummy matching data seeded successfully',
            recruiterId: recruiter._id,
            jobId: job._id,
            seekerId: seeker._id,
            applicationId: application._id
        });
    } catch (err) {
        console.error('Seed Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});


// Health Check Aliases
app.get('/health', (req, res) => res.redirect('/api/health'));

// Auth Aliases
app.post('/api/login', (req, res) => res.redirect(308, '/api/auth/login'));

// Test Route
app.get('/', (req, res) => {
    res.json({ message: 'Future Milestone API is running' });
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(`[Global Error Handler] ${err.stack || err}`);
    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong on the server'
    });
});

const PORT_NUM = process.env.PORT || 5000;

server.listen(PORT_NUM, () => {
    console.log(`✅ Server active on port ${PORT_NUM}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Server Error: Port ${PORT_NUM} is currently in use. Please kill the process using this port before starting the server.`);
        process.exit(1);
    } else {
        console.error('❌ Server Error:', err);
    }
});
