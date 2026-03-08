const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from the same directory
dotenv.config();

const User = require('./models/User');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jobportal';

async function verifyStorage() {
    console.log('Connecting to MongoDB:', MONGO_URI);
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB successfully.');

        const testEmail = `test_user_storage_${Date.now()}@example.com`;
        const testUser = new User({
            firstName: 'Test',
            lastName: 'User',
            email: testEmail,
            role: 'seeker',
            phoneNumber: '1234567890'
        });

        console.log('Attempting to save test user:', testEmail);
        const savedUser = await testUser.save();
        console.log('User saved successfully with ID:', savedUser._id);

        // Verify existence
        const foundUser = await User.findOne({ email: testEmail });
        if (foundUser) {
            console.log('Verification: User found in database.');
        } else {
            console.error('Verification: User NOT found in database after save.');
            process.exit(1);
        }

        // Cleanup
        await User.deleteOne({ _id: savedUser._id });
        console.log('Test user cleaned up.');

        await mongoose.connection.close();
        console.log('Done.');
        process.exit(0);
    } catch (err) {
        console.error('Error during verification:', err);
        process.exit(1);
    }
}

verifyStorage();
