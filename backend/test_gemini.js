require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    try {
        console.log('Testing Gemini API key...');
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('No API key found in .env');
            return;
        }
        console.log('Key length:', apiKey.length);

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = "Reply with 'API Key is working!' if you receive this message.";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log('Gemini Response:', response.text());
        console.log('✅ Gemini API is configured and working perfectly!');
    } catch (error) {
        console.error('❌ Gemini API Error:', error.message);
    }
}

testGemini();
