# Email Automation Strategy & Report

This report outlines the automated email notifications implemented in the Future Milestone Job Portal. The system ensures consistent communication across the recruitment and learning lifecycle.

## 1. Authentication & Security
| Trigger Situation | Recipient | Email Type | Purpose |
|-------------------|-----------|------------|---------|
| New User Signup | Seeker/Recruiter | Welcome Email | Confirm registration and provide next steps. |
| Login Attempt | Any User | OTP Email | Secure authentication via 6-digit code. |
| Password Reset | Any User | Reset Code | Verify identity for password change. |
| Business Domain Link | Recruiter | Company OTP | Verify official company email address. |

## 2. Application Lifecycle
| Trigger Situation | Recipient | Email Type | Purpose |
|-------------------|-----------|------------|---------|
| Job Application | Seeker | Confirmation | Acknowledge receipt of application. |
| Status Update (Any) | Seeker | Status Notification | Notify of changes (e.g., "Viewed", "Shortlisted"). |
| Selection/Hire | Seeker | Congratulations | Celebrate the job offer and provide hire details. |
| Rejection (General) | Seeker | Rejection Notice | Polite notification of decision. |

## 3. Interview Management
| Trigger Situation | Recipient | Email Type | Purpose |
|-------------------|-----------|------------|---------|
| Interview Scheduled | Seeker | Invitation | Provide Date, Time, and Meeting Link. |
| 30 Mins Before | Seeker | **Auto-Reminder** | Background cron-job for "just-in-time" joining. |
| Seeker Cancels | Recruiter | Cancellation | Instant notification to the hiring team. |
| Post-Interview Rej. | Seeker | Personalized Rej. | Soften the decision after personal interaction. |

## 4. AI-Powered Feedback (ATS)
| Trigger Situation | Recipient | Email Type | Purpose |
|-------------------|-----------|------------|---------|
| Low ATS Score Rej. | Seeker | Score Feedback | transparently explain rejection with Match % and skills gap analysis. |

## 5. Learning & Courses
| Trigger Situation | Recipient | Email Type | Purpose |
|-------------------|-----------|------------|---------|
| Course Enrollment | Seeker | Enrollment Conf. | Confirm access to course and welcome from instructor. |

---

### Implementation Status: ✅ Fully Operational
- **Service**: NodeMailer with Gmail SMTP.
- **Background Jobs**: `node-cron` running every 5 minutes for reminders.
- **Trigger Points**: Direct hooks in `jobRoutes.js` and `courseRoutes.js`.
