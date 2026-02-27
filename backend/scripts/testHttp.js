const fetch = require('node-fetch'); // or use http
const http = require('http');

http.get('http://localhost:5000/api/jobs/699ea70c175e2f19e3d7755d/recommendations', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('Response:', res.statusCode, data));
}).on('error', err => console.error(err));
