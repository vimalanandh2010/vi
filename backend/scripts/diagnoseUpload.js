const { createClient } = requiif s');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('=== Supabase Upload Diagnosis ===\n');

console.log('1. Environment Variables:');
console.log('   SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('   SUPABASE_SERVICE_ROLE:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
console.log('   SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');

console.log('\n2. Testing with Service Role Key...');
const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

async function testUpload() {
    try {
        // Test upload with service role
        const testFile = Buffer.from('Test resume content');
        const fileName = `resumes/test_${Date.now()}.txt`;
        
        const { data, error } = await supabaseService.storage
            .from('uploads')
            .upload(fileName, testFile, {
                contentType: 'text/plain',
                upsert: false
            });
        
        if (error) {
            console.log('   ❌ Upload failed:', error.message);
            console.log('   Error details:', JSON.stringify(error, null, 2));
            
            if (error.message.includes('new row violates row-level security')) {
                console.log('\n⚠️  ISSUE: Row Level Security (RLS) is blocking uploads');
                console.log('   SOLUTION: Add storage policies in Supabase dashboard');
                console.log('   Go to: https://supabase.com/dashboard/project/ppyuyohomndnsyfpoxuh/storage/policies');
                console.log('   Add policy: Allow INSERT for authenticated or public users');
            }
        } else {
            console.log('   ✅ Upload successful!');
            console.log('   File path:', data.path);
            
            // Clean up
            await supabaseService.storage.from('uploads').remove([fileName]);
            console.log('   ✅ Test file cleaned up');
        }
        
    } catch (err) {
        console.log('   ❌ Error:', err.message);
    }
    
    process.exit(0);
}

testUpload();
