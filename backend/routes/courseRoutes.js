const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Course = require('../models/Course');
const User = require('../models/User');

const multer = require('multer');
const { uploadFile, deleteFile } = require('../utils/uploadService');
const { sendCourseEnrollmentEmail } = require('../utils/emailService');

// Configure Multer
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
}).fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'content', maxCount: 1 }
]);

// @route   POST /api/courses
// @desc    Post a new course with file uploads
router.post('/', auth, upload, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found. Please log in again.' });
        }
        if (user.role !== 'employer' && user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Only employers can post courses.' });
        }

        const populatedUser = await User.findById(req.user.id).populate('company');
        /*
        if (!populatedUser.company || populatedUser.company.verificationStatus !== 'verified') {
            return res.status(403).json({ message: 'Your company must be verified before you can post courses.' });
        }
        */

        const { title, description, level } = req.body;

        // Log files for debugging
        console.log('Files received:', req.files);

        let thumbnailUrl = '';
        let contentUrl = '';

        // Upload Thumbnail if exists
        if (req.files && req.files.thumbnail) {
            console.log('📡 Attempting thumbnail upload...');
            const uploadedUrl = await uploadFile(req.files.thumbnail[0], 'course-thumbnails');
            if (uploadedUrl) {
                thumbnailUrl = uploadedUrl;
                console.log('✅ Thumbnail upload successful:', thumbnailUrl);
            }
        }

        if (req.files && req.files.content) {
            console.log('📡 Attempting content upload...');
            const uploadedUrl = await uploadFile(req.files.content[0], 'course-content');
            if (uploadedUrl) {
                contentUrl = uploadedUrl;
                console.log('✅ Content upload successful:', contentUrl);
            }
        }

        const newCourse = new Course({
            title,
            description,
            level: level || 'Beginner',
            thumbnailUrl,
            contentUrl,
            createdBy: req.user.id
        });

        const course = await newCourse.save();
        res.status(201).json(course);
    } catch (err) {
        console.error('❌ Course Upload Full Error:', {
            message: err.message,
            stack: err.stack,
            details: err.response?.data || err
        });
        res.status(500).json({ message: 'Server Error during upload', error: err.message });
    }
});

// @route   GET /api/courses/my-courses
// @desc    Get all courses posted by the logged-in employer
router.get('/my-courses', auth, async (req, res) => {
    try {
        const courses = await Course.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
        const coursesWithStudents = await Promise.all(courses.map(async (course) => {
            const studentCount = await Enrollment.countDocuments({ course: course._id });
            return {
                ...course.toObject(),
                studentsCount: studentCount
            };
        }));
        res.json(coursesWithStudents);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/courses
// @desc    Get all courses
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });
        res.json(courses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/courses/my-enrollments
// @desc    Get all courses a student is enrolled in
router.get('/my-enrollments', auth, async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ user: req.user.id })
            .populate('course')
            .sort({ createdAt: -1 });
        res.json(enrollments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/courses/:id
// @desc    Get a single course
router.get('/:id', async (req, res) => {
    try {
        const courseId = req.params.id;
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: 'Invalid Course ID' });
        }

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/courses/:id
// @desc    Update a course with optional file uploads
router.put('/:id', auth, upload, async (req, res) => {
    try {
        const courseId = req.params.id;
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: 'Invalid Course ID' });
        }

        let course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Make sure user owns the course
        if (course.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const { title, description, level } = req.body;
        const courseFields = {};
        if (title) courseFields.title = title;
        if (description) courseFields.description = description;
        if (level) courseFields.level = level;

        // Handle File Updates if they exist
        if (req.files) {
            if (req.files.thumbnail) {
                console.log('📡 Attempting thumbnail update...');
                const uploadedUrl = await uploadFile(req.files.thumbnail[0], 'course-thumbnails');
                if (uploadedUrl) {
                    if (course.thumbnailUrl) await deleteFile(course.thumbnailUrl);
                    courseFields.thumbnailUrl = uploadedUrl;
                    console.log('✅ Thumbnail updated successfully:', uploadedUrl);
                }
            }
            if (req.files.content) {
                console.log('📡 Attempting content update...');
                const uploadedUrl = await uploadFile(req.files.content[0], 'course-content');
                if (uploadedUrl) {
                    if (course.contentUrl) await deleteFile(course.contentUrl);
                    courseFields.contentUrl = uploadedUrl;
                    console.log('✅ Content updated successfully:', uploadedUrl);
                }
            }
        }

        course = await Course.findByIdAndUpdate(
            req.params.id,
            { $set: courseFields },
            { new: true }
        );

        res.json(course);
    } catch (err) {
        console.error('Course Update Error:', err.message);
        res.status(500).json({ message: 'Server Error during course update', error: err.message });
    }
});

// @route   DELETE /api/courses/:id
// @desc    Delete a course
router.delete('/:id', auth, async (req, res) => {
    try {
        const courseId = req.params.id;
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: 'Invalid Course ID' });
        }

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Make sure user owns the course
        if (course.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // Delete files from storage
        if (course.thumbnailUrl) await deleteFile(course.thumbnailUrl);
        if (course.contentUrl) await deleteFile(course.contentUrl);

        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: 'Course removed successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

const Enrollment = require('../models/Enrollment');

// @route   POST /api/courses/enroll/:id
// @desc    Enroll in a course
router.post('/enroll/:id', auth, async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.user.id;

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Check for duplicate enrollment
        const existingEnrollment = await Enrollment.findOne({ course: courseId, user: userId });
        if (existingEnrollment) return res.status(400).json({ message: 'You are already enrolled in this course' });

        const enrollment = new Enrollment({
            course: courseId,
            user: userId
        });

        await enrollment.save();

        // Fetch user and instructor details to send the email
        const user = await User.findById(userId);
        const instructor = await User.findById(course.createdBy);
        const instructorName = instructor ? `${instructor.firstName} ${instructor.lastName}`.trim() : 'Instructor';

        if (user && user.email) {
            await sendCourseEnrollmentEmail(user.email, user.firstName || 'Student', course.title, instructorName);
        }

        res.status(201).json({ message: 'Enrolled successfully', enrollment });
    } catch (err) {
        console.error(`[CourseRoutes] Enrollment error: ${err.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/courses/students/:courseId
// @desc    Get all students enrolled in a course (Instructor only)
router.get('/students/:courseId', auth, async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Verify ownership
        if (course.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view students for this course' });
        }

        const Students = await Enrollment.find({ course: courseId })
            .populate('user', 'firstName lastName email photoUrl bio skills experience education')
            .sort({ createdAt: -1 });

        res.json(Students);
    } catch (err) {
        console.error(`[CourseRoutes] Error fetching students: ${err.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
