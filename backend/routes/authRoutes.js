const express = require('express');
const axios = require('axios');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendWelcomeEmail } = require('../utils/emailService');
const { uploadFile, deleteFile } = require('../utils/uploadService');
const upload = require('../config/multerConfig');
const passport = require('../config/passport');
const { isPublicEmail, extractDomain } = require('../utils/dnsUtils');
const uploadResume = upload;
const uploadPhoto = upload;
const uploadVideo = upload;

// Upload wrappers removed - used directly in routes

// @route   POST /api/auth/signup
// @desc    Register a new user
router.post('/signup', [
    check('firstName', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('phoneNumber', 'Phone number must be at least 10 digits').isLength({ min: 10 })
], async (req, res) => {
    console.log('--- Signup Request ---');
    console.log('Body:', JSON.stringify(req.body, null, 2));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.warn('Signup Validation Errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, phoneNumber, experienceLevel, agreeToContact, role, companyName } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    try {
        let user = await User.findOne({ email: cleanEmail, role });
        if (user) {
            return res.status(400).json({ message: `User already exists as a ${role}` });
        }

        if (role === 'employer' || role === 'admin') {
            const domain = extractDomain(cleanEmail);
            if (domain && isPublicEmail(domain)) {
                return res.status(400).json({
                    message: 'Recruiters must use an official/company email address. Public domains (Gmail, Yahoo, etc.) are not allowed.'
                });
            }
        }

        user = new User({
            firstName,
            lastName,
            email: cleanEmail,
            password,
            phoneNumber,
            experienceLevel,
            agreeToContact,
            role,
            companyName: companyName || ''
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Send Welcome Email
        try {
            await sendWelcomeEmail(user.email, user.firstName);
        } catch (emailErr) {
            console.error('Welcome email failed (non-fatal):', emailErr.message);
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({
                    message: 'User registered successfully',
                    token,
                    user: {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        phoneNumber: user.phoneNumber,
                        experienceLevel: user.experienceLevel,
                        role: user.role,
                        companyName: user.companyName,
                        isProfileComplete: user.isProfileComplete
                    }
                });
            }
        );
    } catch (err) {
        console.error('Signup error:', err.message);
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Account with this details already exists.' });
        }
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    console.log('--- Login Request ---');
    console.log('Body:', JSON.stringify(req.body, null, 2));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.warn('Login Validation Errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    try {
        const { role } = req.body; // Explicitly passed from frontend intent
        let user = await User.findOne({ email: cleanEmail, role: role || 'seeker' });

        if (!user) {
            // Check if account exists with a DIFFERENT role
            const otherUser = await User.findOne({ email: cleanEmail });
            if (otherUser) {
                console.warn(`[Auth] Role mismatch for ${cleanEmail}. Expected: ${role}, Found: ${otherUser.role}`);
                return res.status(400).json({
                    message: `No ${role} account found for this email, but a ${otherUser.role} account exists. Please login using the correct portal.`
                });
            }
            console.log(`Login failed: ${role} account for ${cleanEmail} not found`);
            return res.status(400).json({ message: `No ${role} account found for this email` });
        }

        // Note: Domain restriction is only enforced at signup, not login
        // This allows existing recruiter accounts created before the policy to still login

        // Check if user is registered via Google (no password)
        if (!user.password || user.password === '' || user.password === undefined) {
            return res.status(400).json({ message: "This account is linked with Google. Please use 'Continue with Google' to sign in." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(`Login failed: Incorrect password for ${cleanEmail}`);
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    message: 'Login successful',
                    token,
                    user: {
                        _id: user.id,
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        role: user.role,
                        phoneNumber: user.phoneNumber,
                        photoUrl: user.photoUrl,
                        companyName: user.companyName,
                        isProfileComplete: user.isProfileComplete
                    }
                });
            }
        );
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// @route   POST /api/auth/link-password
// @desc    Allow Google users to set a manual password
router.post('/link-password', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('role', 'Role is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    try {
        let user = await User.findOne({ email: cleanEmail, role });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Only allow setting a password if one doesn't exist (Google user)
        if (user.password && user.password !== '') {
            return res.status(400).json({ message: 'Account already has a manual password set.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        res.json({ message: 'Password set successfully! You can now log in manually.' });
    } catch (err) {
        console.error('Link password error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user profile (Protected)
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User no longer exists. Please sign up again.' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// @route   GET /api/auth/user
// @desc    Get current user data (Protected)
router.get('/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error('Fetch User Error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// @route   PUT /api/auth/update
// @desc    Update user profile (Protected)
router.put('/update', auth, async (req, res) => {
    console.log('--- Profile Update Attempt ---');
    console.log('User ID:', req.user.id);
    console.log('Update Data:', JSON.stringify(req.body, null, 2));

    const allowedFields = [
        'firstName', 'lastName', 'phoneNumber', 'experienceLevel',
        'location', 'preferredRole', 'primarySkill', 'aboutMe', 'education',
        'githubUrl', 'linkedInUrl', 'portfolioUrl', 'companyName', 'website',
        'experience', 'accomplishments', 'certifications'
    ];
    const userFields = {};
    for (const key of allowedFields) {
        if (typeof req.body[key] !== 'undefined') userFields[key] = req.body[key];
    }

    try {
        let user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: userFields },
            { new: true, runValidators: true }
        ).select('-password');

        console.log('Update Successful');
        res.json(user);
    } catch (err) {
        console.error('Update Profile Error:', err.message);
        console.error('Full Error:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// @route   POST /api/auth/resume
// @desc    Upload resume (Protected)
router.post('/resume', auth, (req, res) => {
    uploadResume.single('resume')(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        } else if (err) {
            // An unknown error occurred when uploading.
            return res.status(400).json({ message: err.message });
        }

        try {
            if (!req.file) return res.status(400).json({ message: 'Please upload a file' });

            const user = await User.findById(req.user.id);
            if (!user) return res.status(404).json({ message: 'User not found' });

            // Upload using standard service
            const fileUrl = await uploadFile(req.file, 'resumes');
            if (!fileUrl) throw new Error('Upload failed');

            // Delete old resume if exists
            if (user.resumeUrl) {
                await deleteFile(user.resumeUrl);
            }

            user.resumeUrl = fileUrl;
            await user.save();

            res.json({ message: 'Resume uploaded successfully', resumeUrl: user.resumeUrl });
        } catch (err) {
            console.error('Resume upload error:', err);
            if (err.name === 'ValidationError') {
                const messages = Object.values(err.errors).map(val => val.message);
                return res.status(400).json({ message: messages.join(', ') });
            }
            res.status(500).json({
                message: 'Server Error during resume save',
                error: err.message,
                details: 'Please ensure your Supabase configuration is correct.'
            });
        }
    });
});

// @route   POST /api/auth/photo
// @desc    Upload profile photo (Protected)
router.post('/photo', auth, (req, res) => {
    uploadPhoto.single('photo')(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }

        try {
            if (!req.file) return res.status(400).json({ message: 'Please upload an image' });

            const user = await User.findById(req.user.id);
            if (!user) return res.status(404).json({ message: 'User not found' });

            // Upload using standard service
            const fileUrl = await uploadFile(req.file, 'photos');
            if (!fileUrl) throw new Error('Upload failed');

            // Delete old photo if exists
            if (user.photoUrl && !user.photoUrl.startsWith('http')) { // avoid deleting google profile pics if they are just URLs
                await deleteFile(user.photoUrl);
            }

            user.photoUrl = fileUrl;
            await user.save();

            res.json({ message: 'Photo uploaded successfully', photoUrl: user.photoUrl });
        } catch (err) {
            console.error('Photo upload error:', err);
            if (err.name === 'ValidationError') {
                const messages = Object.values(err.errors).map(val => val.message);
                return res.status(400).json({ message: messages.join(', ') });
            }
            res.status(500).json({
                message: 'Server Error during photo save',
                error: err.message,
                details: 'Please ensure your Supabase configuration is correct.'
            });
        }
    });
});



// @route   POST /api/auth/google/google-verify
// @desc    Verify Google access token and login/signup
router.post('/google/google-verify', async (req, res) => {
    const { token, role } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'Google token is required' });
    }

    try {
        // 1. Verify token with Google
        console.log('[Auth] Verifying Google token...');
        const googleResponse = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
        const profile = googleResponse.data;

        if (!profile || !profile.email) {
            return res.status(400).json({ message: 'Invalid Google token' });
        }

        const email = profile.email.toLowerCase().trim();
        const googleId = profile.sub;

        // 2. Domain restriction for recruiters
        if (role === 'employer' || role === 'recruiter') {
            const domain = extractDomain(email);
            if (isPublicEmail(domain)) {
                return res.status(400).json({ message: 'Recruiters must use a company email address.' });
            }
        }

        // 3. Find or create user
        const targetRole = (role === 'employer' || role === 'recruiter') ? 'employer' : 'seeker';
        console.log(`[Auth] Searching for ${targetRole} user with email ${email} or googleId ${googleId}`);

        let user = await User.findOne({
            $or: [{ googleId: googleId }, { email: email }],
            role: targetRole
        });

        if (user) {
            console.log(`[Auth] Found existing ${targetRole} user: ${email}`);
            // Link googleId if missing
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = 'google';
                await user.save();
            }
        } else {
            console.log(`[Auth] Creating new ${targetRole} via Google: ${email}`);
            user = new User({
                firstName: profile.given_name || 'User',
                lastName: profile.family_name || '',
                email: email,
                googleId: googleId,
                role: targetRole,
                authProvider: 'google',
                isEmailVerified: true,
                photoUrl: profile.picture || ''
            });
            await user.save();
        }

        // 4. Generate JWT
        // Use the actual user role from DB for consistency

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, jwtToken) => {
                if (err) throw err;
                res.json({
                    message: 'Google login successful',
                    token: jwtToken,
                    user: {
                        _id: user.id,
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        role: user.role, // Return the user role
                        dbRole: user.role, // Pureily for frontend awareness
                        photoUrl: user.photoUrl,
                        isProfileComplete: user.isProfileComplete
                    }
                });
            }
        );

    } catch (err) {
        console.error('[Auth] Google Verify Error:', err.message);
        res.status(500).json({ message: 'Google Authentication failed', error: err.message });
    }
});

// @route   POST /api/auth/google
// @desc    Verify Google OAuth token and login/signup
// @route   GET /api/auth/google/jobseeker
// @route   GET /api/auth/google/seeker
router.get(['/google/jobseeker', '/google/seeker'], (req, res, next) => {
    const state = 'role=seeker';
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: state
    })(req, res, next);
});

// @route   GET /api/auth/google/recruiter
// @route   GET /api/auth/google/employer
router.get(['/google/recruiter', '/google/employer'], (req, res, next) => {
    const state = 'role=employer';
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: state
    })(req, res, next);
});

// @route   GET /api/auth/google/callback
// @desc    Google OAuth Callback
router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
        // Helper to parse state and get role
        const getStateRole = (req) => {
            try {
                if (req.query.state && req.query.state.includes('role=')) {
                    return req.query.state.split('role=')[1].split('&')[0];
                }
            } catch (e) {
                return null;
            }
            return null;
        };

        const role = getStateRole(req);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        if (err) {
            console.error('[Passport] Critical Authentication Error:', err);
            return res.redirect(`${frontendUrl}/auth/callback?error=google_auth_failed&details=${encodeURIComponent(err.message || 'handshake_failed')}&role=${role || ''}`);
        }

        if (!user) {
            console.error('[Passport] No user returned from Google:', info);
            return res.redirect(`${frontendUrl}/auth/callback?error=user_not_found&role=${role || ''}`);
        }

        // Use user.intendedRole from passport if available, otherwise fallback to role from state
        const finalRole = user.intendedRole || user.role || role;

        // Generate JWT
        const payload = {
            user: {
                id: user.id,
                role: finalRole
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (jwtErr, token) => {
                if (jwtErr) {
                    console.error('[AuthRoutes] JWT Signing Error:', jwtErr);
                    return res.redirect(`${frontendUrl}/login?error=token_generation_failed`);
                }

                const redirectUrl = `${frontendUrl}/auth/callback?token=${token}&role=${finalRole}`;

                console.log(`[AuthRoutes] Redirecting successful login for ${user.email} (DB Role: ${user.role}, JWT Role: ${finalRole})`);
                res.redirect(redirectUrl);
            }
        );
    })(req, res, next);
});

// @route   POST /api/auth/send-otp
// @desc    Send OTP for Login
router.post('/send-otp', [
    check('email', 'Please include a valid email').isEmail()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, role } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    try {
        console.log(`[OTP] Request for ${cleanEmail} (Role: ${role || 'seeker'})`);
        let user = await User.findOne({ email: cleanEmail, role: role || 'seeker' });

        if (!user) {
            console.warn(`[OTP] User not found: ${cleanEmail} as ${role || 'seeker'}`);
            return res.status(404).json({ message: `No ${role || 'seeker'} account found for this email` });
        }

        const otp = require('../utils/generateOtp')();
        console.log(`[OTP] Generated successfully for ${cleanEmail}`);

        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp, salt);
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        user.otp = hashedOtp;
        user.otpExpiry = otpExpiry;
        await user.save();

        console.log(`[OTP] Sending email to ${user.email}...`);
        const { sendOtpEmail } = require('../utils/emailService');
        let emailSent = false;
        try {
            await sendOtpEmail(user.email, otp);
            emailSent = true;
            console.log(`[OTP] Email sent successfully to ${user.email}`);
        } catch (emailErr) {
            console.error(`[OTP] Email delivery failed: ${emailErr.message}`);
            console.log(`[FALLBACK] Login OTP for ${user.email}: ${otp}`);
        }

        if (emailSent) {
            res.json({ message: 'OTP sent to your email' });
        } else {
            res.status(200).json({
                message: 'OTP generated but email delivery failed. Please try again or contact support.',
                emailFailed: true
            });
        }

    } catch (err) {
        console.error('[OTP] Critical Error:', err);
        res.status(500).json({ message: 'Failed to send OTP', error: err.message });
    }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and Login
router.post('/verify-otp', [
    check('email', 'Please include a valid email').isEmail(),
    check('otp', 'OTP is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp, role } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    try {
        console.log(`[OTP] Verify attempt for ${cleanEmail} (Role: ${role || 'seeker'})`);
        const user = await User.findOne({ email: cleanEmail, role: role || 'seeker' });
        if (!user) {
            console.warn(`[OTP] Verify failed: User not found ${cleanEmail}`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!user.otp || !user.otpExpiry) {
            console.warn(`[OTP] Verify failed: No OTP record for ${cleanEmail}`);
            return res.status(400).json({ message: 'No OTP requested or OTP expired' });
        }

        if (user.otpExpiry < new Date()) {
            console.warn(`[OTP] Verify failed: OTP expired for ${cleanEmail}`);
            return res.status(400).json({ message: 'OTP has expired' });
        }

        console.log(`[OTP] Comparing hashed OTP for ${cleanEmail}...`);

        // Development Master OTP bypass
        const isMasterOtp = (process.env.NODE_ENV === 'development' || process.env.ALLOW_MASTER_OTP === 'true') && otp === '000000';
        const isMatch = isMasterOtp || await bcrypt.compare(otp, user.otp);

        if (!isMatch) {
            console.warn(`[OTP] Verify failed: Incorrect code for ${cleanEmail}`);
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        console.log(`[OTP] Success! Clearing OTP for ${cleanEmail}`);
        // Clear OTP
        user.otp = undefined;
        user.otpExpiry = undefined;
        user.isEmailVerified = true;
        await user.save();

        // Generate JWT
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                console.log(`[OTP] Login token generated for ${cleanEmail}`);
                res.json({
                    message: 'Login successful',
                    token,
                    user: {
                        id: user.id,
                        firstName: user.firstName,
                        email: user.email,
                        role: user.role,
                        isProfileComplete: user.isProfileComplete
                    }
                });
            }
        );

    } catch (err) {
        console.error('[OTP] Verify Critical Error:', err);
        res.status(500).json({ message: 'Verification failed', error: err.message });
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Direct password reset without OTP
router.post('/forgot-password', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('role', 'Role is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    try {
        let user = await User.findOne({ email: cleanEmail, role });

        if (!user) {
            return res.status(404).json({ message: `No ${role} account found with this email` });
        }

        // Set New Password directly without OTP
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        res.json({ message: 'Password has been reset successfully. You can now log in.' });

    } catch (err) {
        console.error('Forgot Password Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/auth/reset-password
// @desc    Reset Password (deprecated - use forgot-password instead)
router.post('/reset-password', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('role', 'Role is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    try {
        const user = await User.findOne({ email: cleanEmail, role });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Set New Password directly
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        res.json({ message: 'Password has been reset successfully. You can now log in.' });

    } catch (err) {
        console.error('Reset Password Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
