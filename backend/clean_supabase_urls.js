const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Job = require('./models/Job');
const Course = require('./models/Course');
const Company = require('./models/Company');

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=random';
const DEFAULT_POSTER = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';

async function migrateUrls() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected');

        // 1. Users table (photoUrl)
        const users = await User.find({ photoUrl: { $regex: 'ppyuyohomndnsyfpoxuh.supabase.co', $options: 'i' } });
        console.log(`Found ${users.length} users with old Supabase photos`);
        for (let user of users) {
            user.photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || 'User')}&background=random`;
            await user.save();
        }

        // 2. Jobs table (posterUrl)
        const jobs = await Job.find({ posterUrl: { $regex: 'ppyuyohomndnsyfpoxuh.supabase.co', $options: 'i' } });
        console.log(`Found ${jobs.length} jobs with old Supabase posters`);
        for (let job of jobs) {
            job.posterUrl = DEFAULT_POSTER;
            await job.save();
        }

        // 3. Courses table (thumbnailUrl)
        const courses = await Course.find({ thumbnailUrl: { $regex: 'ppyuyohomndnsyfpoxuh.supabase.co', $options: 'i' } });
        console.log(`Found ${courses.length} courses with old Supabase thumbnails`);
        for (let course of courses) {
            course.thumbnailUrl = DEFAULT_POSTER;
            await course.save();
        }

        // 4. Companies table (logo)
        const companies = await Company.find({ logo: { $regex: 'ppyuyohomndnsyfpoxuh.supabase.co', $options: 'i' } });
        console.log(`Found ${companies.length} companies with old Supabase logos`);
        for (let company of companies) {
            company.logo = DEFAULT_POSTER;
            await company.save();
        }

        console.log('Migration Complete');
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
}

migrateUrls();
