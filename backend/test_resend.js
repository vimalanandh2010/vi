const axios = require('axios');

// Test both keys to see which one works
const keys = [
    { name: 'Local Key', key: 're_RTEVbSz9_2ArC7YAppFdVsse2WiD3VjJE' },
    { name: 'Render Key', key: 're_PT3P5hmK_Exi2YfqQ3YxmnX6n1Vy1jL4' }
];

async function testResendKey(name, apiKey) {
    console.log(`\n🧪 Testing ${name}...`);
    try {
        const response = await axios.post('https://api.resend.com/emails', {
            from: 'onboarding@resend.dev',
            to: 'test@test.com', // This will fail but show if key is valid
            subject: 'Test Email',
            html: '<p>Test</p>'
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        console.log(`✅ ${name} is VALID!`);
        console.log(`Response:`, response.data);
        return true;
    } catch (error) {
        const errMsg = error.response?.data?.message || error.message;
        if (errMsg.includes('Invalid API key') || errMsg.includes('unauthorized')) {
            console.log(`❌ ${name} is INVALID or EXPIRED`);
        } else if (errMsg.includes('not a valid email')) {
            console.log(`✅ ${name} is VALID (API key works, just bad test email)`);
        } else {
            console.log(`⚠️ ${name} error:`, errMsg);
        }
        return false;
    }
}

async function runTests() {
    console.log('🔍 Testing Resend API Keys...\n');
    for (const {name, key} of keys) {
        await testResendKey(name, key);
    }
    console.log('\n✅ Test Complete!');
}

runTests();
