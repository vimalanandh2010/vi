require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    debug: true,
    logger: true
});

transporter.verify(function (error, success) {
    if (error) {
        console.error('❌ Email Service Error:', error);
    } else {
        console.log('✅ Email Service is ready');
    }
});
