const axios = require('axios');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const masterTest = async () => {
    let token = '';
    let email = 'testseeker_' + Date.now() + '@example.com';
    let password = 'password123';

    try {
        console.log('--- 1. Testing Signup ---');
        const signupRes = await axios.post('http://localhost:5000/api/auth/signup', {
            firstName: 'Master',
            lastName: 'Test',
            email: email,
            password: password,
            phoneNumber: '9' + Math.floor(Math.random() * 1000000000),
            role: 'seeker'
        });
        console.log('✅ Signup OK');
        token = signupRes.data.token;

        console.log('\n--- 2. Testing Login ---');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: email,
            password: password
        });
        console.log('✅ Login OK');
        token = loginRes.data.token;

        const authHeader = { headers: { Authorization: `Bearer ${token}` } };

        console.log('\n--- 3. Testing /auth/me ---');
        const meRes = await axios.get('http://localhost:5000/api/auth/me', authHeader);
        console.log('✅ /auth/me OK - Name:', meRes.data.firstName);

        console.log('\n--- 4. Testing /api/jobs (Seeker) ---');
        const jobsRes = await axios.get('http://localhost:5000/api/jobs', authHeader);
        console.log('✅ /api/jobs OK - Count:', Array.isArray(jobsRes.data) ? jobsRes.data.length : 'Object returned');

        console.log('\n--- 5. Testing /api/dashboard/seeker ---');
        const dashboardRes = await axios.get('http://localhost:5000/api/dashboard/seeker', authHeader);
        console.log('✅ /api/dashboard/seeker OK');

        console.log('\n--- 6. Testing /api/chat ---');
        const chatRes = await axios.get('http://localhost:5000/api/chat', authHeader);
        console.log('✅ /api/chat OK');

        console.log('\n--- 7. Testing /api/jobseeker/profile ---');
        const profileRes = await axios.get('http://localhost:5000/api/jobseeker/profile', authHeader);
        console.log('✅ /api/jobseeker/profile OK');

        console.log('\n--- 8. Testing Recruiter Flow ---');
        const rEmail = 'testrecruiter_' + Date.now() + '@example.com';
        const rSignupRes = await axios.post('http://localhost:5000/api/auth/signup', {
            firstName: 'Recruiter',
            lastName: 'Test',
            email: rEmail,
            password: password,
            phoneNumber: '9' + Math.floor(Math.random() * 1000000000),
            role: 'employer',
            companyName: 'Test Corp'
        });
        console.log('✅ Recruiter Signup OK');
        const rToken = rSignupRes.data.token;
        const rHeader = { headers: { Authorization: `Bearer ${rToken}` } };

        const rDashboardRes = await axios.get('http://localhost:5000/api/dashboard/recruiter', rHeader);
        console.log('✅ Recruiter Dashboard OK');

        const postJobRes = await axios.post('http://localhost:5000/api/jobs', {
            title: 'Test Software Engineer',
            description: 'This is a test job',
            location: 'Remote',
            salaryType: 'range',
            salaryMin: 50000,
            salaryMax: 100000,
            jobType: 'full-time',
            category: 'IT',
            experienceLevel: 'intermediate',
            skills: ['Javascript', 'React']
        }, rHeader);
        console.log('✅ Job Posting OK');

        console.log('\n🚀 ALL PORTAL TESTS PASSED INCH-BY-INCH!');

    } catch (error) {
        console.error('❌ MASTER TEST FAILED!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Endpoint:', error.config.url);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
        process.exit(1);
    }
};

masterTest();
