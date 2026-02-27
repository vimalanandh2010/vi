const express = require('express');
const app = express();
app.use(express.json());
app.post('/test', (req, res) => {
    console.log('Body received:', req.body);
    res.json({ success: true, received: req.body });
});
app.listen(5005, () => console.log('Test server on 5005'));
