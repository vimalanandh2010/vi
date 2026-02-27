const axios = require('axios');
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:5000/api';

// Test Data
const seeker = {
    email: 'test_seeker_' + Date.now() + '@example.com',
    password: 'password123',
    role: 'seeker',
    firstName: 'Test',
    lastName: 'Seeker'
};

async function runVerification() {
    try {
        console.log('🚀 Starting Job Application Verification...');

        // 1. Signup/Login Seeker
        console.log(`\n1. Registering Seeker: ${seeker.email}`);
        let token;
        try {
            const res = await axios.post(`${BASE_URL}/auth/signup`, seeker);
            token = res.data.token;
            console.log('✅ Seeker Registered');
        } catch (e) {
            console.log('⚠️ Signup failed (user might exist), trying login...');
            const res = await axios.post(`${BASE_URL}/auth/login`, {
                email: seeker.email,
                password: seeker.password,
                role: 'seeker'
            });
            token = res.data.token;
            console.log('✅ Seeker Logged In');
        }

        // 2. Fetch Jobs
        console.log('\n2. Fetching Jobs...');
        const jobsRes = await axios.get(`${BASE_URL}/jobs`);
        const jobs = jobsRes.data;
        if (jobs.length === 0) {
            console.error('❌ No jobs found. Please seed jobs first.');
            process.exit(1);
        }
        const jobToApply = jobs[0];
        console.log(`✅ Found ${jobs.length} jobs. Applying to: "${jobToApply.title}" (${jobToApply._id})`);

        // 3. Apply to Job
        console.log(`\n3. Applying to Job (${jobToApply._id})...`);
        const applyRes = await axios.post(`${BASE_URL}/jobs/apply/${jobToApply._id}`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ Application Response:', applyRes.data.message);

        // 4. Verify in My Applications
        console.log('\n4. Verifying in "My Applications"...');
        const myAppsRes = await axios.get(`${BASE_URL}/jobs/applied`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const myApps = myAppsRes.data;
        const appliedJob = myApps.find(app => app.job._id === jobToApply._id);

        if (appliedJob) {
            console.log(`✅ SUCCESS! Found application for "${appliedJob.job.title}" with status: ${appliedJob.status}`);
        } else {
            console.error('❌ FAILURE: Application not found in list.');
            console.log('My Applications List:', JSON.stringify(myApps, null, 2));
            process.exit(1);
        }

    } catch (err) {
        console.error('\n❌ Verification Failed:', err.response?.data || err.message);
        process.exit(1);
    }
}

runVerification();
