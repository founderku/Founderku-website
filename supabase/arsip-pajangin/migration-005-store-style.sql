-- ============================================================
-- MIGRASI 5: Fitur "Edit Style Tokomu" - 5 varian gaya visual
-- Dibuat: 28 Juli 2026
-- CARA PAKAI: copy-paste ke Supabase SQL Editor, klik Run.
-- ============================================================

-- Kolom baru buat nyimpen pilihan gaya visual toko. Default 'klasik'
-- (gaya asli Pajangin, amber/coral) buat user yang belum milih.
alter table public.profiles
  add column store_style text not null default 'klasik'
  check (store_style in ('klasik', 'hangat', 'minimalis', 'elegan', 'bold'));

-- Update view publik biar ikut nampilin store_style (dipakai halaman
-- publik /l/[slug] dan /toko/[storeSlug] buat nentuin gaya tampilan).
create or replace view public.store_profiles as
  select id, store_slug, is_pro, store_style
  from public.profiles;

grant select on public.store_profiles to anon, authenticated;
