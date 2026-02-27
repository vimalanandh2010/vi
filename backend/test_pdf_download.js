const axios = require('axios');
const fs = require('fs');
async function test() {
    try {
        const url = 'https://ppyuyohomndnsyfpoxuh.supabase.co/storage/v1/object/public/uploads/resumes/1771968423214_autoCV.pdf';
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        fs.writeFileSync('test_download.pdf', res.data);
        console.log('Saved to test_download.pdf. Status:', res.status, 'Content-Type:', res.headers['content-type']);
        console.log('File size:', res.data.length);
    } catch (e) {
        console.error(e.message);
    }
}
test();
