const axios = require('axios');
const pdfParse = require('pdf-parse');

async function test() {
    const url = 'https://ppyuyohomndnsyfpoxuh.supabase.co/storage/v1/object/public/uploads/resumes/1771968423214_autoCV.pdf';
    try {
        console.log('Fetching', url);
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        console.log('Status:', res.status, 'Type:', res.headers['content-type']);
        const text = await pdfParse(Buffer.from(res.data));
        console.log('Extracted:', text.text.substring(0, 100));
    } catch (e) {
        console.error('Error:', e.message);
    }
}
test();
