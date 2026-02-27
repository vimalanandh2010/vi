const http = require('http');
const port = 5000;
const server = http.createServer((req, res) => {
    res.end('Server is up');
});
server.listen(port, () => {
    console.log(`Port ${port} is free and server is listening`);
    process.exit(0);
});
server.on('error', (err) => {
    console.error(`Port ${port} error:`, err.message);
    process.exit(1);
});
