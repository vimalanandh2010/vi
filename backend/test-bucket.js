const dotenv = require('dotenv');
const supabase = require('./config/supabaseConfig');

dotenv.config();

async function testBucket() {
    console.log('🧪 Testing Supabase Bucket...\n');

    try {
        // List all buckets
        const { data: buckets, error } = await supabase.storage.listBuckets();

        if (error) {
            console.log('❌ Error:', error.message);
            return;
        }

        console.log('📁 Your buckets:');
        if (buckets.length === 0) {
            console.log('   (No buckets found)');
            console.log('\n🎯 You need to create the "uploads" bucket!');
            console.log('   👉 Go to: https://supabase.com/dashboard/project/ppyuyohomndnsyfpoxuh/storage/buckets');
            console.log('   👉 Click "New bucket"');
            console.log('   👉 Name: "uploads"');
            console.log('   👉 ✅ Check "Public bucket"');
            console.log('   👉 Click "Create bucket"');
        } else {
            buckets.forEach(bucket => {
                console.log(`   - ${bucket.name} (${bucket.public ? 'Public' : 'Private'})`);
            });

            const uploadsBucket = buckets.find(b => b.name === 'uploads');
            if (uploadsBucket) {
                console.log('\n✅ "uploads" bucket found!');
                console.log('🎉 Your resume upload should work now!');
            } else {
                console.log('\n❌ "uploads" bucket missing!');
                console.log('   👉 Create it at: https://supabase.com/dashboard/project/ppyuyohomndnsyfpoxuh/storage/buckets');
            }
        }

    } catch (error) {
        console.log('❌ Connection failed:', error.message);
    }
}

testBucket();