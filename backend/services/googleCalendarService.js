const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

/**
 * Google Calendar Service
 * Supports both OAuth 2.0 and Service Account authentication
 */

class GoogleCalendarService {
    constructor() {
        this.oauth2Client = null;
        this.serviceAuth = null;
        this.calendar = null;
        this.authType = process.env.GOOGLE_CALENDAR_TYPE || 'oauth'; // 'oauth' or 'service_account'
    }

    /**
     * Initialize Service Account authentication
     * For Google Workspace accounts with domain-wide delegation
     */
    initializeServiceAccount() {
        try {
            const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;
            const adminEmail = process.env.GOOGLE_CALENDAR_ADMIN_EMAIL;

            if (!serviceAccountPath) {
                console.log('⚠️  No service account configured, using OAuth method');
                return false;
            }

            const keyFilePath = path.resolve(__dirname, '..', serviceAccountPath);
            
            if (!fs.existsSync(keyFilePath)) {
                console.log('⚠️  Service account file not found:', keyFilePath);
                return false;
            }

            const serviceAccount = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));

            this.serviceAuth = new google.auth.JWT({
                email: serviceAccount.client_email,
                key: serviceAccount.private_key,
                scopes: [
                    'https://www.googleapis.com/auth/calendar',
                    'https://www.googleapis.com/auth/calendar.events'
                ],
                subject: adminEmail // Impersonate this user
            });

            this.calendar = google.calendar({ version: 'v3', auth: this.serviceAuth });
            
            console.log('✅ Service Account initialized for:', serviceAccount.client_email);
            return true;

        } catch (error) {
            console.error('❌ Service Account initialization failed:', error.message);
            return false;
        }
    }

    /**
     * Initialize OAuth2 client with credentials
     */
    initializeClient(credentials) {
        const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FRONTEND_URL } = process.env;
        
        this.oauth2Client = new google.auth.OAuth2(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            `${FRONTEND_URL}/auth/google/callback`
        );

        if (credentials) {
            this.oauth2Client.setCredentials(credentials);
        }

        this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    }

    /**
     * Generate Google OAuth URL for calendar access
     */
    getAuthUrl() {
        const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FRONTEND_URL } = process.env;
        
        const oauth2Client = new google.auth.OAuth2(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            `${FRONTEND_URL}/auth/google/callback`
        );

        const scopes = [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events'
        ];

        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent'
        });

        return url;
    }

    /**
     * Exchange authorization code for tokens
     */
    async getTokensFromCode(code) {
        const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FRONTEND_URL } = process.env;
        
        const oauth2Client = new google.auth.OAuth2(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            `${FRONTEND_URL}/auth/google/callback`
        );

        const { tokens } = await oauth2Client.getToken(code);
        return tokens;
    }

    /**
     * Create a calendar event for an interview
     * Supports both OAuth and Service Account
     */
    async createInterviewEvent(interviewData, accessToken = null) {
        try {
            // Choose authentication method
            if (this.authType === 'service_account' && !this.serviceAuth) {
                this.initializeServiceAccount();
            }
            
            if (this.authType === 'oauth' && accessToken) {
                this.initializeClient({ access_token: accessToken });
            }

            if (!this.calendar) {
                throw new Error('Calendar not initialized. Check authentication configuration.');
            }

            const {
                candidateName,
                candidateEmail,
                jobTitle,
                interviewDate,
                interviewTime,
                meetingLink,
                notes,
                recruiterEmail
            } = interviewData;

            // Parse date and time
            const [year, month, day] = interviewDate.split('-');
            const [hours, minutes] = interviewTime.split(':');
            
            // Create start datetime
            const startDateTime = new Date(year, month - 1, day, hours, minutes);
            // End time: 1 hour after start
            const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

            // Format for Google Calendar
            const event = {
                summary: `Interview: ${candidateName} - ${jobTitle}`,
                description: `
Interview with ${candidateName} for ${jobTitle} position.

${notes ? `Notes: ${notes}\n` : ''}
${meetingLink ? `Meeting Link: ${meetingLink}` : 'In-person interview'}
                `.trim(),
                start: {
                    dateTime: startDateTime.toISOString(),
                    timeZone: 'Asia/Kolkata', // Adjust based on your timezone
                },
                end: {
                    dateTime: endDateTime.toISOString(),
                    timeZone: 'Asia/Kolkata',
                },
                attendees: [
                    { email: candidateEmail },
                    { email: recruiterEmail }
                ],
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'email', minutes: 24 * 60 }, // 1 day before
                        { method: 'popup', minutes: 30 }, // 30 minutes before
                    ],
                },
                conferenceData: meetingLink ? {
                    entryPoints: [{
                        entryPointType: 'video',
                        uri: meetingLink,
                        label: 'Join Interview'
                    }]
                } : undefined
            };

            const response = await this.calendar.events.insert({
                calendarId: 'primary',
                resource: event,
                sendUpdates: 'all', // Send email invites to attendees
                conferenceDataVersion: meetingLink ? 1 : 0
            });

            return {
                success: true,
                eventId: response.data.id,
                eventLink: response.data.htmlLink
            };

        } catch (error) {
            console.error('Error creating Google Calendar event:', error);
            throw new Error(`Failed to create calendar event: ${error.message}`);
        }
    }

    /**
     * Update an existing calendar event
     */
    async updateInterviewEvent(eventId, updatedData, accessToken) {
        try {
            this.initializeClient({ access_token: accessToken });

            const {
                interviewDate,
                interviewTime,
                meetingLink,
                notes
            } = updatedData;

            // Parse date and time
            const [year, month, day] = interviewDate.split('-');
            const [hours, minutes] = interviewTime.split(':');
            
            const startDateTime = new Date(year, month - 1, day, hours, minutes);
            const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

            const updates = {
                start: {
                    dateTime: startDateTime.toISOString(),
                    timeZone: 'Asia/Kolkata',
                },
                end: {
                    dateTime: endDateTime.toISOString(),
                    timeZone: 'Asia/Kolkata',
                },
                description: notes || undefined
            };

            await this.calendar.events.update({
                calendarId: 'primary',
                eventId: eventId,
                resource: updates,
                sendUpdates: 'all'
            });

            return { success: true };

        } catch (error) {
            console.error('Error updating Google Calendar event:', error);
            throw new Error(`Failed to update calendar event: ${error.message}`);
        }
    }

    /**
     * Delete a calendar event
     */
    async deleteInterviewEvent(eventId, accessToken) {
        try {
            this.initializeClient({ access_token: accessToken });

            await this.calendar.events.delete({
                calendarId: 'primary',
                eventId: eventId,
                sendUpdates: 'all'
            });

            return { success: true };

        } catch (error) {
            console.error('Error deleting Google Calendar event:', error);
            throw new Error(`Failed to delete calendar event: ${error.message}`);
        }
    }

    /**
     * Fetch events from Google Calendar
     * @param {string} accessToken - User's Google access token
     * @param {Date} timeMin - Minimum date to fetch from (optional)
     * @param {Date} timeMax - Maximum date to fetch to (optional)
     * @returns {Promise<Array>} - List of calendar events
     */
    async fetchCalendarEvents(accessToken, timeMin = null, timeMax = null) {
        try {
            this.initializeClient({ access_token: accessToken });

            if (!this.calendar) {
                throw new Error('Calendar not initialized');
            }

            // Default: fetch events from 3 months ago to 6 months ahead
            const defaultTimeMin = timeMin || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
            const defaultTimeMax = timeMax || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);

            const response = await this.calendar.events.list({
                calendarId: 'primary',
                timeMin: defaultTimeMin.toISOString(),
                timeMax: defaultTimeMax.toISOString(),
                maxResults: 100,
                singleEvents: true,
                orderBy: 'startTime'
            });

            const events = response.data.items || [];

            // Format events for frontend
            return events.map(event => ({
                id: event.id,
                title: event.summary || 'No Title',
                description: event.description || '',
                startDateTime: event.start.dateTime || event.start.date,
                endDateTime: event.end.dateTime || event.end.date,
                location: event.location || '',
                attendees: event.attendees || [],
                htmlLink: event.htmlLink,
                meetingLink: event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri || '',
                creator: event.creator?.email || '',
                status: event.status
            }));

        } catch (error) {
            console.error('Error fetching Google Calendar events:', error);
            
            // More detailed error handling
            if (error.response?.status === 401) {
                throw new Error('Authorization expired. Please reconnect your Google Calendar.');
            }
            
            throw new Error(`Failed to fetch calendar events: ${error.message}`);
        }
    }
}

module.exports = new GoogleCalendarService();
