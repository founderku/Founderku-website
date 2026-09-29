-- ============================================================
-- Migration 013: Social Space (TukarSkill di dalam Founderku)
--
-- Tempat founder saling tukar skill: profil skill, tawaran barter,
-- permintaan tukar, chat antar pasangan, ulasan, dan laporan. Juga arsip
-- profil TukarSkill lama (ss_legacy) yang bisa diklaim pemiliknya
-- sendiri setelah login dengan email yang sama.
--
-- Prinsip keamanan (belajar dari audit TukarSkill lama):
--   - Semua tabel RLS aktif. Kolom yang boleh diisi dari browser dibatasi.
--   - Status permintaan (terima/tolak/selesai) hanya lewat fungsi yang
--     mengecek siapa yang boleh.
--   - Chat hanya bisa dibaca dan ditulis dua orang yang berpasangan.
--   - Kolom moderasi (hidden) dan arsip TukarSkill tidak bisa diubah
--     dari browser.
--
-- Tidak mengubah tabel lain. Boleh dijalankan ulang, TAPI akan
-- menghapus semua data Social Space yang sudah ada.
-- Jalankan di Supabase: SQL Editor > New query > tempel > Run.
-- ============================================================

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
