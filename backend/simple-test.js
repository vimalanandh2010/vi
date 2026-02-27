const dotenv = require('dotenv');
dotenv.config();

console.log('🔍 Checking Supabase Configuration...\n');

// Check environment variables
console.log('1. Environment Variables:');
console.log('   SUPABASE_URL:', process.env.SUPABASE_URL || '❌ Missing');
console.log('   SUPABASE_KEY:', process.env.SUPABASE_KEY ? '✅ Set' : '❌ Missing');

// Test basic connection
async function testConnection() {
    console.log('\n2. Testing Connection...');
    
    try {
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
        
        console.log('   📡 Creating Supabase client...');
        
        // Simple test - try to list buckets
        const { data, error } = await supabase.storage.listBuckets();
        
        if (error) {
            console.log('   ❌ Connection failed:', error.message);
            
            if (error.message.includes('fetch failed')) {
                console.log('   🌐 This might be a network issue');
                console.log('   💡 Try checking your internet connection');
                console.log('   💡 Or try again in a few minutes');
            }
            
            return false;
        }
        
        console.log('   ✅ Connection successful!');
        console.log('   📁 Found', data.length, 'buckets');
        
        if (data.length === 0) {
            console.log('   📋 No buckets found - you need to create the "uploads" bucket');
        } else {
            console.log('   📁 Your buckets:');
            data.forEach(bucket => {
                console.log(`      - ${bucket.name} (${bucket.public ? 'Public' : 'Private'})`);
            });
            
            const uploadsBucket = data.find(b => b.name === 'uploads');
            if (uploadsBucket) {
                console.log('   🎉 "uploads" bucket found! Your upload should work now!');
            } else {
                console.log('   ⚠️  "uploads" bucket missing - create it in the dashboard');
            }
        }
        
        return true;
        
    } catch (error) {
        console.log('   ❌ Test failed:', error.message);
        return false;
    }
}

testConnection();