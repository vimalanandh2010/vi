const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Company = require('../models/Company');

dotenv.config();

const linkCompany = async () => {
    const userEmail = process.argv[2];
    const companyName = process.argv[3];

    if (!userEmail || !companyName) {
        console.log('Usage: node scripts/linkCompanyToUser.js <user_email> <company_name>');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB...');

        const user = await User.findOne({ email: userEmail });
        if (!user) {
            console.error(`❌ User with email ${userEmail} not found.`);
            process.exit(1);
        }

        const company = await Company.findOne({ name: companyName });
        if (!company) {
            console.error(`❌ Company with name "${companyName}" not found.`);
            process.exit(1);
        }

        user.company = company._id;
        user.companyName = company.name;
        user.role = 'employer'; // Ensure they have employer role
        await user.save();

        console.log(`✅ Successfully linked User ${userEmail} to Company "${companyName}" as an employer.`);
        process.exit();
    } catch (err) {
        console.error('❌ Error linking company:', err);
        process.exit(1);
    }
};

linkCompany();
