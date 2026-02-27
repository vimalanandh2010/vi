require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndices() {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jobportal');
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('users');

        console.log('Dropping problematic index: googleId_1_role_1');
        try {
            await collection.dropIndex('googleId_1_role_1');
            console.log('✅ Successfully dropped index');
        } catch (e) {
            console.log('Info: Index not found or already dropped');
        }

        console.log('Dropping problematic index: googleId_1');
        try {
            await collection.dropIndex('googleId_1');
            console.log('✅ Successfully dropped index');
        } catch (e) {
            console.log('Info: Index not found');
        }

        console.log('\nIndices will be recreated with partialFilterExpression when the server restarts.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

fixIndices();
