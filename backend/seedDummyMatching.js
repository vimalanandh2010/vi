const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Company = require('./models/Company');
const Job = require('./models/Job');
const Application = require('./models/Application');

dotenv.config();

const seedDummyMatching = async () => {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jobportal';
        console.log('Attempting to connect to MongoDB:', uri);

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
        });
        console.log('✅ Connected to MongoDB');

        // 1. Create Recruiter
        const recruiter = await User.findOneAndUpdate(
            { email: 'recruiter_dummy@example.com' },
            {
                firstName: 'Recruiter',
                lastName: 'Dummy',
                password: 'password123',
                role: 'employer',
                companyName: 'Tech Solutions Inc.',
                chatId: 'recruiter_dummy'
            },
            { upsert: true, new: true }
        );

        // 2. Create Company
        const company = await Company.findOneAndUpdate(
            { createdBy: recruiter._id },
            {
                name: 'Tech Solutions Inc.',
                about: 'Leading technology solutions provider specializing in full-stack development and cloud services.',
                companyType: 'Enterprise',
                industries: ['Web/SaaS', 'AI/ML'],
                size: '501-1000',
                location: 'Namakkal',
                website: 'https://techsolutions.example.com',
                officialEmail: 'hiring@techsolutions.example.com',
                verificationStatus: 'verified',
                verified: true,
                createdBy: recruiter._id
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
                type: 'Full Time',
                salary: '$120k - $160k',
                description: 'We are looking for a Lead Full Stack Engineer to drive our technical vision...',
                experienceLevel: 'Senior Level',
                tags: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS', 'Git'],
                requirements: [
                    '5+ years of experience in MERN stack',
                    'Strong leadership skills',
                    'Experience with AWS and Docker'
                ],
                postedBy: recruiter._id,
                status: 'active'
            },
            { upsert: true, new: true }
        );

        // 4. Create Seeker (Vimalanandh K)
        const seeker = await User.findOneAndUpdate(
            { email: 'vimalanandh_dummy@example.com' },
            {
                firstName: 'Vimalanandh',
                lastName: 'K',
                password: 'password123',
                role: 'seeker',
                location: 'Namakkal',
                experienceLevel: 'senior',
                preferredRole: 'Senior Software Developer',
                primarySkill: 'JavaScript, React, Node.js, Express, MongoDB, TypeScript, AWS, Docker, Tailwind, Redux, Git',
                aboutMe: 'Motivated MERN stack developer with hands-on experience building scalable web applications. Strong in React, Node.js, and API development with a focus on performance.',
                chatId: 'vimalanandh_k',
                experience: [
                    {
                        company: 'Tech Solutions Inc.',
                        role: 'Senior Software Developer',
                        duration: '2021 - Present',
                        description: 'Led a team of 3 developers to build a real-time chat application using Redux and Tailwind CSS.'
                    }
                ],
                education: [
                    {
                        institutionName: 'Namakkal University',
                        degreeName: 'B.Tech IT',
                        yearOfPassing: 2021,
                        score: '8.5 CGPA',
                        level: 'Graduation'
                    }
                ],
                projects: [
                    {
                        title: 'Matchmaker ATS',
                        description: 'AI-powered job portal with OTP authentication and real-time chat.',
                        technologies: ['React', 'Node.js', 'Express', 'MongoDB']
                    }
                ]
            },
            { upsert: true, new: true }
        );
        console.log('✅ Seeker synchronized:', seeker.firstName, seeker.lastName, seeker._id);

        // 5. Create Application with high ATS score
        const application = await Application.findOneAndUpdate(
            { job: job._id, user: seeker._id },
            {
                job: job._id,
                user: seeker._id,
                status: 'applied',
                resumeUrl: 'https://example.com/resumes/vimalanandh_resume.pdf',
                aiMatchScore: 92,
                aiAnalysis: {
                    atsScore: 92,
                    geniusScore: 92,
                    roleMatchPercentage: 92,
                    candidateType: 'Experienced',
                    detectedRole: 'Lead Full Stack Engineer',
                    matchedSkills: ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'AWS', 'Docker', 'Tailwind', 'Redux', 'Git'],
                    missingKeywords: ['Problem Solving', 'Teamwork', 'Agile'],
                    finalVerdict: 'Highly Qualified'
                }
            },
            { upsert: true, new: true }
        );

        console.log('Dummy matching data seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding dummy matching data:', error);
        process.exit(1);
    }
};

seedDummyMatching();
