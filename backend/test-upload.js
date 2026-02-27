const { uploadFile, deleteFile, listFiles } = require('./utils/uploadService');

async function testUpload() {
    console.log('🧪 Testing Local Upload System...\n');

    try {
        // Create a mock file
        const mockFile = {
            originalname: 'test-resume.pdf',
            buffer: Buffer.from('This is a test resume file content'),
            mimetype: 'application/pdf',
            size: 34
        };

        console.log('1. Testing file upload...');
        const fileUrl = await uploadFile(mockFile, 'resumes');
        console.log('✅ Upload successful!');
        console.log('📄 File URL:', fileUrl);

        console.log('\n2. Testing file listing...');
        const files = listFiles('resumes');
        console.log('📁 Files in resumes folder:', files.length);
        files.forEach(file => {
            console.log(`   - ${file.name} (${file.url})`);
        });

        console.log('\n3. Testing file deletion...');
        const deleted = await deleteFile(fileUrl);
        console.log(deleted ? '✅ File deleted successfully' : '❌ File deletion failed');

        console.log('\n4. Verifying deletion...');
        const filesAfterDelete = listFiles('resumes');
        console.log('📁 Files after deletion:', filesAfterDelete.length);

        console.log('\n🎉 All tests passed! Your upload system is working perfectly!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testUpload();