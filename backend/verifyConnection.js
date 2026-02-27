const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let recruiterToken = '';
let seekerToken = '';
let jobId = '';

async function setupRecruiter() {
    const uniqueEmail = 'recruiter_conn_test@connect.com'; // Fixed email for consistency
    try {
        // Try signup first
        const res = await axios.post(`${API_URL}/auth/signup`, {
            firstName: 'Connect',
            lastName: 'Recruiter',
            email: uniqueEmail,
            password: 'password123',
            phoneNumber: '1234567890',
            role: 'employer',
            companyName: 'Connect Corp'
        });
        recruiterToken = res.data.token;
        console.log(`✅ Recruiter created: ${uniqueEmail}`);
    } catch (err) {
        if (err.response?.status === 400) {
            // User likely exists, try login
            console.log('Recruiter exists, logging in...');
            try {
                const loginRes = await axios.post(`${API_URL}/auth/login`, {
                    email: uniqueEmail,
                    password: 'password123',
                    role: 'employer'
                });
                recruiterToken = loginRes.data.token;
                console.log(`✅ Recruiter logged in: ${uniqueEmail}`);
            } catch (loginErr) {
                console.error('Recruiter login failed:', loginErr.response?.data || loginErr.message);
                process.exit(1);
            }
        } else {
            console.error('Recruiter setup failed:', err.response?.data || err.message);
            console.error('Full error:', err);
            process.exit(1);
        }
    }

    try {
        // Post a job
        const jobRes = await axios.post(`${API_URL}/jobs`, {
            title: 'Connection Test Job ' + Date.now(),
            company: 'Connect Corp',
            location: 'Remote',
            type: 'Full Time',
            description: 'Testing connection',
            requirements: ['React', 'Node'],
            salary: '$120k'
        }, { headers: { 'Authorization': `Bearer ${recruiterToken}` } });

        jobId = jobRes.data._id;
        console.log(`✅ Job posted: ${jobId}`);
    } catch (err) {
        console.error('Job posting failed:', err.response?.data || err.message);
        process.exit(1);
    }
}

async function setupSeekerWithProfile() {
    try {
        const uniqueEmail = `seeker${Date.now()}@connect.com`;
        // 1. Signup
        const signupRes = await axios.post(`${API_URL}/auth/signup`, {
            firstName: 'Rich',
            lastName: 'Profile',
            email: uniqueEmail,
            password: 'password123',
            phoneNumber: '9876543210',
            role: 'seeker'
        });
        seekerToken = signupRes.data.token;
        console.log(`✅ Seeker created: ${uniqueEmail}`);

        // 2. Update Profile with RICH data
        await axios.put(`${API_URL}/auth/update`, {
            aboutMe: 'I am a passionate developer with 5 years experience.',
            primarySkill: 'React, Node.js, MongoDB, AWS',
            experienceLevel: 'experienced',
            location: 'San Francisco, CA',
            education: {
                degree: { degreeName: 'B.Tech', collegeName: 'Tech University', score: '9.0' },
                twelfth: { schoolOrCollegeName: 'High School', score: '95%' },
                tenth: { schoolName: 'Primary School', score: '98%' }
            },
            githubUrl: 'https://github.com/richprofile',
            linkedInUrl: 'https://linkedin.com/in/richprofile',
            portfolioUrl: 'https://richprofile.com'
        }, { headers: { 'Authorization': `Bearer ${seekerToken}` } });
        console.log('✅ Seeker profile updated with rich data');

    } catch (err) {
        console.error('Seeker setup failed:', err.response?.data || err.message);
        process.exit(1);
    }
}

async function applyAndVerify() {
    try {
        // 1. Apply
        await axios.post(`${API_URL}/jobs/apply/${jobId}`, {}, {
            headers: { 'Authorization': `Bearer ${seekerToken}` }
        });
        console.log('✅ Seeker applied to job');

        // 2. Recruiter fetches applicants
        const res = await axios.get(`${API_URL}/jobs/applicants/${jobId}`, {
            headers: { 'Authorization': `Bearer ${recruiterToken}` }
        });

        const applicant = res.data[0];
        const user = applicant.user;

        console.log('\n--- VERIFICATION RESULTS ---');
        console.log(`Name: ${user.firstName} ${user.lastName} ${user.firstName === 'Rich' ? '✅' : '❌'}`);
        console.log(`Email: ${user.email} ${user.email.includes('seeker') ? '✅' : '❌'}`);
        console.log(`Phone: ${user.phoneNumber} ${user.phoneNumber === '9876543210' ? '✅' : '❌'}`);
        console.log(`About: ${user.aboutMe} ${user.aboutMe.includes('passionate') ? '✅' : '❌'}`);
        console.log(`Skills: ${user.primarySkill} ${user.primarySkill.includes('React') ? '✅' : '❌'}`);
        console.log(`Location: ${user.location} ${user.location === 'San Francisco, CA' ? '✅' : '❌'}`);
        console.log(`Github: ${user.githubUrl} ${user.githubUrl?.includes('github') ? '✅' : '❌'}`);
        console.log(`LinkedIn: ${user.linkedInUrl} ${user.linkedInUrl?.includes('linkedin') ? '✅' : '❌'}`);
        console.log(`Portfolio: ${user.portfolioUrl} ${user.portfolioUrl?.includes('richprofile') ? '✅' : '❌'}`);
        console.log(`Education: ${user.education?.degree?.degreeName} ${user.education?.degree?.degreeName === 'B.Tech' ? '✅' : '❌'}`);

        if (user.location && user.githubUrl && user.aboutMe && user.portfolioUrl) {
            console.log('\n🎉 SUCCESS: All rich data is visible to recruiter!');
        } else {
            console.log('\n⚠️ FAILURE: Some data is missing.');
        }

    } catch (err) {
        console.error('Verification failed:', err.response?.data || err.message);
    }
}

async function run() {
    console.log('Starting Connection Verification...');
    await setupRecruiter();
    await setupSeekerWithProfile();
    await applyAndVerify();
}

run();
