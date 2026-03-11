const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Company = require('../models/Company');

const uploadCompanies = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const dataPath = path.join(__dirname, '..', 'data', 'companies.json');
        const companiesData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

        for (const company of companiesData) {
            const exists = await Company.findOne({ name: company.name });
            if (!exists) {
                await Company.create(company);
                console.log(`🚀 Created company: ${company.name}`);
            } else {
                console.log(`ℹ️ Company already exists: ${company.name}`);
            }
        }

        console.log('✅ Company upload complete');
        process.exit();
    } catch (err) {
        console.error('❌ Error uploading companies:', err);
        process.exit(1);
    }
};

uploadCompanies();
