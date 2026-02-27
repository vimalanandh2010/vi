require('dotenv').config();
const { sendStatusUpdateEmail } = require('../utils/emailService');

async function testEmails() {
    console.log('🧪 Starting Email Verification Test...');

    // Test Hired Status (should trigger sendSelectionEmail)
    console.log('\n1. Testing HIRED status email...');
    await sendStatusUpdateEmail(
        'vimal@example.com',
        'Vimal',
        'Software Engineer',
        'Future Milestone Tech',
        'hired'
    );

    // Test Interview Status with custom link
    console.log('\n2. Testing INTERVIEW status email with Google Meet link...');
    await sendStatusUpdateEmail(
        'vimal@example.com',
        'Vimal',
        'Software Engineer',
        'Future Milestone Tech',
        'interview',
        null, // ATS score
        'https://meet.google.com/abc-defg-hij'
    );

    // Test Rejected Status
    console.log('\n2. Testing REJECTED status email...');
    await sendStatusUpdateEmail(
        'candidate@example.com',
        'Candidate',
        'Product Manager',
        'Future Milestone Tech',
        'rejected',
        45 // ATS Score
    );

    console.log('\n✅ Email tests finished. Check console logs for "Selection email sent" and "Status update email sent".');
    process.exit(0);
}

testEmails().catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});
