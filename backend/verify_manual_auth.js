const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';

async function testSignup(role) {
    const email = `test_${role}_${Date.now()}@example.com`;
    console.log(`Testing signup for ${role} with email: ${email}`);

    try {
        const response = await axios.post(`${API_URL}/signup`, {
            firstName: 'Test',
            lastName: 'User',
            email: email,
            password: 'password123',
            phoneNumber: '1234567890',
            role: role,
            companyName: role === 'employer' ? 'Test Company' : ''
        });

        console.log(`✅ ${role} signup successful!`);
        console.log('Response:', JSON.stringify(response.data.user, null, 2));
        return { email, token: response.data.token };
    } catch (error) {
        console.error(`❌ ${role} signup failed:`, error.response?.data || error.message);
        return null;
    }
}

async function testLogin(email, role) {
    console.log(`Testing login for ${role} with email: ${email}`);

    try {
        const response = await axios.post(`${API_URL}/login`, {
            email: email,
            password: 'password123',
            role: role
        });

        console.log(`✅ ${role} login successful!`);
        return response.data.token;
    } catch (error) {
        console.error(`❌ ${role} login failed:`, error.response?.data || error.message);
        return null;
    }
}

async function runTests() {
    const seekerData = await testSignup('seeker');
    if (seekerData) {
        await testLogin(seekerData.email, 'seeker');
    }

    console.log('\n-------------------\n');

    const recruiterData = await testSignup('employer');
    if (recruiterData) {
        await testLogin(recruiterData.email, 'employer');
    }
}

runTests();
