const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const fixIndexes = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is missing');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const collection = mongoose.connection.collection('users');

        // List indexes
        const indexes = await collection.indexes();
        console.log('Current Indexes:', indexes.map(i => i.name));

        const emailIndex = indexes.find(i => i.name === 'email_1');

        if (emailIndex) {
            console.log('Found conflicting index "email_1". Dropping it...');
            await collection.dropIndex('email_1');
            console.log('✅ Successfully dropped "email_1" index.');
        } else {
            console.log('Index "email_1" not found. It might have already been removed.');
        }

        // The compound index should be created automatically by Mongoose on restart, 
        // but we can ensure it exists here if we want.
        // For now, removing the bad one is the priority.

    } catch (err) {
        console.error('Error fixing indexes:', err.message);
    } finally {
        await mongoose.disconnect();
    }
};

fixIndexes();
