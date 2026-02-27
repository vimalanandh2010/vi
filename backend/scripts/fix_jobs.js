const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Job = require('../models/Job');

const fixJobsData = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('Connected.');

        // Get raw collection to check types
        const collection = mongoose.connection.collection('jobs');
        const jobs = await collection.find({}).toArray();

        console.log(`Found ${jobs.length} jobs to inspect.`);
        let fixCount = 0;

        for (const job of jobs) {
            // Check if company is a string (corrupted data)
            if (job.company && typeof job.company === 'string') {
                console.log(`[FIX] Job "${job.title}" (${job._id}) has string company: "${job.company}"`);

                // Move string name to companyName for preservation
                // And set company to null (since we don't have a valid ID)
                await collection.updateOne(
                    { _id: job._id },
                    {
                        $set: {
                            companyName: job.company,
                            company: null
                        }
                    }
                );
                fixCount++;
            }
        }

        console.log(`\nMigration complete. Fixed ${fixCount} jobs.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

fixJobsData();
