const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Startup validation: warn clearly if email credentials are missing
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('⚠️ ========================================');
    console.error('⚠️ EMAIL_USER or EMAIL_PASS is NOT SET!');
    console.error('⚠️ OTP emails WILL NOT be sent.');
    console.error('⚠️ Set these in your Render Environment Variables.');
    console.error('⚠️ ========================================');
}

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    logger: process.env.NODE_ENV !== 'production',
    debug: process.env.NODE_ENV !== 'production'
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.error('❌ Email Service Error:', error.message);
        console.error('❌ Email delivery will fail. Check EMAIL_USER and EMAIL_PASS environment variables.');
    } else {
        console.log('✅ Email Service is ready to take our messages');
    }
});

const sendWelcomeEmail = async (email, name) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to Future Milestone Job Portal!',
            html: `
                <h1>Welcome, ${name}!</h1>
                <p>Thank you for registering with Future Milestone. We are excited to help you find your dream job (or dream candidate).</p>
                <p>Explore thousands of job listings and take the next step in your career.</p>
                <br>
                <p>Best Regards,<br>The Future Milestone Team</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${email}`);
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
};

const sendApplicationEmail = async (email, name, jobTitle, companyName) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Application Received: ${jobTitle}`,
            html: `
                <h1>Hi ${name},</h1>
                <p>Your application for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been successfully submitted.</p>
                <p>The employer will review your profile and get back to you soon.</p>
                <br>
                <p>Good luck!</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Application email sent to ${email}`);
    } catch (error) {
        console.error('Error sending application email:', error);
    }
};

const sendStatusUpdateEmail = async (email, name, jobTitle, companyName, status, atsScore = null) => {
    console.log(`[Email] Attempting to send status update email: ${email}, status: ${status}, score: ${atsScore}`);
    try {
        let subject = `Update on your application for ${jobTitle}`;
        let messageBody = `<p>Your application status for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been updated to: <strong>${status.toUpperCase()}</strong>.</p>`;

        if (status === 'shortlisted' || status === 'interview' || status === 'interviewed') {
            messageBody += `<p>Congratulations! Check your dashboard for more details or next steps.</p>`;
        } else if (status === 'hired' || status === 'offer' || status === 'selected') {
            return await sendSelectionEmail(email, name, jobTitle, companyName);
        } else if (status === 'rejected' || status === 'rejected after interview') {
            if (status === 'rejected after interview') {
                return await sendPostInterviewRejectionEmail(email, name, jobTitle, companyName);
            }
            messageBody += `<p>Thank you for your interest. Unfortunately, the employer has decided not to proceed at this time.</p>`;
            if (atsScore !== null && atsScore !== undefined) {
                messageBody += `<div style="margin-top: 15px; padding: 15px; background: #fff1f2; border-left: 4px solid #ef4444; border-radius: 4px;">
                                    <p style="margin: 0; color: #991b1b;">
                                        <strong>Feedback:</strong> Your profile received an ATS Match Score of <strong>${atsScore}%</strong> against the job requirements. Unfortunately, this did not meet the required threshold for this position.
                                    </p>
                                </div>`;
            }
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            html: `
                <h1>Hi ${name},</h1>
                ${messageBody}
                <br>
                <p>Best Regards,<br>The Future Milestone Team</p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email] Status update email sent to ${email}. Response: ${info.response}`);
    } catch (error) {
        console.error(`[Email] Error sending status update email to ${email}:`, error);
    }
};

const sendSelectionEmail = async (email, name, jobTitle, companyName) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `🎉 Congratulations! You've been selected for ${jobTitle}`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #f8fafc; color: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
                    <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 40px 32px; text-align: center;">
                        <h1 style="margin: 0; font-size: 32px; color: white; font-weight: 800;">🎊 You're Selected!</h1>
                        <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Fantastic news from Future Milestone</p>
                    </div>
                    <div style="padding: 32px; background: white;">
                        <p style="font-size: 18px; margin: 0 0 16px;">Hi <strong>${name}</strong>,</p>
                        <p style="color: #475569; margin: 0 0 24px; line-height: 1.6; font-size: 16px;">
                            We are thrilled to inform you that <strong>${companyName}</strong> has selected you for the position of <strong>${jobTitle}</strong>!
                        </p>
                        <div style="background: #ecfdf5; border: 1px solid #10b98133; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
                            <p style="margin: 0; font-size: 14px; color: #065f46; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Status</p>
                            <p style="margin: 8px 0 0; font-size: 24px; font-weight: 800; color: #059669;">Selected / Hired</p>
                        </div>
                        <p style="color: #475569; margin: 0 0 24px; line-height: 1.6;">
                            The recruitment team will contact you shortly with the next steps, including the offer letter and onboarding process.
                        </p>
                        <div style="border-top: 1px solid #e2e8f0; pt: 24px; mt: 24px;">
                            <p style="color: #64748b; font-size: 14px; margin: 0;">Congratulations on this major milestone!<br><strong style="color: #1e293b;">The Future Milestone Team</strong></p>
                        </div>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Selection email sent to ${email}`);
    } catch (error) {
        console.error('Error sending selection email:', error);
    }
};

const sendVerificationOTPEmail = async (email, otp) => {
    // Always log OTP to server console as fallback
    console.log(`[OTP-FALLBACK] Company Verification OTP for ${email}: ${otp}`);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Action Required: Verify your Company Domain`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #2563eb;">Company Verification</h2>
                <p>Hello,</p>
                <p>Use the following OTP to verify your official company email and complete your recruiter profile. This code is valid for 10 minutes.</p>
                <div style="background: #f3f4f6; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                    <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1e293b;">${otp}</span>
                </div>
                <p>If you did not request this, please ignore this email.</p>
                <br>
                <p>Best Regards,<br>The Future Milestone Team</p>
            </div>
        `
    };

    // Throw on failure so calling code can detect it
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification OTP email sent to ${email}`);
};

const sendOtpEmail = async (email, otp) => {
    // Always log OTP to server console as fallback
    console.log(`[OTP-FALLBACK] Login OTP for ${email}: ${otp}`);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Login OTP - Future Milestone',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #2563eb;">Login Verification</h2>
                <p>Hello,</p>
                <p>Use the following OTP to log in to your account. This code is valid for 5 minutes.</p>
                <div style="background: #f3f4f6; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                    <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1e293b;">${otp}</span>
                </div>
                <p>If you did not request this, please ignore this email.</p>
                <br>
                <p>Best Regards,<br>The Future Milestone Team</p>
            </div>
        `
    };

    // Throw on failure so calling code can detect it
    await transporter.sendMail(mailOptions);
    console.log(`✅ Login OTP email sent to ${email}`);
};

const sendResetPasswordEmail = async (email, otp) => {
    // Always log OTP to server console as fallback
    console.log(`[OTP-FALLBACK] Reset Password OTP for ${email}: ${otp}`);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Code - Future Milestone',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #2563eb;">Password Reset</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password. Use the following OTP to complete the process. This code is valid for 10 minutes.</p>
                <div style="background: #f3f4f6; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                    <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1e293b;">${otp}</span>
                </div>
                <p>If you did not request this, please ignore this email.</p>
                <br>
                <p>Best Regards,<br>The Future Milestone Team</p>
            </div>
        `
    };

    // Throw on failure so calling code can detect it
    await transporter.sendMail(mailOptions);
    console.log(`✅ Reset password OTP email sent to ${email}`);
};

const sendInterviewSlotEmail = async (email, candidateName, jobTitle, companyName, interviewDate, interviewTime, interviewNotes, applicationId, meetingLink = null) => {
    try {
        // Format date nicely: "Monday, 24 February 2026"
        const dateObj = new Date(interviewDate);
        const formattedDate = dateObj.toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        // Format time: "18:00" -> "6:00 PM"
        const [hh, mm] = interviewTime.split(':');
        const h = parseInt(hh, 10);
        const formattedTime = `${h > 12 ? h - 12 : h === 0 ? 12 : h}:${mm} ${h >= 12 ? 'PM' : 'AM'}`;

        // Determine final meeting URL
        // If meetingLink is provided (Google Meet etc), use it. 
        // Otherwise fallback to Jitsi if applicationId is provided.
        const finalMeetingUrl = meetingLink || (applicationId ? `${process.env.FRONTEND_URL || 'http://localhost:5173'}/interview/${applicationId}` : '#');

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Interview Scheduled: ${jobTitle} at ${companyName}`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #0f172a; color: #e2e8f0; border-radius: 16px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #2563eb, #4f46e5); padding: 36px 32px; text-align: center;">
                        <h1 style="margin: 0; font-size: 26px; color: white; font-weight: 800;">🎯 Interview Scheduled!</h1>
                        <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Future Milestone Job Portal</p>
                    </div>
                    <div style="padding: 32px;">
                        <p style="font-size: 16px; margin: 0 0 16px;">Hi <strong style="color: #60a5fa;">${candidateName}</strong>,</p>
                        <p style="color: #94a3b8; margin: 0 0 24px; line-height: 1.6;">
                            Your interview for <strong style="color: white;">${jobTitle}</strong> at <strong style="color: white;">${companyName}</strong> has been scheduled.
                        </p>
                        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                            <div style="display: flex; align-items: center; margin-bottom: 16px;">
                                <span style="font-size: 24px; margin-right: 12px;">📅</span>
                                <div>
                                    <p style="margin: 0; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Interview Date</p>
                                    <p style="margin: 4px 0 0; font-size: 18px; font-weight: 800; color: #60a5fa;">${formattedDate}</p>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; margin-bottom: ${interviewNotes ? '16px' : '0'};">
                                <span style="font-size: 24px; margin-right: 12px;">🕐</span>
                                <div>
                                    <p style="margin: 0; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Interview Time</p>
                                    <p style="margin: 4px 0 0; font-size: 18px; font-weight: 800; color: #a78bfa;">${formattedTime}</p>
                                </div>
                            </div>
                            ${interviewNotes ? `
                            <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
                                <span style="font-size: 24px; margin-right: 12px;">📝</span>
                                <div>
                                    <p style="margin: 0; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Notes</p>
                                    <p style="margin: 4px 0 0; font-size: 14px; color: #94a3b8;">${interviewNotes}</p>
                                </div>
                            </div>` : ''}
                            
                            <div style="margin-top: 24px; text-align: center;">
                                <a href="${finalMeetingUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                                    🎥 Join Interview Session
                                </a>
                            </div>
                        </div>
                        <div style="background: #1e3a5f; border: 1px solid #2563eb33; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
                            <p style="margin: 0; font-size: 13px; color: #93c5fd; line-height: 1.6;">
                                💡 <strong>Tip:</strong> Please be ready 5 minutes before time. Keep your resume handy and ensure a stable internet connection.
                            </p>
                        </div>
                        <p style="color: #64748b; font-size: 13px; margin: 0;">Best of luck!<br><strong style="color: #94a3b8;">The Future Milestone Team</strong></p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`[Email] Interview slot email sent to ${email}`);
    } catch (error) {
        console.error('[Email] Error sending interview slot email:', error);
    }
};

const sendPostInterviewRejectionEmail = async (email, name, jobTitle, companyName) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Update regarding your interview for ${jobTitle}`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #f8fafc; color: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
                    <div style="background: #64748b; padding: 40px 32px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px; color: white; font-weight: 800;">Interview Update</h1>
                    </div>
                    <div style="padding: 32px; background: white;">
                        <p style="font-size: 16px; margin: 0 0 16px;">Hi <strong>${name}</strong>,</p>
                        <p style="color: #475569; margin: 0 0 24px; line-height: 1.6; font-size: 15px;">
                            Thank you for taking the time to interview for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>. 
                            It was a pleasure meeting you and learning more about your background.
                        </p>
                        <p style="color: #475569; margin: 0 0 24px; line-height: 1.6; font-size: 15px;">
                            After careful consideration, the recruitment team has decided to move forward with other candidates at this time. 
                            This was a difficult decision as we were impressed with your skills and experience.
                        </p>
                        <p style="color: #475569; margin: 0 0 24px; line-height: 1.6; font-size: 15px;">
                            We will keep your profile in our database for future opportunities that may be a good fit. 
                            Thank you again for your interest in <strong>${companyName}</strong>.
                        </p>
                        <div style="border-top: 1px solid #e2e8f0; padding-top: 24px;">
                            <p style="color: #64748b; font-size: 14px; margin: 0;">Best regards,<br><strong style="color: #1e293b;">The Future Milestone Team</strong></p>
                        </div>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Post-interview rejection email sent to ${email}`);
    } catch (error) {
        console.error('Error sending post-interview rejection email:', error);
    }
};

const sendCourseEnrollmentEmail = async (email, name, courseTitle, instructorName) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Enrollment Confirmed: ${courseTitle}`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #f8fafc; color: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
                    <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); padding: 40px 32px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px; color: white; font-weight: 800;">📚 Enrollment Confirmed!</h1>
                        <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 15px;">Future Milestone Learning</p>
                    </div>
                    <div style="padding: 32px; background: white;">
                        <p style="font-size: 16px; margin: 0 0 16px;">Hi <strong>${name}</strong>,</p>
                        <p style="color: #475569; margin: 0 0 24px; line-height: 1.6; font-size: 15px;">
                            You have successfully enrolled in the course: <strong>${courseTitle}</strong>.
                        </p>
                        <p style="color: #475569; margin: 0 0 24px; line-height: 1.6; font-size: 15px;">
                            The instructor, <strong>${instructorName || 'the creator'}</strong>, is excited to have you on board! You can now access all the course materials directly from your Dashboard.
                        </p>
                        <div style="border-top: 1px solid #e2e8f0; padding-top: 24px;">
                            <p style="color: #64748b; font-size: 14px; margin: 0;">Happy Learning!<br><strong style="color: #1e293b;">The Future Milestone Team</strong></p>
                        </div>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`[Email] Course enrollment email sent to ${email}`);
    } catch (error) {
        console.error('[Email] Error sending course enrollment email:', error);
    }
};

const sendInterviewReminderEmail = async (email, name, jobTitle, companyName, meetingLink, interviewTime) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Reminder: Action Required - Your interview for ${jobTitle} starts in 30 minutes!`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #fffbeb; color: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #fde68a;">
                    <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 32px; text-align: center;">
                        <h1 style="margin: 0; font-size: 26px; color: white; font-weight: 800;">⏰ Interview Reminder</h1>
                    </div>
                    <div style="padding: 32px; background: white;">
                        <p style="font-size: 16px; margin: 0 0 16px;">Hi <strong>${name}</strong>,</p>
                        <p style="color: #475569; margin: 0 0 24px; line-height: 1.6; font-size: 15px;">
                            This is a friendly reminder that your interview for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> is starting in exactly 30 minutes!
                        </p>
                        <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
                            <p style="margin: 0 0 8px; font-size: 14px; color: #92400e; font-weight: 600; text-transform: uppercase;">Scheduled Time</p>
                            <p style="margin: 0 0 16px; font-size: 22px; font-weight: 800; color: #b45309;">${interviewTime}</p>
                            
                            <a href="${meetingLink}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                                🎥 Join Meeting Room
                            </a>
                        </div>
                        <p style="color: #475569; margin: 0 0 24px; line-height: 1.6;">
                            Please ensure your camera and microphone are working properly before joining.
                        </p>
                        <div style="border-top: 1px solid #e2e8f0; padding-top: 24px;">
                            <p style="color: #64748b; font-size: 14px; margin: 0;">Good luck in your interview!<br><strong style="color: #1e293b;">The Future Milestone Team</strong></p>
                        </div>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`[Email] Interview reminder email sent to ${email}`);
    } catch (error) {
        console.error('[Email] Error sending interview reminder email:', error);
    }
};

const sendInterviewCancelledEmail = async (recruiterEmail, applicantName, jobTitle) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recruiterEmail,
            subject: `Interview Cancelled: ${applicantName} for ${jobTitle}`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #fef2f2; color: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #fca5a5;">
                    <div style="background: #ef4444; padding: 24px 32px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px; color: white; font-weight: 800;">🚫 Interview Cancelled</h1>
                    </div>
                    <div style="padding: 32px; background: white;">
                        <p style="font-size: 16px; margin: 0 0 16px;">Hello,</p>
                        <p style="color: #475569; margin: 0 0 24px; line-height: 1.6; font-size: 15px;">
                            This is an automated notification to let you know that the candidate <strong>${applicantName}</strong> has cancelled their upcoming interview for the position of <strong>${jobTitle}</strong>.
                        </p>
                        <p style="color: #475569; margin: 0 0 24px; line-height: 1.6; font-size: 15px;">
                            Their application status has been updated to "Cancelled" in your Recruiter Dashboard.
                        </p>
                        <div style="border-top: 1px solid #e2e8f0; padding-top: 24px;">
                            <p style="color: #64748b; font-size: 14px; margin: 0;">Best regards,<br><strong style="color: #1e293b;">The Future Milestone Team</strong></p>
                        </div>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`[Email] Interview cancellation email sent to recruiter: ${recruiterEmail}`);
    } catch (error) {
        console.error('[Email] Error sending interview cancellation email:', error);
    }
};

module.exports = {
    sendWelcomeEmail,
    sendApplicationEmail,
    sendStatusUpdateEmail,
    sendVerificationOTPEmail,
    sendOtpEmail,
    sendResetPasswordEmail,
    sendInterviewSlotEmail,
    sendSelectionEmail,
    sendPostInterviewRejectionEmail,
    sendCourseEnrollmentEmail,
    sendInterviewReminderEmail,
    sendInterviewCancelledEmail
};
