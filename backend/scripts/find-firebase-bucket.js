const admin = require('firebase-admin');
const path = require('path');

console.log('🔍 Finding correct Firebase Storage bucket...\n');

// Load service account
const serviceAccountPath = path.resolve(__dirname, '../config/firebase-service-account.json');
const serviceAccount = require(serviceAccountPath);

const projectId = serviceAccount.project_id;
console.log(`📋 Project ID: ${projectId}`);

// Common bucket name patterns for Firebase projects
const possibleBuckets = [
    `${projectId}.appspot.com`,
    `${projectId}.firebasestorage.app`,
    `gs://${projectId}.appspot.com`,
    projectId
];

console.log('\n🔍 Testing possible bucket names:\n');

const testBucket = async (bucketName) => {
    try {
        // Initialize with specific bucket
        if (admin.apps.length) {
            admin.app().delete();
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: bucketName
        });

        const bucket = admin.storage().bucket();

        // Try to access the bucket
        await bucket.getFiles({ maxResults: 1 });

        return true;
    } catch (error) {
        return false;
    }
};

const findBucket = async () => {
    for (const bucketName of possibleBuckets) {
        process.stdout.write(`Testing: ${bucketName} ... `);
        const success = await testBucket(bucketName);

        if (success) {
            console.log('✅ SUCCESS!');
            console.log(`\n🎉 Found working bucket: ${bucketName}`);
            console.log(`\n📝 Update your .env file with:`);
            console.log(`FIREBASE_STORAGE_BUCKET=${bucketName}`);
            process.exit(0);
        } else {
            console.log('❌ Not found');
        }
    }

    console.log('\n❌ None of the common bucket names worked.');
    console.log('\n💡 Solutions:');
    console.log('1. Create a storage bucket in Firebase Console:');
    console.log('   https://console.firebase.google.com/project/' + projectId + '/storage');
    console.log('2. Or check if storage is enabled for your project.');
    process.exit(1);
};

findBucket();
