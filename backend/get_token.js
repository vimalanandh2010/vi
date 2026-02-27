const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const path = require('path');
const User = require('./models/User');

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function getToken() {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        const user = await User.findOne({ role: 'employer' });
        if (!user) {
            console.error('No employer found');
            process.exit(1);
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log(token);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

getToken();
