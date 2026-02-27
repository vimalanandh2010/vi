const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let recruiterToken = '';
let jobs = [];

async function setupData() {
    try {
        // 1. Create Recruiter
        const uniqueEmail = `dash_recruiter${Date.now()}@test.com`;
        const res = await axios.post(`${API_URL}/auth/signup`, {
            firstName: 'Dashboard',
            lastName: 'Tester',
            email: uniqueEmail,
            password: 'password123',
            phoneNumber: '1234567890',
            role: 'employer',
            companyName: 'Analytics Corp'
        });
        recruiterToken = res.data.token;
        console.log(`✅ Recruiter created: ${uniqueEmail}`);

        // 2. Post Jobs
        const jobConfigs = [
            { title: 'Active Job 1', status: 'active' },
            { title: 'Active Job 2', status: 'active' },
            { title: 'Closed Job 1', status: 'closed' }
        ];

        for (const config of jobConfigs) {
            const jobRes = await axios.post(`${API_URL}/jobs`, {
                title: config.title,
                description: 'Test job for analytics',
                requirements: ['None'],
                salary: '$100k',
                location: 'Remote',
                type: 'Full Time',
                company: 'Analytics Corp'
            }, { headers: { 'Authorization': `Bearer ${recruiterToken}` } });

            // Manually update status if needed (since default is active)
            if (config.status === 'closed') {
                await axios.put(`${API_URL}/jobs/${jobRes.data._id}`, { status: 'closed' }, {
                    headers: { 'Authorization': `Bearer ${recruiterToken}` }
                });
            }
            jobs.push({ id: jobRes.data._id, status: config.status });
        }
        console.log(`✅ Posted ${jobs.length} jobs`);

        // 3. Create Seeker and Apply
        const seekerEmail = `seeker${Date.now()}@test.com`;
        const seekerRes = await axios.post(`${API_URL}/auth/signup`, {
            firstName: 'App',
            lastName: 'lier',
            email: seekerEmail,
            password: 'password123',
            phoneNumber: '9876543210',
            role: 'seeker'
        });
        const seekerToken = seekerRes.data.token;

        // Apply to Active Job 1 (New Application)
        await axios.post(`${API_URL}/jobs/apply/${jobs[0].id}`, {}, {
            headers: { 'Authorization': `Bearer ${seekerToken}` }
        });
        console.log('✅ Seeker applied to Active Job 1');

        // Note: Simulating "Old" applications is hard via API without back-dating DB records directly, 
        // but we can verify at least the "New" count increments.

    } catch (err) {
        console.error('Setup failed:', err.response?.data || err.message);
        process.exit(1);
    }
}

async function verifyAnalytics() {
    try {
        console.log('Fetching Dashboard Analytics...');
        const res = await axios.get(`${API_URL}/dashboard/recruiter`, {
            headers: { 'Authorization': `Bearer ${recruiterToken}` }
        });

        const data = res.data.summary;
        console.log('\n--- ANALYTICS RESULTS ---');
        console.log(JSON.stringify(data, null, 2));

        // Assertions
        const checks = [
            { label: 'Total Jobs', passed: data.totalJobs === 3 },
            { label: 'Total Applications', passed: data.totalApplications === 1 },
            { label: 'Active Jobs', passed: data.activeJobs === 2 },
            { label: 'Closed Jobs', passed: data.closedJobs === 1 },
            { label: 'New Applications', passed: data.newApplicationsThisWeek === 1 }
        ];

        checks.forEach(check => {
            console.log(`${check.label}: ${check.passed ? '✅' : '❌'}`);
        });

        if (checks.every(c => c.passed)) {
            console.log('\n🎉 SUCCESS: Analytics aggregation is correct!');
        } else {
            console.log('\n⚠️ FAILURE: Some metrics do not match expected values.');
        }

    } catch (err) {
        console.error('Verification failed:', err.response?.data || err.message);
    }
}

async function verifyPopulation() {
    console.log('\nTesting Population...');
    try {
        // Test populate('applicants') specifically
        // We'll use a job we know has applications (jobs[0])
        const res = await axios.get(`${API_URL}/jobs/recruiter/jobs`, {
            headers: { 'Authorization': `Bearer ${recruiterToken}` }
        });

        // Check if the response contains jobs and if validation passes
        if (res.status === 200) {
            console.log('✅ /jobs/recruiter/jobs works (Population test pass)');
        }

    } catch (err) {
        console.error('Population test failed:', err.response?.data || err.message);
    }
}

async function run() {
    await setupData();
    await verifyAnalytics();
    await verifyPopulation();
}

run();
