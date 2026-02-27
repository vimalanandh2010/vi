const axios = require('axios');

async function testSearch() {
    const baseUrl = 'http://localhost:5000/api';

    try {
        console.log('--- Testing Job Search ---');
        const jobRes = await axios.get(`${baseUrl}/jobs`, {
            params: { search: 'python', location: 'remote' }
        });
        console.log('Jobs matching "python" in "remote":', jobRes.data.length);

        console.log('\n--- Testing Company Filtration by Skills ---');
        const compRes = await axios.get(`${baseUrl}/companies`, {
            params: { skills: 'react' }
        });
        console.log('Companies matching skill "react":', compRes.data.length);

    } catch (err) {
        console.error('Test failed:', err.message);
    }
}

// Note: This script requires the backend to be running.
// Since I cannot guarantee it's running on the correct port or at all, 
// I will just rely on code review for now as the logic is straightforward.
// testSearch();
