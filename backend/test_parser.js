require('dotenv').config({ path: __dirname + '/.env' });
const { extractText } = require('./services/documentParser');

async function testPDF() {
    try {
        console.log('Testing documentParser with new native http download...');
        const url = "https://ppyuyohomndnsyfpoxuh.supabase.co/storage/v1/object/public/uploads/resumes/1771646473705_autoCV.pdf";
        const text = await extractText(url);
        console.log('--- EXTRACTED TEXT ---');
        console.log(text ? text.substring(0, 500) : 'NO TEXT EXTRACTED');
        console.log('--- END EXTRACTED TEXT ---');
        process.exit(0);
    } catch (e) {
        console.error('Test Failed:', e.message);
        process.exit(1);
    }
}

const timer = setTimeout(() => {
    console.error('Test timed out after 20 seconds!');
    process.exit(2);
}, 20000);

testPDF();
