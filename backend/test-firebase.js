const { uploadFile, deleteFile } = require('./utils/uploadService');
const fs = require('fs');
const path = require('path');

async function testFirebaseStorage() {
    console.log('🚀 Starting Firebase Storage Test...');

    // Create a dummy file
    const testFilePath = path.join(__dirname, 'test-profile.jpg');
    fs.writeFileSync(testFilePath, 'fake image data');

    const mockFile = {
        originalname: 'test-profile.jpg',
        mimetype: 'image/jpeg',
        buffer: fs.readFileSync(testFilePath)
    };

    try {
        console.log('📡 Uploading to Firebase...');
        const url = await uploadFile(mockFile, 'photos');
        console.log('✅ Upload Successful! URL:', url);

        if (url.includes('firebasestorage.googleapis.com')) {
            console.log('✨ SUCCESS: URL is from Firebase');

            console.log('🗑️ Testing Deletion...');
            const deleted = await deleteFile(url);
            if (deleted) {
                console.log('✅ Deletion Successful!');
            } else {
                console.log('❌ Deletion Failed!');
            }
        } else if (url.startsWith('/uploads/')) {
            console.log('⚠️ FALLBACK: Saved to local storage instead of Firebase.');
        } else {
            console.log('❌ FAILURE: Unknown URL format:', url);
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error);
    } finally {
        // Cleanup dummy file
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
        }
    }
}

testFirebaseStorage();
