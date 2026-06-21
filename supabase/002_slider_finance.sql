-- ================================================================
-- FITUR BARU: FOTO SLIDER & KEUANGAN TOTAL
-- Jalankan skrip ini di Supabase SQL Editor
-- ================================================================

-- 1. TABLE: hero_slides
create table if not exists public.hero_slides (
  id uuid primary key default uuid_generate_v4(),
  image_url text not null,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- RLS untuk hero_slides
alter table public.hero_slides enable row level security;
create policy "hero_slides_select_public" on public.hero_slides for select using (true);
create policy "hero_slides_admin_manage" on public.hero_slides for all using (public.get_my_role() in ('admin','superadmin'));

-- 2. TABLE: expenses
create table if not exists public.expenses (
  id uuid primary key default uuid_generate_v4(),
  description text not null,
  amount integer not null default 0,
  date date not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- RLS untuk expenses
alter table public.expenses enable row level security;
create policy "expenses_admin_manage" on public.expenses for all using (public.get_my_role() in ('admin','superadmin'));

-- 3. STORAGE: hero-slider bucket
insert into storage.buckets (id, name, public)
values ('hero-slider', 'hero-slider', true)
on conflict (id) do update set public = true;

-- Policies untuk storage hero-slider
drop policy if exists "slider_upload" on storage.objects;
drop policy if exists "slider_read"   on storage.objects;
drop policy if exists "slider_update" on storage.objects;
drop policy if exists "slider_delete" on storage.objects;

create policy "slider_upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'hero-slider' and public.get_my_role() in ('admin','superadmin'));
create policy "slider_read" on storage.objects
  for select to public using (bucket_id = 'hero-slider');
create policy "slider_update" on storage.objects
  for update to authenticated using (bucket_id = 'hero-slider' and public.get_my_role() in ('admin','superadmin'));
create policy "slider_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'hero-slider' and public.get_my_role() in ('admin','superadmin'));

-- ================================================================
-- SELESAI
-- ================================================================
