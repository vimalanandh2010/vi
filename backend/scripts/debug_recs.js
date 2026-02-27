const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');

const { calculateMatchScore, getRecommendedCandidates } = require('../services/matchingService');

async function debug() {
    let output = '';
    const log = (msg) => {
        console.log(msg);
        output += msg + '\n';
    };

    try {
        log('Connecting to DB...');
        await mongoose.connect(process.env.MONGO_URI);
        log('Connected successfully!');

        const jobId = '699ea70c175e2f19e3d7755d';

        const Job = require('../models/Job');
        const job = await Job.findById(jobId);
        if (!job) {
            log('Job not found in DB!');
        } else {
            log('Job Title: ' + job.title + ' | Required Skills: ' + JSON.stringify(job.requiredSkills));

            const User = require('../models/User');
            const seekers = await User.find({ role: 'seeker' }).limit(5);
            log('Found ' + seekers.length + ' seekers for sample.');

            if (seekers.length > 0) {
                const s = seekers[0];
                log('Sample Seeker Name: ' + s.firstName + ' ' + s.lastName);
                log('Sample Seeker Skills: ' + JSON.stringify(s.skills));
                const score = calculateMatchScore(job, s);
                log('Score logic result: ' + JSON.stringify(score));
            }

            log('Running full getRecommendedCandidates...');
            const recs = await getRecommendedCandidates(jobId);
            log('Recommendations returned: ' + recs.length);
        }

    } catch (e) {
        log('ERROR: ' + e.message);
        log(e.stack);
    } finally {
        await mongoose.disconnect();
        fs.writeFileSync(require('path').join(__dirname, 'debug_output.txt'), output);
        log('Done. Output saved.');
    }
}

debug();
