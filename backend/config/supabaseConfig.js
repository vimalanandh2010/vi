const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
// Use the Service Role Key so backend can upload without RLS permission errors
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase URL or Auth Key is missing in environment variables');
    console.error('   SUPABASE_URL:', supabaseUrl ? 'Present' : 'Missing');
    console.error('   SUPABASE_SERVICE_ROLE:', process.env.SUPABASE_SERVICE_ROLE ? 'Present' : 'Missing');
    console.error('   SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Present' : 'Missing');
    
    // Return a mock client that will fail gracefully
    module.exports = {
        storage: {
            from: () => ({
                upload: async () => ({ data: null, error: new Error('Supabase not configured') }),
                getPublicUrl: () => ({ data: null }),
                remove: async () => ({ error: new Error('Supabase not configured') })
            })
        }
    };
} else {
    const supabase = createClient(supabaseUrl, supabaseKey);
    module.exports = supabase;
}
