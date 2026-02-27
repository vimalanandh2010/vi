const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        enum: ['email_verification', 'password_reset', 'company_verification'],
        default: 'company_verification'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // 10 minutes session
    }
});

// Create index for fast cleanup and lookup
otpSchema.index({ email: 1, purpose: 1 });

module.exports = mongoose.model('VerificationOTP', otpSchema);
