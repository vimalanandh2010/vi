const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function simulateApiCall() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Job = require('./models/Job');
        const Application = require('./models/Application');
        const User = require('./models/User');

        const recruiterId = '698d1ac565cdcceb7833143f'; // Known recruiter with 2 applications

        console.log(`Simulating /api/jobs/recruiter/applicants for Recruiter: ${recruiterId}`);

        // 1. Find all jobs posted by this recruiter
        const recruiterJobs = await Job.find({ postedBy: recruiterId }).select('_id');
        const jobIds = recruiterJobs.map(job => job._id);
        console.log(`Jobs found: ${jobIds.length}`);
        console.log(`Job IDs: ${jobIds}`);

        // 2. Find all applications for these jobs
        const applications = await Application.find({ job: { $in: jobIds } })
            .populate('user', 'firstName lastName email photoUrl aboutMe primarySkill experienceLevel education phoneNumber resumeUrl location preferredRole githubUrl linkedInUrl portfolioUrl')
            .populate('job', 'title company location type')
            .sort({ createdAt: -1 });

        console.log(`Applications found: ${applications.length}`);

        if (applications.length > 0) {
            applications.forEach((app, i) => {
                console.log(`Candidate ${i + 1}: ${app.user?.firstName} ${app.user?.lastName} for Job: ${app.job?.title}`);
            });
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

simulateApiCall();
