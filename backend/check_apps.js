const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

async function checkApplications() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Application = require('./models/Application');
        const Job = require('./models/Job');
        const User = require('./models/User');

        const apps = await Application.find().populate('job').populate('user');
        console.log(`Total Applications: ${apps.length}`);

        if (apps.length > 0) {
            apps.slice(0, 5).forEach((app, i) => {
                console.log(`\nApplication ${i + 1}:`);
                console.log(`- ID: ${app._id}`);
                console.log(`- Job: ${app.job ? app.job.title : 'NULL'} (ID: ${app.job ? app.job._id : 'N/A'})`);
                console.log(`- User: ${app.user ? app.user.email : 'NULL'} (ID: ${app.user ? app.user._id : 'N/A'})`);
                if (app.job) {
                    console.log(`- Job Posted By: ${app.job.postedBy}`);
                }
            });
        }

        const recruitersWithJobs = await Job.distinct('postedBy');
        console.log(`\nUnique recruiters with jobs: ${recruitersWithJobs.length}`);

        for (const recId of recruitersWithJobs) {
            const jobCount = await Job.countDocuments({ postedBy: recId });
            const jobIds = (await Job.find({ postedBy: recId }).select('_id')).map(j => j._id);
            const appCount = await Application.countDocuments({ job: { $in: jobIds } });
            console.log(`Recruiter ${recId}: ${jobCount} jobs, ${appCount} applications`);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkApplications();
