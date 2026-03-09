require('dotenv').config();

console.log('\n=== Google OAuth Configuration Check ===\n');

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const frontendUrl = process.env.FRONTEND_URL;

console.log('GOOGLE_CLIENT_ID:', clientId ? `${clientId.substring(0, 30)}...` : '❌ MISSING');
console.log('Full Client ID:', clientId);
console.log('\nGOOGLE_CLIENT_SECRET:', clientSecret ? `${clientSecret.substring(0, 20)}...` : '❌ MISSING');
console.log('\nFRONTEND_URL:', frontendUrl || '❌ MISSING');
console.log('\nRedirect URI:', frontendUrl ? `${frontendUrl}/auth/google/callback` : 'Cannot construct - FRONTEND_URL missing');

console.log('\n=== Expected Configuration ===');
console.log('Your Client ID from Google Console should end with: ...suib5it3119.apps.googleusercontent.com');
console.log('Redirect URIs configured in Google Console:');
console.log('  - https://backend-portal-56ud.onrender.com/auth/google/callback');
console.log('  - https://frontend-portal-b2az.onrender.com/auth/google/callback');
console.log('\n');

// Check if they match
if (clientId && clientId.includes('suib5it3119')) {
    console.log('✅ Client ID appears to match your Google Console configuration');
} else if (clientId) {
    console.log('⚠️  WARNING: Client ID may not match! Check if it ends with suib5it3119.apps.googleusercontent.com');
} else {
    console.log('❌ ERROR: GOOGLE_CLIENT_ID is not set!');
}

if (!clientSecret) {
    console.log('❌ ERROR: GOOGLE_CLIENT_SECRET is not set!');
}

if (!frontendUrl) {
    console.log('❌ ERROR: FRONTEND_URL is not set!');
}
