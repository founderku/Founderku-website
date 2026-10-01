-- ============================================================
-- Migration 018: batas foto produk per akun + hapus foto sendiri
--
-- 1. Tiap akun maksimal 60 file di bucket product-photos, supaya tidak
--    ada yang bisa memenuhi kuota storage lewat unggahan langsung.
-- 2. User boleh menghapus foto di foldernya sendiri. Dipakai editor
--    Pajangin untuk membuang foto lama saat diganti atau halaman dihapus.
-- Data yang sudah ada tidak berubah. Boleh dijalankan ulang.
-- Jalankan di Supabase: SQL Editor > New query > tempel > Run.
-- ============================================================

-- Jumlah foto milik akun yang sedang login (tanpa parameter, jadi tidak
-- bisa dipakai mengintip akun lain)
create or replace function public.jumlah_foto_saya()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int from storage.objects
   where bucket_id = 'product-photos'
     and (storage.foldername(name))[1] = auth.uid()::text;
$$;
revoke execute on function public.jumlah_foto_saya() from public, anon;
grant execute on function public.jumlah_foto_saya() to authenticated;

drop policy if exists "User upload foto produk ke folder sendiri" on storage.objects;
create policy "User upload foto produk ke folder sendiri"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'product-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.jumlah_foto_saya() < 60
  );

-- Lihat file di folder sendiri (dibutuhkan untuk menghapus lewat API storage).
-- Folder orang lain tetap tidak bisa didaftar.
drop policy if exists "User lihat foto produk sendiri" on storage.objects;
create policy "User lihat foto produk sendiri"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'product-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "User hapus foto produk sendiri" on storage.objects;
create policy "User hapus foto produk sendiri"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'product-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
