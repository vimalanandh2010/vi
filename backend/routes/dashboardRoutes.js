const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Job = require('../models/Job');
const Application = require('../models/Application');
const auth = require('../middleware/auth');

// Middleware to ensure user is a recruiter
const recruiterAuth = async (req, res, next) => {
    try {
        await auth(req, res, () => {
            if (req.user.role !== 'employer') {
                return res.status(403).json({ message: 'Access denied. Recruiter only.' });
            }
            next();
        });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};


// @route   GET /api/dashboard/seeker
// @desc    Get seeker dashboard analytics
router.get('/seeker', auth, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        // Aggregate applications by status
        const stats = await Application.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: null,
                    totalApplied: { $sum: 1 },
                    shortlisted: {
                        $sum: { $cond: [{ $eq: ['$status', 'shortlisted'] }, 1, 0] }
                    },
                    interviews: {
                        $sum: {
                            $cond: [{
                                $or: [
                                    { $eq: ['$status', 'interview'] },
                                    { $eq: ['$status', 'scheduled'] }
                                ]
                            }, 1, 0]
                        }
                    },
                    rejected: {
                        $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
                    },
                    offers: {
                        $sum: { $cond: [{ $in: ['$status', ['offer', 'selected']] }, 1, 0] }
                    },
                    hired: {
                        $sum: { $cond: [{ $eq: ['$status', 'hired'] }, 1, 0] }
                    }
                }
            }
        ]);

        const result = stats.length > 0 ? stats[0] : {
            totalApplied: 0,
            shortlisted: 0,
            interviews: 0,
            rejected: 0,
            offers: 0,
            hired: 0
        };

        // Get recent activity (last 5 applications)
        const recentActivity = await Application.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate({
                path: 'job',
                select: 'title company location type',
                populate: { path: 'company', select: 'name logo' }
            })
            .select('status createdAt job');

        res.json({
            stats: {
                applied: result.totalApplied,
                shortlisted: result.shortlisted,
                interviews: result.interviews,
                rejected: result.rejected,
                offers: result.offers,
                hired: result.hired
            },
            recentActivity
        });

    } catch (err) {
        console.error(`[DashboardRoutes] Seeker Error: ${err.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/dashboard/recruiter
// @desc    Get recruiter dashboard analytics (Single API call)
router.get('/recruiter', recruiterAuth, async (req, res) => {
    try {
        const recruiterId = new mongoose.Types.ObjectId(req.user.id);

        // Aggregation Pipeline
        const stats = await Job.aggregate([
            // 1. Match jobs posted by this recruiter
            { $match: { postedBy: recruiterId } },

            // 2. Lookup applications for each job
            {
                $lookup: {
                    from: 'applications',
                    localField: '_id',
                    foreignField: 'job',
                    as: 'applications'
                }
            },

            // 3. Project necessary fields for calculation
            {
                $project: {
                    _id: 1,
                    title: 1,
                    status: 1,
                    createdAt: 1,
                    views: 1,
                    applicationCount: { $size: '$applications' },
                    applications: {
                        $map: {
                            input: '$applications',
                            as: 'app',
                            in: {
                                appliedAt: '$$app.createdAt',
                                status: '$$app.status'
                            }
                        }
                    }
                }
            },

            // 4. Group to calculate global stats
            {
                $group: {
                    _id: null,
                    totalJobs: { $sum: 1 },
                    totalApplications: { $sum: '$applicationCount' },
                    totalViews: { $sum: '$views' },
                    activeJobs: {
                        $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                    },
                    closedJobs: {
                        $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] }
                    },
                    recentApplications: {
                        $push: {
                            $filter: {
                                input: '$applications',
                                as: 'app',
                                cond: {
                                    $gte: ['$$app.appliedAt', new Date(new Date() - 7 * 24 * 60 * 60 * 1000)]
                                }
                            }
                        }
                    },
                    subItem: { $push: '$$ROOT' } // Keep job details for potential list
                }
            },

            // 5. Final Calculation for New Applications (flattening the array of arrays)
            {
                $project: {
                    _id: 0,
                    summary: {
                        totalJobs: '$totalJobs',
                        totalApplications: '$totalApplications',
                        totalViews: '$totalViews',
                        activeJobs: '$activeJobs',
                        closedJobs: '$closedJobs',
                        newApplicationsThisWeek: {
                            $size: {
                                $reduce: {
                                    input: '$recentApplications',
                                    initialValue: [],
                                    in: { $concatArrays: ['$$value', '$$this'] }
                                }
                            }
                        }
                    },
                    // recentActivity: ... (could add more complex logic here if needed)
                }
            }
        ]);

        // Handle case where recruiter has no jobs
        const result = stats.length > 0 ? stats[0] : {
            summary: {
                totalJobs: 0,
                totalApplications: 0,
                totalViews: 0,
                activeJobs: 0,
                closedJobs: 0,
                newApplicationsThisWeek: 0
            }
        };

        res.json(result);

    } catch (err) {
        console.error(`[DashboardRoutes] Error: ${err.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
