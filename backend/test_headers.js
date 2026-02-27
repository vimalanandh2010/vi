const axios = require('axios');
axios.get('https://ppyuyohomndnsyfpoxuh.supabase.co/storage/v1/object/public/uploads/resumes/1771968423214_autoCV.pdf')
    .then(res => console.log('CONTENT TYPE:', res.headers['content-type'], 'SIZE:', res.data.length))
    .catch(e => console.error(e.message));
