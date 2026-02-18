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

// Test connection by querying production tables
async function testConnection() {
    try {
        console.log('🔌 Testing connection to Supabase...\n');

        // Simple query to test connection
        const { error } = await supabase
            .from('agents')
            .select('id', { head: true, count: 'exact' });

        if (error) {
            console.error('❌ Connection failed:', error.message);
            console.log('\nPossible issues:');
            console.log('1. Invalid credentials');
            console.log('2. Required tables are missing');
            console.log('3. RLS policies blocking access');
            return;
        }

        console.log('✅ Successfully connected to Supabase!');
        console.log('✓ Database is accessible');
        console.log('✓ "agents" table exists\n');

        const tableChecks = ['reviews', 'enquiries', 'agent_profiles', 'contact_submissions', 'blog_posts'];
        for (const tableName of tableChecks) {
            const { error: tableError } = await supabase
                .from(tableName)
                .select('id', { head: true, count: 'exact' });
            if (tableError) {
                console.log(`⚠ "${tableName}" check failed: ${tableError.message}`);
            } else {
                console.log(`✓ "${tableName}" table exists`);
            }
        }

        console.log('\n🎉 Supabase connection is working perfectly!');

    } catch (err) {
        console.error('❌ Unexpected error:', err.message);
    }
}

testConnection();
