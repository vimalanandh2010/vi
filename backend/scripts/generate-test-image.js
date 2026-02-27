const fs = require('fs');
const path = require('path');

const testImagePath = path.join(__dirname, '..', 'test-image.png');

// A 1x1 transparent PNG pixel base64
const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

try {
    fs.writeFileSync(testImagePath, base64Data, 'base64');
    console.log(`✅ Valid test image generated at: ${testImagePath}`);
} catch (error) {
    console.error('❌ Failed to generate test image:', error.message);
}
