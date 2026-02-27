const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function checkModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    try {
        console.log('Fetching models list from API...');
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        console.log('Available Models:');
        response.data.models.forEach(m => console.log(`- ${m.name}`));
    } catch (error) {
        console.error('Error fetching models:', error.response ? error.response.data : error.message);
    }
}

checkModels();
