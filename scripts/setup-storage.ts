/**
 * Setup Supabase Storage + RLS policies
 * Run: npm run setup:storage
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

async function setup() {
  console.log("🪣 Setting up storage...\n");

  // 1. Ensure bucket exists and is public
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.find((b) => b.id === "payment-proofs");

  if (!exists) {
    const { error } = await supabase.storage.createBucket("payment-proofs", {
      public: true,
      fileSizeLimit: 2097152,
      allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
    });
    if (error) { console.error("❌ Buat bucket gagal:", error.message); return; }
    console.log("✅ Bucket dibuat");
  } else {
    await supabase.storage.updateBucket("payment-proofs", { public: true });
    console.log("✅ Bucket sudah ada, diset public");
  }

  // 2. Setup RLS policies via SQL (service role bypass)
  const policies = [
    `drop policy if exists "payment_upload" on storage.objects`,
    `drop policy if exists "payment_read" on storage.objects`,
    `drop policy if exists "payment_update" on storage.objects`,
    `drop policy if exists "Give users access to own folder 1oj01fe_0" on storage.objects`,
    `drop policy if exists "Give users access to own folder 1oj01fe_1" on storage.objects`,
    `drop policy if exists "Give users access to own folder 1oj01fe_2" on storage.objects`,
    `create policy "payment_upload" on storage.objects for insert to authenticated with check (bucket_id = 'payment-proofs')`,
    `create policy "payment_read" on storage.objects for select to public using (bucket_id = 'payment-proofs')`,
    `create policy "payment_update" on storage.objects for update to authenticated using (bucket_id = 'payment-proofs')`,
  ];

  console.log("\n🔐 Setting up storage RLS policies...");
  for (const sql of policies) {
    const { error } = await supabase.rpc("exec_sql" as any, { sql });
    if (error && !error.message.includes("does not exist")) {
      console.log(`  ⚠️  ${sql.slice(0, 50)}... → ${error.message}`);
    }
  }

  // 3. Test upload dengan authenticated client
  console.log("\n🧪 Test upload dengan service role...");
  const testBytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const { error: testErr } = await supabase.storage
    .from("payment-proofs")
    .upload(`test/ping-${Date.now()}.png`, testBytes, { upsert: true });

  if (testErr) {
    console.error("❌ Test upload gagal:", testErr.message);
  } else {
    console.log("✅ Test upload berhasil!");
    await supabase.storage.from("payment-proofs").remove([`test/ping-${Date.now()}.png`]);
  }

  // 4. Check bucket config
  const { data: b } = await supabase.storage.getBucket("payment-proofs");
  console.log("\n📋 Bucket config:", JSON.stringify(b, null, 2));

  console.log("\n✨ Setup selesai!");
  console.log("\n⚠️  PENTING: Jalankan juga SQL ini di Supabase SQL Editor:");
  console.log(`
drop policy if exists "payment_upload" on storage.objects;
drop policy if exists "payment_read" on storage.objects;
drop policy if exists "payment_update" on storage.objects;

create policy "payment_upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'payment-proofs');

create policy "payment_read" on storage.objects
  for select to public
  using (bucket_id = 'payment-proofs');

create policy "payment_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'payment-proofs');
  `);
}

setup().catch(console.error);
