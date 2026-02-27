const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

async function inspect() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const User = require('./models/User');
        const users = await User.find().sort({ updatedAt: -1 }).limit(10);

        let output = 'Recent Users:\n';
        users.forEach(u => {
            output += `Email: ${u.email}\n`;
            output += `Resume: ${u.resumeUrl}\n`;
            output += `Photo: ${u.photoUrl}\n`;
            output += `Video: ${u.videoUrl}\n`;
            output += `Updated: ${u.updatedAt}\n`;
            output += '-------------------\n';
        });

        fs.writeFileSync('user_inspect.txt', output);
        console.log('Inspection complete. Check user_inspect.txt');
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

inspect();
