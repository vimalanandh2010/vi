const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const generateOtp = require('./utils/generateOtp');
const dotenv = require('dotenv');

dotenv.config();

const testOtp = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'vimalanandhkit2427@ksrce.ac.in'; // Test email from .env
        const role = 'employer';

        const user = await User.findOne({ email, role });
        if (!user) {
            console.log('User not found. Use a different email or create a user.');
            process.exit(0);
        }

        const otp = generateOtp();
        console.log('Generated OTP:', otp);

        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp, salt);
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

        user.otp = hashedOtp;
        user.otpExpiry = otpExpiry;
        await user.save();
        console.log('OTP saved to user');

        // Verify OTP
        const isMatch = await bcrypt.compare(otp, user.otp);
        console.log('OTP Match result:', isMatch);

        if (isMatch) {
            console.log('OTP Verification Logic Works!');
        } else {
            console.log('OTP Verification Logic FAILED!');
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error('Test Error:', err);
    }
};

testOtp();
