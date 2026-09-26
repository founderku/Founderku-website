-- ============================================================
-- MIGRASI 3: Rename produk dari "Tokify" ke "Founderin"
-- Dibuat: 27 Juli 2026
-- CARA PAKAI: copy-paste ke Supabase SQL Editor, klik Run.
-- Ini cuma update 1 baris data di tabel slug_blocklist (bukan
-- struktur tabel), jadi aman dan cepat.
-- ============================================================

update public.slug_blocklist
  set slug = 'founderin'
  where slug = 'tokify';

-- Cek hasilnya (opsional, boleh dijalankan abis migrasi di atas
-- buat mastiin beneran keganti)
select slug from public.slug_blocklist where slug in ('founderin', 'tokify');
