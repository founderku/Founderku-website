-- ============================================================
-- Migration 016: profil penjual Social Space
--
-- 1. Profil Social Space dapat 2 isian baru: pengalaman (teks) dan
--    portofolio (maksimal 8 karya berisi judul, tautan, catatan).
-- 2. Etalase hanya menampilkan halaman dari penjual yang punya profil
--    Social Space publik, supaya pembeli selalu tahu siapa penjualnya.
--    Halaman lain tetap aktif di Pajangin, hanya tidak muncul di Etalase
--    sampai pemiliknya membuat profil.
-- Data yang sudah ada tidak berubah. Boleh dijalankan ulang.
-- Jalankan di Supabase: SQL Editor > New query > tempel > Run.
-- ============================================================

create or replace function public.ss_portfolio_ok(p jsonb)
returns boolean
language sql
immutable
set search_path = public
as $$
  -- Maksimal 8 karya. Tiap karya: judul 2-80 huruf, tautan https (boleh
  -- kosong), catatan maksimal 200 huruf, tanpa isian lain.
  select case when p is null or jsonb_typeof(p) <> 'array' then false
    else jsonb_array_length(p) <= 8
     and not exists (
       select 1 from jsonb_array_elements(p) e
        where jsonb_typeof(e) <> 'object'
           or jsonb_typeof(e->'title') is distinct from 'string'
           or char_length(btrim(e->>'title')) not between 2 and 80
           or (e ? 'url' and jsonb_typeof(e->'url') <> 'string')
           or (e ? 'note' and jsonb_typeof(e->'note') <> 'string')
           or not public.ss_link_ok(coalesce(e->>'url', ''))
           or char_length(coalesce(e->>'note', '')) > 200
           or exists (select 1 from jsonb_object_keys(e) k where k not in ('title', 'url', 'note'))
     )
  end;
$$;

alter table public.ss_profiles add column if not exists experience text not null default ''
  check (char_length(experience) <= 1500);
alter table public.ss_profiles add column if not exists portfolio jsonb not null default '[]'::jsonb
  check (public.ss_portfolio_ok(portfolio));

grant insert (experience, portfolio) on public.ss_profiles to authenticated;
grant update (experience, portfolio) on public.ss_profiles to authenticated;
grant execute on function public.ss_portfolio_ok(jsonb) to anon, authenticated;

create or replace function public.ss_etalase()
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
         sp.name, sp.handle, sp.city,
         l.pro,
         (select round(avg(r.rating), 1) from ss_reviews r where r.reviewee_id = l.user_id),
         (select count(*)::int from ss_reviews r where r.reviewee_id = l.user_id)
    from live l
    -- Wajib punya profil penjual publik: pembeli selalu tahu siapa penjualnya
    join ss_profiles sp on sp.user_id = l.user_id and sp.is_public and not sp.hidden
   where l.status = 'active' and l.show_in_social and not l.social_hidden
     and (l.pro or l.urut <= 2)
   order by l.pro desc, l.created_at desc
   limit 500;
$$;
