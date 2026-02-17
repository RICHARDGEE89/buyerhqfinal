// Quick Supabase Connection Test
// Run with: node test-supabase.js
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Check if environment variables are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Checking Supabase Configuration...\n');

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables!');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✓ Set' : '✗ Missing');
    console.log('\n💡 Tip: Create a .env.local file with your Supabase credentials');
    process.exit(1);
}

console.log('✓ Environment variables found');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 20) + '...\n');

// Create client
const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection by querying the users table
async function testConnection() {
    try {
        console.log('🔌 Testing connection to Supabase...\n');

        // Simple query to test connection
        const { data, error } = await supabase
            .from('users')
            .select('count')
            .limit(1);

        if (error) {
            console.error('❌ Connection failed:', error.message);
            console.log('\nPossible issues:');
            console.log('1. Invalid credentials');
            console.log('2. Table "users" does not exist');
            console.log('3. RLS policies blocking access');
            return;
        }

        console.log('✅ Successfully connected to Supabase!');
        console.log('✓ Database is accessible');
        console.log('✓ "users" table exists\n');

        // Test agents table
        const { data: agentsData, error: agentsError } = await supabase
            .from('agents')
            .select('count')
            .limit(1);

        if (!agentsError) {
            console.log('✓ "agents" table exists');
        }

        console.log('\n🎉 Supabase connection is working perfectly!');

    } catch (err) {
        console.error('❌ Unexpected error:', err.message);
    }
}

testConnection();
