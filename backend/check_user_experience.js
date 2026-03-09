const mongoose = require('mongoose');
const User = require('./models/User');
const Application = require('./models/Application');

mongoose.connect('mongodb://127.0.0.1:27017/jobportal')
    .then(async () => {
        console.log('✅ Connected to MongoDB\n');
        
        // Check seekers with experience
        const seekers = await User.find({ role: 'seeker' })
            .select('firstName lastName email experience')
            .limit(10);
        
        console.log(`Found ${seekers.length} job seekers\n`);
        console.log('='.repeat(60));
        
        seekers.forEach((user, idx) => {
            console.log(`\n${idx + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
            console.log(`   Experience entries: ${user.experience?.length || 0}`);
            
            if (user.experience && user.experience.length > 0) {
                user.experience.forEach((exp, i) => {
                    console.log(`   ${i + 1}) ${exp.role || 'N/A'} at ${exp.company || 'N/A'}`);
                    console.log(`      Duration: ${exp.duration || 'N/A'}`);
                });
            } else {
                console.log('   ❌ No experience data');
            }
        });
        
        console.log('\n' + '='.repeat(60));
        
        // Now check applications
        console.log('\n📋 Checking Applications with User Data:\n');
        const apps = await Application.find()
            .populate('user', 'firstName lastName email experience')
            .limit(5);
        
        apps.forEach((app, idx) => {
            console.log(`\n${idx + 1}. Application by: ${app.user?.firstName} ${app.user?.lastName}`);
            console.log(`   User Experience: ${app.user?.experience?.length || 0} entries`);
            if (app.user?.experience && app.user.experience.length > 0) {
                console.log(`   First entry: ${app.user.experience[0].role} at ${app.user.experience[0].company}`);
            } else {
                console.log('   ❌ No experience in populated user');
            }
        });
        
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
