const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

// Try loading env from multiple locations
dotenv.config({ path: path.resolve(__dirname, '../.env') });
// If that failed, maybe it's one level up?
if (!process.env.MONGODB_URI) {
    dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

console.log('URI Loaded:', !!process.env.MONGODB_URI);

const checkUser = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is missing in environment variables');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const email = 'ceitvimalanandh27@gmail.com';
        const users = await User.find({ email });

        console.log(`\n--- Users found for ${email} ---`);
        if (users.length === 0) {
            console.log('No accounts found for this email.');
        } else {
            users.forEach(u => {
                console.log(`ID: ${u._id}`);
                console.log(`Role: ${u.role}`);
                console.log(`AuthProvider: ${u.authProvider}`);
                console.log(`Has Password: ${!!u.password}`);
                console.log(`Google ID: ${u.googleId}`);
                console.log('---');
            });
        }
        console.log('---------------------------------\n');

    } catch (err) {
        console.error('SCRIPT ERROR:', err.message);
    } finally {
        await mongoose.disconnect();
    }
};

checkUser();
