const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const { getRecommendedCandidates } = require('../services/matchingService');

const test = async () => {
    try {
        console.log('Connecting to', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected');
        const results = await getRecommendedCandidates('699ea70c175e2f19e3d7755d');
        console.log('Recommendations found:', results.length);
        if (results.length > 0) {
            console.log(results[0]);
        }

        // Also let's check total seekers
        const User = require('../models/User');
        const Job = require('../models/Job');

        const job = await Job.findById('699ea70c175e2f19e3d7755d');
        console.log('Job:', job.title, job.requiredSkills);

        const count = await User.countDocuments({ role: 'seeker' });
        console.log('Total seekers in DB:', count);

        const someSeekers = await User.find({ role: 'seeker' }).limit(2).lean();
        console.log('Some seekers:', someSeekers.map(s => ({ title: s.preferredRole, exp: s.experienceLevel, skills: s.skills })));

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
};

test();
