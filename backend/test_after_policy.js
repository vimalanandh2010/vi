const supabase = require('./config/supabaseConfig');

async function testSupabase() {
    console.log('Testing Supabase Upload...');
    const mockFile = {
        originalname: 'test_after_policy.txt',
        buffer: Buffer.from('Testing after policy creation'),
        mimetype: 'text/plain'
    };
    const fileName = `resumes/${Date.now()}_test.txt`;

    try {
        const { data, error } = await supabase.storage
            .from('uploads')
            .upload(fileName, mockFile.buffer, {
                contentType: mockFile.mimetype,
                upsert: false
            });

        if (error) {
            console.error('Error Object:', JSON.stringify(error, null, 2));
            console.error('Error Message:', error.message);
        } else {
            console.log('Upload successful:', data);
        }
    } catch (err) {
        console.error('Unexpected Catch Error:', err);
    } finally {
        process.exit(0);
    }
}

testSupabase();
