-- ================================================================
-- SETUP STORAGE untuk payment-proofs
-- Jalankan di Supabase SQL Editor
-- ================================================================

-- 1. Buat bucket (kalau belum ada)
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', true)
on conflict (id) do update set public = true;

-- 2. Drop policy lama
drop policy if exists "Anyone can upload payment proofs" on storage.objects;
drop policy if exists "Anyone can view payment proofs" on storage.objects;
drop policy if exists "Users can upload payment proofs" on storage.objects;
drop policy if exists "Public read payment proofs" on storage.objects;
drop policy if exists "payment_upload" on storage.objects;
drop policy if exists "payment_read" on storage.objects;
drop policy if exists "payment_delete" on storage.objects;

-- 3. Policy: user yang login bisa upload
create policy "payment_upload" on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'payment-proofs');

-- 4. Policy: semua orang bisa baca (public bucket)
create policy "payment_read" on storage.objects
  for select
  to public
  using (bucket_id = 'payment-proofs');

-- 5. Policy: user bisa update file miliknya
create policy "payment_update" on storage.objects
  for update
  to authenticated
  using (bucket_id = 'payment-proofs');

-- Verifikasi
select id, name, public from storage.buckets where id = 'payment-proofs';
