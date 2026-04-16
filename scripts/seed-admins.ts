/**
 * Seed Admin Users for Serumo
 * Run: npm run seed:admins
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SUPABASE_URL.startsWith("http")) {
  console.error("❌ Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const admins = [
  { email: "adminserumo@moklet.com",  password: "serumopass123",  name: "Admin Serumo", role: "admin" },
  { email: "chusniarin12@gmail.com",  password: "chusnimoklet88", name: "Super Admin",  role: "superadmin" },
];

async function seedAdmins() {
  console.log("🌱 Seeding admin users...\n");

  for (const admin of admins) {
    // 1. Cek apakah sudah ada di auth.users
    const { data: listData } = await supabase.auth.admin.listUsers();
    const existing = listData?.users?.find((u) => u.email === admin.email);

    let userId: string;

    if (existing) {
      console.log(`⚠️  ${admin.email} sudah ada — update password & role...`);
      // Update password
      const { error: updateErr } = await supabase.auth.admin.updateUserById(existing.id, {
        password: admin.password,
        email_confirm: true,
      });
      if (updateErr) {
        console.error(`❌ Gagal update password: ${updateErr.message}`);
        continue;
      }
      userId = existing.id;
    } else {
      // Buat baru
      const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
        email: admin.email,
        password: admin.password,
        email_confirm: true,
      });
      if (authErr || !authData.user) {
        console.error(`❌ Gagal buat auth user ${admin.email}: ${authErr?.message}`);
        continue;
      }
      userId = authData.user.id;
      console.log(`✅ Auth user dibuat: ${admin.email}`);
    }

    // 2. Upsert ke public.users (bypass RLS pakai service key)
    const { error: profileErr } = await supabase.from("users").upsert(
      { id: userId, name: admin.name, email: admin.email, role: admin.role },
      { onConflict: "id" }
    );

    if (profileErr) {
      console.error(`❌ Gagal upsert profile ${admin.email}: ${profileErr.message}`);
      // Coba insert langsung via SQL
      const { error: sqlErr } = await supabase.rpc("exec_sql", {
        sql: `INSERT INTO public.users (id, name, email, role) VALUES ('${userId}', '${admin.name}', '${admin.email}', '${admin.role}') ON CONFLICT (id) DO UPDATE SET role = '${admin.role}', name = '${admin.name}'`
      });
      if (sqlErr) console.error(`❌ SQL fallback juga gagal: ${sqlErr.message}`);
    } else {
      console.log(`✅ Profile OK: ${admin.email} — role: ${admin.role}`);
    }
  }

  console.log("\n✨ Selesai!\n");
  console.log("Kredensial login:");
  admins.forEach((a) => console.log(`  📧 ${a.email}  🔑 ${a.password}  👤 ${a.role}`));
}

seedAdmins().catch(console.error);
