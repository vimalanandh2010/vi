const User = require('../models/User');
const { uploadFile, deleteFile } = require('../utils/uploadService');
const axios = require('axios');

/**
 * @desc    Get current jobseeker profile
 * @route   GET /api/jobseeker/profile
 * @access  Private (Seeker)
 */
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error('Get Profile Error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Update or Create jobseeker profile
 * @route   PUT /api/jobseeker/profile
 * @access  Private (Seeker)
 */
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updateData = req.body;

        // Grouped updates handled by the frontend sending structured objects
        // However, we ensure only allowed fields are updated
        const allowedFields = [
            'firstName', 'lastName', 'phoneNumber', 'location',
            'aboutMe', 'primarySkill', 'education', 'experience',
            'projects', 'socialLinks', 'jobPreferences', 'photoUrl',
            'resumeUrl', 'accomplishments', 'certifications', 'experienceLevel',
            'preferredRole'
        ];

        const userFields = {};
        for (const key of allowedFields) {
            if (typeof updateData[key] !== 'undefined') {
                // Map frontend nested education to backend array if necessary
                if (key === 'education' && !Array.isArray(updateData[key])) {
                    const edu = updateData[key];
                    const eduArray = [];
                    if (edu.tenth?.schoolName) eduArray.push({ level: '10th', schoolName: edu.tenth.schoolName, score: edu.tenth.score });
                    if (edu.twelfth?.schoolOrCollegeName) eduArray.push({ level: '12th', schoolOrCollegeName: edu.twelfth.schoolOrCollegeName, score: edu.twelfth.score });
                    if (edu.degree?.degreeName) eduArray.push({
                        level: 'Graduation',
                        degreeName: edu.degree.degreeName,
                        collegeName: edu.degree.collegeName,
                        institutionName: edu.degree.collegeName,
                        yearOfPassing: edu.degree.yearOfPassing,
                        score: edu.degree.score
                    });
                    userFields[key] = eduArray;
                }
                // Map social handles to nested object
                else if (key === 'socialLinks' && updateData.socialLinks) {
                    userFields.socialLinks = {
                        github: updateData.socialLinks.github || '',
                        linkedin: updateData.socialLinks.linkedin || '',
                        portfolio: updateData.socialLinks.portfolio || ''
                    };
                }
                else {
                    userFields[key] = updateData[key];
                }
            }
        }

        // Special handling for legacy/alternate social link fields from ProfileSetup.jsx
        if (updateData.githubUrl) {
            if (!userFields.socialLinks) userFields.socialLinks = {};
            userFields.socialLinks.github = updateData.githubUrl;
        }
        if (updateData.linkedInUrl) {
            if (!userFields.socialLinks) userFields.socialLinks = {};
            userFields.socialLinks.linkedin = updateData.linkedInUrl;
        }
        if (updateData.portfolioUrl) {
            if (!userFields.socialLinks) userFields.socialLinks = {};
            userFields.socialLinks.portfolio = updateData.portfolioUrl;
        }

        console.log('--- Profile Update Payload ---');
        console.log(JSON.stringify(userFields, null, 2));

        // Sync root preferredRole to jobPreferences for consistency if one is provided
        if (userFields.preferredRole) {
            if (!userFields.jobPreferences) userFields.jobPreferences = {};
            userFields.jobPreferences.preferredRole = userFields.preferredRole;
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: userFields },
            { new: true, runValidators: true }
        ).select('-password');

        console.log('--- Update Result ---');
        console.log('New preferredRole:', user.preferredRole);
        console.log('New jobPreferences.preferredRole:', user.jobPreferences?.preferredRole);

        res.json(user);
    } catch (err) {
        console.error('Update Profile Error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

/**
 * @desc    Upload Profile Photo to Supabase
 * @route   POST /api/jobseeker/photo
 */
exports.uploadPhoto = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const user = await User.findById(req.user.id);

        // Delete old photo if exists
        if (user.photoUrl) {
            await deleteFile(user.photoUrl);
        }

        const publicUrl = await uploadFile(req.file, 'photos');
        if (!publicUrl) throw new Error('Upload failed');

        user.photoUrl = publicUrl;
        await user.save();

        res.json({ photoUrl: publicUrl });
    } catch (err) {
        console.error('Photo Upload Error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Upload Resume to Supabase
 * @route   POST /api/jobseeker/resume
 */
exports.uploadResume = async (req, res) => {
    try {
        console.log('📄 Resume upload request received');

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete old resume if exists
        if (user.resumeUrl) {
            console.log('🗑️ Deleting old resume:', user.resumeUrl);
            await deleteFile(user.resumeUrl);
        }

        console.log('📤 Uploading file to Supabase...');
        const publicUrl = await uploadFile(req.file, 'resumes');

        if (!publicUrl) {
            console.error('❌ Supabase Upload failed, returning error instead of local fallback');
            return res.status(500).json({ message: 'Cloud storage upload failed' });
        }

        if (publicUrl.startsWith('/uploads')) {
            console.warn('⚠️ [Controller] uploadFile returned a local URL:', publicUrl);
        }

        console.log('✅ Upload successful, URL:', publicUrl);
        user.resumeUrl = publicUrl;
        await user.save();

        res.json({ resumeUrl: publicUrl });
    } catch (err) {
        console.error('❌ Resume Upload Error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

/**
 * @desc    Upload Certificate to Supabase
 * @route   POST /api/jobseeker/certificate
 */
exports.uploadCertificate = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const publicUrl = await uploadFile(req.file, 'certificates');
        if (!publicUrl) throw new Error('Upload failed');

        res.json({ certificateUrl: publicUrl });
    } catch (err) {
        console.error('Certificate Upload Error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Proxy resume fetch to bypass CORS and serve PDFs properly
 * @route   GET /api/jobseeker/proxy-resume
 * @access  Private (Seeker)
 */
exports.proxyResume = async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ message: 'URL is required' });

        // Handle relative URLs (local fallbacks)
        let finalUrl = url;
        if (url.startsWith('/uploads')) {
            const host = req.get('host');
            const protocol = req.protocol;
            finalUrl = `${protocol}://${host}${url}`;
            console.log(`[Proxy] Relative URL detected, converting to: ${finalUrl}`);
        }

        console.log(`[Proxy] Fetching resume from: ${finalUrl}`);

        const response = await axios({
            method: 'get',
            url: finalUrl,
            responseType: 'stream',
            timeout: 30000 // 30 second timeout
        });

        // Set proper headers for PDF viewing
        const contentType = response.headers['content-type'] || 'application/pdf';
        res.setHeader('Content-Type', contentType);

        // Allow inline viewing in browser
        res.setHeader('Content-Disposition', 'inline');

        // CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');

        if (response.headers['content-length']) {
            res.setHeader('Content-Length', response.headers['content-length']);
        }

        response.data.pipe(res);
    } catch (err) {
        console.error('[Proxy] Resume Proxy Error:', err.message);
        if (err.response) {
            console.error(`[Proxy] External service returned ${err.response.status}:`, err.response.data);
            return res.status(err.response.status).json({
                message: 'External storage error',
                error: err.message,
                status: err.response.status
            });
        }
        res.status(500).json({ message: 'Failed to proxy resume', error: err.message });
    }
};

