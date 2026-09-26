-- ============================================================
-- FOUNDERKU INSTANT - DATABASE SCHEMA (Supabase/Postgres)
-- Dibuat: 27 Juli 2026
-- Cara pakai: copy-paste seluruh isi file ini ke Supabase SQL Editor,
-- lalu klik Run. Urutan di file ini sudah benar (tidak perlu diacak).
-- ============================================================

-- Pastikan fungsi pembuat ID acak (UUID) aktif
create extension if not exists pgcrypto;

-- ============================================================
-- 1. TABEL: profiles
-- Data tambahan untuk tiap user, nempel ke sistem auth bawaan Supabase
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  is_pro boolean not null default false,
  pro_expires_at timestamptz,
  page_count integer not null default 0,
  store_slug text unique,
  store_style text not null default 'klasik'
    check (store_style in ('klasik', 'hangat', 'minimalis', 'elegan', 'bold')),
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 2. TABEL: pages
-- Halaman jualan yang dibuat user
-- ============================================================
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null unique,
  product_name text not null,
  tagline text,
  original_price numeric(12,2),
  promo_price numeric(12,2),
  highlights text[],
  image_url text,
  whatsapp_number text not null,
  status text not null default 'active' check (status in ('active','locked','taken_down')),
  click_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index pages_user_id_idx on public.pages(user_id);
create index pages_slug_idx on public.pages(slug);

-- ============================================================
-- 3. TABEL: subscriptions
-- Riwayat langganan Pro, terpisah dari profiles untuk jejak historis
-- ============================================================
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  xendit_invoice_id text not null unique,
  plan text not null check (plan in ('monthly','yearly')),
  amount numeric(12,2) not null,
  status text not null default 'pending' check (status in ('pending','paid','failed','expired')),
  paid_at timestamptz,
  period_start timestamptz,
  period_end timestamptz,
  created_at timestamptz not null default now()
);

create index subscriptions_user_id_idx on public.subscriptions(user_id);

-- ============================================================
-- 4. TABEL: takedowns
-- Jejak moderasi (halaman yang diturunkan)
-- ============================================================
create table public.takedowns (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  reason text not null,
  taken_down_by text,
  notified_user boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 5. TABEL: slug_blocklist
-- Kata-kata yang tidak boleh dipakai sebagai alamat halaman (slug)
-- ============================================================
create table public.slug_blocklist (
  slug text primary key
);

insert into public.slug_blocklist (slug) values
  ('admin'), ('api'), ('dashboard'), ('login'), ('register'),
  ('founderku'), ('www'), ('app'), ('assets'), ('static'),
  ('settings'), ('billing'), ('support'), ('help'), ('terms'),
  ('privacy'), ('l'), ('pajangin'), ('pro'), ('free'), ('webhook');

-- ============================================================
-- TRIGGER: auto-buat baris profiles saat ada user baru signup
-- ============================================================
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- FUNGSI: is_admin
-- Dipakai di dalam RLS policy buat ngecek "apakah user ini admin".
-- Sengaja dibikin fungsi terpisah (security definer) supaya query di
-- dalamnya BYPASS RLS - kalau ditulis langsung di policy tabel
-- profiles, bisa infinite recursion (policy nyari data ke tabel yang
-- lagi dijaga policy itu sendiri).
-- ============================================================
create function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select is_admin from public.profiles where id = uid),
    false
  );
$$;

grant execute on function public.is_admin(uuid) to authenticated;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Ini aturan "siapa boleh lihat/ubah data apa"
-- ============================================================

-- ---------- profiles ----------
alter table public.profiles enable row level security;

create policy "User lihat profil sendiri"
  on public.profiles for select
  using (auth.uid() = id);

create policy "User update profil sendiri"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admin bisa lihat semua profil"
  on public.profiles for select
  using (public.is_admin(auth.uid()));

-- Data publik pemilik toko: sengaja BYPASS RLS lewat fungsi security
-- definer (bukan view - view yang bypass RLS diam-diam ditandai
-- "Critical" sama Security Advisor Supabase, jadi ditulis eksplisit
-- di sini biar jelas ini kesengajaan, bukan celah). Cuma expose 4
-- kolom aman (BUKAN email) - dipakai halaman publik (/l/[slug] dan
-- /toko/[storeSlug]) buat cek is_pro (watermark) dan store_slug tanpa
-- perlu akses penuh ke tabel profiles. Dibikin 2 versi karena kode
-- butuh cari lewat store_slug (halaman toko) dan lewat id (halaman
-- produk individual).
create function public.get_store_profile_by_slug(lookup_store_slug text)
returns table (
  id uuid,
  store_slug text,
  is_pro boolean,
  store_style text
)
language sql
security definer
set search_path = public
stable
as $$
  select id, store_slug, is_pro, store_style
  from public.profiles
  where store_slug = lookup_store_slug;
$$;

create function public.get_store_profile_by_id(lookup_id uuid)
returns table (
  id uuid,
  store_slug text,
  is_pro boolean,
  store_style text
)
language sql
security definer
set search_path = public
stable
as $$
  select id, store_slug, is_pro, store_style
  from public.profiles
  where id = lookup_id;
$$;

grant execute on function public.get_store_profile_by_slug(text) to anon, authenticated;
grant execute on function public.get_store_profile_by_id(uuid) to anon, authenticated;

-- ---------- pages ----------
alter table public.pages enable row level security;

create policy "Publik bisa lihat halaman aktif"
  on public.pages for select
  using (status = 'active');

create policy "Pemilik bisa lihat halaman sendiri (semua status)"
  on public.pages for select
  using (auth.uid() = user_id);

create policy "Pemilik bisa buat halaman"
  on public.pages for insert
  with check (auth.uid() = user_id);

create policy "Pemilik bisa update halaman sendiri"
  on public.pages for update
  using (auth.uid() = user_id);

create policy "Pemilik bisa hapus halaman sendiri"
  on public.pages for delete
  using (auth.uid() = user_id);

create policy "Admin bisa lihat semua halaman"
  on public.pages for select
  using (public.is_admin(auth.uid()));

create policy "Admin bisa update status halaman (takedown/pulihkan)"
  on public.pages for update
  using (public.is_admin(auth.uid()));

-- ---------- subscriptions ----------
alter table public.subscriptions enable row level security;

create policy "User lihat riwayat langganan sendiri"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Catatan: sengaja tidak ada policy insert/update untuk client.
-- Insert/update subscriptions hanya lewat server (webhook Xendit)
-- pakai service_role key, yang otomatis melewati RLS.

-- ---------- takedowns ----------
alter table public.takedowns enable row level security;

-- Pemilik halaman boleh baca alasan takedown punya halamannya sendiri
-- (buat ditampilin sebagai notifikasi di dashboard-nya).
create policy "Pemilik bisa lihat takedown halaman miliknya"
  on public.takedowns for select
  using (
    exists (
      select 1 from public.pages
      where pages.id = takedowns.page_id
        and pages.user_id = auth.uid()
    )
  );

-- Admin boleh baca semua, bikin baru (pas nurunin halaman), dan update
-- (nandain notified_user setelah pemilik lihat notifnya).
create policy "Admin bisa lihat semua takedown"
  on public.takedowns for select
  using (public.is_admin(auth.uid()));

create policy "Admin bisa bikin takedown baru"
  on public.takedowns for insert
  with check (public.is_admin(auth.uid()));

create policy "Admin bisa update takedown"
  on public.takedowns for update
  using (public.is_admin(auth.uid()));

-- ---------- slug_blocklist ----------
alter table public.slug_blocklist enable row level security;

create policy "Semua orang bisa baca blocklist untuk validasi form"
  on public.slug_blocklist for select
  using (true);

-- Sengaja tidak ada policy insert/update/delete untuk client.
-- Menambah kata blocklist baru hanya lewat admin/service_role key.

-- ============================================================
-- FUNGSI: increment_page_click
-- Dipakai halaman publik (dibuka pengunjung anonim) buat nambah
-- counter klik, tanpa perlu kasih akses UPDATE penuh ke tabel pages.
-- Dibatasi: 1 pengunjung yang sama cuma dihitung 1x tiap 60 detik per
-- halaman (nyegah spam klik dari script otomatis).
-- ============================================================
create table public.page_click_log (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  visitor_hash text not null,
  clicked_at timestamptz not null default now()
);

create index page_click_log_lookup_idx
  on public.page_click_log (page_id, visitor_hash, clicked_at);

alter table public.page_click_log enable row level security;
-- Sengaja tidak ada policy - tabel ini cuma diakses lewat fungsi
-- increment_page_click (security definer, bypass RLS).

create function public.increment_page_click(page_slug text, visitor_hash text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_page_id uuid;
begin
  select id into target_page_id from public.pages
  where slug = page_slug and status = 'active';

  if target_page_id is null then
    return;
  end if;

  if exists (
    select 1 from public.page_click_log
    where page_id = target_page_id
      and page_click_log.visitor_hash = increment_page_click.visitor_hash
      and clicked_at > now() - interval '60 seconds'
  ) then
    return;
  end if;

  insert into public.page_click_log (page_id, visitor_hash)
  values (target_page_id, increment_page_click.visitor_hash);

  update public.pages
  set click_count = click_count + 1
  where id = target_page_id;
end;
$$;

grant execute on function public.increment_page_click(text, text) to anon, authenticated;
