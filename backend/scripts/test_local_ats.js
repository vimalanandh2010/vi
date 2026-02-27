const axios = require('axios');

async function testLocalATS() {
    try {
        const response = await axios.post('http://localhost:5000/api/ai/analyze', {
            resumeText: "Experienced JavaScript developer with 5 years in React and Node.js.",
            jobDescription: "Looking for a React developer with Node.js knowledge."
        });
        console.log('✅ Test Success:', response.data);
    } catch (err) {
        console.error('❌ Test Failed:', err.response?.data || err.message);
    }
}

testLocalATS();
