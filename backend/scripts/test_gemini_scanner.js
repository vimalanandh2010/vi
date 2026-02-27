const { compareJDAndResume } = require('../services/geminiScannerService');

const testScanner = async () => {
    const jdText = `
        Title: Senior MERN Stack Developer
        Description: We are looking for a developer with 5+ years of experience in React, Node.js, and MongoDB.
        Requirements: Expertise in React hooks, Express.js middleware, and MongoDB aggregation pipelines.
    `;

    const resumeText = `
        Vimalanandh K
        MERN Stack Developer with 4 years of experience.
        Skills: React, Node.js, Express, MongoDB, JavaScript, Tailwind.
        Projects: Built a job portal using MERN.
        Education: B.E. in IT.
    `;

    console.log('--- Starting Gemini Scanner Test ---');
    try {
        const result = await compareJDAndResume(jdText, resumeText);
        console.log('Scan Result:', JSON.stringify(result, null, 2));

        if (result.score && result.verdict) {
            console.log('✅ AI Analysis Successful');
        } else {
            console.log('❌ Unexpected Result Format');
        }
    } catch (error) {
        console.error('❌ AI Analysis Failed:', error.message);
    }
};

testScanner();
