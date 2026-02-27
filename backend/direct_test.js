const axios = require('axios');
const pdfParse = require('pdf-parse');

async function testPDF() {
    try {
        console.log('Downloading PDF...');
        const url = "https://ppyuyohomndnsyfpoxuh.supabase.co/storage/v1/object/public/uploads/resumes/1771646473705_autoCV.pdf";
        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 5000 });
        const buffer = Buffer.from(response.data);
        console.log(`Downloaded ${buffer.length} bytes.`);

        console.log('Parsing PDF...');
        const result = await pdfParse(buffer);
        console.log('Parsed text length:', result.text.length);
        console.log(result.text.substring(0, 100));
        console.log('Done!');
        process.exit(0);
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

testPDF();
