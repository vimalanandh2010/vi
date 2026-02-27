
require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

console.log('--- Google Auth Config Check ---');
console.log('GOOGLE_CLIENT_ID:', clientId ? clientId.substring(0, 15) + '...' : 'MISSING');
console.log('GOOGLE_CLIENT_SECRET:', clientSecret ? clientSecret.substring(0, 5) + '...' : 'MISSING');

if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
    console.error('❌ GOOGLE_CLIENT_ID is not set or is default placeholder.');
    process.exit(1);
}

try {
    const client = new OAuth2Client(clientId);
    console.log('✅ OAuth2Client initialized successfully.');
} catch (error) {
    console.error('❌ Failed to initialize OAuth2Client:', error.message);
}
