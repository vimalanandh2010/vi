const { bucket } = require('../config/firebaseConfig');

console.log('🔥 Testing Firebase Connection...\n');

const testConnection = async () => {
    try {
        // Test 1: List files in bucket (should work even if empty)
        console.log('Test 1: Checking bucket access...');
        const [files] = await bucket.getFiles({ maxResults: 1 });
        console.log('✅ Successfully connected to Firebase Storage!');
        console.log(`📦 Bucket: ${bucket.name}`);

        // Test 2: Upload a test file
        console.log('\nTest 2: Uploading test file...');
        const testFileName = 'tests/connection-test.txt';
        const testContent = `Firebase connection test - ${new Date().toISOString()}`;

        const file = bucket.file(testFileName);
        await file.save(testContent, {
            metadata: {
                contentType: 'text/plain',
            },
            public: true
        });

        await file.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${testFileName}`;

        console.log('✅ Test file uploaded successfully!');
        console.log(`📎 URL: ${publicUrl}`);

        // Test 3: Delete test file
        console.log('\nTest 3: Cleaning up test file...');
        await file.delete();
        console.log('✅ Test file deleted successfully!');

        console.log('\n🎉 All tests passed! Firebase is ready to use.');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Firebase connection test failed:');
        console.error(error.message);

        if (error.code === 'ENOENT') {
            console.error('\n💡 Service account file not found!');
            console.error('Please ensure firebase-service-account.json exists in backend/config/');
        } else if (error.code === 403 || error.code === 401) {
            console.error('\n💡 Authentication error!');
            console.error('Please check your service account permissions.');
        } else if (error.message.includes('bucket')) {
            console.error('\n💡 Bucket access error!');
            console.error('Please verify the bucket name in .env file.');
        }

        process.exit(1);
    }
};

testConnection();
