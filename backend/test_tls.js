const tls = require('tls');

const options = {
    host: 'smtp.gmail.com',
    port: 465,
    servername: 'smtp.gmail.com',
    rejectUnauthorized: false
};

console.log('Connecting to smtp.gmail.com:465...');
const socket = tls.connect(options, () => {
    console.log('✅ Connected to', socket.remoteAddress);
    console.log('Cipher:', socket.getCipher());
    socket.end();
});

socket.on('data', (data) => {
    console.log('Received:', data.toString());
});

socket.on('error', (err) => {
    console.error('❌ TLS Connection Error:', err);
});

socket.on('end', () => {
    console.log('Connection ended by server');
});
