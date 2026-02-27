const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

async function testAuth() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if users exist
        const userCount = await User.countDocuments();
        console.log(`📊 Total users in database: ${userCount}`);

        // Get a sample user
        const sampleUser = await User.findOne().select('-password');
        if (sampleUser) {
            console.log('👤 Sample user:', {
                id: sampleUser._id,
                name: `${sampleUser.firstName} ${sampleUser.lastName}`,
                email: sampleUser.email,
                role: sampleUser.role
            });
        } else {
            console.log('⚠️ No users found in database');
        }

        // Test authentication flow
        console.log('\n🔐 Authentication System Status:');
        console.log('- JWT_SECRET configured:', !!process.env.JWT_SECRET);
        console.log('- Google OAuth configured:', !!process.env.GOOGLE_CLIENT_ID);
        console.log('- MongoDB connection:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');

        mongoose.connection.close();
        console.log('\n✅ Test completed successfully');
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testAuth();
