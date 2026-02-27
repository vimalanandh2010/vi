const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkBuckets() {
    try {
        const { data, error } = await supabase.storage.listBuckets();
        if (error) {
            console.error('❌ Error listing buckets:', error.message);
            return;
        }
        console.log('✅ Buckets found:', data.map(b => b.name));

        const uploadsBucket = data.find(b => b.name === 'uploads');
        if (!uploadsBucket) {
            console.log('❌ Bucket "uploads" NOT found!');
        } else {
            console.log('✅ Bucket "uploads" exists and is', uploadsBucket.public ? 'PUBLIC' : 'PRIVATE');
        }
    } catch (err) {
        console.error('❌ Script failed:', err.message);
    }
}

checkBuckets();
