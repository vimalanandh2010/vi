const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Company = require('./models/Company');

async function debug() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal');
        console.log('Connected to MongoDB');

        // Find recruiters
        const recruiters = await User.find({ role: 'employer' }).populate('company');
        console.log('Recruiters found:', recruiters.length);

        recruiters.forEach(r => {
            console.log(`User: ${r.email}, ID: ${r._id}`);
            console.log(`Company Reference (raw): ${r.toObject().company}`);
            console.log(`Company Populated: ${r.company ? r.company.name : 'NULL'}`);
            if (r.company) {
                console.log(`Company ID: ${r.company._id}`);
            }
            console.log('---');
        });

        const companies = await Company.find();
        console.log('Total Companies in DB:', companies.length);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

debug();
