const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test Data
const employer = {
    email: 'test_employer_' + Date.now() + '@example.com',
    password: 'password123',
    role: 'employer',
    firstName: 'Test',
    lastName: 'Recruiter',
    phoneNumber: '1234567890'
};

const seeker = {
    email: 'test_seeker_' + Date.now() + '@example.com',
    password: 'password123',
    role: 'seeker',
    firstName: 'Test',
    lastName: 'Seeker',
    phoneNumber: '0987654321'
};

let employerToken;
let seekerToken;
let jobId;
let applicationId;

async function runVerification() {
    try {
        console.log('🚀 Starting Recruiter Flow Verification...');

        // 1. Register Employer
        console.log(`\n1. Registering Employer: ${employer.email}`);
        const empRes = await axios.post(`${BASE_URL}/auth/signup`, employer);
        employerToken = empRes.data.token;
        console.log('✅ Employer Registered');

        // 2. Post a Job
        console.log('\n2. Posting a Job...');
        const jobRes = await axios.post(`${BASE_URL}/jobs`, {
            title: 'Test Job ' + Date.now(),
            company: 'Test Corp',
            location: 'Remote',
            type: 'Full Time',
            description: 'A test job description',
            requirements: ['Node.js', 'React'],
            tags: ['Engineering']
        }, {
            headers: { 'Authorization': `Bearer ${employerToken}` }
        });
        jobId = jobRes.data._id;
        console.log(`✅ Job Posted: ${jobId}`);

        // 3. Register Seeker
        console.log(`\n3. Registering Seeker: ${seeker.email}`);
        const seekRes = await axios.post(`${BASE_URL}/auth/signup`, seeker);
        seekerToken = seekRes.data.token;
        console.log('✅ Seeker Registered');

        // 4. Seeker Applies
        console.log(`\n4. Seeker Applying to Job ${jobId}...`);
        const applyRes = await axios.post(`${BASE_URL}/jobs/apply/${jobId}`, {}, {
            headers: { 'Authorization': `Bearer ${seekerToken}` }
        });
        applicationId = applyRes.data.application._id;
        console.log(`✅ Applied. Application ID: ${applicationId}`);

        // 5. Employer Views Applicants
        console.log(`\n5. Employer Fetching Applicants for Job ${jobId}...`);
        const applicantsRes = await axios.get(`${BASE_URL}/jobs/${jobId}/applicants`, {
            headers: { 'Authorization': `Bearer ${employerToken}` }
        });
        const applicants = applicantsRes.data;
        console.log(`✅ Fetched ${applicants.length} applicants.`);

        if (applicants.length === 0) {
            throw new Error('Applicants list is empty!');
        }
        if (applicants[0]._id !== applicationId) {
            throw new Error('Application ID mismatch!');
        }

        // 6. Employer Updates Status
        console.log(`\n6. Employer Updating Status to "interview"...`);
        const updateRes = await axios.put(`${BASE_URL}/jobs/application/${applicationId}/status`, {
            status: 'interview'
        }, {
            headers: { 'Authorization': `Bearer ${employerToken}` }
        });
        console.log(`✅ Status Updated: ${updateRes.data.status}`);

        if (updateRes.data.status !== 'interview') {
            throw new Error('Status update failed!');
        }

        console.log('\n🎉 ALL CHECKS PASSED!');

    } catch (err) {
        console.error('\n❌ Verification Failed:', err.response?.data || err.message);
        process.exit(1);
    }
}

runVerification();
