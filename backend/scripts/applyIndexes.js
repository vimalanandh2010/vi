const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const applyIndexes = async () => {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!uri) {
            console.error('❌ MongoDB URI missing');
            process.exit(1);
        }

        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB');

        const Job = require('../models/Job');
        const User = require('../models/User');
        const Application = require('../models/Application');

        console.log('⏳ Applying indexes...');

        // Job Indexes
        await Job.collection.createIndex({ title: 'text', description: 'text', tags: 'text' });
        await Job.collection.createIndex({ location: 1 });
        await Job.collection.createIndex({ category: 1 });
        await Job.collection.createIndex({ status: 1 });
        await Job.collection.createIndex({ postedBy: 1 });
        await Job.collection.createIndex({ createdAt: -1 });

        // User Indexes
        await User.collection.createIndex({ email: 1 }, { unique: true });
        await User.collection.createIndex({ role: 1 });
        await User.collection.createIndex({ googleId: 1 });

        // Application Indexes
        await Application.collection.createIndex({ job: 1 });
        await Application.collection.createIndex({ user: 1 });
        await Application.collection.createIndex({ status: 1 });
        await Application.collection.createIndex({ createdAt: -1 });

        console.log('✅ All indexes applied successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Index Application Error:', err.message);
        process.exit(1);
    }
};

applyIndexes();
