-- ============================================================
-- MIGRASI 2: Fitur "Halaman Toko" (gabung semua produk 1 user jadi 1 link)
-- Dibuat: 27 Juli 2026
-- CARA PAKAI: copy-paste SEMUA isi file ini ke Supabase SQL Editor
-- (project yang SAMA yang sudah pernah jalanin schema.sql), lalu klik Run.
-- JANGAN jalanin ulang schema.sql yang lama, itu bakal error karena
-- tabel-tabelnya sudah ada. Ini cuma tambahan di atas yang sudah ada.
-- ============================================================

-- Tambah kolom nama/alamat toko di profil user. Nullable dulu (belum wajib
-- diisi), unique supaya tidak ada 2 toko dengan alamat sama.
alter table public.profiles
  add column store_slug text unique;

-- View publik yang cuma nampilin kolom AMAN (id, store_slug, is_pro),
-- BUKAN email. Ini dibutuhkan karena RLS profiles cuma izinin user lihat
-- baris profil miliknya sendiri - padahal pengunjung publik (belum login)
-- perlu tahu is_pro (buat nentuin watermark muncul atau tidak) dan
-- store_slug, tanpa perlu (dan tidak boleh) bisa akses email siapa pun.
create or replace view public.store_profiles as
  select id, store_slug, is_pro
  from public.profiles;

grant select on public.store_profiles to anon, authenticated;
