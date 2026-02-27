const admin = require('firebase-admin');
// Verify firebaseConfig exists and imports correctly
try {
    require('../config/firebaseConfig');
} catch (e) {
    console.log('Could not load firebaseConfig, assuming app not initialized via that file.');
}

// If app is not initialized (e.g. config file didn't init it properly or failed), 
// we can't proceed easily without the creds. 
// However, since we are in the same process, we rely on the singleton.

if (!admin.apps.length) {
    console.error('Firebase App not initialized. Please ensure firebaseConfig.js works.');
    // Fallback: try to hardcode the path IF we know it, but we failed before.
    // Let's assume require(../config/firebaseConfig) works.
    process.exit(1);
}

const storage = admin.storage();

const tryBucket = async (bucketName) => {
    console.log(`\nTesting bucket: ${bucketName} ...`);
    try {
        const bucket = storage.bucket(bucketName);
        const file = bucket.file('tests/connection-test.txt');
        await file.save('Connection successful', {
            metadata: { contentType: 'text/plain' },
            public: true
        });
        console.log(`✅ SUCCESS! Valid bucket is: ${bucketName}`);
        return true;
    } catch (error) {
        console.log(`❌ Failed: ${error.message}`);
        return false;
    }
};

const runTests = async () => {
    // Project ID from the service account file
    const projectID = 'futuremmilestonejob';
    const candidates = [
        `${projectID}.appspot.com`,
        `${projectID}.firebasestorage.app`,
        `staging.${projectID}.appspot.com`
    ];

    for (const name of candidates) {
        // Also try the bucket from .env if available
        if (process.env.FIREBASE_STORAGE_BUCKET && candidates.indexOf(process.env.FIREBASE_STORAGE_BUCKET) === -1) {
            candidates.unshift(process.env.FIREBASE_STORAGE_BUCKET);
        }

        const success = await tryBucket(name);
        if (success) process.exit(0);
    }

    console.error('\nAll bucket candidates failed.');
    process.exit(1);
};

runTests();
