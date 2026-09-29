-- ============================================================
-- Migration 014: Social Space tahap 2
--
-- 1. Tawaran TukarSkill lama tampil di Social Space sebelum pemiliknya
--    pindah (ss_legacy_posts). Ajakan tukar ke tawaran lama disimpan
--    (ss_legacy_interest) dan otomatis jadi permintaan sungguhan saat
--    pemiliknya mengklaim profil. Email pemilik tidak pernah bisa
--    dibaca dari browser.
-- 2. Etalase: halaman Pajangin bisa berjenis produk, jasa, atau lainnya,
--    dan pemiliknya bisa memilih tampil di Social Space.
-- 3. Info Beasiswa, Magang & Lowongan (ss_info). Hanya admin dan akun
--    yang diberi izin admin yang bisa memasang info. Info yang lewat
--    tenggat otomatis tersembunyi.
--
-- Butuh migration 013. Boleh dijalankan ulang: tabel baru di sini
-- dibuat ulang (isinya hilang), kolom baru di tabel lama tidak diubah.
-- Jalankan di Supabase: SQL Editor > New query > tempel > Run.
-- ============================================================

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
