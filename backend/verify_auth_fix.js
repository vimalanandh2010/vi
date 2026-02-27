const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function verifyFix() {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const testEmail = 'test_role_mismatch@example.com';
        const testGoogleId = 'test_google_id_123';

        // Clean up previous test data
        await User.deleteMany({ email: testEmail });
        console.log('Cleaned up previous test data');

        // 1. Create a seeker account
        const seeker = new User({
            firstName: 'Seeker',
            email: testEmail,
            googleId: testGoogleId,
            role: 'seeker',
            authProvider: 'google'
        });
        await seeker.save();
        console.log('Created Seeker account');

        // 2. Simulate Google login as recruiter (The scenario that used to fail)
        const targetRole = 'employer';
        console.log(`Simulating Google login as ${targetRole}...`);

        let user = await User.findOne({
            $or: [{ googleId: testGoogleId }, { email: testEmail }],
            role: targetRole
        });

        if (user) {
            console.error('FAILED: Should not have found an employer account');
        } else {
            console.log('SUCCESS: Did not find employer account (as expected)');

            // Create the employer account
            user = new User({
                firstName: 'Employer',
                email: testEmail,
                googleId: testGoogleId,
                role: targetRole,
                authProvider: 'google'
            });
            await user.save();
            console.log('SUCCESS: Created Employer account alongside Seeker account');
        }

        // Verify both exist
        const allAccounts = await User.find({ email: testEmail });
        console.log(`Verified counts: ${allAccounts.length} accounts found (Expected: 2)`);

        if (allAccounts.length === 2) {
            console.log('✅ Auth Fix Verified Successfully!');
        } else {
            console.error('❌ Auth Fix Verification Failed!');
        }

        // Cleanup
        await User.deleteMany({ email: testEmail });
        process.exit(0);
    } catch (err) {
        console.error('Verification Error:', err);
        process.exit(1);
    }
}

verifyFix();
