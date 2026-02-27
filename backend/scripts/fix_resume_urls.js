const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const fixResumeUrls = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({ resumeUrl: { $regex: /^\/uploads\/resumes\// } });
        console.log(`Found ${users.length} users with local resume URLs`);

        for (const user of users) {
            const localUrl = user.resumeUrl;
            const fileName = localUrl.split('/').pop();
            // Assuming the file was uploaded to Supabase but the DB has the local fallback
            const supabaseUrl = `https://ppyuyohomndnsyfpoxuh.supabase.co/storage/v1/object/public/uploads/resumes/${fileName}`;

            console.log(`Updating ${user.email}: ${localUrl} -> ${supabaseUrl}`);
            user.resumeUrl = supabaseUrl;
            await user.save();
        }

        console.log('Finished updating URLs');
        process.exit(0);
    } catch (err) {
        console.error('Error fixing URLs:', err);
        process.exit(1);
    }
};

fixResumeUrls();
