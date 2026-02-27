const supabase = require('./config/supabaseConfig');

async function testUploadPersistent() {
    console.log('🧪 Testing Persistent Supabase Upload...');

    const mockFile = {
        originalname: 'VERIFY_THIS_IN_DASHBOARD.pdf',
        buffer: Buffer.from('PDF Content Simulation'),
        mimetype: 'application/pdf'
    };

    const fileName = `resumes/verify_${Date.now()}.pdf`;

    try {
        console.log(`📡 Attempting to upload ${fileName} to bucket 'uploads'...`);
        const { data, error } = await supabase.storage
            .from('uploads')
            .upload(fileName, mockFile.buffer, {
                contentType: mockFile.mimetype,
                upsert: true
            });

        if (error) {
            console.error('❌ Supabase Error:', error.message);
            return;
        }

        console.log('✅ Upload successful!');
        const { data: publicUrlData } = supabase.storage
            .from('uploads')
            .getPublicUrl(fileName);

        console.log('\n--------------------------------------------------');
        console.log('🔗 PUBLIC URL:', publicUrlData.publicUrl);
        console.log('--------------------------------------------------');
        console.log('\n👉 Go to your Supabase Dashboard now:');
        console.log('1. Click on "Storage" in the left sidebar');
        console.log('2. Click on the "uploads" bucket');
        console.log('3. Open the "resumes" folder');
        console.log('4. Look for:', fileName.split('/').pop());
        console.log('--------------------------------------------------');

    } catch (err) {
        console.error('💥 Error:', err);
    }
}

testUploadPersistent();
