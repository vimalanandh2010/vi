/**
 * Quick Email Configuration Verification Script
 * Run this after deploying to production to verify email setup
 * 
 * Usage: node backend/scripts/verify_production_email.js
 */

require('dotenv').config();
const axios = require('axios');

console.log('\n🔍 EMAIL CONFIGURATION DIAGNOSTIC\n');
console.log('=' .repeat(60));

// Check 1: Environment Variables
console.log('\n✅ Step 1: Checking Environment Variables...\n');

const checks = {
    EMAIL_SERVICE: process.env.EMAIL_SERVICE,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS ? '✓ Set (hidden)' : '✗ NOT SET',
    RESEND_API_KEY: process.env.RESEND_API_KEY ? '✓ Set (hidden)' : '✗ NOT SET',
    NODE_ENV: process.env.NODE_ENV
};

console.table(checks);

// Check 2: Service-specific validation
console.log('\n✅ Step 2: Service-Specific Validation...\n');

const service = (process.env.EMAIL_SERVICE || 'gmail').toLowerCase();

if (service === 'resend') {
    console.log('📧 Service: RESEND (API-based)');
    if (!process.env.RESEND_API_KEY) {
        console.error('❌ ERROR: RESEND_API_KEY is missing!');
        console.log('   Get your API key from: https://resend.com/api-keys');
    } else if (!process.env.RESEND_API_KEY.startsWith('re_')) {
        console.error('❌ ERROR: Invalid Resend API key format (should start with "re_")');
    } else {
        console.log('✅ Resend API key format looks correct');
    }
} else if (service === 'brevo' || service === 'sendinblue') {
    console.log('📧 Service: BREVO/SENDINBLUE (SMTP)');
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ ERROR: EMAIL_USER or EMAIL_PASS missing for Brevo!');
        console.log('   Get SMTP credentials from: https://app.brevo.com/settings/keys/smtp');
    } else {
        console.log('✅ Brevo credentials are set');
    }
} else if (service === 'gmail') {
    console.log('📧 Service: GMAIL (SMTP)');
    console.warn('⚠️  WARNING: Gmail has a limit of 100 emails/day');
    console.warn('⚠️  Not recommended for production!');
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ ERROR: EMAIL_USER or EMAIL_PASS missing!');
    } else {
        console.log('✅ Gmail credentials are set');
        if (process.env.EMAIL_PASS.length === 16 && !process.env.EMAIL_PASS.includes(' ')) {
            console.log('✅ Looks like a valid Gmail App Password');
        } else {
            console.warn('⚠️  EMAIL_PASS should be a 16-character App Password');
        }
    }
} else {
    console.error(`❌ Unknown EMAIL_SERVICE: ${service}`);
}

// Check 3: Test Email Sending (Optional)
console.log('\n✅ Step 3: Ready to Test Email Sending\n');

const testEmail = async () => {
    try {
        if (service === 'resend' && process.env.RESEND_API_KEY) {
            console.log('🧪 Testing Resend API connection...\n');
            
            const response = await axios.post(
                'https://api.resend.com/emails',
                {
                    from: 'onboarding@resend.dev',
                    to: process.env.EMAIL_USER || 'test@example.com',
                    subject: 'Test Email from Your Job Portal',
                    html: '<h1>Success!</h1><p>Your email configuration is working correctly.</p>'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ EMAIL SENT SUCCESSFULLY!');
            console.log(`   Email ID: ${response.data.id}`);
            console.log(`   Check inbox: ${process.env.EMAIL_USER}`);
            
        } else if (service === 'brevo' || service === 'gmail') {
            console.log('🧪 Testing SMTP connection...\n');
            
            const nodemailer = require('nodemailer');
            
            const transportConfig = service === 'brevo' ? {
                host: 'smtp-relay.brevo.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            } : {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            };

            const transporter = nodemailer.createTransport(transportConfig);
            
            await transporter.verify();
            console.log('✅ SMTP CONNECTION VERIFIED!');
            
            const info = await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER,
                subject: 'Test Email from Your Job Portal',
                html: '<h1>Success!</h1><p>Your email configuration is working correctly.</p>'
            });
            
            console.log('✅ TEST EMAIL SENT!');
            console.log(`   Message ID: ${info.messageId}`);
            console.log(`   Check inbox: ${process.env.EMAIL_USER}`);
        }
        
    } catch (error) {
        console.error('\n❌ EMAIL TEST FAILED!\n');
        if (error.response) {
            console.error('   API Error:', error.response.data);
            if (error.response.status === 401) {
                console.error('   → Invalid API key or credentials');
            } else if (error.response.status === 422) {
                console.error('   → Invalid email format or missing fields');
            }
        } else if (error.code === 'EAUTH') {
            console.error('   → Authentication failed - check credentials');
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION') {
            console.error('   → Connection timeout - SMTP might be blocked');
            console.log('   → Try using Resend API instead of SMTP');
        } else {
            console.error('   Error:', error.message);
        }
    }
};

// Run the test
console.log('Press ENTER to send a test email, or Ctrl+C to skip...');

if (process.env.SKIP_TEST) {
    console.log('\n✅ Configuration check complete!\n');
    console.log('To test email sending, run again without SKIP_TEST=true');
} else {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    readline.question('', async () => {
        await testEmail();
        readline.close();
        
        console.log('\n' + '='.repeat(60));
        console.log('\n📋 SUMMARY:\n');
        
        if (service === 'resend' && process.env.RESEND_API_KEY) {
            console.log('✅ Using Resend API (Recommended for production)');
        } else if (service === 'brevo') {
            console.log('✅ Using Brevo SMTP');
        } else if (service === 'gmail') {
            console.log('⚠️  Using Gmail SMTP (100 emails/day limit)');
        }
        
        console.log('\n📚 For hosting setup instructions, see:');
        console.log('   EMAIL_HOSTING_SETUP_GUIDE.md\n');
        
        process.exit(0);
    });
}
