const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function testUpdate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const testEmail = 'vimalanandh@example.com'; // Change this to a real user email if needed, or create a dummy
        let user = await User.findOne({ email: /vimalanandh/i });

        if (!user) {
            console.log('User not found. Creating a test user...');
            user = new User({
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                role: 'seeker'
            });
            await user.save();
        }

        console.log('Current User Data:', JSON.stringify(user, null, 2));

        console.log('Updating preferredRole...');
        user.preferredRole = 'Senior MERN Developer';
        await user.save();

        const updatedUser = await User.findById(user._id);
        console.log('Updated User Data:', JSON.stringify(updatedUser, null, 2));

        if (updatedUser.preferredRole === 'Senior MERN Developer') {
            console.log('✅ SUCCESS: preferredRole persisted correctly using .save()');
        } else {
            console.log('❌ FAILURE: preferredRole did not persist using .save()');
        }

        console.log('Testing findByIdAndUpdate...');
        await User.findByIdAndUpdate(user._id, { $set: { preferredRole: 'Lead Engineer' } });
        const finalUser = await User.findById(user._id);
        if (finalUser.preferredRole === 'Lead Engineer') {
            console.log('✅ SUCCESS: preferredRole persisted correctly using findByIdAndUpdate');
        } else {
            console.log('❌ FAILURE: preferredRole did not persist using findByIdAndUpdate');
        }

    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        await mongoose.connection.close();
    }
}

testUpdate();
