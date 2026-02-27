const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const inspectUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const User = require('./models/User');
        const count = await User.countDocuments();
        console.log(`Total users: ${count}`);

        const latest = await User.find().sort({ createdAt: -1 }).limit(5);
        console.log('\nLatest 5 users:');
        latest.forEach(u => {
            console.log(`- ID: ${u._id}, Email: ${u.email}, Role: ${u.role}, Auth: ${u.authProvider}, GoogleId: ${u.googleId}`);
        });

        const nullEmails = await User.find({ email: null });
        console.log(`\nUsers with null email: ${nullEmails.length}`);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

inspectUsers();
