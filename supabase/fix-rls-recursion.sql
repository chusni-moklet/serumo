-- ================================================================
-- FIX COMPLETE — Drop semua policy lama, buat ulang yang baru
-- Jalankan di Supabase SQL Editor
-- ================================================================

-- ============ HELPER FUNCTION ============
create or replace function public.get_my_role()
returns text language sql stable security definer as $$
  select role from public.users where id = auth.uid()
$$;

-- ============ DROP SEMUA POLICY LAMA ============

-- users
drop policy if exists "Users view own" on public.users;
drop policy if exists "Users can view own profile" on public.users;
drop policy if exists "Admin view all users" on public.users;
drop policy if exists "Admin/Superadmin can view all users" on public.users;
drop policy if exists "Users insert own" on public.users;
drop policy if exists "Users can insert own profile" on public.users;
drop policy if exists "Users update own" on public.users;
drop policy if exists "Users can update own profile" on public.users;
drop policy if exists "Superadmin update any" on public.users;
drop policy if exists "Superadmin can update any user" on public.users;
drop policy if exists "Superadmin delete" on public.users;
drop policy if exists "Superadmin can delete user" on public.users;
drop policy if exists "users_select_own" on public.users;
drop policy if exists "users_select_admin" on public.users;
drop policy if exists "users_insert_own" on public.users;
drop policy if exists "users_update_own" on public.users;
drop policy if exists "users_update_superadmin" on public.users;
drop policy if exists "users_delete_superadmin" on public.users;

-- rooms
drop policy if exists "Anyone can view rooms" on public.rooms;
drop policy if exists "Public view rooms" on public.rooms;
drop policy if exists "Admin can manage rooms" on public.rooms;
drop policy if exists "Admin/Superadmin can manage rooms" on public.rooms;
drop policy if exists "rooms_admin_manage" on public.rooms;

-- facilities
drop policy if exists "Anyone can view facilities" on public.facilities;
drop policy if exists "Public view facilities" on public.facilities;
drop policy if exists "Admin can manage facilities" on public.facilities;
drop policy if exists "Admin/Superadmin can manage facilities" on public.facilities;
drop policy if exists "facilities_admin_manage" on public.facilities;

-- bookings
drop policy if exists "Users can view own bookings" on public.bookings;
drop policy if exists "Users view own bookings" on public.bookings;
drop policy if exists "Admin can view all bookings" on public.bookings;
drop policy if exists "Admin/Superadmin can view all bookings" on public.bookings;
drop policy if exists "Users can create bookings" on public.bookings;
drop policy if exists "Users create bookings" on public.bookings;
drop policy if exists "Admin can update bookings" on public.bookings;
drop policy if exists "Admin/Superadmin can update bookings" on public.bookings;
drop policy if exists "Admin update bookings" on public.bookings;
drop policy if exists "bookings_select" on public.bookings;
drop policy if exists "bookings_admin_select" on public.bookings;
drop policy if exists "bookings_admin_update" on public.bookings;

-- booking_facilities
drop policy if exists "Users can view own booking facilities" on public.booking_facilities;
drop policy if exists "Users view own bf" on public.booking_facilities;
drop policy if exists "Users can insert booking facilities" on public.booking_facilities;
drop policy if exists "Users insert bf" on public.booking_facilities;
drop policy if exists "Admin can view all booking facilities" on public.booking_facilities;
drop policy if exists "Admin/Superadmin can view all booking facilities" on public.booking_facilities;
drop policy if exists "Admin view all bf" on public.booking_facilities;
drop policy if exists "bf_select" on public.booking_facilities;
drop policy if exists "bf_admin_select" on public.booking_facilities;

-- payments
drop policy if exists "Users can view own payments" on public.payments;
drop policy if exists "Users view own payments" on public.payments;
drop policy if exists "Users can insert payments" on public.payments;
drop policy if exists "Users insert payments" on public.payments;
drop policy if exists "Admin can manage payments" on public.payments;
drop policy if exists "Admin/Superadmin can manage payments" on public.payments;
drop policy if exists "payments_admin_manage" on public.payments;

-- ============ BUAT POLICY BARU (pakai get_my_role, tidak rekursif) ============

-- USERS
create policy "users_select_own"        on public.users for select using (auth.uid() = id);
create policy "users_select_admin"      on public.users for select using (public.get_my_role() in ('admin','superadmin'));
create policy "users_insert_own"        on public.users for insert with check (auth.uid() = id);
create policy "users_update_own"        on public.users for update using (auth.uid() = id);
create policy "users_update_superadmin" on public.users for update using (public.get_my_role() = 'superadmin');
create policy "users_delete_superadmin" on public.users for delete using (public.get_my_role() = 'superadmin');

-- ROOMS
create policy "rooms_public_select"  on public.rooms for select using (true);
create policy "rooms_admin_manage"   on public.rooms for all using (public.get_my_role() in ('admin','superadmin'));

-- FACILITIES
create policy "facilities_public_select" on public.facilities for select using (true);
create policy "facilities_admin_manage"  on public.facilities for all using (public.get_my_role() in ('admin','superadmin'));

-- BOOKINGS
create policy "bookings_select" on public.bookings
  for select using (auth.uid() = user_id or public.get_my_role() in ('admin','superadmin'));
create policy "bookings_insert" on public.bookings
  for insert with check (auth.uid() = user_id);
create policy "bookings_admin_update" on public.bookings
  for update using (public.get_my_role() in ('admin','superadmin'));

-- BOOKING_FACILITIES
create policy "bf_select" on public.booking_facilities
  for select using (
    public.get_my_role() in ('admin','superadmin')
    or exists (select 1 from public.bookings where id = booking_id and user_id = auth.uid())
  );
create policy "bf_insert" on public.booking_facilities
  for insert with check (
    exists (select 1 from public.bookings where id = booking_id and user_id = auth.uid())
  );

-- PAYMENTS
create policy "payments_select" on public.payments
  for select using (
    public.get_my_role() in ('admin','superadmin')
    or exists (select 1 from public.bookings where id = booking_id and user_id = auth.uid())
  );
create policy "payments_insert" on public.payments
  for insert with check (
    exists (select 1 from public.bookings where id = booking_id and user_id = auth.uid())
  );
create policy "payments_admin_manage" on public.payments
  for all using (public.get_my_role() in ('admin','superadmin'));

-- ============ VERIFIKASI ============
select email, role from public.users where role in ('admin','superadmin');
