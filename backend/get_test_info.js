const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const User = require('./models/User');
        const user = await User.findOne();

        if (!user) {
            console.log('No user found');
            process.exit();
        }

        console.log('User found:', user.email);
        console.log('Resume URL:', user.resumeUrl);

        const payload = { user: { id: user._id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Token:', token);

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

test();
