const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const API_BASE = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET;
const RECRUITER_ID = '698f5f06705927d8c25b3b53'; // From debug_recruiter.js output

async function testJobPosting() {
    console.log('=== Testing Job Posting ===\n');

    // Generate a valid JWT token
    const payload = {
        user: {
            id: RECRUITER_ID,
            role: 'employer'
        }
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
    console.log('✓ Generated JWT token');

    const config = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    // Test 1: Verify auth works
    try {
        const meResponse = await axios.get(`${API_BASE}/auth/me`, config);
        console.log('✓ Auth verified, user:', meResponse.data.email);
    } catch (err) {
        console.error('✗ Auth failed:', err.response?.data || err.message);
        return;
    }

    // Test 2: Check company profile
    try {
        const companyResponse = await axios.get(`${API_BASE}/companies/my-company`, config);
        console.log('✓ Company found:', companyResponse.data.name);
    } catch (err) {
        console.error('✗ Company check failed:', err.response?.data || err.message);
    }

    // Test 3: Post a minimal job
    console.log('\n--- Attempting to post job ---');
    const jobData = {
        title: 'Test Backend Engineer',
        location: 'Remote',
        type: 'Full Time',
        salary: '₹30L',
        minSalary: 25,
        maxSalary: 35,
        experienceLevel: 'Mid-Senior Level',
        description: 'Test job posting from verification script',
        tags: 'Node,Express,MongoDB',
        requirements: '3+ years experience,Strong backend skills',
        category: 'IT'
    };

    try {
        const response = await axios.post(`${API_BASE}/jobs`, jobData, config);
        console.log('✓ Job posted successfully!');
        console.log('Job ID:', response.data._id);
        console.log('Job Title:', response.data.title);
    } catch (err) {
        console.error('✗ Job posting failed!');
        console.error('Status:', err.response?.status);
        console.error('Error:', err.response?.data);

        if (err.response?.data?.stack) {
            console.error('\n--- Server Stack Trace ---');
            console.error(err.response.data.stack);
        }
    }
}

testJobPosting();
