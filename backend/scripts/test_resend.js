const axios = require('axios');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const EMAIL_USER = process.env.EMAIL_USER || 'onboarding@resend.dev';
const API_KEY = process.env.RESEND_API_KEY || process.env.EMAIL_PASS;

console.log('🧪 Performance Test: Resend API vs SMTP');

const testAPI = async () => {
    console.log('\n1️⃣ Testing Resend REST API...');
    const start = Date.now();
    try {
        const response = await axios.post('https://api.resend.com/emails', {
            from: EMAIL_USER,
            to: ['ceitvimalanandh27@gmail.com'],
            subject: 'Latency Test: REST API',
            html: '<p>Testing Resend REST API Speed</p>'
        }, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        console.log(`✅ API Success: ${Date.now() - start}ms (ID: ${response.data.id})`);
    } catch (e) {
        console.error(`❌ API Failed: ${e.response?.data?.message || e.message}`);
    }
};

const testSMTP = async () => {
    console.log('\n2️⃣ Testing Resend SMTP...');
    const start = Date.now();
    const transporter = nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        auth: { user: 'resend', pass: API_KEY }
    });

    try {
        await transporter.verify();
        console.log(`✅ SMTP Connect: ${Date.now() - start}ms`);

        const sendStart = Date.now();
        await transporter.sendMail({
            from: EMAIL_USER,
            to: 'ceitvimalanandh27@gmail.com',
            subject: 'Latency Test: SMTP',
            text: 'Testing Resend SMTP Speed'
        });
        console.log(`✅ SMTP Send: ${Date.now() - sendStart}ms`);
        console.log(`📊 SMTP Total: ${Date.now() - start}ms`);
    } catch (e) {
        console.error(`❌ SMTP Failed: ${e.message}`);
    }
};

const run = async () => {
    if (!API_KEY) {
        console.error('Missing API Key in .env');
        return;
    }
    await testAPI();
    await testSMTP();
    console.log('\n🏁 Performance test complete.');
    process.exit(0);
};

run();
