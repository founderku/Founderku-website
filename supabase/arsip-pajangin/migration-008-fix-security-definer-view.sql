-- ============================================================
-- MIGRATION 008: Ganti view store_profiles jadi fungsi eksplisit
-- Jalankan ini di Supabase SQL Editor.
--
-- Kenapa: view "store_profiles" ditandai "Security Definer View -
-- CRITICAL" sama Security Advisor Supabase. Ini karena view di
-- Postgres, secara default, jalan pakai izin SI PEMBUAT view (bisa
-- nembus RLS) TANPA ditulis eksplisit di kode - itu yang bikin
-- Supabase curiga/waspada, walau isi datanya sendiri aman (cuma 4
-- kolom non-sensitif yang emang sengaja dibuat publik).
--
-- Ganti jadi 2 FUNGSI (bukan 1 view) dengan "security definer"
-- DITULIS EKSPLISIT - perilakunya sama persis kayak view lama, cuma
-- sekarang jelas kelihatan di kode bahwa ini sengaja nembus RLS,
-- bukan kebetulan/kelupaan. Pola ini sama kayak fungsi is_admin() yang
-- sudah ada. Dibikin 2 fungsi karena kode aplikasi butuh cari data ini
-- dengan 2 cara beda: lewat store_slug (halaman toko, cek slug
-- kepakai/enggak) dan lewat id user (halaman produk individual).
-- ============================================================

drop view if exists public.store_profiles;

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
