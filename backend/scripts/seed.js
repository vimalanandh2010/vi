const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Employer = require('../models/Employer');
const Job = require('../models/Job');
const Application = require('../models/Application');

dotenv.config();

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany();
        await Employer.deleteMany();
        await Job.deleteMany();
        await Application.deleteMany();
        console.log('🗑️  Existing data cleared.');

        // 1. Create Users
        const salt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash('admin123', salt);
        const seekerPassword = await bcrypt.hash('seeker123', salt);
        const employerPassword = await bcrypt.hash('employer123', salt);

        const admin = new User({
            firstName: 'System',
            lastName: 'Admin',
            email: 'admin@jobportal.com',
            password: adminPassword,
            phoneNumber: '1234567890',
            role: 'admin'
        });

        const seeker = new User({
            firstName: 'Rahul',
            lastName: 'Kumar',
            email: 'rahul@example.com',
            password: seekerPassword,
            phoneNumber: '9876543210',
            role: 'seeker',
            experienceLevel: 'fresher'
        });

        const employerUser = new User({
            firstName: 'Amit',
            lastName: 'Sharma',
            email: 'amit@techcorp.com',
            password: employerPassword,
            phoneNumber: '8888888888',
            role: 'employer'
        });

        await admin.save();
        await seeker.save();
        await employerUser.save();
        console.log('👤 Users created.');

        // 2. Create Employer Profile
        const employerProfile = new Employer({
            companyName: 'TechCorp Solutions',
            description: 'Leading IT services company specializing in Cloud and AI.',
            location: 'Bangalore, KA',
            website: 'https://techcorp.example.com',
            userId: employerUser._id
        });
        await employerProfile.save();
        console.log('🏢 Employer profile created.');

        // 3. Create Jobs
        const jobs = await Job.insertMany([
            {
                title: 'Senior React Developer',
                company: 'TechCorp Solutions',
                location: 'Bangalore, KA',
                type: 'Full Time',
                salary: '₹18L - ₹25L',
                description: 'We are looking for an experienced React developer to lead our frontend team.',
                tags: ['React', 'JavaScript', 'Tailwind'],
                postedBy: employerUser._id
            },
            {
                title: 'Node.js Backend Engineer',
                company: 'TechCorp Solutions',
                location: 'Remote',
                type: 'Full Time',
                salary: '₹15L - ₹22L',
                description: 'Join our backend team to build scalable microservices using Node.js and MongoDB.',
                tags: ['Node.js', 'Express', 'MongoDB'],
                postedBy: employerUser._id
            },
            {
                title: 'UI/UX Designer',
                company: 'Design Studio',
                location: 'Mumbai, MH',
                type: 'Internship',
                salary: '₹20k - ₹30k',
                description: 'Help us create beautiful and intuitive user interfaces for our clients.',
                tags: ['Figma', 'UI/UX', 'Adobe XD'],
                postedBy: employerUser._id
            }
        ]);
        console.log('💼 Jobs created.');

        // 4. Create Applications
        const application = new Application({
            job: jobs[0]._id,
            user: seeker._id,
            status: 'applied'
        });
        await application.save();
        console.log('📝 Application created.');

        console.log('✅ Seeding complete!');
        process.exit();
    } catch (err) {
        console.error('❌ Seeding error:', err);
        process.exit(1);
    }
};

seedDatabase();
