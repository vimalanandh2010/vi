const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const API_BASE = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_milestone_token_2026';

// Recruiter user from debug output: vimalanandhkit2427@ksrce.ac.in, ID: 698f5f06705927d8c25b3b53
const RECRUITER_ID = '698f5f06705927d8c25b3b53';
// Seeker user (will pick one from DB or use ID if known)
const SEEKER_ID = '698f28cdbe335b21f1f81df5';

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '1d' });
};

async function testBackend() {
    console.log('--- Starting Backend Verification ---');

    const recruiterToken = generateToken(RECRUITER_ID, 'employer');
    const seekerToken = generateToken(SEEKER_ID, 'seeker');

    const config = (token) => ({
        headers: { Authorization: `Bearer ${token}` }
    });

    console.log('\n[1] Testing Seeker Endpoints...');
    try {
        const jobs = await axios.get(`${API_BASE}/jobs`, config(seekerToken));
        console.log('✅ GET /jobs: Success, count:', jobs.data.length);

        const me = await axios.get(`${API_BASE}/auth/me`, config(seekerToken));
        console.log('✅ GET /auth/me (Seeker): Success, email:', me.data.email);

        const stats = await axios.get(`${API_BASE}/dashboard/seeker`, config(seekerToken));
        console.log('✅ GET /dashboard/seeker: Success');
    } catch (err) {
        console.error('❌ Seeker Test Failed:', err.response?.data || err.message);
    }

    console.log('\n[2] Testing Recruiter Endpoints...');
    try {
        const myCompany = await axios.get(`${API_BASE}/companies/my-company`, config(recruiterToken));
        console.log('✅ GET /companies/my-company: Success, name:', myCompany.data.name);

        const recruiterJobs = await axios.get(`${API_BASE}/jobs/recruiter/jobs`, config(recruiterToken));
        console.log('✅ GET /jobs/recruiter/jobs: Success, count:', recruiterJobs.data.length);

        console.log('\n[3] Testing Job Posting (The problematic 500 route)...');
        const jobData = {
            title: 'Test AI Engineer',
            location: 'Remote',
            type: 'Full Time',
            salary: '₹50L',
            minSalary: 40,
            maxSalary: 60,
            experienceLevel: 'Senior Level',
            description: 'This is a test job posted by the verification script.',
            tags: ['AI', 'React', 'Node'],
            requirements: ['3+ years experience'],
            category: 'IT'
        };

        const postJob = await axios.post(`${API_BASE}/jobs`, jobData, config(recruiterToken));
        console.log('✅ POST /jobs: Success, Job ID:', postJob.data._id);
    } catch (err) {
        console.error('❌ Recruiter Test Failed:', err.response?.data || err.message);
        if (err.response?.data?.stack) {
            console.error('Stack trace from server:', err.response.data.stack);
        }
    }

    console.log('\n--- Verification Complete ---');
}

testBackend();
