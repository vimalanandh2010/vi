const googleCalendarService = require('./services/googleCalendarService');
const fs = require('fs');
const path = require('path');

/**
 * Test Service Account Configuration
 * Verifies that service account is properly set up
 */

async function testServiceAccount() {
    console.log('🧪 Testing Google Calendar Service Account...\n');

    // Check environment variables
    console.log('1️⃣ Checking environment variables...');
    const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;
    const adminEmail = process.env.GOOGLE_CALENDAR_ADMIN_EMAIL;
    const calendarType = process.env.GOOGLE_CALENDAR_TYPE;

    if (!serviceAccountPath) {
        console.log('   ❌ GOOGLE_SERVICE_ACCOUNT_PATH not set in .env');
        console.log('   💡 Add: GOOGLE_SERVICE_ACCOUNT_PATH=./config/google-service-account.json');
        return;
    }
    console.log('   ✅ Service account path:', serviceAccountPath);

    if (!adminEmail) {
        console.log('   ⚠️  GOOGLE_CALENDAR_ADMIN_EMAIL not set (optional for OAuth)');
    } else {
        console.log('   ✅ Admin email:', adminEmail);
    }

    console.log('   ℹ️  Calendar type:', calendarType || 'oauth (default)');

    // Check file exists
    console.log('\n2️⃣ Checking service account file...');
    const keyFilePath = path.resolve(__dirname, serviceAccountPath);
    
    if (!fs.existsSync(keyFilePath)) {
        console.log('   ❌ File not found:', keyFilePath);
        console.log('   💡 Download from: Google Cloud Console → Service Accounts → Keys');
        return;
    }
    console.log('   ✅ File found:', keyFilePath);

    // Validate JSON
    console.log('\n3️⃣ Validating JSON structure...');
    try {
        const serviceAccount = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
        
        const requiredFields = ['client_email', 'private_key', 'project_id'];
        const missingFields = requiredFields.filter(field => !serviceAccount[field]);
        
        if (missingFields.length > 0) {
            console.log('   ❌ Missing fields:', missingFields.join(', '));
            return;
        }

        console.log('   ✅ Valid service account JSON');
        console.log('   📧 Client email:', serviceAccount.client_email);
        console.log('   🆔 Project ID:', serviceAccount.project_id);
    } catch (error) {
        console.log('   ❌ Invalid JSON:', error.message);
        return;
    }

    // Test initialization
    console.log('\n4️⃣ Testing service account initialization...');
    const initialized = googleCalendarService.initializeServiceAccount();
    
    if (!initialized) {
        console.log('   ❌ Failed to initialize service account');
        return;
    }

    // Test calendar access
    console.log('\n5️⃣ Testing calendar API access...');
    try {
        // Try to list calendars
        const response = await googleCalendarService.calendar.calendarList.list({
            maxResults: 1
        });

        console.log('   ✅ Successfully accessed Google Calendar API!');
        console.log('   📅 Found', response.data.items?.length || 0, 'calendar(s)');
        
        if (response.data.items && response.data.items.length > 0) {
            console.log('   Primary calendar:', response.data.items[0].summary);
        }

    } catch (error) {
        console.log('   ❌ API access failed:', error.message);
        
        if (error.message.includes('domain-wide delegation')) {
            console.log('\n   💡 Enable Domain-wide Delegation:');
            console.log('      1. Go to Google Cloud Console → Service Accounts');
            console.log('      2. Edit your service account');
            console.log('      3. Check "Enable Google Workspace Domain-wide Delegation"');
            console.log('      4. In Google Workspace Admin, add OAuth scopes:');
            console.log('         https://www.googleapis.com/auth/calendar');
            console.log('         https://www.googleapis.com/auth/calendar.events');
        }
        return;
    }

    console.log('\n✅ Service Account is properly configured!');
    console.log('\n📋 To use Service Account mode:');
    console.log('   1. Set in .env: GOOGLE_CALENDAR_TYPE=service_account');
    console.log('   2. Restart your backend server');
    console.log('   3. Calendar operations will use service account automatically');
}

// Run test
require('dotenv').config();
testServiceAccount().catch(console.error);
