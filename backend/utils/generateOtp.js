const crypto = require('crypto');

/**
 * Generates a secure 6-digit OTP.
 * @returns {string} 6-digit OTP
 */
const generateOtp = () => {
    // Generate a random number between 100000 and 999999
    const otp = crypto.randomInt(100000, 1000000).toString();
    return otp;
};

module.exports = generateOtp;
