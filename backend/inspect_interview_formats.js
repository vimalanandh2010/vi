const mongoose = require('mongoose');
async function inspect() {
    try {
        process.stdout.write('Connecting to DB...\n');
        await mongoose.connect('mongodb://127.0.0.1:27017/jobportal');
        process.stdout.write('Connected to DB.\n');

        const Application = mongoose.model('Application', new mongoose.Schema({
            status: String,
            interviewDate: String,
            interviewTime: String
        }));

        const apps = await Application.find({
            status: 'interview'
        }).select('interviewDate interviewTime status');

        process.stdout.write(`Found ${apps.length} interview apps.\n`);
        apps.forEach(app => {
            process.stdout.write(`ID: ${app._id}, Date: "${app.interviewDate}", Time: "${app.interviewTime}"\n`);
        });
        process.stdout.write('Done.\n');

        process.exit(0);
    } catch (err) {
        process.stdout.write(`Error: ${err.message}\n`);
        process.exit(1);
    }
}
inspect();
