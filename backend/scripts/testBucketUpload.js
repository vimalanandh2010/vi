const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testBucketUpload() {
    try {
        console.log('🔍 Testing Supabase bucket upload...');
        console.log('URL:', supabaseUrl);
        console.log('Using Service Role Key:', !!process.env.SUPABASE_SERVICE_ROLE);
        
        // Test 1: List buckets
        console.log('\n📋 Listing buckets...');
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        
        if (listError) {
            console.error('❌ Error listing buckets:', listError);
            process.exit(1);
        }
        
        console.log('✅ Found buckets:', buckets.map(b => b.name).join(', '));
        
        const bucketExists = buckets.some(b => b.name === 'futuremilstone');
        if (!bucketExists) {
            console.error('❌ Bucket "futuremilstone" not found!');
            process.exit(1);
        }
        
        console.log('✅ Bucket "futuremilstone" exists');
        
        // Test 2: Try to upload a test file
        console.log('\n📤 Testing file upload...');
        const testContent = Buffer.from('This is a test file');
        const testFileName = `test/test_${Date.now()}.txt`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('futuremilstone')
            .upload(testFileName, testContent, {
                contentType: 'text/plain',
                upsert: false
            });
        
        if (uploadError) {
            console.error('❌ Upload error:', uploadError);
            console.error('Error details:', JSON.stringify(uploadError, null, 2));
            process.exit(1);
        }
        
        console.log('✅ Upload successful!');
        console.log('Upload data:', uploadData);
        
        // Test 3: Get public URL
        console.log('\n🔗 Getting public URL...');
        const { data: urlData } = supabase.storage
            .from('futuremilstone')
            .getPublicUrl(testFileName);
        
        console.log('✅ Public URL:', urlData.publicUrl);
        
        // Test 4: Clean up test file
        console.log('\n🗑️  Cleaning up test file...');
        const { error: deleteError } = await supabase.storage
            .from('futuremilstone')
            .remove([testFileName]);
        
        if (deleteError) {
            console.error('⚠️  Delete error:', deleteError);
        } else {
            console.log('✅ Test file deleted');
        }
        
        console.log('\n✅ All tests passed! Supabase storage is working correctly.');
        process.exit(0);
        
    } catch (err) {
        console.error('❌ Test failed:', err);
        process.exit(1);
    }
}

testBucketUpload();
