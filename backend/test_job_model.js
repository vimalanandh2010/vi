const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Job = require('./models/Job');
const User = require('./models/User');
const Company = require('./models/Company');

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function testJobSave() {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ role: 'employer' });
        if (!user) {
            console.error('No employer user found to test with');
            process.exit(1);
        }

        const company = await Company.findOne();
        if (!company) {
            console.error('No company found to test with');
            process.exit(1);
        }

        const newJob = new Job({
            title: 'Test Job',
            company: company._id,
            companyName: company.name,
            location: 'Remote',
            type: 'Full Time',
            salary: '₹10L+',
            minSalary: 10,
            maxSalary: 20,
            experienceLevel: 'Entry Level',
            description: 'Test description',
            tags: ['test'],
            requirements: ['test req'],
            category: 'IT',
            postedBy: user._id
        });

        await newJob.save();
        console.log('✅ Job saved successfully in test script');

        // Clean up
        await Job.deleteOne({ _id: newJob._id });
        console.log('Cleaned up test job');

    } catch (err) {
        console.error('❌ Error during job save test:', err);
    } finally {
        await mongoose.disconnect();
    }
}

testJobSave();
