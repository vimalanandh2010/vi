const { extractText } = require('./services/documentParser');
const mongoose = require('mongoose');
const User = require('./models/User');
const Application = require('./models/Application');

async function debugResume() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/jobportal');
        console.log('Connected to DB');

        // Let's find Sabarna's application
        const testUser = await User.findOne({ email: 'sabarnad976@gmail.com' });
        if (!testUser) {
            console.log('User not found');
            return;
        }

        console.log('User resumeUrl:', testUser.resumeUrl);

        if (!testUser.resumeUrl || !testUser.resumeUrl.includes('supabase')) {
            console.log('Resume URL is either missing or not a Supabase URL.');
            const apps = await Application.find({ user: testUser._id }).sort({ createdAt: -1 });
            console.log('User applications:', apps.map(a => `${a._id} (Score: ${a.aiMatchScore}) (app.resumeUrl: ${a.resumeUrl})`));
            return;
        }

        console.log('Testing extraction on:', testUser.resumeUrl);
        const text = await extractText(testUser.resumeUrl);
        console.log('Extracted text preview:', text.substring(0, 100));

    } catch (e) {
        console.error('Extraction test failed:', e.message);
    } finally {
        process.exit(0);
    }
}
debugResume();
