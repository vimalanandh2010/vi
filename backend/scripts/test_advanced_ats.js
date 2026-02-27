const { compareJDAndResume } = require('../services/geminiScannerService');

const testJD = `
Job Title: Senior Software Engineer
Skills: Node.js, React, AWS, MongoDB, Docker
Experience: 5+ years
Responsibilities:
- Build scalable microservices
- Lead frontend development using React
- Manage cloud infrastructure on AWS
`;

const testResume = `
John Doe
Full Stack Developer
Skills: Node.js, React, JavaScript, MongoDB, Express, Git
Experience: 4 years
Work Experience:
- Developed multiple web applications using Node.js and React.
- Integrated MongoDB for data storage.
- Used Git for version control.
Education: Bachelor of Technology in Computer Science
`;

async function runTest() {
    console.log('Testing Advanced ATS Resume Analyzer (with Auto-Fallback)...');
    try {
        const result = await compareJDAndResume(testJD, testResume);
        console.log('Analysis Result:');
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Test Failed:', error.message);
    }
}

runTest();
