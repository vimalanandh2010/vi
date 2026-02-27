const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Job = require('./models/Job');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const inspectJobs = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const jobs = await Job.find({});
        console.log(`Total jobs found: ${jobs.length}`);

        if (jobs.length > 0) {
            console.log('Sample Job:', JSON.stringify(jobs[0], null, 2));
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
};

inspectJobs();
