const express = require('express');
const router = express.Router();
const recruiterAuth = require('../middleware/recruiterAuth');
const { validateCompanyEmail } = require('../middleware/verificationMiddleware');
const { extractDomain, hasMXRecord } = require('../utils/dnsUtils');
const { sendVerificationOTPEmail } = require('../utils/emailService');
const VerificationOTP = require('../models/VerificationOTP');
const Company = require('../models/Company');
const Employer = require('../models/Employer');
const bcrypt = require('bcryptjs');

// @route   POST /api/verification/verify-domain
// @desc    Step 1: Extract domain and check MX records
router.post('/verify-domain', recruiterAuth, async (req, res) => {
    try {
        const { companyWebsite } = req.body;
        const domain = extractDomain(companyWebsite);

        if (!domain) {
            return res.status(400).json({ message: 'Invalid company website URL' });
        }

        const isValidMX = await hasMXRecord(domain);

        res.json({
            domain,
            mxValid: isValidMX,
            message: isValidMX ? 'Domain is valid and can receive emails' : 'No mail server found for this domain'
        });
    } catch (error) {
        console.error('Verify domain error:', error);
        res.status(500).json({ message: 'Server error during domain validation' });
    }
});

// @route   POST /api/verification/send-otp
// @desc    Step 2: Send OTP to official email
router.post('/send-otp', [recruiterAuth, validateCompanyEmail], async (req, res) => {
    try {
        const { officialEmail } = req.body;
        const { emailDomain } = req.verifiedDomains;

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash OTP before storing
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp, salt);

        // Delete any existing OTP for this email
        await VerificationOTP.deleteMany({ email: officialEmail.toLowerCase(), purpose: 'company_verification' });

        // Save new OTP
        const otpDoc = new VerificationOTP({
            email: officialEmail.toLowerCase(),
            otp: hashedOtp,
            purpose: 'company_verification'
        });
        await otpDoc.save();

        // Send Email
        let emailSent = false;
        try {
            await sendVerificationOTPEmail(officialEmail, otp);
            emailSent = true;
        } catch (emailErr) {
            console.error(`[Verification] Email delivery failed: ${emailErr.message}`);
            console.log(`[FALLBACK] Company Verification OTP for ${officialEmail}: ${otp}`);
        }

        if (emailSent) {
            res.json({ message: `Verification OTP sent to ${officialEmail}` });
        } else {
            // OTP is saved in DB, so master OTP (000000) will still work
            res.status(200).json({
                message: `OTP generated but email delivery failed. Please check your email or contact support.`,
                emailFailed: true
            });
        }
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ message: 'Error sending verification email' });
    }
});

// @route   POST /api/verification/verify-otp
// @desc    Step 3: Verify OTP and update status
router.post('/verify-otp', recruiterAuth, async (req, res) => {
    try {
        const { officialEmail, otp, companyWebsite } = req.body;

        if (!officialEmail || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        // Find OTP record
        const otpRecord = await VerificationOTP.findOne({
            email: officialEmail.toLowerCase(),
            purpose: 'company_verification'
        });

        if (!otpRecord) {
            return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
        }

        // Verify OTP
        const isMasterOtp = (process.env.NODE_ENV === 'development' || process.env.ALLOW_MASTER_OTP === 'true') && otp === '000000';
        const isMatch = isMasterOtp || await bcrypt.compare(otp, otpRecord.otp);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        // Calculate Trust Score
        // Work email verified (+30), Domain match (+30), DNS valid (+40) = 100
        const domain = extractDomain(officialEmail);
        const mxValid = await hasMXRecord(domain);

        let trustScore = 60; // Base for email verified + domain match (already checked by middleware)
        if (mxValid) trustScore += 40;

        // Update Company
        const company = await Company.findOneAndUpdate(
            { createdBy: req.user.id },
            {
                officialEmail: officialEmail.toLowerCase(),
                emailDomain: domain,
                mxValid,
                officialEmailVerified: true,
                verificationStatus: 'verified',
                verificationLevel: mxValid ? 3 : 2,
                trustScore,
                verified: true
            },
            { new: true }
        );

        if (!company) {
            return res.status(404).json({ message: 'Company profile not found. Please create it first.' });
        }

        // Update Employer status
        await Employer.findOneAndUpdate(
            { userId: req.user.id },
            { isVerified: true }
        );

        // Cleanup OTP
        await VerificationOTP.deleteOne({ _id: otpRecord._id });

        res.json({
            message: 'Company successfully verified!',
            company,
            trustScore
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Server error during OTP verification' });
    }
});

module.exports = router;
