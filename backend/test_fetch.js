const http = require('http');
async function test() {
    try {
        const response = await fetch('http://localhost:5000/api/chat/register-handle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // To get past auth, we either disable auth middleware for a test or mimic it.
                // Wait! Let's mock the auth token from the authRoutes or bypass it for debugging.
                // Or just observe the response!
            },
            body: JSON.stringify({ chat_username: 'john_doe' })
        });
        const text = await response.text();
        console.log("STATUS:", response.status);
        console.log("BODY:", text);
    } catch (e) {
        console.error("FETCHER ERROR:", e);
    }
}
test();
