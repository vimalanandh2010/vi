const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Attempt to load from .env just in case, but prioritize process.env (hosting environment)
dotenv.config();

console.log('🚀 --- Job Portal Host Diagnostic --- 🚀');
console.log(`Current Time: ${new Date().toISOString()}`);
console.log(`Node Environment: ${process.env.NODE_ENV || 'development'}`);
console.log('-------------------------------------------');

const requiredVars = [
    { name: 'MONGODB_URI', secret: true, critical: true },
    { name: 'JWT_SECRET', secret: true, critical: true },
    { name: 'SUPABASE_URL', secret: false, critical: true },
    { name: 'SUPABASE_ANON_KEY', secret: true, critical: true },
    { name: 'GEMINI_API_KEY', secret: true, critical: true },
    { name: 'EMAIL_SERVICE', secret: false, critical: true },
    { name: 'EMAIL_USER', secret: false, critical: true },
    { name: 'EMAIL_PASS', secret: true, critical: true }
];

let allPassed = true;

requiredVars.forEach(v => {
    const value = process.env[v.name];
    if (!value || value.trim() === '') {
        console.error(`❌ MISSING: ${v.name} is not set!`);
        if (v.critical) allPassed = false;
    } else {
        const displayValue = v.secret ? '********' : value;
        console.log(`✅ OK: ${v.name} is set (${displayValue})`);
    }
});

console.log('-------------------------------------------');

// Check for Brevo recommendation
if (process.env.EMAIL_SERVICE !== 'brevo' && process.env.NODE_ENV === 'production') {
    console.warn('⚠️ WARNING: You are not using Brevo for emails. Gmail often fails in production.');
    console.warn('   Recommended: Set EMAIL_SERVICE=brevo and use a Brevo API Key.');
}

// Check for Supabase Bucket policy (cannot check from here, but provide advice)
console.log('💡 TIP: Ensure your Supabase bucket "uploads" is set to "Public".');

if (allPassed) {
    console.log('🎉 DIAGNOSTIC PASSED: All critical environment variables are set.');
} else {
    console.log('🛑 DIAGNOSTIC FAILED: Please fix the missing variables in your hosting dashboard.');
}

process.exit(allPassed ? 0 : 1);
