
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    logger: true,
    debug: true
});

const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Send to self for testing
    subject: 'OTP Test Email',
    text: 'If you see this, the email service is working. Your OTP is: 123456'
};

console.log('Attempting to send test email...');
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error('❌ Error sending test email:', error);
    } else {
        console.log('✅ Email sent successfully:', info.response);
    }
    process.exit();
});
