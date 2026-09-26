-- ============================================================
-- STORAGE: bucket foto produk Pajangin (product-photos)
--
-- File ini melengkapi schema.sql (yang cuma mengurus schema public).
-- Sudah dipasang di project Supabase asli. Kalau bikin project baru,
-- jalankan SETELAH schema.sql.
-- ============================================================

-- Bucket publik: foto bisa dibuka lewat alamatnya (untuk halaman jualan),
-- tapi dibatasi 2 MB dan cuma JPEG/PNG.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-photos', 'product-photos', true, 2097152, array['image/jpeg','image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Upload: cuma user login, cuma ke folder miliknya sendiri
-- (nama file: <id akun>/<acak>.jpg).
drop policy if exists "User upload foto produk ke folder sendiri" on storage.objects;
create policy "User upload foto produk ke folder sendiri"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'product-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- SENGAJA tidak ada policy SELECT: bucket publik tetap bisa dibuka lewat
-- alamat foto, tapi daftar semua file (list) tidak bisa diintip orang.
-- Tidak ada policy UPDATE/DELETE: foto lama tidak bisa ditimpa orang lain.
-- Hapus akun menghapus fotonya lewat server (service_role).
