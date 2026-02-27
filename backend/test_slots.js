const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');

async function testSlot() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const recruiter = await User.findOne({ role: 'employer' });
        if (!recruiter) {
            console.log('No recruiter found to test');
            process.exit(0);
        }

        console.log(`Testing for recruiter: ${recruiter.firstName} (${recruiter._id})`);

        // We need to simulate the environment of jobRoutes.js
        // Since we can't easily import the internal function, let's just check the DB state
        const recruiterJobIds = (await Job.find({ postedBy: recruiter._id }).select('_id')).map(j => j._id);
        console.log(`Jobs found: ${recruiterJobIds.length}`);

        // Call the endpoint if server is running? No, let's just run the code logic
        // I will copy the function here to test it
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
}

testSlot();
