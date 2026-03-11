const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Company = require('../models/Company');
const User = require('../models/User');

dotenv.config();

const uploadCompanies = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB...');

        // Find a default admin user to associate with "createdBy"
        let adminUser = await User.findOne({ role: 'admin' });
        
        if (!adminUser) {
            console.log('⚠️ No admin user found. Finding first available user...');
            adminUser = await User.findOne();
        }

        if (!adminUser) {
            console.error('❌ Error: No user found in database. Please create a user first.');
            process.exit(1);
        }

        console.log(`👤 Using user: ${adminUser.email} (${adminUser._id})`);

        // Read JSON file
        const dataPath = path.join(__dirname, '../data/companies.json');
        const companiesData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        // Prepare data with createdBy field
        const companiesToUpload = companiesData.map(company => ({
            ...company,
            createdBy: adminUser._id,
            verified: true,
            verificationStatus: 'verified'
        }));

        // Insert into database
        const result = await Company.insertMany(companiesToUpload);
        console.log(`🚀 Successfully uploaded ${result.length} companies!`);

        process.exit();
    } catch (err) {
        console.error('❌ Error uploading companies:', err);
        process.exit(1);
    }
};

uploadCompanies();
