const { execSync } = require('child_process');

function killPort(port) {
    try {
        console.log(`Checking port ${port}...`);
        const output = execSync(`netstat -ano | findstr :${port}`).toString();
        const lines = output.split('\n').filter(line => line.includes('LISTENING'));

        lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            if (pid && pid !== '0') {
                console.log(`Killing PID ${pid} on port ${port}...`);
                try {
                    execSync(`taskkill /F /PID ${pid}`);
                } catch (e) {
                    console.error(`Failed to kill PID ${pid}: ${e.message}`);
                }
            }
        });
    } catch (err) {
        console.log(`No process found on port ${port} or error: ${err.message}`);
    }
}

killPort(5000);
killPort(5001);
console.log('Done.');
