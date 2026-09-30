-- ============================================================
-- Migration 015: 3 style toko Pajangin baru (ceria, neon, segar)
--
-- Hanya melonggarkan aturan kolom profiles.store_style supaya boleh
-- berisi 3 style baru. Data yang sudah ada tidak berubah.
-- Boleh dijalankan ulang.
-- Jalankan di Supabase: SQL Editor > New query > tempel > Run.
-- ============================================================

alter table public.profiles drop constraint if exists profiles_store_style_check;
alter table public.profiles add constraint profiles_store_style_check
  check (store_style in ('klasik', 'hangat', 'minimalis', 'elegan', 'bold', 'ceria', 'neon', 'segar'));
