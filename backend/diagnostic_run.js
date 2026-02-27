const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

async function run() {
    const logFile = 'diagnostic_output.txt';
    const log = (msg) => {
        console.log(msg);
        fs.appendFileSync(logFile, msg + '\n');
    };

    fs.writeFileSync(logFile, '--- DIAGNOSTIC LOG ---\n');

    try {
        log(`Connecting to: ${process.env.MONGO_URI}`);
        await mongoose.connect(process.env.MONGO_URI);
        log('Connected successfully.');

        const Application = require('./models/Application');
        const apps = await Application.find({ status: 'interview' }).select('interviewDate interviewTime _id');

        log(`Found ${apps.length} interview applications.`);
        apps.forEach(app => {
            log(`ID: ${app._id}, Date: "${app.interviewDate}", Time: "${app.interviewTime}"`);
        });

        log('--- END DIAGNOSTIC ---');
        process.exit(0);
    } catch (err) {
        log(`ERROR: ${err.message}`);
        process.exit(1);
    }
}

run();
