const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // The listModels method might not be directly available on genAI in this version
        // But we can try to use a simple prompt on a few known model names
        const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'];
        
        for (const modelName of models) {
            try {
                console.log(`Checking model: ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("ping");
                const response = await result.response;
                console.log(`✅ ${modelName} is available. Response: ${response.text()}`);
                return; // Stop after first working model
            } catch (err) {
                console.log(`❌ ${modelName} failed: ${err.message}`);
            }
        }
    } catch (error) {
        console.error('Error listing models:', error.message);
    }
}

listModels();
