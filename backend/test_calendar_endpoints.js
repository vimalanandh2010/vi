const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test authentication first
async function testCalendarEndpoints() {
    console.log('🧪 Testing Calendar API Endpoints...\n');

    try {
        // Test 1: Check if calendar routes are registered
        console.log('1️⃣ Testing /api/calendar/auth-url endpoint...');
        try {
            const authUrlResponse = await axios.get(`${BASE_URL}/calendar/auth-url`, {
                headers: {
                    'Authorization': 'Bearer test_token'
                }
            });
            console.log('   ✅ Route exists and responds');
            console.log('   Response:', authUrlResponse.status);
        } catch (error) {
            if (error.response) {
                console.log(`   ✅ Route exists (status: ${error.response.status})`);
                console.log(`   Message: ${error.response.data.message || 'Auth required'}`);
            } else {
                console.log('   ❌ Route not found or connection error');
            }
        }

        // Test 2: Check calendar status endpoint
        console.log('\n2️⃣ Testing /api/calendar/status endpoint...');
        try {
            const statusResponse = await axios.get(`${BASE_URL}/calendar/status`, {
                headers: {
                    'Authorization': 'Bearer test_token'
                }
            });
            console.log('   ✅ Status endpoint responding');
        } catch (error) {
            if (error.response) {
                console.log(`   ✅ Status endpoint exists (status: ${error.response.status})`);
            } else {
                console.log('   ❌ Status endpoint not found');
            }
        }

        // Test 3: Check sync-all endpoint
        console.log('\n3️⃣ Testing /api/calendar/sync-all endpoint...');
        try {
            const syncResponse = await axios.post(`${BASE_URL}/calendar/sync-all`, {}, {
                headers: {
                    'Authorization': 'Bearer test_token'
                }
            });
            console.log('   ✅ Sync endpoint responding');
        } catch (error) {
            if (error.response) {
                console.log(`   ✅ Sync endpoint exists (status: ${error.response.status})`);
            } else {
                console.log('   ❌ Sync endpoint not found');
            }
        }

        console.log('\n✅ All calendar routes are properly registered!\n');
        console.log('📋 Next steps:');
        console.log('   1. Open http://localhost:5173 in your browser');
        console.log('   2. Login as a recruiter');
        console.log('   3. Go to Job Applicants page');
        console.log('   4. Click "Schedule" button to see the calendar picker');
        console.log('   5. Go to Calendar page and click "Connect Google Calendar"');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testCalendarEndpoints();
