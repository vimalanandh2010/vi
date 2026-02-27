const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let recruiterToken = '';
let seekerToken = '';
let jobId = '';

async function loginRecruiter() {
    try {
        const res = await axios.post(`${API_URL}/auth/login`, {
            email: 'recruiter@example.com', // Replace with valid recruiter
            password: 'password123', // Replace with valid password
            role: 'employer'
        });
        recruiterToken = res.data.token;
        console.log('✅ Recruiter logged in');
    } catch (err) {
        console.error('Login failed:', err.response?.data?.message || err.message);
        // Create recruiter if login fails
        await createRecruiter();
    }
}

async function createRecruiter() {
    try {
        const uniqueEmail = `recruiter${Date.now()}@test.com`;
        const res = await axios.post(`${API_URL}/auth/signup`, {
            firstName: 'Test',
            lastName: 'Recruiter',
            email: uniqueEmail,
            password: 'password123',
            phoneNumber: '1234567890',
            role: 'employer',
            companyName: 'Test Corp',
            website: 'https://testcorp.com'
        });
        recruiterToken = res.data.token;
        console.log(`✅ Created and logged in new recruiter: ${uniqueEmail}`);
    } catch (err) {
        console.error('Recruiter creation failed:', err.response?.data?.message || err.message);
        process.exit(1);
    }
}

async function loginSeeker() {
    try {
        const uniqueEmail = `seeker${Date.now()}@test.com`;
        const res = await axios.post(`${API_URL}/auth/signup`, {
            firstName: 'Test',
            lastName: 'Seeker',
            email: uniqueEmail,
            password: 'password123',
            phoneNumber: '1234567890',
            role: 'seeker'
        });
        seekerToken = res.data.token;
        console.log(`✅ Created and logged in new seeker: ${uniqueEmail}`);
    } catch (err) {
        console.error('Seeker creation failed:', err.response?.data?.message || err.message);
    }
}

async function postJob() {
    try {
        const res = await axios.post(`${API_URL}/jobs`, {
            title: 'Analytics Test Job',
            company: 'Test Corp',
            location: 'Remote',
            type: 'Full Time',
            description: 'Testing analytics',
            requirements: ['Node.js', 'React'],
            salary: '$100k'
        }, {
            headers: { 'Authorization': `Bearer ${recruiterToken}` }
        });
        jobId = res.data._id;
        console.log(`✅ Job posted: ${jobId}`);
    } catch (err) {
        console.error('Job posting failed:', err.response?.data?.message || err.message);
        process.exit(1);
    }
}

async function trackView() {
    try {
        await axios.post(`${API_URL}/jobs/${jobId}/view`, {}, {
            headers: { 'Authorization': `Bearer ${seekerToken}` }
        });
        console.log('✅ Job view tracked');
    } catch (err) {
        console.error('View tracking failed:', err.response?.data?.message || err.message);
    }
}

async function applyToJob() {
    try {
        await axios.post(`${API_URL}/jobs/apply/${jobId}`, {}, {
            headers: { 'Authorization': `Bearer ${seekerToken}` }
        });
        console.log('✅ Applied to job');
    } catch (err) {
        console.error('Application failed:', err.response?.data?.message || err.message);
    }
}

async function checkAnalytics() {
    try {
        const res = await axios.get(`${API_URL}/jobs/recruiter/analytics/${jobId}`, {
            headers: { 'Authorization': `Bearer ${recruiterToken}` }
        });
        console.log('✅ Individual Job Analytics:', {
            views: res.data.totalViews,
            applications: res.data.totalApplications,
            conversionRate: res.data.viewToApplicationRate
        });

        if (res.data.totalViews > 0 && res.data.totalApplications > 0) {
            console.log('✅ Analytics validation passed');
        } else {
            console.warn('⚠️ Analytics might not be updated correctly');
        }
    } catch (err) {
        console.error('Analytics check failed:', err.response?.data?.message || err.message);
    }
}

async function checkSummaryAnalytics() {
    try {
        const res = await axios.get(`${API_URL}/jobs/recruiter/analytics`, {
            headers: { 'Authorization': `Bearer ${recruiterToken}` }
        });
        console.log('✅ Summary Analytics:', res.data.summary);
    } catch (err) {
        console.error('Summary analytics failed:', err.response?.data?.message || err.message);
    }
}

async function run() {
    console.log('Starting Analytics Verification...');
    await loginRecruiter();
    await loginSeeker();
    await postJob();

    // Simulate multiple views
    await trackView();
    await trackView();
    await trackView();

    // Simulate application
    await applyToJob();

    // Check analytics
    await checkAnalytics();
    await checkSummaryAnalytics();
    console.log('Verification Complete!');
}

run();
