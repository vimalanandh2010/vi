const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

// Configuration
const API_URL = 'http://localhost:5000/api';
const EMAIL = 'amit@techcorp.com';
const PASSWORD = 'employer123';

async function testCloudinaryUpload() {
    try {
        console.log('🚀 Starting Cloudinary Upload Test...');

        // 1. Login to get token
        console.log('🔐 Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: EMAIL,
            password: PASSWORD
        });
        const token = loginRes.data.token;
        console.log('✅ Logged in successfully');

        // 2. Prepare Form Data
        const form = new FormData();
        form.append('title', 'Test Cloudinary Course');
        form.append('description', 'A course to test Cloudinary video upload');
        form.append('level', 'Beginner');

        const imagePath = path.join(__dirname, 'test-image.png');

        form.append('content', fs.createReadStream(imagePath), {
            filename: 'test_image.png',
            contentType: 'image/png'
        });

        // 3. Upload Course
        console.log('📡 Uploading course...');
        const uploadRes = await axios.post(`${API_URL}/courses`, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('✨ Course created successfully!');
        console.log('🔗 Video URL:', uploadRes.data.contentUrl);

        if (uploadRes.data.contentUrl.includes('cloudinary.com')) {
            console.log('✅ SUCCESS: Video URL is from Cloudinary');
        } else {
            console.log('❌ FAILURE: Video URL is NOT from Cloudinary');
        }

        // Cleanup test image
        fs.unlinkSync(imagePath);

    } catch (error) {
        console.error('❌ Test failed:', error.response ? error.response.data : error.message);
    }
}

testCloudinaryUpload();
