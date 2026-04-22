const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL ERROR: SUPABASE_URL or SUPABASE_KEY is missing.');
    if (process.env.NODE_ENV === 'production') {
        process.exit(1); // Fail fast in production to show error in logs
    }
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
