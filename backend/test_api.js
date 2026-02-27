const http = require('http');

const data = JSON.stringify({
    chat_username: 'john_doe'
});

// Assuming token from one of the previous scripts
const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/chat/register-handle',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        // we need to bypass auth or just pass a valid token.
    }
};

const req = http.request(options, res => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => console.log(`BODY: ${body}`));
});

req.on('error', error => {
    console.error(error);
});

req.write(data);
req.end();
