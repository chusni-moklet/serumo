-- ================================================================
-- FIX: RLS untuk bookings INSERT
-- Jalankan di Supabase SQL Editor
-- ================================================================

-- Drop policy lama
drop policy if exists "bookings_insert" on public.bookings;
drop policy if exists "Users can create bookings" on public.bookings;
drop policy if exists "Users create bookings" on public.bookings;

-- Buat ulang — user yang login bisa insert booking untuk dirinya sendiri
create policy "bookings_insert" on public.bookings
  for insert
  with check (auth.uid() = user_id);

-- Pastikan select juga ada
drop policy if exists "bookings_select" on public.bookings;
create policy "bookings_select" on public.bookings
  for select using (
    auth.uid() = user_id
    or public.get_my_role() in ('admin', 'superadmin')
  );

-- Fix booking_facilities insert
drop policy if exists "bf_insert" on public.booking_facilities;
create policy "bf_insert" on public.booking_facilities
  for insert with check (
    exists (
      select 1 from public.bookings
      where id = booking_id and user_id = auth.uid()
    )
  );

-- Verifikasi policies
select schemaname, tablename, policyname, cmd
from pg_policies
where tablename in ('bookings', 'booking_facilities')
order by tablename, policyname;
