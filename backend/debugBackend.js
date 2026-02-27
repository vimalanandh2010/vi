const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function run() {
    try {
        console.log('Logging in as recruiter...');
        // Create a new recruiter to be sure
        const uniqueEmail = `recruiter${Date.now()}@debug.com`;
        const signupRes = await axios.post(`${API_URL}/auth/signup`, {
            firstName: 'Debug',
            lastName: 'Recruiter',
            email: uniqueEmail,
            password: 'password123',
            phoneNumber: '1234567890',
            role: 'employer',
            companyName: 'Debug Corp',
            website: 'https://debug.com'
        });

        const token = signupRes.data.token;
        console.log('✅ Logged in. Token:', token.substring(0, 20) + '...');

        console.log('Fetching recruiter jobs...');
        const jobsRes = await axios.get(`${API_URL}/jobs/recruiter/jobs`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('✅ Jobs fetched successfully. Count:', jobsRes.data.length);
        console.log('Jobs:', JSON.stringify(jobsRes.data, null, 2));

    } catch (err) {
        console.error('❌ Error:', err.message);
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', JSON.stringify(err.response.data, null, 2));
        }
    }
}

run();
