require('dotenv').config();
const { sendStatusUpdateEmail } = require('./utils/emailService');

const testRejection = async () => {
    const testEmail = 'vimalanandh018@gmail.com'; // Using user's potential email or a known test one
    console.log('--- Email Rejection Test ---');
    console.log(`Sending test rejection email to: ${testEmail}`);

    try {
        await sendStatusUpdateEmail(
            testEmail,
            'Test Candidate',
            'Full Stack Developer',
            'Future Milestone Tech',
            'rejected',
            85
        );
        console.log('✅ sendStatusUpdateEmail call completed without throwing errors.');
        console.log('Check your inbox (or SPAM folder) and the terminal logs above.');
    } catch (err) {
        console.error('❌ Test Failed with Error:', err);
    }

    process.exit();
};

testRejection();
