const mongoose = require('mongoose');

// Fallback logic to get MONGO_URI
const fs = require('fs');
const path = require('path');
const dotenvPath = path.join(__dirname, '../.env');
const envFile = fs.readFileSync(dotenvPath, 'utf8');
let uri = '';
envFile.split('\n').forEach(line => {
    if (line.startsWith('MONGO_URI=')) {
        uri = line.split('=')[1].trim();
    }
});

async function run() {
    try {
        console.log('Connecting...');
        await mongoose.connect(uri);
        console.log('Connected!');

        const User = require('../models/User');
        const count = await User.countDocuments();
        console.log('Total users:', count);

        const seekerCount = await User.countDocuments({ role: 'seeker' });
        console.log('Total seekers:', seekerCount);

        const otherRoles = await User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]);
        console.log('Roles distribution:', JSON.stringify(otherRoles));

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}
run();
