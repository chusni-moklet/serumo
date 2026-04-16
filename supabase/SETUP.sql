-- ================================================================
-- SERUMO — Setup Lengkap Database
-- Jalankan SEMUA file ini secara berurutan di Supabase SQL Editor:
-- 1. SETUP.sql (file ini) — buat semua tabel & RLS
-- 2. Setelah selesai, jalankan: npm run seed:admins
-- ================================================================

-- Extension
create extension if not exists "uuid-ossp";

-- Drop tables (fresh install)
drop table if exists public.payments cascade;
drop table if exists public.booking_facilities cascade;
drop table if exists public.bookings cascade;
drop table if exists public.facilities cascade;
drop table if exists public.rooms cascade;
drop table if exists public.users cascade;

-- TABLE: users
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'user' check (role in ('superadmin', 'admin', 'user')),
  created_at timestamptz default now()
);

-- TABLE: rooms
create table public.rooms (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price integer not null default 0,
  capacity integer not null default 0,
  area numeric(8,2) default 0,
  room_facilities text[] default '{}',
  image_url text,
  virtual_tour_url text,
  map_image text,
  gallery text[] default '{}',
  created_at timestamptz default now()
);

-- TABLE: facilities
create table public.facilities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  price integer not null default 0,
  created_at timestamptz default now()
);

-- TABLE: bookings
create table public.bookings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  total_price integer not null default 0,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  created_at timestamptz default now()
);

-- TABLE: booking_facilities
create table public.booking_facilities (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  facility_id uuid not null references public.facilities(id) on delete cascade,
  quantity integer not null default 1
);

-- TABLE: payments
create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references public.bookings(id) on delete cascade unique,
  proof_url text not null,
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  created_at timestamptz default now()
);

-- ================================================================
-- RLS
-- ================================================================

alter table public.users enable row level security;
alter table public.rooms enable row level security;
alter table public.facilities enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_facilities enable row level security;
alter table public.payments enable row level security;

-- Helper function (prevents infinite recursion in RLS)
create or replace function public.get_my_role()
returns text language sql stable security definer as $$
  select role from public.users where id = auth.uid()
$$;

-- USERS
create policy "users_select_own"        on public.users for select using (auth.uid() = id);
create policy "users_select_admin"      on public.users for select using (public.get_my_role() in ('admin','superadmin'));
create policy "users_insert_own"        on public.users for insert with check (auth.uid() = id);
create policy "users_update_own"        on public.users for update using (auth.uid() = id);
create policy "users_update_superadmin" on public.users for update using (public.get_my_role() = 'superadmin');
create policy "users_delete_superadmin" on public.users for delete using (public.get_my_role() = 'superadmin');

-- ROOMS
create policy "rooms_public_select" on public.rooms for select using (true);
create policy "rooms_admin_manage"  on public.rooms for all using (public.get_my_role() in ('admin','superadmin'));

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

-- ================================================================
-- STORAGE
-- ================================================================
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', true)
on conflict (id) do update set public = true;

drop policy if exists "payment_upload" on storage.objects;
drop policy if exists "payment_read"   on storage.objects;
drop policy if exists "payment_update" on storage.objects;

create policy "payment_upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'payment-proofs');
create policy "payment_read" on storage.objects
  for select to public using (bucket_id = 'payment-proofs');
create policy "payment_update" on storage.objects
  for update to authenticated using (bucket_id = 'payment-proofs');

-- ================================================================
-- SEED DATA
-- ================================================================
insert into public.facilities (name, price) values
  ('Proyektor',              50000),
  ('Sound System',          100000),
  ('Kursi Tambahan (per 10)', 25000),
  ('AC Tambahan',            75000),
  ('Microphone',             30000);

-- ================================================================
-- SELESAI. Selanjutnya jalankan: npm run seed:admins
-- ================================================================
