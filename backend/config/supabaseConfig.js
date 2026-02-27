const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
// Use the Service Role Key so backend can upload without RLS permission errors
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase URL or Auth Key is missing in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
