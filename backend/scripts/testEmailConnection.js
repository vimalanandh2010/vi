const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config();

// Use the key provided or from env
const EMAIL_USER = process.env.EMAIL_USER || 'your-brevo-email@example.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'xsmtpsib-...'; // The key you just got

console.log('🧪 Testing Brevo SMTP connection...');
console.log(`Using Email: ${EMAIL_USER}`);
console.log(`Using Key: ${EMAIL_PASS.substring(0, 10)}... (truncated)`);

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Connection Failed!');
        console.error(error);
    } else {
        console.log('✅ Connection Successful! Your Brevo key is working.');

        // Optional: Send a test email
        /*
        const mailOptions = {
            from: EMAIL_USER,
            to: EMAIL_USER, // Send to yourself
            subject: 'Brevo Test Email',
            text: 'If you see this, your Brevo setup is 100% correct!'
        };
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) console.error('Error sending test mail:', err);
            else console.log('📧 Test email sent: ' + info.response);
        });
        */
    }
});
