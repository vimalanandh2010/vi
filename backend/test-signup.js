const axios = require('axios');

const testSignup = async () => {
    const signupData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'testseeker_' + Date.now() + '@example.com',
        password: 'password123',
        phoneNumber: '9' + Math.floor(Math.random() * 1000000000),
        role: 'seeker',
        experienceLevel: 'fresher'
    };

    try {
        console.log('🚀 Attempting signup with:', signupData.email);
        const response = await axios.post('http://localhost:5000/api/auth/signup', signupData);
        console.log('✅ Signup Success:', response.data);
    } catch (error) {
        console.error('❌ Signup Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error Message:', error.message);
        }
    }
};

testSignup();
