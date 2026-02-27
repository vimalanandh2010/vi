const axios = require('axios');

const testLogin = async (email, password) => {
    try {
        console.log(`🚀 Attempting login for: ${email}`);
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: email,
            password: password
        });
        console.log('✅ Login Success!');
        console.log('Token:', response.data.token.substring(0, 20) + '...');
        console.log('User Role:', response.data.user.role);
    } catch (error) {
        console.error('❌ Login Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error Message:', error.message);
        }
    }
};

// Use the email created in the previous successful signup test
// testseeker_1771390518200@example.com
testLogin('testseeker_1771390518200@example.com', 'password123');
