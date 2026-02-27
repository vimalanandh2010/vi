const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use SERVICE_ROLE key for admin operations like creating buckets
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(process.env.SUPABASE_URL, supabaseKey);

async function createUploadsBucket() {
    try {
        console.log('📡 Attempting to create "futuremilstone" bucket...');
        console.log('Using Supabase URL:', process.env.SUPABASE_URL);
        console.log('Using Service Role Key:', process.env.SUPABASE_SERVICE_ROLE ? 'Found' : 'Not Found');
        
        const { data, error } = await supabase.storage.createBucket('futuremilstone', {
            public: true,
            allowedMimeTypes: ['image/*', 'video/*', 'application/pdf'],
            fileSizeLimit: 104857600 // 100MB
        });

        if (error) {
            console.error('❌ Error creating bucket:', error.message);
            console.log('Full error:', JSON.stringify(error, null, 2));
            
            // Check if bucket already exists
            if (error.message.includes('already exists')) {
                console.log('✅ Bucket "futuremilstone" already exists!');
                return;
            }
            
            console.log('Please create a public bucket named "futuremilstone" manually in Supabase Dashboard.');
            return;
        }
        console.log('✅ Bucket "futuremilstone" created successfully!');
        console.log('Data:', data);
    } catch (err) {
        console.error('❌ Script failed:', err.message);
        console.error('Stack:', err.stack);
    }
}

createUploadsBucket();
