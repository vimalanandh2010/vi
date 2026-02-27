const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = './config/firebase-service-account.json';
const keyPath = path.resolve(__dirname, serviceAccountPath);

const storage = new Storage({
    keyFilename: keyPath,
});

async function listBuckets() {
    try {
        const [buckets] = await storage.getBuckets();
        console.log('Available Buckets:');
        buckets.forEach(bucket => {
            console.log('-', bucket.name);
        });
    } catch (error) {
        console.error('Error listing buckets:', error);
    }
}

listBuckets();
