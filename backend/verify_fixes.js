const axios = require('axios');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const API_URL = 'http://localhost:5000';
const recruiterId = '698d1ac565cdcceb7833143f'; // Known recruiter
const jwtSecret = process.env.JWT_SECRET || 'your_secret_key'; // Need the actual secret to sign a token

async function verifyFixes() {
    console.log('--- Verifying Frontend API Fixes ---');

    // 1. Generate a valid recruiter token
    const token = jwt.sign({ user: { id: recruiterId, role: 'employer' } }, jwtSecret, { expiresIn: '1h' });
    console.log('Generated mock recruiter_token');

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    try {
        // Test 1: Dashboard Stats
        console.log('\nTest 1: Fetching Dashboard Stats...');
        const statsRes = await axios.get(`${API_URL}/api/employer/dashboard-stats`, config);
        console.log('Status:', statsRes.status);
        console.log('Total Applications:', statsRes.data.stats.totalApplications);

        // Test 2: Recruiter Applicants (Candidates page)
        console.log('\nTest 2: Fetching Recruiter Applicants...');
        const applicantsRes = await axios.get(`${API_URL}/api/jobs/recruiter/applicants`, config);
        console.log('Status:', applicantsRes.status);
        console.log('Candidates found:', applicantsRes.data.length);

        // Test 3: Recruiter Jobs
        console.log('\nTest 3: Fetching Recruiter Jobs...');
        const jobsRes = await axios.get(`${API_URL}/api/jobs/recruiter/jobs`, config);
        console.log('Status:', jobsRes.status);
        console.log('Jobs found:', jobsRes.data.length);

        console.log('\n--- Verification Complete: FIXES CONFIRMED ---');
    } catch (err) {
        console.error('\n--- Verification Failed ---');
        if (err.response) {
            console.error('Error status:', err.response.status);
            console.error('Error data:', err.response.data);
        } else {
            console.error('Error message:', err.message);
        }
    }
}

verifyFixes();
