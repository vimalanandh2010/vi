const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase-service-account.json');

console.log('--- Firebase Diagnostic ---');
console.log('Project ID:', serviceAccount.project_id);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const checkBucket = async (bucketName) => {
    console.log(`\nChecking bucket: ${bucketName}...`);
    const bucket = admin.storage().bucket(bucketName);
    try {
        const [files] = await bucket.getFiles({ maxResults: 1 });
        console.log(`✅ Success! Bucket "${bucketName}" is accessible.`);
        return true;
    } catch (error) {
        console.log(`❌ Failed: ${error.message}`);
        return false;
    }
};

const run = async () => {
    const bucketsToTest = [
        'futuremmilestonejob.firebasestorage.app',
        'futuremmilestonejob.appspot.com',
        'futuremmilestonejob'
    ];

    for (const b of bucketsToTest) {
        if (await checkBucket(b)) {
            console.log(`\n🎉 Found valid bucket: ${b}`);
            process.exit(0);
        }
    }

    console.log('\n❌ Could not connect to any test bucket.');
    process.exit(1);
};

run();
