const { createClient } = require('@supabase/supabase-js');

const requiredEnv = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
];

const missingEnv = requiredEnv.filter((name) => !process.env[name]);

if (missingEnv.length > 0) {
  throw new Error(`Missing required env vars: ${missingEnv.join(', ')}`);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAdmin() {
  const { data: usersData, error: listErr } = await supabase.auth.admin.listUsers();
  if (!listErr && usersData.users) {
    const existing = usersData.users.find((user) => user.email === process.env.ADMIN_EMAIL);
    if (existing) {
      await supabase.auth.admin.deleteUser(existing.id);
      console.log('Removed old admin user');
    }
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: process.env.ADMIN_FULL_NAME || 'Admin' },
    app_metadata: { role: 'admin' },
  });

  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Created admin ID:', data.user.id);
  }
}

createAdmin();
