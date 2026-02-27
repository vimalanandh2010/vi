const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const User = require('./models/User');
const Job = require('./models/Job');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const logFile = path.resolve(__dirname, 'diag_final.txt');
function log(msg) {
    fs.appendFileSync(logFile, (typeof msg === 'object' ? JSON.stringify(msg, null, 2) : msg) + '\n');
}

async function run() {
    try {
        log('--- DIAGNOSTIC START ---');
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        log('DB Connected');

        const emp = await User.findOne({ role: 'employer' }).populate('company');
        if (!emp) { log('No emp'); process.exit(0); }
        log(`Emp: ${emp.email}`);

        const job = new Job({
            title: 'DEBUG',
            company: emp.company?._id || new mongoose.Types.ObjectId(),
            location: 'Remote',
            postedBy: emp._id,
            category: 'IT'
        });

        try {
            await job.save();
            log('Save Success');
        } catch (e) {
            log('Save Error: ' + e.message);
            if (e.errors) log(e.errors);
        }

        await mongoose.disconnect();
        log('--- DIAGNOSTIC END ---');
        process.exit(0);
    } catch (err) {
        log('Fatal: ' + err.message);
        process.exit(1);
    }
}

run();
setTimeout(() => { log('Timeout exit'); process.exit(1); }, 10000);
