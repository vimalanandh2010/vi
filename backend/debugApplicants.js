const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Job = require('./models/Job');
const Application = require('./models/Application');
const User = require('./models/User');

dotenv.config();

const debugApplicants = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const recruiter = await User.findOne({ email: 'recruiter_dummy@example.com' });
        if (!recruiter) {
            console.log('Recruiter not found');
            process.exit(1);
        }

        const recruiterJobs = await Job.find({ postedBy: recruiter._id }).select('_id');
        const jobIds = recruiterJobs.map(job => job._id);

        const applications = await Application.find({ job: { $in: jobIds } })
            .populate('user', 'firstName lastName email photoUrl aboutMe primarySkill experienceLevel education phoneNumber resumeUrl location preferredRole githubUrl linkedInUrl portfolioUrl projects experience accomplishments certifications')
            .populate('job', 'title company location type description requirements')
            .sort({ createdAt: -1 });

        console.log(`Found ${applications.length} applications`);

        if (applications.length > 0) {
            const app = applications[0];
            console.log('--- Application Detail ---');
            console.log('ID:', app._id);
            console.log('Status:', app.status);
            console.log('User Name:', app.user?.firstName, app.user?.lastName);
            console.log('User Location:', app.user?.location);
            console.log('User AboutMe:', app.user?.aboutMe);
            console.log('User Experience Length:', app.user?.experience?.length);
            console.log('User Education Length:', app.user?.education?.length);
            console.log('User Projects Length:', app.user?.projects?.length);
            console.log('User Object Keys:', Object.keys(app.user?.toObject() || {}));
        }

        process.exit(0);
    } catch (error) {
        console.error('Debug failed:', error);
        process.exit(1);
    }
};

debugApplicants();
