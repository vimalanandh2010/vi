const cron = require('node-cron');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { sendInterviewReminderEmail } = require('../utils/emailService');

// Run every 5 minutes
const startInterviewReminders = () => {
    cron.schedule('*/5 * * * *', async () => {
        try {
            console.log('[Cron] Checking for upcoming interviews within the next 30 minutes...');

            // Current time plus 30 minutes
            const now = new Date();
            const targetTime = new Date(now.getTime() + 30 * 60000);

            // Format dates as strings because that's how they are stored (YYYY-MM-DD and HH:mm)
            const targetDateStr = `${targetTime.getFullYear()}-${String(targetTime.getMonth() + 1).padStart(2, '0')}-${String(targetTime.getDate()).padStart(2, '0')}`;

            // Create range for "next 35 minutes" to catch anything starting within 30-35 mins
            const maxTargetTime = new Date(now.getTime() + 35 * 60000);

            // Find applications that are in interview state, haven't been sent a reminder, and start soon
            const upcomingInterviews = await Application.find({
                status: { $in: ['interview', 'scheduled'] },
                reminderSent: false,
                interviewDate: targetDateStr
            }).populate('user').populate('job');

            for (const app of upcomingInterviews) {
                if (!app.interviewTime) continue;

                // Parse the interviewTime (HH:mm)
                const [hours, minutes] = app.interviewTime.split(':').map(Number);

                // Create Date object for the interview time today
                const interviewDateTime = new Date(targetTime);
                interviewDateTime.setHours(hours, minutes, 0, 0);

                // If interview is strictly between now and maxTargetTime + 1 min margin
                const timeDiffMs = interviewDateTime.getTime() - now.getTime();
                const diffMinutes = timeDiffMs / 60000;

                // Trigger reminder if interview is between 25 and 35 mins from now
                if (diffMinutes >= 25 && diffMinutes <= 35) {
                    console.log(`[Cron] Triggering 30-min reminder for Application: ${app._id}`);

                    const seekerName = app.user ? `${app.user.firstName} ${app.user.lastName}`.trim() : 'Candidate';
                    const jobTitle = app.job ? app.job.title : 'Job';
                    const companyName = process.env.COMPANY_NAME || 'Future Milestone'; // Fallback

                    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                    const finalMeetingUrl = app.meetingLink || `${frontendUrl}/interview/${app._id}`;

                    // Format time for email (e.g. 2:00 PM)
                    const formatTime = (t) => {
                        const [h, m] = t.split(':');
                        const hr = parseInt(h, 10);
                        const ampm = hr >= 12 ? 'PM' : 'AM';
                        const hr12 = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
                        return `${hr12}:${m} ${ampm}`;
                    };

                    if (app.user && app.user.email) {
                        await sendInterviewReminderEmail(
                            app.user.email,
                            seekerName,
                            jobTitle,
                            companyName,
                            finalMeetingUrl,
                            formatTime(app.interviewTime)
                        );

                        // Mark reminder as sent so we don't spam
                        app.reminderSent = true;
                        await app.save();
                    }
                }
            }
        } catch (error) {
            console.error('[Cron] Error running interview reminder job:', error);
        }
    });
};

module.exports = startInterviewReminders;
