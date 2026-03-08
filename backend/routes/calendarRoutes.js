const express = require('express');
const router = express.Router();
const googleCalendarService = require('../services/googleCalendarService');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Application = require('../models/Application');

/**
 * @route   GET /api/calendar/auth-url
 * @desc    Get Google Calendar OAuth URL
 * @access  Private (Recruiter)
 */
router.get('/auth-url', auth, async (req, res) => {
    try {
        const authUrl = googleCalendarService.getAuthUrl();
        res.json({ success: true, authUrl });
    } catch (error) {
        console.error('Error generating auth URL:', error);
        res.status(500).json({ message: 'Failed to generate authorization URL' });
    }
});

/**
 * @route   POST /api/calendar/callback
 * @desc    Handle Google OAuth callback and store tokens
 * @access  Private (Recruiter)
 */
router.post('/callback', auth, async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ message: 'Authorization code required' });
        }

        // Exchange code for tokens
        const tokens = await googleCalendarService.getTokensFromCode(code);

        // Store tokens in user document (you may want to encrypt these)
        await User.findByIdAndUpdate(req.user.id, {
            googleCalendarTokens: tokens
        });

        res.json({ 
            success: true, 
            message: 'Google Calendar connected successfully' 
        });

    } catch (error) {
        console.error('Error in OAuth callback:', error);
        res.status(500).json({ message: 'Failed to authorize Google Calendar' });
    }
});

/**
 * @route   POST /api/calendar/sync-interview/:applicationId
 * @desc    Sync specific interview to Google Calendar
 * @access  Private (Recruiter)
 */
router.post('/sync-interview/:applicationId', auth, async (req, res) => {
    try {
        // Get user's Google Calendar tokens
        const user = await User.findById(req.user.id);
        
        if (!user.googleCalendarTokens || !user.googleCalendarTokens.access_token) {
            return res.status(401).json({ 
                message: 'Google Calendar not connected. Please authorize first.',
                requiresAuth: true
            });
        }

        // Get application details
        const application = await Application.findById(req.params.applicationId)
            .populate('user', 'firstName lastName email')
            .populate('job', 'title');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        if (application.status !== 'interview' || !application.interviewDate) {
            return res.status(400).json({ message: 'Interview not scheduled for this application' });
        }

        // Prepare interview data
        const interviewData = {
            candidateName: `${application.user.firstName} ${application.user.lastName}`,
            candidateEmail: application.user.email,
            jobTitle: application.job.title,
            interviewDate: application.interviewDate,
            interviewTime: application.interviewTime,
            meetingLink: application.meetingLink,
            notes: application.interviewNotes,
            recruiterEmail: req.user.email
        };

        // Create calendar event
        const result = await googleCalendarService.createInterviewEvent(
            interviewData,
            user.googleCalendarTokens.access_token
        );

        // Store calendar event ID and auto-generated meeting link in application
        application.googleCalendarEventId = result.eventId;
        if (result.meetingLink && !application.meetingLink) {
            application.meetingLink = result.meetingLink;
        }
        await application.save();

        res.json({
            success: true,
            message: 'Interview synced to Google Calendar',
            eventLink: result.eventLink,
            meetingLink: result.meetingLink
        });

    } catch (error) {
        console.error('Error syncing to Google Calendar:', error);
        
        // Check if token expired
        if (error.message && error.message.includes('invalid_grant')) {
            return res.status(401).json({ 
                message: 'Google Calendar authorization expired. Please reconnect.',
                requiresAuth: true
            });
        }

        res.status(500).json({ message: 'Failed to sync interview to Google Calendar' });
    }
});

/**
 * @route   POST /api/calendar/sync-all
 * @desc    Sync all upcoming interviews to Google Calendar
 * @access  Private (Recruiter)
 */
router.post('/sync-all', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user.googleCalendarTokens || !user.googleCalendarTokens.access_token) {
            return res.status(400).json({ 
                message: 'Google Calendar not connected. Please connect first.',
                requiresAuth: true
            });
        }

        // Get all upcoming interviews for this recruiter's jobs
        const upcomingInterviews = await Application.find({
            status: 'interview',
            interviewDate: { $exists: true, $ne: '' },
            googleCalendarEventId: { $exists: false } // Only sync those not already synced
        })
            .populate('user', 'firstName lastName email')
            .populate('job', 'title recruiter');

        // Filter to only this recruiter's jobs (with safety checks)
        const recruiterInterviews = upcomingInterviews.filter(
            app => app.job && app.job.recruiter && app.job.recruiter.toString() === req.user.id
        );

        // If no interviews to sync
        if (recruiterInterviews.length === 0) {
            return res.json({
                success: true,
                message: 'No new interviews to sync',
                syncedCount: 0,
                totalCount: 0
            });
        }

        let syncedCount = 0;
        const errors = [];

        for (const application of recruiterInterviews) {
            try {
                // Validate required data
                if (!application.user || !application.user.email) {
                    console.warn(`Skipping application ${application._id}: No user data`);
                    continue;
                }

                if (!application.interviewTime) {
                    console.warn(`Skipping application ${application._id}: No interview time`);
                    continue;
                }

                const interviewData = {
                    candidateName: `${application.user.firstName || 'Candidate'} ${application.user.lastName || ''}`.trim(),
                    candidateEmail: application.user.email,
                    jobTitle: application.job.title,
                    interviewDate: application.interviewDate,
                    interviewTime: application.interviewTime,
                    meetingLink: application.meetingLink || '',
                    notes: application.interviewNotes || '',
                    recruiterEmail: user.email
                };

                const result = await googleCalendarService.createInterviewEvent(
                    interviewData,
                    user.googleCalendarTokens.access_token
                );

                application.googleCalendarEventId = result.eventId;
                if (result.meetingLink && !application.meetingLink) {
                    application.meetingLink = result.meetingLink;
                }
                await application.save();
                
                syncedCount++;
            } catch (error) {
                console.error(`Failed to sync application ${application._id}:`, error.message);
                errors.push({ applicationId: application._id, error: error.message });
            }
        }

        res.json({
            success: true,
            message: syncedCount > 0 
                ? `Successfully synced ${syncedCount} interview${syncedCount === 1 ? '' : 's'}!` 
                : 'No interviews could be synced',
            syncedCount,
            totalCount: recruiterInterviews.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Error syncing all interviews:', error);
        res.status(500).json({ 
            message: 'Failed to sync interviews',
            error: error.message 
        });
    }
});

/**
 * @route   GET /api/calendar/status
 * @desc    Check Google Calendar connection status
 * @access  Private (Recruiter)
 */
router.get('/status', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        const isConnected = !!(user.googleCalendarTokens && user.googleCalendarTokens.access_token);

        res.json({
            success: true,
            connected: isConnected,
            email: isConnected ? user.email : null
        });

    } catch (error) {
        console.error('Error checking calendar status:', error);
        res.status(500).json({ message: 'Failed to check calendar status' });
    }
});

/**
 * @route   POST /api/calendar/disconnect
 * @desc    Disconnect Google Calendar and remove tokens
 * @access  Private
 */
router.post('/disconnect', auth, async (req, res) => {
    try {
        // Remove Google Calendar tokens from user
        await User.findByIdAndUpdate(req.user.id, {
            $unset: { googleCalendarTokens: 1 }
        });

        res.json({
            success: true,
            message: 'Successfully disconnected Google Calendar'
        });

    } catch (error) {
        console.error('Error disconnecting calendar:', error);
        res.status(500).json({ message: 'Failed to disconnect calendar' });
    }
});

/**
 * @route   GET /api/calendar/events
 * @desc    Fetch events from Google Calendar
 * @access  Private (Recruiter)
 */
router.get('/events', auth, async (req, res) => {
    try {
        // Get user's Google Calendar tokens
        const user = await User.findById(req.user.id);
        
        if (!user.googleCalendarTokens || !user.googleCalendarTokens.access_token) {
            return res.status(401).json({ 
                success: false,
                message: 'Google Calendar not connected. Please authorize first.',
                requiresAuth: true,
                events: []
            });
        }

        // Optional date range parameters
        const { startDate, endDate } = req.query;
        let timeMin = startDate ? new Date(startDate) : null;
        let timeMax = endDate ? new Date(endDate) : null;

        // Fetch events from Google Calendar
        const events = await googleCalendarService.fetchCalendarEvents(
            user.googleCalendarTokens.access_token,
            timeMin,
            timeMax
        );

        res.json({
            success: true,
            events,
            count: events.length
        });

    } catch (error) {
        console.error('Error fetching calendar events:', error);
        
        // Check if token expired
        if (error.message && error.message.includes('Authorization expired')) {
            return res.status(401).json({ 
                success: false,
                message: 'Google Calendar authorization expired. Please reconnect.',
                requiresAuth: true,
                events: []
            });
        }

        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch calendar events',
            error: error.message,
            events: []
        });
    }
});

module.exports = router;
