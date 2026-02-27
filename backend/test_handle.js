const mongoose = require('mongoose');
const ChatProfile = require('./chat-module/models/ChatProfile');

async function testHandle() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/jobPortal');
        console.log("Connected to DB");

        // Use a dummy objectID for testing
        const dummyUserId = new mongoose.Types.ObjectId();

        const profile = await ChatProfile.findOneAndUpdate(
            { userId: dummyUserId },
            {
                userId: dummyUserId,
                chat_username: 'john_doe',
                displayName: 'John Doe',
                role: 'admin' // test admin
            },
            { upsert: true, new: true, runValidators: true }
        );
        console.log("Success:", profile);

    } catch (err) {
        console.log("CAUGHT ERROR:");
        console.log("Name:", err.name);
        console.log("Code:", err.code);
        console.log("Message:", err.message);
        if (err.errors) {
            for (let e in err.errors) {
                console.log("Validation error:", err.errors[e].message);
            }
        }
    } finally {
        process.exit(0);
    }
}

testHandle();
