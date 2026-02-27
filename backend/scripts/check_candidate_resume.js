require('dotenv').config();
const mongoose = require('mongoose');
const Application = require('./models/Application');
const User = require('./models/User');

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jobportal');
        console.log('Connected to DB');

        const user = await User.findOne({ email: 'sabarnad976@gmail.com' });
        if (user) {
            console.log('User found:', user.firstName, user.lastName);
            console.log('Resume URL:', user.resumeUrl);

            // fetch with axios
            const axios = require('axios');
            try {
                if (user.resumeUrl) {
                    console.log('Testing resume fetch...');
                    const res = await axios.get(user.resumeUrl, { responseType: 'arraybuffer' });
                    console.log('Fetch successful, status:', res.status, 'Content-Type:', res.headers['content-type']);
                }
            } catch (e) {
                console.error('Fetch failed:', e.message);
            }
        } else {
            console.log('User not found');
            // Try fetching all applications
            const apps = await Application.find().populate('user').sort({ createdAt: -1 }).limit(5);
            console.log(apps.map(a => `${a.user?.email} - Scanned: ${a.aiMatchScore}`));
        }
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}
test();
