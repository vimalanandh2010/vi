const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function testVirtual() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const testUser = new User({
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            phoneNumber: '1234567890',
            location: 'Chennai',
            preferredRole: 'Developer',
            primarySkill: 'React',
            experienceLevel: 'fresher',
            education: {
                degree: {
                    degreeName: 'B.Tech',
                    collegeName: 'IIT'
                }
            },
            resumeUrl: 'http://example.com/resume.pdf'
        });

        console.log('User data set. Checking isProfileComplete...');
        console.log('isProfileComplete:', testUser.isProfileComplete);

        if (testUser.isProfileComplete) {
            console.log('✅ Virtual property works correctly!');
        } else {
            console.log('❌ Virtual property logic failed. Check field requirements.');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

testVirtual();
