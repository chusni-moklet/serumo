/**
 * Reset password admin langsung via Supabase Admin API
 * Run: npm run reset:password
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function resetPasswords() {
  // List semua user
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) { console.error("❌ Gagal list users:", error.message); return; }

  console.log(`\n📋 Total auth users: ${users.length}`);
  users.forEach(u => console.log(`  - ${u.email} (confirmed: ${u.email_confirmed_at ? "✅" : "❌"})`));

  const targets = [
    { email: "adminserumo@moklet.com",  password: "serumopass123",  role: "admin" },
    { email: "chusniarin12@gmail.com",  password: "chusnimoklet88", role: "superadmin" },
  ];

  console.log("\n🔄 Reset password...\n");

  for (const target of targets) {
    const user = users.find(u => u.email === target.email);

    if (!user) {
      console.log(`⚠️  ${target.email} tidak ada di auth — membuat baru...`);
      const { data, error: createErr } = await supabase.auth.admin.createUser({
        email: target.email,
        password: target.password,
        email_confirm: true,
      });
      if (createErr) { console.error(`❌ Gagal buat: ${createErr.message}`); continue; }

      // Insert ke public.users
      await supabase.from("users").upsert({
        id: data.user!.id,
        name: target.role === "superadmin" ? "Super Admin" : "Admin Serumo",
        email: target.email,
        role: target.role,
      }, { onConflict: "id" });

      console.log(`✅ Dibuat baru: ${target.email}`);
      continue;
    }

    // Update password
    const { error: updateErr } = await supabase.auth.admin.updateUserById(user.id, {
      password: target.password,
      email_confirm: true,
    });

    if (updateErr) {
      console.error(`❌ Gagal update ${target.email}: ${updateErr.message}`);
    } else {
      console.log(`✅ Password reset: ${target.email} → "${target.password}"`);
    }

    // Update role di public.users
    const { error: roleErr } = await supabase.from("users").upsert({
      id: user.id,
      name: target.role === "superadmin" ? "Super Admin" : "Admin Serumo",
      email: target.email,
      role: target.role,
    }, { onConflict: "id" });

    if (roleErr) {
      console.error(`⚠️  Role update gagal: ${roleErr.message}`);
      // Coba langsung SQL
      await supabase.rpc("exec_sql" as any, {
        sql: `INSERT INTO public.users (id, name, email, role) VALUES ('${user.id}','${target.role === "superadmin" ? "Super Admin" : "Admin Serumo"}','${target.email}','${target.role}') ON CONFLICT (id) DO UPDATE SET role='${target.role}'`
      });
    } else {
      console.log(`✅ Role OK: ${target.email} → ${target.role}`);
    }
  }

  console.log("\n✨ Selesai! Coba login sekarang:");
  targets.forEach(t => console.log(`  📧 ${t.email}  🔑 ${t.password}`));
}

resetPasswords().catch(console.error);
