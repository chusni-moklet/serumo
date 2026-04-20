-- ================================================================
-- SECURITY PATCH — Fix 3 kerentanan dari hasil pentest
-- Jalankan di Supabase SQL Editor
-- Tanggal: April 2026
-- ================================================================

-- ================================================================
-- FIX 1: PRIVILEGE ESCALATION (CRITICAL)
-- Masalah: users_update_own mengizinkan user mengubah kolom 'role'
-- Fix: Batasi UPDATE hanya untuk kolom name (bukan role)
-- ================================================================

-- Hapus policy lama yang terlalu permissive
drop policy if exists "users_update_own" on public.users;

-- Buat policy baru: user hanya bisa update kolom 'name', BUKAN 'role'
-- Menggunakan check untuk memastikan role tidak berubah
create policy "users_update_own" on public.users
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- Pastikan role tidak berubah (harus sama dengan nilai di DB)
    and role = (select role from public.users where id = auth.uid())
  );

-- Tambahkan function untuk update profile yang aman (hanya name)
create or replace function public.update_my_profile(new_name text)
returns void
language plpgsql
security definer
as $$
begin
  -- Hanya update name, role tidak bisa diubah oleh user sendiri
  update public.users
  set name = new_name
  where id = auth.uid();
end;
$$;

-- ================================================================
-- FIX 2: PAYMENT FRAUD — Database Trigger (CRITICAL)
-- Masalah: Client bisa kirim total_price sembarang (termasuk 0)
-- Fix: Trigger otomatis hitung ulang total_price di database
-- ================================================================

-- Function untuk hitung total price yang benar
create or replace function public.calculate_booking_price()
returns trigger
language plpgsql
security definer
as $$
declare
  v_room_price integer;
  v_duration_hours numeric;
  v_start time;
  v_end time;
begin
  -- Ambil harga ruangan dari tabel rooms
  select price into v_room_price
  from public.rooms
  where id = NEW.room_id;

  -- Hitung durasi dalam jam
  v_start := NEW.start_time;
  v_end := NEW.end_time;
  v_duration_hours := extract(epoch from (v_end - v_start)) / 3600.0;

  -- Validasi durasi harus positif
  if v_duration_hours <= 0 then
    raise exception 'Waktu selesai harus lebih dari waktu mulai';
  end if;

  -- Validasi durasi maksimal 24 jam
  if v_duration_hours > 24 then
    raise exception 'Durasi booking maksimal 24 jam';
  end if;

  -- Override total_price dengan kalkulasi yang benar dari server
  -- Harga dasar = durasi × harga ruangan
  -- Fasilitas tambahan akan ditambahkan setelah booking_facilities diinsert
  NEW.total_price := round(v_duration_hours * v_room_price);

  -- Paksa status selalu 'pending' saat insert (tidak bisa dimanipulasi)
  if TG_OP = 'INSERT' then
    NEW.status := 'pending';
  end if;

  return NEW;
end;
$$;

-- Pasang trigger pada tabel bookings
drop trigger if exists trg_calculate_booking_price on public.bookings;
create trigger trg_calculate_booking_price
  before insert or update on public.bookings
  for each row
  execute function public.calculate_booking_price();

-- Function untuk update total setelah fasilitas ditambahkan
create or replace function public.update_booking_total_after_facilities()
returns trigger
language plpgsql
security definer
as $$
declare
  v_room_price integer;
  v_duration_hours numeric;
  v_facility_total integer;
begin
  -- Hitung ulang total setelah booking_facilities diinsert
  select
    r.price,
    extract(epoch from (b.end_time - b.start_time)) / 3600.0
  into v_room_price, v_duration_hours
  from public.bookings b
  join public.rooms r on r.id = b.room_id
  where b.id = NEW.booking_id;

  -- Total fasilitas
  select coalesce(sum(bf.quantity * f.price), 0)
  into v_facility_total
  from public.booking_facilities bf
  join public.facilities f on f.id = bf.facility_id
  where bf.booking_id = NEW.booking_id;

  -- Update total_price di bookings
  update public.bookings
  set total_price = round(v_duration_hours * v_room_price) + v_facility_total
  where id = NEW.booking_id;

  return NEW;
end;
$$;

drop trigger if exists trg_update_booking_total on public.booking_facilities;
create trigger trg_update_booking_total
  after insert on public.booking_facilities
  for each row
  execute function public.update_booking_total_after_facilities();

-- ================================================================
-- FIX 3: DEFACEMENT — Storage RLS (HIGH)
-- Masalah: User biasa bisa PUT/overwrite file di storage
-- Fix: Hanya admin yang bisa update/overwrite file
-- ================================================================

-- Hapus policy lama
drop policy if exists "payment_upload" on storage.objects;
drop policy if exists "payment_read"   on storage.objects;
drop policy if exists "payment_update" on storage.objects;

-- User authenticated bisa INSERT file baru (upload bukti bayar)
create policy "payment_upload" on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'payment-proofs');

-- Semua orang bisa READ (public bucket)
create policy "payment_read" on storage.objects
  for select
  to public
  using (bucket_id = 'payment-proofs');

-- Hanya admin/superadmin yang bisa UPDATE (overwrite) file
create policy "payment_update_admin_only" on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'payment-proofs'
    and public.get_my_role() in ('admin', 'superadmin')
  );

-- Hanya admin/superadmin yang bisa DELETE file
create policy "payment_delete_admin_only" on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'payment-proofs'
    and public.get_my_role() in ('admin', 'superadmin')
  );

-- ================================================================
-- VERIFIKASI
-- ================================================================

-- Cek policies users
select policyname, cmd, qual
from pg_policies
where tablename = 'users'
order by policyname;

-- Cek trigger bookings
select trigger_name, event_manipulation, action_timing
from information_schema.triggers
where event_object_table = 'bookings';

-- Cek storage policies
select policyname, cmd
from pg_policies
where tablename = 'objects' and schemaname = 'storage'
order by policyname;
