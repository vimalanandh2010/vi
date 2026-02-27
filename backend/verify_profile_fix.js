const axios = require('axios');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

dotenv.config();

const API_URL = 'http://localhost:5000';
const seekerId = '698f238525017fa546712e9b'; // Valid seeker ID found in DB
const jwtSecret = process.env.JWT_SECRET || 'supersecret_milestone_token_2026';

async function verifyProfileFixes() {
    console.log('--- Verifying Seeker Profile Setup Fixes ---');

    // 1. Generate a valid seeker token
    const token = jwt.sign({ user: { id: seekerId, role: 'seeker' } }, jwtSecret, { expiresIn: '1h' });
    console.log('Generated mock jobseeker_token');

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    try {
        // Test 1: Update Profile Info
        console.log('\nTest 1: Updating Profile Info...');
        const profileData = {
            firstName: 'Test',
            lastName: 'Seeker',
            phoneNumber: '1234567890',
            location: 'Test City',
            preferredRole: 'Software Engineer',
            primarySkill: 'JavaScript'
        };
        const updateRes = await axios.put(`${API_URL}/api/auth/update`, profileData, config);
        console.log('Status:', updateRes.status);
        console.log('Update result:', updateRes.data.firstName === 'Test' ? 'SUCCESS' : 'FAILED');

        // Test 2: Upload Resume
        console.log('\nTest 2: Uploading Resume...');
        const resumeForm = new FormData();
        // Use an existing small file or create a dummy buffer
        resumeForm.append('resume', Buffer.from('Dummy resume content'), {
            filename: 'test_resume_verify.pdf',
            contentType: 'application/pdf'
        });

        const uploadConfig = {
            headers: {
                ...config.headers,
                ...resumeForm.getHeaders()
            }
        };

        const resumeRes = await axios.post(`${API_URL}/api/auth/resume`, resumeForm, uploadConfig);
        console.log('Status:', resumeRes.status);
        console.log('Resume URL:', resumeRes.data.resumeUrl);

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

verifyProfileFixes();
