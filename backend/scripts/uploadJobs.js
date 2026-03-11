const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Job = require('../models/Job');
const Company = require('../models/Company');
const User = require('../models/User');

dotenv.config();

const uploadJobs = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB...');

        // Find a default admin user to associate with "postedBy"
        let adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            adminUser = await User.findOne({ role: { $in: ['admin', 'employer'] } });
        }
        if (!adminUser) {
            console.error('❌ Error: No admin or employer user found in database. Please create a user first.');
            process.exit(1);
        }

        console.log(`👤 Using user for posting: ${adminUser.email} (${adminUser._id})`);

        // Read JSON file
        const dataPath = path.join(__dirname, '../data/jobs.json');
        const jobsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        const jobsToUpload = [];

        for (const job of jobsData) {
            process.stdout.write(`🔍 Finding company: "${job.companyName}"... `);
            const company = await Company.findOne({ name: job.companyName });
            
            if (!company) {
                console.log('❌ NOT FOUND');
                console.warn(`⚠️ Warning: Company "${job.companyName}" not found. Skipping job "${job.title}".`);
                continue;
            }
            console.log('✅ FOUND');

            // Construct salary string like ₹18L - ₹25L
            let salaryString = '';
            if (job.minSalary && job.maxSalary) {
                salaryString = `₹${job.minSalary}L - ₹${job.maxSalary}L`;
            } else if (job.minSalary) {
                salaryString = `₹${job.minSalary}L+`;
            }

            jobsToUpload.push({
                ...job,
                company: company._id,
                companyName: company.name,
                salary: salaryString || job.salary,
                postedBy: adminUser._id,
                status: 'active'
            });
        }

        if (jobsToUpload.length === 0) {
            console.log('🛑 No jobs matched with existing companies. Check your company names.');
            process.exit(0);
        }

        // Insert into database
        console.log(`🚀 Inserting ${jobsToUpload.length} jobs into database...`);
        const result = await Job.insertMany(jobsToUpload);
        console.log(`✨ Successfully uploaded ${result.length} jobs!`);

        process.exit();
    } catch (err) {
        console.error('❌ Error uploading jobs:', err);
        process.exit(1);
    }
};

uploadJobs();
