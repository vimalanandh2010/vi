const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadPhoto, uploadResume, uploadCertificate, proxyResume, saveResumeAnalysis } = require('../controllers/jobseekerController');
const auth = require('../middleware/auth');
const multer = require('multer');

// Multer config for buffer storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// @route   GET /api/jobseeker/profile
router.get('/profile', auth, getProfile);

// @route   PUT /api/jobseeker/profile
router.put('/profile', auth, updateProfile);

// @route   POST /api/jobseeker/photo
router.post('/photo', auth, upload.single('photo'), uploadPhoto);

// @route   POST /api/jobseeker/resume
router.post('/resume', auth, upload.single('resume'), uploadResume);

// @route   POST /api/jobseeker/certificate
router.post('/certificate', auth, upload.single('certificate'), uploadCertificate);

// @route   GET /api/jobseeker/proxy-resume
router.get('/proxy-resume', auth, proxyResume);


module.exports = router;
