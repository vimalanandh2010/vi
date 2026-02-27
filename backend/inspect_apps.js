const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

// Register models
require('./models/User');
require('./models/Job');
const Application = require('./models/Application');

async function inspect() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const apps = await Application.find().sort({ createdAt: -1 }).populate('user job').limit(10);

        let output = 'Recent Applications:\n';
        apps.forEach(a => {
            output += `User: ${a.user?.email}\n`;
            output += `Job: ${a.job?.title}\n`;
            output += `App Resume URL: ${a.resumeUrl}\n`;
            output += `User Resume URL: ${a.user?.resumeUrl}\n`;
            output += `Status: ${a.status}\n`;
            output += `Created: ${a.createdAt}\n`;
            output += '-------------------\n';
        });

        fs.writeFileSync('app_inspect.txt', output);
        console.log('Inspection complete. Check app_inspect.txt');
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

inspect();
