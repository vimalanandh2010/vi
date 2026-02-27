const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

async function testApiUpdate() {
    const token = 'YOUR_TEST_TOKEN'; // I need to get a token or bypass auth for testing
    // Actually, I'll just call the controller function directly in a script
}

// Better yet, let's just use the controller directly
const { updateProfile } = require('./controllers/jobseekerController');
const mongoose = require('mongoose');
const User = require('./models/User');

async function simulateController() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ email: /vimalanandh/i });
        if (!user) return console.log('User not found');

        const req = {
            user: { id: user._id },
            body: { preferredRole: 'Frontend Master' }
        };
        const res = {
            json: (data) => console.log('Response JSON:', JSON.stringify(data, null, 2)),
            status: (code) => ({ json: (data) => console.log(`Response ${code}:`, data) })
        };

        console.log('--- Simulating updateProfile ---');
        await updateProfile(req, res);

        const checkUser = await User.findById(user._id);
        console.log('Field in DB after update:', checkUser.preferredRole);

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
}

simulateController();
