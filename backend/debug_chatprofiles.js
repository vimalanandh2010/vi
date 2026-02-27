const mongoose = require('mongoose');

async function debugChatProfiles() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/jobPortal');
        console.log("Connected.");
        const profiles = await mongoose.connection.collection('chatprofiles').find().toArray();
        console.log("Existing profiles:", profiles);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
debugChatProfiles();
