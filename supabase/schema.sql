-- ============================================================
-- FOUNDERKU - DATABASE SCHEMA (Supabase/Postgres)
-- Satu akun Founderku buat semua tools (Pajangin, dst), dengan paket
-- Founderku Pro + trial.
--
-- CARA PAKAI (project Supabase yang SAMA dengan Pajangin lama):
--   Buka SQL Editor, copy-paste SELURUH isi file ini, klik Run.
--
-- PERHATIAN: bagian 0 di bawah MENGHAPUS semua tabel lama Pajangin
-- beserta isinya. Aman karena belum ada pengguna sama sekali. Jangan
-- jalankan ulang file ini kalau nanti sudah ada pengguna beneran.
-- Foto di Storage (bucket product-photos) dan akun login di
-- Authentication TIDAK ikut terhapus.
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- 0. BERSIH-BERSIH SKEMA LAMA PAJANGIN
-- ============================================================
drop trigger if exists on_auth_user_created on auth.users;
drop view if exists public.store_profiles;
drop table if exists public.tool_data cascade;
drop table if exists public.page_click_log cascade;
drop table if exists public.takedowns cascade;
drop table if exists public.subscriptions cascade;
drop table if exists public.pages cascade;
drop table if exists public.slug_blocklist cascade;
drop table if exists public.profiles cascade;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.is_admin(uuid) cascade;
drop function if exists public.is_admin() cascade;
drop function if exists public.has_pro_access(uuid) cascade;
drop function if exists public.get_store_profile_by_slug(text) cascade;
drop function if exists public.get_store_profile_by_id(uuid) cascade;
drop function if exists public.increment_page_click(text) cascade;
drop function if exists public.increment_page_click(text, text) cascade;
drop function if exists public.enforce_page_limit() cascade;
drop function if exists public.admin_set_page_status(uuid, text, text) cascade;
drop function if exists public.activate_subscription(text, numeric) cascade;
drop function if exists public.start_trial(uuid, integer) cascade;
drop function if exists public.tool_data_touch() cascade;
drop function if exists public.current_user_has_pro() cascade;

-- ============================================================
-- 1. TABEL: profiles
-- Satu baris per akun Founderku.
--   trial_ends_at  : kapan trial habis (diisi server saat login pertama)
--   pro_expires_at : kapan langganan Pro habis (diisi webhook Xendit)
-- Akses Pro = salah satu dari dua tanggal itu masih di masa depan.
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  trial_ends_at timestamptz,
  pro_expires_at timestamptz,
  store_slug text unique,
  store_style text not null default 'klasik'
    check (store_style in ('klasik', 'hangat', 'minimalis', 'elegan', 'bold')),
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 2. TABEL: pages (halaman jualan Pajangin)
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

-- ============================================================
-- 3. TABEL: subscriptions (riwayat pembayaran Founderku Pro)
-- price_id, amount, days disalin dari data/pricing.json SAAT invoice
-- dibuat, jadi kalau harga diubah di admin panel, invoice lama tetap
-- diproses sesuai harga waktu itu.
-- ============================================================
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  xendit_invoice_id text not null unique,
  price_id text not null,
  amount numeric(12,2) not null,
  days integer not null check (days > 0),
  status text not null default 'pending' check (status in ('pending','paid','failed','expired')),
  paid_at timestamptz,
  period_start timestamptz,
  period_end timestamptz,
  created_at timestamptz not null default now()
);

create index subscriptions_user_id_idx on public.subscriptions(user_id);

-- ============================================================
-- 4. TABEL: takedowns (jejak moderasi)
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
-- Harus SAMA dengan SLUG_BLOCKLIST di src/lib/constants.ts
-- ============================================================
create table public.slug_blocklist (
  slug text primary key
);

insert into public.slug_blocklist (slug) values
  ('admin'), ('api'), ('dashboard'), ('login'), ('register'),
  ('founderku'), ('www'), ('app'), ('assets'), ('static'),
  ('settings'), ('billing'), ('support'), ('help'), ('terms'),
  ('privacy'), ('l'), ('pajangin'), ('pro'), ('free'), ('webhook'),
  ('masuk'), ('daftar'), ('akun'), ('harga'), ('katalog'), ('tools'),
  ('toko'), ('moderasi'), ('privasi'), ('syarat'), ('founterns'),
  ('notain'), ('pajakin'), ('kontrakin'), ('jalanin'), ('sehatin');

-- ============================================================
-- 6. TABEL: page_click_log (anti-spam penghitung klik)
-- ============================================================
create table public.page_click_log (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  visitor_hash text not null,
  clicked_at timestamptz not null default now()
);

create index page_click_log_lookup_idx
  on public.page_click_log (page_id, visitor_hash, clicked_at);

-- ============================================================
-- FUNGSI BANTUAN
-- ============================================================

-- Auto-buat baris profiles saat ada akun baru
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

-- Akun login yang sudah ada sebelum reset (misal akun tes) dibikinin
-- lagi baris profilnya, biar gak error pas login.
insert into public.profiles (id, email)
select id, coalesce(email, '') from auth.users
on conflict (id) do nothing;

-- Apakah user yang SEDANG LOGIN ini admin (security definer biar gak
-- infinite recursion di policy tabel profiles). Sengaja tanpa parameter,
-- jadi gak bisa dipakai buat ngecek akun orang lain.
create function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- Apakah user ini punya akses Pro sekarang (trial ATAU langganan aktif).
-- Ini satu-satunya sumber kebenaran soal akses, dipakai database
-- (batas halaman) dan halaman publik (watermark).
create function public.has_pro_access(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select greatest(
        coalesce(trial_ends_at, '-infinity'::timestamptz),
        coalesce(pro_expires_at, '-infinity'::timestamptz)
      ) > now()
     from public.profiles where id = uid),
    false
  );
$$;

-- Mulai trial sekali seumur akun. Kalau trial_ends_at sudah terisi
-- (pernah trial), gak diubah lagi. Cuma bisa dipanggil server
-- (service_role), bukan dari browser.
create function public.start_trial(uid uuid, trial_days integer)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles
  set trial_ends_at = now() + make_interval(days => trial_days)
  where id = uid and trial_ends_at is null and trial_days > 0;
$$;

-- Data publik pemilik toko (TANPA email), buat halaman publik
create function public.get_store_profile_by_slug(lookup_store_slug text)
returns table (id uuid, store_slug text, has_pro boolean, store_style text)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.store_slug, public.has_pro_access(p.id), p.store_style
  from public.profiles p
  where p.store_slug = lookup_store_slug;
$$;

create function public.get_store_profile_by_id(lookup_id uuid)
returns table (id uuid, store_slug text, has_pro boolean, store_style text)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.store_slug, public.has_pro_access(p.id), p.store_style
  from public.profiles p
  where p.id = lookup_id;
$$;

-- Batas halaman buat akun Free (tanpa trial/Pro): maksimal 2. Dicek di
-- database, jadi gak bisa dilewati walau buka /pajangin/dashboard/new
-- langsung atau nembak API. Angka 2 harus sama dengan
-- TIER_LIMITS.free.maxPages di src/lib/constants.ts
create function public.enforce_page_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Kunci baris profil pemilik biar 2 insert barengan gak bisa
  -- sama-sama lolos pengecekan.
  perform 1 from public.profiles where id = new.user_id for update;
  if not public.has_pro_access(new.user_id) and (
    select count(*) from public.pages
    where user_id = new.user_id and status <> 'taken_down'
  ) >= 2 then
    raise exception 'PAGE_LIMIT: Batas halaman akun Free sudah tercapai.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger pages_enforce_limit
  before insert on public.pages
  for each row execute function public.enforce_page_limit();

-- Admin ubah status halaman (takedown / pulihkan). Status sengaja gak
-- bisa diubah lewat update biasa (lihat bagian HAK AKSES), jadi
-- pemilik halaman gak bisa "memulihkan" halamannya sendiri.
create function public.admin_set_page_status(target_page_id uuid, new_status text, takedown_reason text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Hanya admin.' using errcode = '42501';
  end if;
  if new_status not in ('active', 'taken_down') then
    raise exception 'Status tidak valid.';
  end if;
  if new_status = 'taken_down' then
    if coalesce(trim(takedown_reason), '') = '' then
      raise exception 'Alasan takedown wajib diisi.';
    end if;
    insert into public.takedowns (page_id, reason, taken_down_by)
    values (target_page_id, trim(takedown_reason), auth.uid()::text);
  end if;
  update public.pages set status = new_status, updated_at = now()
  where id = target_page_id;
end;
$$;

-- Dipanggil webhook Xendit (service_role) saat invoice LUNAS. Semua
-- dalam 1 transaksi + kunci baris, jadi webhook yang dikirim dobel gak
-- bikin masa aktif nambah dua kali. Masa bayar dimulai dari tanggal
-- habis yang lama (trial ATAU langganan) kalau masih aktif, jadi sisa
-- hari gak hangus walau bayarnya lebih awal.
-- Hasil: 'activated' | 'already_paid' | 'amount_mismatch' | 'not_found'
create function public.activate_subscription(invoice_id text, paid_amount numeric)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  sub public.subscriptions%rowtype;
  current_expiry timestamptz;
  start_at timestamptz;
begin
  select * into sub from public.subscriptions
  where xendit_invoice_id = invoice_id
  for update;

  if not found then
    return 'not_found';
  end if;
  if sub.status = 'paid' then
    return 'already_paid';
  end if;
  if paid_amount is distinct from sub.amount then
    update public.subscriptions set status = 'failed' where id = sub.id;
    return 'amount_mismatch';
  end if;

  select greatest(
           coalesce(pro_expires_at, '-infinity'::timestamptz),
           coalesce(trial_ends_at, '-infinity'::timestamptz)
         ) into current_expiry
  from public.profiles where id = sub.user_id
  for update;

  start_at := greatest(now(), current_expiry);

  update public.subscriptions
  set status = 'paid',
      paid_at = now(),
      period_start = start_at,
      period_end = start_at + make_interval(days => sub.days)
  where id = sub.id;

  update public.profiles
  set pro_expires_at = start_at + make_interval(days => sub.days)
  where id = sub.user_id;

  return 'activated';
end;
$$;

-- Penghitung klik halaman publik (1 pengunjung = 1x per 60 detik)
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

-- ============================================================
-- HAK AKSES FUNGSI
-- Postgres defaultnya ngizinin SEMUA orang manggil fungsi baru, jadi
-- dicabut dulu, baru dikasih ke yang memang butuh.
-- ============================================================
revoke execute on all functions in schema public from public, anon, authenticated;

-- anon juga butuh: policy "Admin bisa lihat semua ..." ikut dievaluasi
-- waktu pengunjung (belum login) buka halaman publik.
grant execute on function public.is_admin() to anon, authenticated;
-- has_pro_access sengaja gak dikasih ke user: cuma dipakai di dalam
-- fungsi database lain (batas halaman, data toko publik).
grant execute on function public.get_store_profile_by_slug(text) to anon, authenticated;
grant execute on function public.get_store_profile_by_id(uuid) to anon, authenticated;
-- Penghitung klik cuma dipanggil server (halaman /l/[slug]), biar
-- jumlah klik gak bisa dipalsukan dengan manggil fungsi langsung.
grant execute on function public.increment_page_click(text, text) to service_role;
grant execute on function public.admin_set_page_status(uuid, text, text) to authenticated;
grant execute on function public.start_trial(uuid, integer) to service_role;
grant execute on function public.activate_subscription(text, numeric) to service_role;

-- ============================================================
-- HAK AKSES KOLOM
-- Supabase defaultnya ngasih izin tulis ke SEMUA kolom. Di sini
-- dicabut, lalu dikasih cuma ke kolom yang memang boleh diubah user
-- sendiri. Ini yang nutup celah "user bisa jadiin dirinya Pro/admin
-- lewat console browser" di Pajangin lama.
-- ============================================================
revoke insert, update, delete on all tables in schema public from anon, authenticated;

-- profiles: user cuma boleh ubah alamat toko & gaya tampilan
grant update (store_slug, store_style) on public.profiles to authenticated;

-- pages: user boleh bikin/ubah isi halaman, TAPI bukan status,
-- click_count, atau pemiliknya
grant insert (user_id, slug, product_name, tagline, original_price, promo_price,
              highlights, image_url, whatsapp_number)
  on public.pages to authenticated;
grant update (product_name, tagline, original_price, promo_price, highlights,
              image_url, whatsapp_number, updated_at)
  on public.pages to authenticated;
grant delete on public.pages to authenticated;

-- takedowns: admin cuma nandain notifikasi sudah dibaca
grant update (notified_user) on public.takedowns to authenticated;

-- ============================================================
-- ROW LEVEL SECURITY (siapa boleh lihat/ubah BARIS yang mana)
-- ============================================================
alter table public.profiles enable row level security;
alter table public.pages enable row level security;
alter table public.subscriptions enable row level security;
alter table public.takedowns enable row level security;
alter table public.slug_blocklist enable row level security;
alter table public.page_click_log enable row level security;

-- profiles
create policy "User lihat profil sendiri"
  on public.profiles for select using (auth.uid() = id);
create policy "User update profil sendiri"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Admin bisa lihat semua profil"
  on public.profiles for select using (public.is_admin());

-- pages
create policy "Publik bisa lihat halaman aktif"
  on public.pages for select using (status = 'active');
create policy "Pemilik bisa lihat halaman sendiri (semua status)"
  on public.pages for select using (auth.uid() = user_id);
create policy "Pemilik bisa buat halaman"
  on public.pages for insert with check (auth.uid() = user_id);
create policy "Pemilik bisa update halaman sendiri"
  on public.pages for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Pemilik bisa hapus halaman sendiri"
  on public.pages for delete using (auth.uid() = user_id);
create policy "Admin bisa lihat semua halaman"
  on public.pages for select using (public.is_admin());

-- subscriptions: user cuma bisa BACA punya sendiri. Tulis cuma lewat
-- server (service_role).
create policy "User lihat riwayat langganan sendiri"
  on public.subscriptions for select using (auth.uid() = user_id);

-- takedowns
create policy "Pemilik bisa lihat takedown halaman miliknya"
  on public.takedowns for select using (
    exists (select 1 from public.pages
            where pages.id = takedowns.page_id and pages.user_id = auth.uid())
  );
create policy "Admin bisa lihat semua takedown"
  on public.takedowns for select using (public.is_admin());
create policy "Admin bisa update takedown"
  on public.takedowns for update using (public.is_admin());

-- slug_blocklist
create policy "Semua orang bisa baca blocklist"
  on public.slug_blocklist for select using (true);

-- page_click_log: sengaja tanpa policy (cuma lewat increment_page_click)

-- ============================================================
-- TABEL: tool_data (data 5 tools yang "disimpan ke akun")
-- Satu baris = satu kunci penyimpanan tool (misal notain-draft-v1)
-- milik satu user. Isinya JSON yang sama persis dengan yang disimpan
-- tool di browser (localStorage).
-- ============================================================
create table public.tool_data (
  user_id uuid not null references public.profiles(id) on delete cascade,
  key text not null
    check (key ~ '^(notain|pajakin|kontrakin|jalanin|sehatin)-[a-z0-9-]{1,40}$'),
  value jsonb not null
    check (octet_length(value::text) <= 200000),
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

-- Waktu ubah selalu diisi server (bukan jam HP user)
create function public.tool_data_touch()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger tool_data_touch
  before insert or update on public.tool_data
  for each row execute function public.tool_data_touch();

-- Apakah user yang sedang login punya trial/Pro aktif (dipakai policy).
-- Tanpa parameter, jadi gak bisa dipakai ngecek akun orang lain.
create function public.current_user_has_pro()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.has_pro_access(auth.uid());
$$;

revoke execute on function public.tool_data_touch() from public, anon, authenticated;
revoke execute on function public.current_user_has_pro() from public, anon;
grant execute on function public.current_user_has_pro() to authenticated;

alter table public.tool_data enable row level security;
revoke all on public.tool_data from anon;
revoke all on public.tool_data from authenticated;
grant select, insert, delete on public.tool_data to authenticated;
-- user_id & key ikut di-grant karena "upsert" dari browser (PostgREST)
-- menulis ulang semua kolom yang dikirim. Aman: policy di bawah tetap
-- memaksa user_id = akun sendiri, dan check di tabel tetap membatasi key.
-- updated_at tidak bisa diubah user (selalu diisi server).
grant update (user_id, key, value) on public.tool_data to authenticated;

-- Baca & hapus data sendiri: selalu boleh (juga setelah Pro habis)
create policy "User baca data tools sendiri"
  on public.tool_data for select using (auth.uid() = user_id);
create policy "User hapus data tools sendiri"
  on public.tool_data for delete using (auth.uid() = user_id);
-- Simpan / ubah: cuma kalau trial/Pro aktif
create policy "User simpan data tools (Pro/trial)"
  on public.tool_data for insert
  with check (auth.uid() = user_id and public.current_user_has_pro());
create policy "User ubah data tools (Pro/trial)"
  on public.tool_data for update
  using (auth.uid() = user_id and public.current_user_has_pro())
  with check (auth.uid() = user_id and public.current_user_has_pro());

-- ============================================================
-- SETELAH RUN: jadikan akun kamu admin (ganti emailnya)
--
--   update public.profiles set is_admin = true
--   where email = 'email-akun-andi@gmail.com';
--
-- (akun harus sudah pernah daftar/login dulu biar barisnya ada)
-- ============================================================
