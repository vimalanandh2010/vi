const supabase = require('./config/supabaseConfig');
const fs = require('fs');
const path = require('path');

async function testSupabase() {
    console.log('🧪 Testing Supabase Upload...');

    const mockFile = {
        originalname: 'test_resume_detailed.pdf',
        buffer: Buffer.from('PDF Content Simulation'),
        mimetype: 'application/pdf'
    };

    const folder = 'resumes';
    const timestamp = Date.now();
    const safeOriginalName = mockFile.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    const fileName = `${folder}/${timestamp}_${safeOriginalName}`;

    try {
        console.log(`📡 Attempting to upload ${fileName} to bucket 'uploads'...`);
        const { data, error } = await supabase.storage
            .from('uploads')
            .upload(fileName, mockFile.buffer, {
                contentType: mockFile.mimetype,
                upsert: false
            });

        if (error) {
            console.error('❌ Supabase Error Object:', JSON.stringify(error, null, 2));
            console.error('❌ Error Message:', error.message);
            console.error('❌ Error Status:', error.status);

            if (error.message.includes('row-level security policy')) {
                console.log('\n🎯 IMPORTANT: This error means your Supabase Connection is working, but your BUCKET POLICIES are blocking the upload.');
                console.log('   👉 Fix it here: https://supabase.com/dashboard/project/ppyuyohomndnsyfpoxuh/storage/policies');
                console.log('   👉 Create a NEW POLICY for "uploads" bucket -> "Give public access to all users" -> Check INSERT and SELECT.');
            }
            return;
        }

        console.log('✅ Upload successful:', data);
        const { data: publicUrlData } = supabase.storage
            .from('uploads')
            .getPublicUrl(fileName);
        console.log('🔗 Public URL:', publicUrlData.publicUrl);

    } catch (err) {
        console.error('💥 Unexpected Catch Error:', err);
    }
}

testSupabase();
