const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env.local
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
    const { data: users, error } = await supabase.auth.admin.listUsers();
    if (error) {
        console.error('Error fetching users:', error);
        return;
    }
    console.log('Total users:', users.users.length);
    const emails = ['adminserumo@moklet.com', 'chusniarin12@gmail.com', 'chusni@smktelkom-mlg.sch.id'];
    for (const email of emails) {
        const user = users.users.find(u => u.email === email);
        if (user) {
            console.log(`Found user ${email}:`, user.id, user.user_metadata, 'Confirmed:', user.email_confirmed_at !== null);
            // check profile
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            console.log(`Profile for ${email}:`, profile);
        } else {
            console.log(`User ${email} NOT FOUND.`);
        }
    }
}

checkUsers();
