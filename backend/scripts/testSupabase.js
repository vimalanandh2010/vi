const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(process.env.SUPABASE_URL, supabaseKey);

async function testConnection() {
    try {
        console.log('Testing Supabase connection...');
        
        // List existing buckets
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        
        if (listError) {
            console.error('Error listing buckets:', listError);
            process.exit(1);
        }
        
        console.log('Existing buckets:', buckets.map(b => b.name));
        
        // Check if futuremilstone exists
        const bucketExists = buckets.some(b => b.name === 'futuremilstone');
        
        if (bucketExists) {
            console.log('✅ Bucket "futuremilstone" already exists!');
            process.exit(0);
        }
        
        // Try to create the bucket
        console.log('Creating bucket "futuremilstone"...');
        const { data, error } = await supabase.storage.createBucket('futuremilstone', {
            public: true,
            allowedMimeTypes: ['image/*', 'video/*', 'application/pdf'],
            fileSizeLimit: 104857600 // 100MB
        });
        
        if (error) {
            console.error('Error creating bucket:', error);
            process.exit(1);
        }
        
        console.log('✅ Bucket created successfully!', data);
        process.exit(0);
        
    } catch (err) {
        console.error('Script error:', err);
        process.exit(1);
    }
}

testConnection();
