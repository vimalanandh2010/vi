const mongoose = require('mongoose');
require('dotenv').config();

const { Community } = require('./models/Community');
const User = require('./models/User');

const seedCommunities = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB for seeding...");

        // Find a recruiter to be the creator
        const recruiter = await User.findOne({ role: 'employer' });
        if (!recruiter) {
            console.error("No recruiter found to own the communities. Please sign up as a recruiter first.");
            process.exit(1);
        }

        const defaultCommunities = [
            {
                name: "Tech Recruiters Network",
                description: "The official space for technical recruiters to share sourcing tips and tech trends.",
                creator: recruiter._id,
                members: [recruiter._id],
                tags: ["tech", "sourcing", "hiring"],
                icon: "💻"
            },
            {
                name: "HR Strategy & Global Trends",
                description: "Discussing the future of work, remote culture, and global HR policies.",
                creator: recruiter._id,
                members: [recruiter._id],
                tags: ["hr", "culture", "global"],
                icon: "🌍"
            }
        ];

        for (const commData of defaultCommunities) {
            const exists = await Community.findOne({ name: commData.name });
            if (!exists) {
                await Community.create(commData);
                console.log(`Created community: ${commData.name}`);
            }
        }

        console.log("Seeding complete!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedCommunities();
