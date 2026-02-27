const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const getIndices = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        for (let col of collections) {
            console.log(`\nIndices for collection: ${col.name}`);
            const indices = await db.collection(col.name).indexes();
            console.log(JSON.stringify(indices, null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

getIndices();
