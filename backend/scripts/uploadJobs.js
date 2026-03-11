const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Job = require('../models/Job');
const Company = require('../models/Company');

const uploadJobs = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const dataPath = path.join(__dirname, '..', 'data', 'jobs.json');
        const jobsData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

        for (const job of jobsData) {
            process.stdout.write(`🔍 Finding company: "${job.companyName}"... `);
            const company = await Company.findOne({ name: job.companyName });
            
            if (!company) {
                console.warn(`⚠️ Warning: Company "${job.companyName}" not found. Skipping job: ${job.title}`);
                continue;
            }

            const exists = await Job.findOne({ title: job.title, company: company._id });
            if (!exists) {
                await Job.create({
                    ...job,
                    company: company._id,
                    companyName: company.name,
                    status: 'active'
                });
                console.log(`🚀 Created job: ${job.title} at ${company.name}`);
            } else {
                console.log(`ℹ️ Job already exists: ${job.title} at ${company.name}`);
            }
        }

        console.log('✅ Job upload complete');
        process.exit();
    } catch (err) {
        console.error('❌ Error uploading jobs:', err);
        process.exit(1);
    }
};

uploadJobs();
