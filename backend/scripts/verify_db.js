const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Job = require('../models/Job'); // Adjust path as needed
const User = require('../models/User'); // We need a user to post the job

dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

const testStorage = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Find or Create a dummy Employer
        let employer = await User.findOne({ email: 'testemployer@example.com' });
        if (!employer) {
            console.log('Creating test employer...');
            employer = new User({
                firstName: 'Test',
                lastName: 'Employer',
                email: 'testemployer@example.com',
                password: 'password123', // In real app this should be hashed
                phoneNumber: '1234567890',
                role: 'employer'
            });
            await employer.save();
        }
        console.log('Using Employer ID:', employer._id);

        // 2. Create a Job
        const newJob = new Job({
            title: 'Test Storage Job',
            company: 'Test Corp',
            location: 'Remote',
            type: 'Full Time',
            description: 'This is a test job to verify storage.',
            postedBy: employer._id
        });

        // 3. Save to Database
        const savedJob = await newJob.save();
        console.log('✅ Job successfully saved to database!');
        console.log('Saved Job details:', savedJob);

    } catch (error) {
        console.error('❌ Storage Test Failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

testStorage();
