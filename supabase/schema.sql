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
drop table if exists public.tool_views cascade;
drop table if exists public.ai_usage cascade;
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
drop function if exists public.admin_stats() cascade;
drop function if exists public.ai_take_quota(uuid, integer) cascade;
drop function if exists public.ai_refund_quota(uuid) cascade;
drop function if exists public.track_tool_view(text) cascade;
drop function if exists public.activate_subscription(text, numeric) cascade;
drop function if exists public.start_trial(uuid, integer) cascade;
drop function if exists public.tool_data_touch() cascade;
drop function if exists public.tool_data_limit() cascade;
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
    check (store_style in ('klasik', 'hangat', 'minimalis', 'elegan', 'bold', 'ceria', 'neon', 'segar')),
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

  -- Catatan klik cuma perlu untuk cek 60 detik terakhir: yang lebih dari
  -- 1 hari dibuang, supaya data pengunjung tidak menumpuk selamanya.
  delete from public.page_click_log
  where page_id = target_page_id
    and clicked_at < now() - interval '1 day';

  update public.pages
  set click_count = click_count + 1
  where id = target_page_id;
end;
$$;

-- ============================================================
-- DASHBOARD ADMIN (tab Dashboard di admin.html, lewat /api/admin/stats)
-- ============================================================
-- Ringkasan angka bisnis untuk tab Dashboard di admin panel.
-- Hanya admin (profiles.is_admin) yang bisa memanggil; selain itu ditolak.
-- Isinya cuma angka hitungan, tanpa email atau data pribadi user.
-- Status akses mengikuti aturan has_pro_access:
--   pro   = pro_expires_at masih di masa depan (sudah bayar)
--   trial = trial_ends_at masih di masa depan, tapi belum Pro
--   free  = keduanya sudah lewat / kosong
-- Tanggal harian & bulanan dihitung dalam waktu WIB (Asia/Jakarta).
create function public.admin_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  sekarang timestamptz := now();
  zona constant text := 'Asia/Jakarta';
  hari_ini date := (now() at time zone 'Asia/Jakarta')::date;
  hasil jsonb;
begin
  if not public.is_admin() then
    raise exception 'Hanya admin.' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'generated_at', sekarang,
    'users', (
      select jsonb_build_object(
        'total', count(*),
        'new_today', count(*) filter (where (created_at at time zone zona)::date = hari_ini),
        'new_7d', count(*) filter (where created_at > sekarang - interval '7 days'),
        'new_30d', count(*) filter (where created_at > sekarang - interval '30 days'),
        'pro', count(*) filter (where pro_expires_at > sekarang),
        'trial', count(*) filter (where trial_ends_at > sekarang and not coalesce(pro_expires_at > sekarang, false)),
        'free', count(*) filter (where not coalesce(pro_expires_at > sekarang, false) and not coalesce(trial_ends_at > sekarang, false)),
        'trial_ending_7d', count(*) filter (where trial_ends_at > sekarang and trial_ends_at <= sekarang + interval '7 days' and not coalesce(pro_expires_at > sekarang, false)),
        'pro_ending_7d', count(*) filter (where pro_expires_at > sekarang and pro_expires_at <= sekarang + interval '7 days'),
        'ever_paid', (select count(distinct s.user_id) from public.subscriptions s where s.status = 'paid')
      )
      from public.profiles
    ),
    'signups_daily', (
      select coalesce(jsonb_agg(jsonb_build_object('day', h.hari, 'n', coalesce(c.n, 0)) order by h.hari), '[]'::jsonb)
      from (select (hari_ini - i) as hari from generate_series(0, 29) as i) h
      left join (
        select (created_at at time zone zona)::date as hari, count(*) as n
        from public.profiles
        where created_at > sekarang - interval '31 days'
        group by 1
      ) c on c.hari = h.hari
    ),
    'revenue', (
      select jsonb_build_object(
        'total', coalesce(sum(amount), 0),
        'this_month', coalesce(sum(amount) filter (where date_trunc('month', paid_at at time zone zona) = date_trunc('month', sekarang at time zone zona)), 0),
        'last_30d', coalesce(sum(amount) filter (where paid_at > sekarang - interval '30 days'), 0),
        'paid_count', count(*),
        'paid_30d', count(*) filter (where paid_at > sekarang - interval '30 days')
      )
      from public.subscriptions
      where status = 'paid'
    ),
    'revenue_monthly', (
      select coalesce(jsonb_agg(jsonb_build_object('month', to_char(b.bulan, 'YYYY-MM'), 'amount', coalesce(r.jumlah, 0), 'count', coalesce(r.n, 0)) order by b.bulan), '[]'::jsonb)
      from (
        select (date_trunc('month', sekarang at time zone zona) - make_interval(months => i))::date as bulan
        from generate_series(0, 5) as i
      ) b
      left join (
        select date_trunc('month', paid_at at time zone zona)::date as bulan, sum(amount) as jumlah, count(*) as n
        from public.subscriptions
        where status = 'paid'
        group by 1
      ) r on r.bulan = b.bulan
    ),
    'pending_invoices', (
      select count(*) from public.subscriptions where status = 'pending' and created_at > sekarang - interval '2 days'
    ),
    'tools', (
      select coalesce(jsonb_agg(jsonb_build_object('tool', t.tool, 'users', t.users, 'active_30d', t.aktif) order by t.users desc, t.tool), '[]'::jsonb)
      from (
        select split_part(key, '-', 1) as tool,
               count(distinct user_id) as users,
               count(distinct user_id) filter (where updated_at > sekarang - interval '30 days') as aktif
        from public.tool_data
        group by 1
      ) t
    ),
    'tool_views', (
      select jsonb_build_object(
        'total_30d', coalesce((select sum(count) from public.tool_views where day > hari_ini - 30), 0),
        'daily', (
          select coalesce(jsonb_agg(jsonb_build_object('day', h.hari, 'n', coalesce(v.n, 0)) order by h.hari), '[]'::jsonb)
          from (select (hari_ini - i) as hari from generate_series(0, 29) as i) h
          left join (
            select day, sum(count) as n from public.tool_views where day > hari_ini - 30 group by day
          ) v on v.day = h.hari
        ),
        'tools', (
          select coalesce(jsonb_agg(jsonb_build_object('tool', x.tool, 'today', x.today, 'd7', x.d7, 'd30', x.d30) order by x.d30 desc, x.tool), '[]'::jsonb)
          from (
            select tool,
                   coalesce(sum(count) filter (where day = hari_ini), 0) as today,
                   coalesce(sum(count) filter (where day > hari_ini - 7), 0) as d7,
                   sum(count) as d30
            from public.tool_views
            where day > hari_ini - 30
            group by tool
          ) x
        )
      )
    ),
    'pajangin', (
      select jsonb_build_object(
        'pages', count(*),
        'active', count(*) filter (where status = 'active'),
        'taken_down', count(*) filter (where status = 'taken_down'),
        'sellers', count(distinct user_id),
        'clicks', coalesce(sum(click_count), 0),
        'new_30d', count(*) filter (where created_at > sekarang - interval '30 days')
      )
      from public.pages
    )
  ) into hasil;

  return hasil;
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
-- Dashboard admin: fungsinya sendiri menolak yang bukan admin
grant execute on function public.admin_stats() to authenticated;
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
-- TABEL: tool_data (data tools yang "disimpan ke akun")
-- Satu baris = satu kunci penyimpanan tool (misal notain-draft-v1)
-- milik satu user. Isinya JSON yang sama persis dengan yang disimpan
-- tool di browser (localStorage).
-- Kunci cukup berformat "<idtool>-<nama>", jadi tool baru bisa langsung
-- menyimpan tanpa ubah database. Supaya tabel ini tidak jadi gudang
-- bebas, tiap akun dibatasi (lihat tool_data_limit di bawah).
-- ============================================================
create table public.tool_data (
  user_id uuid not null references public.profiles(id) on delete cascade,
  key text not null
    check (key ~ '^[a-z][a-z0-9]{2,23}-[a-z0-9-]{1,40}$'),
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

-- Batas per akun: maksimal 100 kunci dan total 5 MB data tools.
-- Dikunci per akun (advisory lock) supaya dua simpanan bersamaan tidak
-- bisa sama-sama lolos melewati batas.
create function public.tool_data_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  jumlah integer;
  ukuran bigint;
begin
  perform pg_advisory_xact_lock(hashtextextended('tool_data:' || new.user_id::text, 0));
  select count(*), coalesce(sum(octet_length(value::text)), 0)
    into jumlah, ukuran
    from public.tool_data
    where user_id = new.user_id
      and not (tg_op = 'UPDATE' and user_id = old.user_id and key = old.key)
      and key <> new.key;
  if jumlah >= 100 then
    raise exception 'Batas data tools tercapai (maksimal 100 simpanan per akun)'
      using errcode = 'check_violation';
  end if;
  if ukuran + octet_length(new.value::text) > 5000000 then
    raise exception 'Batas ukuran data tools tercapai (maksimal 5 MB per akun)'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger tool_data_limit
  before insert or update on public.tool_data
  for each row execute function public.tool_data_limit();

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
revoke execute on function public.tool_data_limit() from public, anon, authenticated;
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
-- ASISTEN AI (tombol chat di founderku.com, lewat /api/ai/chat)
-- ============================================================
-- Jatah Asisten AI Founderku (Gemini) per akun per hari (tanggal WIB).
-- Yang disimpan cuma JUMLAH pemakaian, bukan isi percakapan.
create table public.ai_usage (
  user_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  count integer not null default 0 check (count >= 0),
  primary key (user_id, day)
);

alter table public.ai_usage enable row level security;

-- User cuma bisa melihat pemakaian miliknya sendiri (untuk tampilan
-- "sisa jatah"). Menambah/mengurangi hanya lewat fungsi server di bawah.
create policy "User lihat jatah AI sendiri"
  on public.ai_usage for select using (auth.uid() = user_id);

-- Ambil 1 jatah hari ini. Kembalikan sisa jatah setelah diambil, atau -1
-- kalau jatah hari ini sudah habis. Satu perintah (atomik), jadi banyak
-- permintaan bersamaan tidak bisa melewati batas.
create function public.ai_take_quota(uid uuid, batas integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  hari date := (now() at time zone 'Asia/Jakarta')::date;
  jumlah integer;
begin
  if batas is null or batas < 1 then
    return -1;
  end if;
  insert into public.ai_usage (user_id, day, count)
    values (uid, hari, 1)
    on conflict (user_id, day)
    do update set count = public.ai_usage.count + 1
    where public.ai_usage.count < batas
    returning count into jumlah;
  if jumlah is null then
    return -1;
  end if;
  return batas - jumlah;
end;
$$;

-- Kembalikan 1 jatah kalau AI gagal menjawab (misal layanan Gemini penuh),
-- supaya user tidak rugi jatah.
create function public.ai_refund_quota(uid uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.ai_usage
    set count = count - 1
    where user_id = uid
      and day = (now() at time zone 'Asia/Jakarta')::date
      and count > 0;
$$;

-- Hanya server (service_role) yang boleh mengambil/mengembalikan jatah.
revoke all on public.ai_usage from anon, authenticated;
grant select on public.ai_usage to authenticated;
revoke execute on function public.ai_take_quota(uuid, integer) from public, anon, authenticated;
revoke execute on function public.ai_refund_quota(uuid) from public, anon, authenticated;
grant execute on function public.ai_take_quota(uuid, integer) to service_role;
grant execute on function public.ai_refund_quota(uuid) to service_role;

-- ============================================================
-- SETELAH RUN: jadikan akun kamu admin (ganti emailnya)
--
--   update public.profiles set is_admin = true
--   where email = 'email-akun-andi@gmail.com';
--
-- (akun harus sudah pernah daftar/login dulu biar barisnya ada)
-- ============================================================

-- ============================================================
-- PENGHITUNG KUNJUNGAN TOOLS (lewat /api/track, untuk Dashboard admin)
-- ============================================================
-- Berapa kali tiap tool dibuka per hari (tanggal WIB), dari SEMUA
-- pengunjung (termasuk yang tidak login). Yang disimpan cuma angka per
-- tool per hari: tanpa akun, IP, cookie, atau data pribadi apa pun.
create table public.tool_views (
  tool text not null check (tool ~ '^[a-z][a-z0-9]{2,23}$'),
  day date not null,
  count integer not null default 0 check (count >= 0),
  primary key (tool, day)
);

-- RLS aktif tanpa aturan: tidak bisa dibaca atau diubah dari browser sama
-- sekali. Angkanya dibaca admin lewat admin_stats().
alter table public.tool_views enable row level security;

-- Tambah 1 kunjungan hari ini. Dibatasi 1 juta per tool per hari supaya
-- tidak bisa dibanjiri tanpa batas.
create function public.track_tool_view(p_tool text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_tool is null or p_tool !~ '^[a-z][a-z0-9]{2,23}$' then
    return;
  end if;
  insert into public.tool_views (tool, day, count)
    values (p_tool, (now() at time zone 'Asia/Jakarta')::date, 1)
    on conflict (tool, day)
    do update set count = public.tool_views.count + 1
    where public.tool_views.count < 1000000;
end;
$$;

-- Hanya server (service_role) yang boleh menambah hitungan.
revoke all on public.tool_views from anon, authenticated;
revoke execute on function public.track_tool_view(text) from public, anon, authenticated;
grant execute on function public.track_tool_view(text) to service_role;

-- ============================================================
-- SOCIAL SPACE (tukar skill antar founder, pengganti TukarSkill lama)
-- ============================================================
-- Profil skill, tawaran, permintaan tukar, chat pasangan, ulasan,
-- laporan, dan arsip profil TukarSkill lama (ss_legacy) yang bisa
-- diklaim pemiliknya sendiri. Sama persis dengan migration 013.

drop table if exists public.ss_reports cascade;
drop table if exists public.ss_reviews cascade;
drop table if exists public.ss_messages cascade;
drop table if exists public.ss_requests cascade;
drop table if exists public.ss_posts cascade;
drop table if exists public.ss_profiles cascade;
drop table if exists public.ss_legacy cascade;
drop function if exists public.ss_skills_ok(text[]) cascade;
drop function if exists public.ss_clean_skills(text[]) cascade;
drop function if exists public.ss_link_ok(text) cascade;
drop function if exists public.ss_is_partner(uuid) cascade;
drop function if exists public.ss_requested_post(uuid) cascade;
drop function if exists public.ss_touch() cascade;
drop function if exists public.ss_posts_limit() cascade;
drop function if exists public.ss_messages_guard() cascade;
drop function if exists public.ss_reports_limit() cascade;
drop function if exists public.ss_request_create(uuid, text) cascade;
drop function if exists public.ss_request_act(uuid, text) cascade;
drop function if exists public.ss_mark_read(uuid) cascade;
drop function if exists public.ss_legacy_preview() cascade;
drop function if exists public.ss_claim_legacy(text) cascade;
drop function if exists public.ss_admin_overview() cascade;
drop function if exists public.ss_admin_moderate(uuid, text) cascade;

-- ---------- Pembantu ----------

-- Daftar skill yang sah: maksimal 10, tiap skill 2 sampai 40 huruf.
create function public.ss_skills_ok(s text[])
returns boolean
language sql
immutable
set search_path = public
as $$
  select s is not null
     and cardinality(s) <= 10
     and not exists (
       select 1 from unnest(s) x
       where x is null or char_length(btrim(x)) < 2 or char_length(x) > 40
     );
$$;

-- Rapikan daftar skill dari data lama: buang kosong, potong 40 huruf,
-- tanpa duplikat, maksimal 10.
create function public.ss_clean_skills(s text[])
returns text[]
language sql
immutable
set search_path = public
as $$
  select coalesce(array_agg(v order by pos), '{}')
  from (
    select v, pos
    from (
      select distinct on (lower(v)) v, pos
      from (
        select left(btrim(x), 40) as v, ord as pos
        from unnest(coalesce(s, '{}')) with ordinality as t(x, ord)
      ) a
      where char_length(v) >= 2
      order by lower(v), pos
    ) d
    order by pos
    limit 10
  ) b;
$$;

-- Link profil: kosong, atau alamat https:// biasa (mencegah javascript: dll).
create function public.ss_link_ok(u text)
returns boolean
language sql
immutable
set search_path = public
as $$
  select u is not null and (u = '' or (char_length(u) <= 200 and u ~ '^https://[^\s"<>]+$'));
$$;

create function public.ss_touch()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------- 1. Profil Social Space ----------
create table public.ss_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  handle text not null unique check (handle ~ '^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$'),
  name text not null check (char_length(btrim(name)) between 2 and 60),
  headline text not null default '' check (char_length(headline) <= 120),
  bio text not null default '' check (char_length(bio) <= 1000),
  city text not null default '' check (char_length(city) <= 60),
  skills_offer text[] not null default '{}' check (public.ss_skills_ok(skills_offer)),
  skills_want text[] not null default '{}' check (public.ss_skills_ok(skills_want)),
  website text not null default '' check (public.ss_link_ok(website)),
  instagram text not null default '' check (public.ss_link_ok(instagram)),
  linkedin text not null default '' check (public.ss_link_ok(linkedin)),
  is_public boolean not null default true,
  -- Diisi sistem saja (tidak bisa diubah dari browser)
  from_tukarskill boolean not null default false,
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger ss_profiles_touch before update on public.ss_profiles
  for each row execute function public.ss_touch();

-- ---------- 2. Tawaran tukar skill ----------
create table public.ss_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.ss_profiles(user_id) on delete cascade,
  offer text[] not null check (cardinality(offer) between 1 and 5 and public.ss_skills_ok(offer)),
  want text[] not null check (cardinality(want) between 1 and 5 and public.ss_skills_ok(want)),
  format text not null default 'online' check (format in ('online', 'offline', 'hybrid')),
  duration text not null default '' check (char_length(duration) <= 40),
  description text not null check (char_length(btrim(description)) between 10 and 1000),
  status text not null default 'open' check (status in ('open', 'closed')),
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ss_posts_feed on public.ss_posts (status, created_at desc);
create index ss_posts_user on public.ss_posts (user_id);
create trigger ss_posts_touch before update on public.ss_posts
  for each row execute function public.ss_touch();

-- Maksimal 10 tawaran terbuka per akun (mencegah spam)
create function public.ss_posts_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'open' and (tg_op = 'INSERT' or old.status <> 'open') then
    if (select count(*) from public.ss_posts where user_id = new.user_id and status = 'open') >= 10 then
      raise exception 'Maksimal 10 tawaran terbuka. Tutup salah satu dulu.';
    end if;
  end if;
  return new;
end;
$$;
create trigger ss_posts_limit before insert or update of status on public.ss_posts
  for each row execute function public.ss_posts_limit();

-- ---------- 3. Permintaan tukar ----------
create table public.ss_requests (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.ss_posts(id) on delete cascade,
  requester_id uuid not null references public.ss_profiles(user_id) on delete cascade,
  owner_id uuid not null references public.ss_profiles(user_id) on delete cascade,
  message text not null check (char_length(btrim(message)) between 1 and 500),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'cancelled', 'completed')),
  requester_read_at timestamptz,
  owner_read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_id <> owner_id)
);
-- Satu orang hanya boleh punya 1 permintaan aktif per tawaran
create unique index ss_requests_aktif on public.ss_requests (post_id, requester_id)
  where status in ('pending', 'accepted');
create index ss_requests_requester on public.ss_requests (requester_id, updated_at desc);
create index ss_requests_owner on public.ss_requests (owner_id, updated_at desc);

-- ---------- 4. Chat antar pasangan ----------
create table public.ss_messages (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.ss_requests(id) on delete cascade,
  sender_id uuid not null references public.ss_profiles(user_id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index ss_messages_request on public.ss_messages (request_id, id);

-- Batas kecepatan kirim pesan, dan tandai percakapan diperbarui
create function public.ss_messages_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.ss_messages
      where sender_id = new.sender_id and created_at > now() - interval '1 minute') >= 20 then
    raise exception 'Terlalu banyak pesan. Tunggu sebentar.';
  end if;
  update public.ss_requests
     set updated_at = now(),
         requester_read_at = case when requester_id = new.sender_id then now() else requester_read_at end,
         owner_read_at = case when owner_id = new.sender_id then now() else owner_read_at end
   where id = new.request_id;
  return new;
end;
$$;
create trigger ss_messages_guard before insert on public.ss_messages
  for each row execute function public.ss_messages_guard();

-- ---------- 5. Ulasan ----------
create table public.ss_reviews (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.ss_requests(id) on delete cascade,
  reviewer_id uuid not null references public.ss_profiles(user_id) on delete cascade,
  reviewee_id uuid not null references public.ss_profiles(user_id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text not null default '' check (char_length(comment) <= 500),
  created_at timestamptz not null default now(),
  unique (request_id, reviewer_id),
  check (reviewer_id <> reviewee_id)
);
create index ss_reviews_reviewee on public.ss_reviews (reviewee_id, created_at desc);

-- ---------- 6. Laporan ----------
create table public.ss_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('profile', 'post', 'message')),
  target_id text not null check (char_length(target_id) between 1 and 64),
  reason text not null check (reason in ('spam', 'penipuan', 'kasar', 'tidak_pantas', 'lainnya')),
  details text not null default '' check (char_length(details) <= 500),
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);
create index ss_reports_open on public.ss_reports (status, created_at desc);

-- Maksimal 10 laporan per hari per akun
create function public.ss_reports_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.ss_reports
      where reporter_id = new.reporter_id and created_at > now() - interval '1 day') >= 10 then
    raise exception 'Batas laporan hari ini sudah tercapai.';
  end if;
  return new;
end;
$$;
create trigger ss_reports_limit before insert on public.ss_reports
  for each row execute function public.ss_reports_limit();

-- ---------- 7. Arsip TukarSkill lama ----------
-- Diisi admin lewat SQL Editor dari arsip database TukarSkill. Tidak bisa
-- dibaca dari browser. Pemilik profil bisa mengklaim profilnya sendiri
-- (lewat ss_legacy_preview dan ss_claim_legacy) setelah login ke
-- Founderku dengan email yang sama. Kata sandi lama TIDAK disimpan.
create table public.ss_legacy (
  email text primary key check (email = lower(btrim(email)) and char_length(email) <= 200),
  full_name text not null default '',
  headline text not null default '',
  bio text not null default '',
  city text not null default '',
  skills_offer text[] not null default '{}',
  skills_want text[] not null default '{}',
  website text not null default '',
  instagram text not null default '',
  linkedin text not null default '',
  joined_at timestamptz,
  claimed_by uuid references public.profiles(id) on delete set null,
  claimed_at timestamptz
);

-- Dipakai aturan akses di bawah. Dijalankan sebagai pemilik tabel supaya
-- pengunjung tanpa login (yang tidak boleh membaca ss_requests) tetap
-- bisa melihat profil dan tawaran publik.
-- Apakah akun ini pernah berpasangan tukar dengan akun yang login?
create function public.ss_is_partner(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null and exists (
    select 1 from ss_requests r
    where (r.requester_id = auth.uid() and r.owner_id = p_user)
       or (r.owner_id = auth.uid() and r.requester_id = p_user));
$$;

-- Apakah akun yang login pernah mengajak tukar tawaran ini?
create function public.ss_requested_post(p_post uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null and exists (
    select 1 from ss_requests r where r.post_id = p_post and r.requester_id = auth.uid());
$$;

-- ============================================================
-- ATURAN AKSES (RLS)
-- ============================================================
alter table public.ss_profiles enable row level security;
alter table public.ss_posts enable row level security;
alter table public.ss_requests enable row level security;
alter table public.ss_messages enable row level security;
alter table public.ss_reviews enable row level security;
alter table public.ss_reports enable row level security;
alter table public.ss_legacy enable row level security;

-- Profil: publik boleh lihat yang terbuka; pasangan tukar tetap bisa
-- saling lihat walau profilnya tidak publik; pemilik kelola miliknya
create policy "SS profil publik terlihat"
  on public.ss_profiles for select
  using (
    (is_public and not hidden) or user_id = auth.uid() or public.is_admin()
    or public.ss_is_partner(user_id)
  );
create policy "SS buat profil sendiri"
  on public.ss_profiles for insert with check (user_id = auth.uid());
create policy "SS ubah profil sendiri"
  on public.ss_profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "SS hapus profil sendiri"
  on public.ss_profiles for delete using (user_id = auth.uid());

-- Tawaran: publik lihat yang terbuka dari profil publik; peminta tetap
-- bisa lihat tawaran yang pernah dia ajak tukar; pemilik kelola
create policy "SS tawaran terbuka terlihat"
  on public.ss_posts for select
  using (
    (status = 'open' and not hidden and exists (
      select 1 from public.ss_profiles p
      where p.user_id = ss_posts.user_id and p.is_public and not p.hidden))
    or user_id = auth.uid() or public.is_admin()
    or public.ss_requested_post(id)
  );
create policy "SS buat tawaran sendiri"
  on public.ss_posts for insert with check (user_id = auth.uid());
create policy "SS ubah tawaran sendiri"
  on public.ss_posts for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "SS hapus tawaran sendiri"
  on public.ss_posts for delete using (user_id = auth.uid());

-- Permintaan: hanya dua pihak (dan admin) yang bisa lihat. Tulis lewat fungsi.
create policy "SS permintaan milik dua pihak"
  on public.ss_requests for select
  using (auth.uid() in (requester_id, owner_id) or public.is_admin());

-- Chat: hanya dua pihak; kirim hanya kalau permintaan sudah diterima
create policy "SS chat milik dua pihak"
  on public.ss_messages for select
  using (exists (
    select 1 from public.ss_requests r
    where r.id = ss_messages.request_id and auth.uid() in (r.requester_id, r.owner_id)
  ));
create policy "SS kirim chat ke pasangan"
  on public.ss_messages for insert
  with check (
    sender_id = auth.uid() and exists (
      select 1 from public.ss_requests r
      where r.id = ss_messages.request_id
        and r.status in ('accepted', 'completed')
        and auth.uid() in (r.requester_id, r.owner_id)
    )
  );

-- Ulasan: terlihat kalau profil yang diulas publik; tulis setelah selesai
create policy "SS ulasan terlihat"
  on public.ss_reviews for select
  using (exists (
    select 1 from public.ss_profiles p
    where p.user_id = ss_reviews.reviewee_id
      and ((p.is_public and not p.hidden) or p.user_id = auth.uid())
  ) or reviewer_id = auth.uid() or public.is_admin());
create policy "SS beri ulasan setelah selesai"
  on public.ss_reviews for insert
  with check (
    reviewer_id = auth.uid() and exists (
      select 1 from public.ss_requests r
      where r.id = ss_reviews.request_id
        and r.status = 'completed'
        and ((r.requester_id = auth.uid() and r.owner_id = ss_reviews.reviewee_id)
          or (r.owner_id = auth.uid() and r.requester_id = ss_reviews.reviewee_id))
    )
  );

-- Laporan: siapa pun yang login boleh melapor; hanya admin yang membaca
create policy "SS kirim laporan"
  on public.ss_reports for insert with check (reporter_id = auth.uid());
create policy "SS admin baca laporan"
  on public.ss_reports for select using (public.is_admin());

-- ss_legacy: sengaja tanpa aturan (tidak bisa dibaca/diubah dari browser)

-- ---------- Hak kolom ----------
revoke all on public.ss_profiles, public.ss_posts, public.ss_requests, public.ss_messages,
  public.ss_reviews, public.ss_reports, public.ss_legacy from anon, authenticated;

grant select on public.ss_profiles, public.ss_posts, public.ss_reviews to anon, authenticated;
grant select on public.ss_requests, public.ss_messages, public.ss_reports to authenticated;

grant insert (user_id, handle, name, headline, bio, city, skills_offer, skills_want,
              website, instagram, linkedin, is_public)
  on public.ss_profiles to authenticated;
grant update (handle, name, headline, bio, city, skills_offer, skills_want,
              website, instagram, linkedin, is_public)
  on public.ss_profiles to authenticated;
grant delete on public.ss_profiles to authenticated;

grant insert (user_id, offer, want, format, duration, description) on public.ss_posts to authenticated;
grant update (offer, want, format, duration, description, status) on public.ss_posts to authenticated;
grant delete on public.ss_posts to authenticated;

grant insert (request_id, sender_id, body) on public.ss_messages to authenticated;
grant insert (request_id, reviewer_id, reviewee_id, rating, comment) on public.ss_reviews to authenticated;
grant insert (reporter_id, target_type, target_id, reason, details) on public.ss_reports to authenticated;

-- ============================================================
-- FUNGSI
-- ============================================================

-- Ajukan permintaan tukar ke sebuah tawaran.
create function public.ss_request_create(p_post uuid, p_message text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  saya uuid := auth.uid();
  pemilik uuid;
  hasil uuid;
begin
  if saya is null then
    raise exception 'Harus login dulu.' using errcode = '42501';
  end if;
  if not exists (select 1 from ss_profiles where user_id = saya) then
    raise exception 'Buat profil Social Space dulu.';
  end if;
  select p.user_id into pemilik
    from ss_posts p join ss_profiles pr on pr.user_id = p.user_id
   where p.id = p_post and p.status = 'open' and not p.hidden and pr.is_public and not pr.hidden;
  if pemilik is null then
    raise exception 'Tawaran tidak ditemukan atau sudah ditutup.';
  end if;
  if pemilik = saya then
    raise exception 'Tidak bisa mengajak tukar tawaran sendiri.';
  end if;
  if (select count(*) from ss_requests
      where requester_id = saya and created_at > now() - interval '1 day') >= 20 then
    raise exception 'Batas 20 permintaan per hari sudah tercapai.';
  end if;
  if exists (select 1 from ss_requests
             where post_id = p_post and requester_id = saya and status in ('pending', 'accepted')) then
    raise exception 'Kamu sudah punya permintaan aktif untuk tawaran ini.';
  end if;
  insert into ss_requests (post_id, requester_id, owner_id, message, requester_read_at)
    values (p_post, saya, pemilik, btrim(coalesce(p_message, '')), now())
    returning id into hasil;
  return hasil;
end;
$$;

-- Ubah status permintaan:
--   accept / decline : pemilik tawaran, dari pending
--   cancel           : peminta, dari pending
--   complete         : salah satu pihak, dari accepted
create function public.ss_request_act(p_request uuid, p_action text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  saya uuid := auth.uid();
  r ss_requests%rowtype;
  baru text;
begin
  if saya is null then
    raise exception 'Harus login dulu.' using errcode = '42501';
  end if;
  select * into r from ss_requests where id = p_request for update;
  if not found or saya not in (r.requester_id, r.owner_id) then
    raise exception 'Permintaan tidak ditemukan.';
  end if;

  if p_action in ('accept', 'decline') then
    if saya <> r.owner_id or r.status <> 'pending' then
      raise exception 'Aksi tidak diizinkan.';
    end if;
    baru := case p_action when 'accept' then 'accepted' else 'declined' end;
  elsif p_action = 'cancel' then
    if saya <> r.requester_id or r.status <> 'pending' then
      raise exception 'Aksi tidak diizinkan.';
    end if;
    baru := 'cancelled';
  elsif p_action = 'complete' then
    if r.status <> 'accepted' then
      raise exception 'Aksi tidak diizinkan.';
    end if;
    baru := 'completed';
  else
    raise exception 'Aksi tidak dikenal.';
  end if;

  update ss_requests
     set status = baru, updated_at = now(),
         requester_read_at = case when saya = requester_id then now() else requester_read_at end,
         owner_read_at = case when saya = owner_id then now() else owner_read_at end
   where id = p_request;
  return baru;
end;
$$;

-- Tandai percakapan sudah dibaca oleh akun yang login
create function public.ss_mark_read(p_request uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update ss_requests
     set requester_read_at = case when requester_id = auth.uid() then now() else requester_read_at end,
         owner_read_at = case when owner_id = auth.uid() then now() else owner_read_at end
   where id = p_request and auth.uid() in (requester_id, owner_id);
end;
$$;

-- Cek apakah akun yang login punya profil TukarSkill lama yang belum diklaim
create function public.ss_legacy_preview()
returns table (full_name text, headline text, city text, skills_offer text[], skills_want text[])
language sql
stable
security definer
set search_path = public
as $$
  select l.full_name, l.headline, l.city, l.skills_offer, l.skills_want
    from ss_legacy l
    join profiles pr on lower(pr.email) = l.email
   where pr.id = auth.uid() and l.claimed_by is null;
$$;

-- Pindahkan profil TukarSkill lama milik sendiri ke Social Space.
-- Kalau sudah punya profil Social Space, kolom yang masih kosong diisi
-- dan skill digabung.
create function public.ss_claim_legacy(p_handle text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  saya uuid := auth.uid();
  l ss_legacy%rowtype;
begin
  if saya is null then
    raise exception 'Harus login dulu.' using errcode = '42501';
  end if;
  select lg.* into l
    from ss_legacy lg join profiles pr on lower(pr.email) = lg.email
   where pr.id = saya and lg.claimed_by is null
   for update of lg;
  if not found then
    raise exception 'Tidak ada profil TukarSkill lama untuk akun ini.';
  end if;

  if exists (select 1 from ss_profiles where user_id = saya) then
    update ss_profiles set
      headline = case when headline = '' then left(l.headline, 120) else headline end,
      bio = case when bio = '' then left(l.bio, 1000) else bio end,
      city = case when city = '' then left(l.city, 60) else city end,
      skills_offer = ss_clean_skills(skills_offer || l.skills_offer),
      skills_want = ss_clean_skills(skills_want || l.skills_want),
      website = case when website = '' and ss_link_ok(l.website) then l.website else website end,
      instagram = case when instagram = '' and ss_link_ok(l.instagram) then l.instagram else instagram end,
      linkedin = case when linkedin = '' and ss_link_ok(l.linkedin) then l.linkedin else linkedin end,
      from_tukarskill = true
    where user_id = saya;
  else
    insert into ss_profiles (user_id, handle, name, headline, bio, city, skills_offer, skills_want,
                             website, instagram, linkedin, from_tukarskill)
    values (
      saya, p_handle,
      case when char_length(btrim(l.full_name)) >= 2 then left(btrim(l.full_name), 60) else 'Founder' end,
      left(l.headline, 120), left(l.bio, 1000), left(l.city, 60),
      ss_clean_skills(l.skills_offer), ss_clean_skills(l.skills_want),
      case when ss_link_ok(l.website) then l.website else '' end,
      case when ss_link_ok(l.instagram) then l.instagram else '' end,
      case when ss_link_ok(l.linkedin) then l.linkedin else '' end,
      true
    );
  end if;

  update ss_legacy set claimed_by = saya, claimed_at = now() where email = l.email;
end;
$$;

-- Ringkasan untuk halaman moderasi (admin saja)
create function public.ss_admin_overview()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Khusus admin.' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'profiles', (select count(*) from ss_profiles),
    'posts_open', (select count(*) from ss_posts where status = 'open' and not hidden),
    'requests', (select count(*) from ss_requests),
    'completed', (select count(*) from ss_requests where status = 'completed'),
    'legacy_total', (select count(*) from ss_legacy),
    'legacy_claimed', (select count(*) from ss_legacy where claimed_by is not null),
    'reports_open', (select count(*) from ss_reports where status = 'open')
  );
end;
$$;

-- Tindak lanjut laporan (admin saja):
--   hide    : sembunyikan profil/tawaran yang dilaporkan, laporan selesai
--   dismiss : abaikan laporan
create function public.ss_admin_moderate(p_report uuid, p_action text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  rp ss_reports%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Khusus admin.' using errcode = '42501';
  end if;
  select * into rp from ss_reports where id = p_report for update;
  if not found then
    raise exception 'Laporan tidak ditemukan.';
  end if;
  if p_action = 'hide' then
    if rp.target_type = 'post' then
      update ss_posts set hidden = true where id::text = rp.target_id;
    elsif rp.target_type = 'profile' then
      update ss_profiles set hidden = true where user_id::text = rp.target_id;
    end if;
    update ss_reports set status = 'resolved' where id = p_report;
  elsif p_action = 'dismiss' then
    update ss_reports set status = 'dismissed' where id = p_report;
  else
    raise exception 'Aksi tidak dikenal.';
  end if;
end;
$$;

-- ---------- Hak menjalankan fungsi ----------
revoke execute on function public.ss_touch(), public.ss_posts_limit(), public.ss_messages_guard(),
  public.ss_reports_limit() from public, anon, authenticated;
revoke execute on function public.ss_request_create(uuid, text), public.ss_request_act(uuid, text),
  public.ss_mark_read(uuid), public.ss_legacy_preview(), public.ss_claim_legacy(text),
  public.ss_admin_overview(), public.ss_admin_moderate(uuid, text) from public, anon;
grant execute on function public.ss_request_create(uuid, text), public.ss_request_act(uuid, text),
  public.ss_mark_read(uuid), public.ss_legacy_preview(), public.ss_claim_legacy(text),
  public.ss_admin_overview(), public.ss_admin_moderate(uuid, text) to authenticated;
-- Pembantu validasi dipakai di aturan CHECK (boleh dijalankan siapa saja, tanpa efek)
grant execute on function public.ss_skills_ok(text[]), public.ss_clean_skills(text[]),
  public.ss_link_ok(text), public.ss_is_partner(uuid), public.ss_requested_post(uuid) to anon, authenticated;

-- ============================================================
-- SOCIAL SPACE TAHAP 2 (tawaran TukarSkill lama, Etalase, Info)
-- ============================================================
-- Sama persis dengan migration 014.

drop table if exists public.ss_legacy_interest cascade;
drop table if exists public.ss_legacy_posts cascade;
drop table if exists public.ss_info cascade;
drop function if exists public.ss_legacy_interest_create(uuid, text) cascade;
drop function if exists public.ss_etalase() cascade;
drop function if exists public.ss_can_post_info() cascade;
drop function if exists public.ss_admin_set_info_access(text, boolean) cascade;
drop function if exists public.ss_info_limit() cascade;

-- ---------- 1. Tawaran TukarSkill lama ----------
create table public.ss_legacy_posts (
  id uuid primary key default gen_random_uuid(),
  legacy_email text not null references public.ss_legacy(email) on delete cascade,
  owner_name text not null check (char_length(btrim(owner_name)) between 1 and 100),
  owner_city text not null default '' check (char_length(owner_city) <= 60),
  offer text[] not null check (cardinality(offer) between 1 and 5 and public.ss_skills_ok(offer)),
  want text[] not null check (cardinality(want) between 1 and 5 and public.ss_skills_ok(want)),
  format text not null default 'online' check (format in ('online', 'offline', 'hybrid')),
  duration text not null default '' check (char_length(duration) <= 40),
  description text not null check (char_length(btrim(description)) between 10 and 1000),
  posted_at timestamptz,
  -- Diisi sistem saja
  hidden boolean not null default false,
  migrated_post_id uuid references public.ss_posts(id) on delete set null,
  migrated_at timestamptz
);
create index ss_legacy_posts_email on public.ss_legacy_posts (legacy_email);

create table public.ss_legacy_interest (
  id uuid primary key default gen_random_uuid(),
  legacy_post_id uuid not null references public.ss_legacy_posts(id) on delete cascade,
  requester_id uuid not null references public.ss_profiles(user_id) on delete cascade,
  message text not null check (char_length(btrim(message)) between 1 and 500),
  created_at timestamptz not null default now(),
  unique (legacy_post_id, requester_id)
);

alter table public.ss_legacy_posts enable row level security;
alter table public.ss_legacy_interest enable row level security;

create policy "SS tawaran lama terlihat"
  on public.ss_legacy_posts for select
  using ((not hidden and migrated_at is null) or public.is_admin());
create policy "SS ajakan lama milik pengirim"
  on public.ss_legacy_interest for select
  using (requester_id = auth.uid() or public.is_admin());

revoke all on public.ss_legacy_posts, public.ss_legacy_interest from anon, authenticated;
-- Email pemilik (legacy_email) sengaja tidak ikut
grant select (id, owner_name, owner_city, offer, want, format, duration, description, posted_at)
  on public.ss_legacy_posts to anon, authenticated;
grant select on public.ss_legacy_interest to authenticated;

-- Ajak tukar ke tawaran lama: disimpan sampai pemiliknya pindah
create function public.ss_legacy_interest_create(p_post uuid, p_message text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  saya uuid := auth.uid();
  lp ss_legacy_posts%rowtype;
  hasil uuid;
begin
  if saya is null then
    raise exception 'Harus login dulu.' using errcode = '42501';
  end if;
  if not exists (select 1 from ss_profiles where user_id = saya) then
    raise exception 'Buat profil Social Space dulu.';
  end if;
  select * into lp from ss_legacy_posts where id = p_post and not hidden and migrated_at is null;
  if not found then
    raise exception 'Tawaran tidak ditemukan atau sudah dipindahkan.';
  end if;
  if exists (select 1 from profiles where id = saya and lower(email) = lp.legacy_email) then
    raise exception 'Ini tawaranmu sendiri. Pindahkan profil TukarSkill-mu untuk mengaktifkannya.';
  end if;
  if (select count(*) from ss_requests where requester_id = saya and created_at > now() - interval '1 day')
     + (select count(*) from ss_legacy_interest where requester_id = saya and created_at > now() - interval '1 day') >= 20 then
    raise exception 'Batas 20 permintaan per hari sudah tercapai.';
  end if;
  if exists (select 1 from ss_legacy_interest where legacy_post_id = p_post and requester_id = saya) then
    raise exception 'Kamu sudah mengajak tukar untuk tawaran ini.';
  end if;
  insert into ss_legacy_interest (legacy_post_id, requester_id, message)
    values (p_post, saya, btrim(coalesce(p_message, '')))
    returning id into hasil;
  return hasil;
end;
$$;

-- Klaim profil lama sekarang juga memindahkan tawaran lama beserta
-- ajakan yang menunggu (jadi permintaan di kotak Permintaan pemilik).
create or replace function public.ss_claim_legacy(p_handle text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  saya uuid := auth.uid();
  l ss_legacy%rowtype;
  lp ss_legacy_posts%rowtype;
  pid uuid;
begin
  if saya is null then
    raise exception 'Harus login dulu.' using errcode = '42501';
  end if;
  select lg.* into l
    from ss_legacy lg join profiles pr on lower(pr.email) = lg.email
   where pr.id = saya and lg.claimed_by is null
   for update of lg;
  if not found then
    raise exception 'Tidak ada profil TukarSkill lama untuk akun ini.';
  end if;

  if exists (select 1 from ss_profiles where user_id = saya) then
    update ss_profiles set
      headline = case when headline = '' then left(l.headline, 120) else headline end,
      bio = case when bio = '' then left(l.bio, 1000) else bio end,
      city = case when city = '' then left(l.city, 60) else city end,
      skills_offer = ss_clean_skills(skills_offer || l.skills_offer),
      skills_want = ss_clean_skills(skills_want || l.skills_want),
      website = case when website = '' and ss_link_ok(l.website) then l.website else website end,
      instagram = case when instagram = '' and ss_link_ok(l.instagram) then l.instagram else instagram end,
      linkedin = case when linkedin = '' and ss_link_ok(l.linkedin) then l.linkedin else linkedin end,
      from_tukarskill = true
    where user_id = saya;
  else
    insert into ss_profiles (user_id, handle, name, headline, bio, city, skills_offer, skills_want,
                             website, instagram, linkedin, from_tukarskill)
    values (
      saya, p_handle,
      case when char_length(btrim(l.full_name)) >= 2 then left(btrim(l.full_name), 60) else 'Founder' end,
      left(l.headline, 120), left(l.bio, 1000), left(l.city, 60),
      ss_clean_skills(l.skills_offer), ss_clean_skills(l.skills_want),
      case when ss_link_ok(l.website) then l.website else '' end,
      case when ss_link_ok(l.instagram) then l.instagram else '' end,
      case when ss_link_ok(l.linkedin) then l.linkedin else '' end,
      true
    );
  end if;

  for lp in select * from ss_legacy_posts
             where legacy_email = l.email and migrated_at is null and not hidden
             order by posted_at nulls last
  loop
    insert into ss_posts (user_id, offer, want, format, duration, description, status)
      values (saya, lp.offer, lp.want, lp.format, lp.duration, lp.description,
              case when (select count(*) from ss_posts where user_id = saya and status = 'open') >= 10
                   then 'closed' else 'open' end)
      returning id into pid;
    insert into ss_requests (post_id, requester_id, owner_id, message, requester_read_at, created_at, updated_at)
      select pid, i.requester_id, saya, i.message, i.created_at, i.created_at, now()
        from ss_legacy_interest i
       where i.legacy_post_id = lp.id and i.requester_id <> saya;
    delete from ss_legacy_interest where legacy_post_id = lp.id;
    update ss_legacy_posts set migrated_post_id = pid, migrated_at = now() where id = lp.id;
  end loop;

  update ss_legacy set claimed_by = saya, claimed_at = now() where email = l.email;
end;
$$;

-- ---------- 2. Etalase (Pajangin di Social Space) ----------
alter table public.pages add column if not exists kind text not null default 'produk'
  check (kind in ('produk', 'jasa', 'lainnya'));
alter table public.pages add column if not exists price_unit text not null default ''
  check (char_length(price_unit) <= 20);
alter table public.pages add column if not exists show_in_social boolean not null default false;
-- Diisi admin saja: disembunyikan dari Etalase karena laporan
alter table public.pages add column if not exists social_hidden boolean not null default false;

grant insert (kind, price_unit, show_in_social) on public.pages to authenticated;
grant update (kind, price_unit, show_in_social) on public.pages to authenticated;

-- Daftar Etalase. Lewat fungsi supaya nama penjual (dari profil Social
-- Space publik), status Pro, dan rating bisa digabung tanpa membuka
-- tabel profiles. Aturan akun Free sama dengan halaman publik Pajangin:
-- hanya 2 halaman terlama yang tayang.
create function public.ss_etalase()
returns table (
  id uuid, slug text, product_name text, tagline text, kind text,
  original_price numeric, promo_price numeric, price_unit text, image_url text,
  created_at timestamptz, seller_name text, seller_handle text, seller_city text,
  has_pro boolean, rating numeric, reviews integer
)
language sql
stable
security definer
set search_path = public
as $$
  with live as (
    select p.*, public.has_pro_access(p.user_id) as pro,
           row_number() over (partition by p.user_id order by p.created_at) as urut
      from pages p
     where p.status <> 'taken_down'
  )
  select l.id, l.slug, l.product_name, coalesce(l.tagline, ''), l.kind,
         l.original_price, l.promo_price, l.price_unit, l.image_url, l.created_at,
         case when sp.is_public and not sp.hidden then sp.name else null end,
         case when sp.is_public and not sp.hidden then sp.handle else null end,
         case when sp.is_public and not sp.hidden then sp.city else null end,
         l.pro,
         (select round(avg(r.rating), 1) from ss_reviews r where r.reviewee_id = l.user_id),
         (select count(*)::int from ss_reviews r where r.reviewee_id = l.user_id)
    from live l
    left join ss_profiles sp on sp.user_id = l.user_id
   where l.status = 'active' and l.show_in_social and not l.social_hidden
     and (l.pro or l.urut <= 2)
     and coalesce(sp.hidden, false) = false
   order by l.pro desc, l.created_at desc
   limit 500;
$$;

-- ---------- 3. Info Beasiswa, Magang & Lowongan ----------
alter table public.ss_profiles add column if not exists can_post_info boolean not null default false;

create function public.ss_can_post_info()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null and (
    public.is_admin() or exists (
      select 1 from ss_profiles where user_id = auth.uid() and can_post_info and not hidden));
$$;

create table public.ss_info (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  category text not null check (category in ('beasiswa', 'magang', 'lowongan')),
  title text not null check (char_length(btrim(title)) between 5 and 140),
  organizer text not null default '' check (char_length(organizer) <= 100),
  description text not null check (char_length(btrim(description)) between 10 and 3000),
  link text not null default '' check (public.ss_link_ok(link)),
  location text not null default '' check (char_length(location) <= 80),
  deadline date not null,
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ss_info_deadline on public.ss_info (deadline);
create trigger ss_info_touch before update on public.ss_info
  for each row execute function public.ss_touch();

create function public.ss_info_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.ss_info
      where author_id = new.author_id and created_at > now() - interval '1 day') >= 20 then
    raise exception 'Batas 20 info per hari sudah tercapai.';
  end if;
  return new;
end;
$$;
create trigger ss_info_limit before insert on public.ss_info
  for each row execute function public.ss_info_limit();

alter table public.ss_info enable row level security;
create policy "SS info aktif terlihat"
  on public.ss_info for select
  using ((not hidden and deadline >= (now() at time zone 'Asia/Jakarta')::date)
         or author_id = auth.uid() or public.is_admin());
create policy "SS pasang info"
  on public.ss_info for insert
  with check (author_id = auth.uid() and public.ss_can_post_info());
create policy "SS ubah info sendiri"
  on public.ss_info for update
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());
create policy "SS hapus info"
  on public.ss_info for delete
  using (author_id = auth.uid() or public.is_admin());

revoke all on public.ss_info from anon, authenticated;
grant select on public.ss_info to anon, authenticated;
grant insert (author_id, category, title, organizer, description, link, location, deadline)
  on public.ss_info to authenticated;
grant update (category, title, organizer, description, link, location, deadline)
  on public.ss_info to authenticated;
grant delete on public.ss_info to authenticated;

-- Admin memberi atau mencabut izin pasang info
create function public.ss_admin_set_info_access(p_handle text, p_allow boolean)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Khusus admin.' using errcode = '42501';
  end if;
  update ss_profiles set can_post_info = coalesce(p_allow, false) where handle = lower(btrim(p_handle));
  if not found then
    raise exception 'Profil tidak ditemukan.';
  end if;
  return coalesce(p_allow, false);
end;
$$;

-- ---------- Laporan & moderasi untuk jenis baru ----------
alter table public.ss_reports drop constraint if exists ss_reports_target_type_check;
alter table public.ss_reports add constraint ss_reports_target_type_check
  check (target_type in ('profile', 'post', 'message', 'legacy_post', 'page', 'info'));

create or replace function public.ss_admin_moderate(p_report uuid, p_action text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  rp ss_reports%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Khusus admin.' using errcode = '42501';
  end if;
  select * into rp from ss_reports where id = p_report for update;
  if not found then
    raise exception 'Laporan tidak ditemukan.';
  end if;
  if p_action = 'hide' then
    if rp.target_type = 'post' then
      update ss_posts set hidden = true where id::text = rp.target_id;
    elsif rp.target_type = 'profile' then
      update ss_profiles set hidden = true where user_id::text = rp.target_id;
    elsif rp.target_type = 'legacy_post' then
      update ss_legacy_posts set hidden = true where id::text = rp.target_id;
    elsif rp.target_type = 'page' then
      update pages set social_hidden = true where id::text = rp.target_id;
    elsif rp.target_type = 'info' then
      update ss_info set hidden = true where id::text = rp.target_id;
    end if;
    update ss_reports set status = 'resolved' where id = p_report;
  elsif p_action = 'dismiss' then
    update ss_reports set status = 'dismissed' where id = p_report;
  else
    raise exception 'Aksi tidak dikenal.';
  end if;
end;
$$;

create or replace function public.ss_admin_overview()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Khusus admin.' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'profiles', (select count(*) from ss_profiles),
    'posts_open', (select count(*) from ss_posts where status = 'open' and not hidden),
    'requests', (select count(*) from ss_requests),
    'completed', (select count(*) from ss_requests where status = 'completed'),
    'legacy_total', (select count(*) from ss_legacy),
    'legacy_claimed', (select count(*) from ss_legacy where claimed_by is not null),
    'legacy_posts_waiting', (select count(*) from ss_legacy_posts where migrated_at is null and not hidden),
    'legacy_interest', (select count(*) from ss_legacy_interest),
    'etalase', (select count(*) from pages where show_in_social and not social_hidden and status = 'active'),
    'info_active', (select count(*) from ss_info where not hidden and deadline >= (now() at time zone 'Asia/Jakarta')::date),
    'info_authors', (select coalesce(jsonb_agg(handle order by handle), '[]'::jsonb) from ss_profiles where can_post_info),
    'reports_open', (select count(*) from ss_reports where status = 'open')
  );
end;
$$;

-- ---------- Hak menjalankan fungsi ----------
revoke execute on function public.ss_info_limit() from public, anon, authenticated;
revoke execute on function public.ss_legacy_interest_create(uuid, text), public.ss_admin_set_info_access(text, boolean)
  from public, anon;
grant execute on function public.ss_legacy_interest_create(uuid, text), public.ss_admin_set_info_access(text, boolean)
  to authenticated;
grant execute on function public.ss_etalase(), public.ss_can_post_info() to anon, authenticated;
