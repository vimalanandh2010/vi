const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

async function checkConnections() {
    console.log('🔍 Checking All Connections...\n');

    // 1. Environment Variables
    console.log('1. Environment Configuration:');
    console.log('   PORT:', process.env.PORT || 5000);
    console.log('   MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
    console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
    console.log('   GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing');

    // 2. MongoDB Connection
    console.log('\n2. MongoDB Connection:');
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('   ✅ MongoDB connected successfully');
        console.log('   📊 Connection ID:', mongoose.connection.id);
        console.log('   🏠 Database Name:', mongoose.connection.name);
        console.log('   🌐 Host:', mongoose.connection.host);
        console.log('   🔌 Port:', mongoose.connection.port);
        console.log('   📈 Ready State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');
        
        // Count documents
        const User = require('./models/User');
        const userCount = await User.countDocuments();
        console.log('   👥 Total Users:', userCount);
        
        await mongoose.disconnect();
        console.log('   🔌 Disconnected from MongoDB');
        
    } catch (error) {
        console.log('   ❌ MongoDB connection failed:', error.message);
    }

    // 3. Server Details
    console.log('\n3. Server Configuration:');
    console.log('   🌐 Server URL: http://localhost:' + (process.env.PORT || 5000));
    console.log('   📁 Upload Directory: backend/uploads/');
    console.log('   🔐 Authentication: JWT + Google OAuth');

    // 4. API Endpoints
    console.log('\n4. Available API Endpoints:');
    console.log('   📝 POST /api/auth/signup - User registration');
    console.log('   🔑 POST /api/auth/login - User login');
    console.log('   🔍 POST /api/auth/google - Google OAuth');
    console.log('   📄 POST /api/auth/resume - Upload resume');
    console.log('   📸 POST /api/auth/photo - Upload photo');
    console.log('   👤 GET /api/auth/profile - Get user profile');

    // 5. File Storage
    console.log('\n5. File Storage:');
    const fs = require('fs');
    const path = require('path');
    
    const uploadsDir = path.join(__dirname, 'uploads');
    if (fs.existsSync(uploadsDir)) {
        console.log('   📁 Upload directory exists');
        
        const folders = ['resumes', 'photos', 'videos'];
        folders.forEach(folder => {
            const folderPath = path.join(uploadsDir, folder);
            if (fs.existsSync(folderPath)) {
                const files = fs.readdirSync(folderPath);
                console.log(`   📂 ${folder}: ${files.length} files`);
            } else {
                console.log(`   📂 ${folder}: folder not found`);
            }
        });
    } else {
        console.log('   ❌ Upload directory not found');
    }

    console.log('\n✅ Connection check complete!');
}

checkConnections().catch(console.error);