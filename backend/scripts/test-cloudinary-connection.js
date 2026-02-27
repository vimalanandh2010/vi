const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

console.log('🔍 Testing Cloudinary Configuration...\n');

// Configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('📋 Configuration:');
console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME || '❌ NOT SET'}`);
console.log(`   API Key: ${process.env.CLOUDINARY_API_KEY ? '✅ SET' : '❌ NOT SET'}`);
console.log(`   API Secret: ${process.env.CLOUDINARY_API_SECRET ? '✅ SET' : '❌ NOT SET'}\n`);

// Test connection by pinging the API
cloudinary.api.ping()
    .then(result => {
        console.log('✅ SUCCESS! Cloudinary connection is working!');
        console.log('📊 Response:', result);
    })
    .catch(error => {
        console.error('❌ FAILED! Cloudinary connection error:');
        console.error('   Error:', error.message);
        if (error.http_code) {
            console.error('   HTTP Code:', error.http_code);
        }
    });
