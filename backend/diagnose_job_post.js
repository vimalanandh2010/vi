const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const User = require('./models/User');
const Job = require('./models/Job');
const Company = require('./models/Company');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const logFile = path.resolve(__dirname, 'diag_output.txt');
function logMessage(msg) {
    const text = typeof msg === 'object' ? JSON.stringify(msg, null, 2) : msg;
    console.log(text);
    fs.appendFileSync(logFile, text + '\n');
}

if (fs.existsSync(logFile)) fs.unlinkSync(logFile);

async function diagnose() {
    try {
        logMessage('Starting diagnosis...');
        mongoose.set('debug', (coll, method, query, doc) => {
            logMessage(`Mongoose: ${coll}.${method} ${JSON.stringify(query)}`);
        });
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        logMessage('Connected to MongoDB');

        const employer = await User.findOne({ role: 'employer' }).populate('company');
        if (!employer) {
            logMessage('No employer found');
            return;
        }
        logMessage(`Testing with user: ${employer.email}, Company: ${employer.company?.name}`);

        if (!employer.company) {
            logMessage('Employer has no company linked!');
            return;
        }

        const jobData = {
            title: 'Diagnostic Test Job',
            location: 'Salem, Tamil Nadu',
            type: 'Full Time',
            minSalary: 10,
            maxSalary: 20,
            experienceLevel: 'Entry Level',
            description: 'This is a diagnostic test job to identify the 500 error.',
            category: 'IT',
            tags: 'test, debugging',
            requirements: 'Must be able to find bugs'
        };

        logMessage('Attempting to create job document directly...');
        try {
            const newJob = new Job({
                ...jobData,
                company: employer.company._id,
                companyName: employer.company.name,
                postedBy: employer._id,
                tags: jobData.tags.split(',').map(t => t.trim()),
                requirements: jobData.requirements.split(',').map(r => r.trim())
            });
            await newJob.save();
            logMessage('✅ Direct save successful');
            await Job.deleteOne({ _id: newJob._id });
            logMessage('Cleaned up test job');
        } catch (saveErr) {
            logMessage('❌ Direct save failed!');
            logMessage(`Error Name: ${saveErr.name}`);
            logMessage(`Error Message: ${saveErr.message}`);
            if (saveErr.errors) {
                Object.keys(saveErr.errors).forEach(key => {
                    logMessage(`- Field "${key}": ${saveErr.errors[key].message}`);
                });
            }
            logMessage(`Full Stack: ${saveErr.stack}`);
        }

    } catch (err) {
        logMessage(`Fatal Error: ${err.stack || err}`);
    } finally {
        await mongoose.disconnect();
        logMessage('Disconnected from MongoDB');
    }
}

diagnose();
