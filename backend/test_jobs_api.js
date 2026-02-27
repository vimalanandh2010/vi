const axios = require('axios');

const testJobsApi = async () => {
    try {
        const res = await axios.get('http://localhost:5000/api/jobs');
        console.log('Status:', res.status);
        console.log('Jobs Count:', res.data.length);
        if (res.data.length > 0) {
            console.log('Sample Job:', res.data[0].title);
        }
    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) {
            console.error('Response Status:', err.response.status);
            console.error('Response Data:', err.response.data);
        }
    }
};

testJobsApi();
