const express = require('express');
const router = express.Router();
const recruiterAuth = require('../middleware/recruiterAuth');
const Job = require('../models/Job');
const Application = require('../models/Application');

// @route   GET /api/employer/dashboard-stats
// @desc    Get dashboard statistics for employer
router.get('/dashboard-stats', recruiterAuth, async (req, res) => {
    try {

        // 1. Get all jobs posted by this employer
        const jobs = await Job.find({ postedBy: req.user.id }).sort({ createdAt: -1 });
        const jobIds = jobs.map(j => j._id);

        // 2. Get all applications for these jobs
        const applications = await Application.find({ job: { $in: jobIds } })
            .populate('user', 'firstName lastName email photoUrl')
            .sort({ createdAt: -1 });

        // Calculate stats
        const totalApplications = applications.length;
        const shortlisted = applications.filter(app => ['shortlisted', 'screening'].includes(app.status)).length;
        const inReview = applications.filter(app => ['applied', 'viewed'].includes(app.status)).length;
        const interviewing = applications.filter(app => ['interview', 'scheduled'].includes(app.status)).length;
        const hired = applications.filter(app => ['offer', 'hired'].includes(app.status)).length;
        const rejected = applications.filter(app => app.status === 'rejected').length;

        // Get recent applicants (last 5)
        const recentApplicants = applications.slice(0, 5).map(app => {
            const job = jobs.find(j => j._id.toString() === app.job?.toString());
            return {
                id: app.user?._id,
                name: `${app.user?.firstName || ''} ${app.user?.lastName || ''}`.trim() || 'Anonymous',
                position: job?.title || 'Unknown Position',
                avatar: app.user?.photoUrl || null,
                email: app.user?.email,
                date: app.createdAt
            };
        });

        // Generate monthly data for chart (last 9 months)
        const monthlyData = [];
        const now = new Date();
        for (let i = 8; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = monthDate.toLocaleString('default', { month: 'short' });

            const monthApps = applications.filter(app => {
                const appDate = new Date(app.createdAt);
                return appDate.getMonth() === monthDate.getMonth() &&
                    appDate.getFullYear() === monthDate.getFullYear();
            });

            monthlyData.push({
                month: monthName,
                applied: monthApps.length,
                interview: monthApps.filter(app => app.status === 'interview').length
            });
        }

        res.json({
            success: true,
            message: 'Dashboard stats fetched successfully',
            data: {
                stats: {
                    totalJobs: jobs.length,
                    totalApplications,
                    totalCandidates: new Set(applications.map(a => a.user?._id?.toString())).size,
                    onboarding: hired,
                    appointments: shortlisted,
                    activeJobs: jobs.filter(j => j.status === 'active').length,
                    closedJobs: jobs.filter(j => j.status === 'closed').length
                },
                recentApplicants,
                applicationSummary: {
                    shortlisted,
                    inReview,
                    rejected,
                    total: totalApplications
                },
                monthlyData,
                jobs: jobs.slice(0, 5).map(job => ({
                    _id: job._id,
                    title: job.title,
                    applicants: applications.filter(a => a.job?.toString() === job._id.toString()).length,
                    status: job.status, // Ensure this matches frontend expectation (Active vs active)
                    posted: job.createdAt
                }))
            }
        });
    } catch (err) {
        console.error('Dashboard stats error:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: err.message
        });
    }
});

// @route   GET /api/employer/interviews
// @desc    Get upcoming interviews for employer's jobs
router.get('/interviews', recruiterAuth, async (req, res) => {
    try {
        // 1. Get all jobs posted by this employer
        const jobs = await Job.find({ postedBy: req.user.id });
        const jobIds = jobs.map(j => j._id);

        // 2. Get all applications with interview scheduled for these jobs
        // Include both 'interview' and 'shortlisted' status with interview dates
        const interviews = await Application.find({
            job: { $in: jobIds },
            status: { $in: ['interview', 'shortlisted'] },
            interviewDate: { $exists: true, $ne: null }
        })
            .populate('user', 'firstName lastName email photoUrl')
            .populate('job', 'title location')
            .sort({ interviewDate: 1 }); // Sort by date ascending

        // Format response
        const formattedInterviews = interviews.map(app => ({
            _id: app._id,
            candidate: {
                id: app.user?._id,
                name: `${app.user?.firstName || ''} ${app.user?.lastName || ''}`.trim() || 'Anonymous',
                email: app.user?.email,
                avatar: app.user?.photoUrl
            },
            job: {
                id: app.job?._id,
                title: app.job?.title || 'Unknown Position',
                location: app.job?.location
            },
            interviewDate: app.interviewDate,
            interviewTime: app.interviewTime,
            meetingLink: app.meetingLink,
            status: app.status
        }));

        res.json({
            success: true,
            message: 'Interviews fetched successfully',
            interviews: formattedInterviews
        });
    } catch (err) {
        console.error('Fetch interviews error:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching interviews',
            error: err.message
        });
    }
});

// @route   DELETE /api/employer/interviews/:id
// @desc    Cancel/delete an interview
router.delete('/interviews/:id', recruiterAuth, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id).populate('job');
        
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Interview not found'
            });
        }

        // Verify the job belongs to this recruiter
        if (application.job.postedBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this interview'
            });
        }

        // Update application status back to shortlisted and clear interview details
        application.status = 'shortlisted';
        application.interviewDate = null;
        application.interviewTime = null;
        application.meetingLink = null;
        application.interviewNotes = null;
        await application.save();

        res.json({
            success: true,
            message: 'Interview cancelled successfully'
        });
    } catch (err) {
        console.error('Cancel interview error:', err);
        res.status(500).json({
            success: false,
            message: 'Error cancelling interview',
            error: err.message
        });
    }
});

module.exports = router;
