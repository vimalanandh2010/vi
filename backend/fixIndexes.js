const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
// Adjusted path: .env is in same directory as this script
dotenv.config({ path: path.resolve(__dirname, '.env') });

const dropIndexes = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('❌ MONGODB_URI not found in .env');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('users');

        // List indexes
        const indexes = await collection.indexes();
        console.log('Current Indexes:', indexes.map(i => i.name));

        // Drop the specific index on googleId if it exists
        // The default name for unique index on googleId is likely "googleId_1"
        const indexName = 'googleId_1';
        try {
            if (indexes.find(i => i.name === indexName)) {
                await collection.dropIndex(indexName);
                console.log(`✅ Dropped incorrect unique index: ${indexName}`);
            } else {
                console.log(`ℹ️ Index ${indexName} not found (already fixed?)`);
            }
        } catch (e) {
            console.log(`⚠️ Error dropping ${indexName}:`, e.message);
        }

        console.log('🏁 Index fix complete. Please restart your backend server.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

dropIndexes();
