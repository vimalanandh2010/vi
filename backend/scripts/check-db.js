const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const checkDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        const users = await User.find({});
        console.log(`Found ${users.length} users.`);

        users.forEach(user => {
            console.log('--------------------------------------------------');
            console.log(`User: ${user.firstName} ${user.lastName}`);
            console.log(`Email: ${user.email}`);
            console.log(`Photo URL: ${user.photoUrl || 'Not uploaded'}`);
            console.log(`Resume URL: ${user.resumeUrl || 'Not uploaded'}`);
            console.log(`Video URL: ${user.videoUrl || 'Not uploaded'}`);
            console.log('--------------------------------------------------');
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDb();
