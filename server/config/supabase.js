require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL: SUPABASE_URL or SUPABASE_KEY is missing in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
