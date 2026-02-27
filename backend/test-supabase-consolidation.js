const { uploadFile, deleteFile } = require('./utils/uploadService');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const testUploads = async () => {
    console.log('🧪 Starting File Upload Verification Test...');

    const dummyFile = {
        originalname: 'test_file.txt',
        mimetype: 'text/plain',
        buffer: Buffer.from('This is a test file for Supabase storage consolidation.'),
        size: 56
    };

    const folders = ['resumes', 'photos', 'job-posters', 'course-thumbnails', 'course-content', 'certificates'];
    const results = [];

    for (const folder of folders) {
        console.log(`\n📂 Testing upload to: ${folder}`);
        try {
            const url = await uploadFile(dummyFile, folder);
            if (url && url.includes('supabase.co')) {
                console.log(`✅ Success: ${url}`);
                results.push({ folder, status: 'Success', url });

                console.log(`🗑️ Testing deletion for: ${folder}`);
                const deleted = await deleteFile(url);
                if (deleted) {
                    console.log(`✅ Deletion successful`);
                } else {
                    console.log(`⚠️ Deletion failed (might be expected if anon key used or RLS restriction)`);
                }
            } else if (url && url.startsWith('/uploads/')) {
                console.warn(`⚠️ Warning: Fell back to local storage: ${url}`);
                results.push({ folder, status: 'Local Fallback', url });
            } else {
                console.error(`❌ Failed: No URL returned`);
                results.push({ folder, status: 'Failed', url: null });
            }
        } catch (err) {
            console.error(`❌ Error testing ${folder}:`, err.message);
            results.push({ folder, status: 'Error', error: err.message });
        }
    }

    console.log('\n--- Test Summary ---');
    console.table(results);

    const allSuccessful = results.every(r => r.status === 'Success');
    if (allSuccessful) {
        console.log('\n✨ All tests passed! File storage is successfully connected to Supabase.');
        process.exit(0);
    } else {
        console.log('\n⚠️ Some tests failed or used fallback. Please check logs.');
        process.exit(1);
    }
};

testUploads();
