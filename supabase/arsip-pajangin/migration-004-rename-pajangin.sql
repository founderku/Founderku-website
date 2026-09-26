-- ============================================================
-- MIGRASI 4: Rename produk dari "Founderin" ke "Pajangin"
-- Dibuat: 27 Juli 2026
-- CARA PAKAI: copy-paste ke Supabase SQL Editor, klik Run.
-- ============================================================

update public.slug_blocklist
  set slug = 'pajangin'
  where slug = 'founderin';

-- Cek hasilnya (opsional)
select slug from public.slug_blocklist where slug in ('pajangin', 'founderin');
