-- ============================================================
-- MIGRATION 006: Admin panel + notifikasi takedown
-- Jalankan ini di Supabase SQL Editor (project yang sudah ada).
-- Kalau install dari nol, cukup pakai schema.sql yang sudah
-- di-update kumulatif (tidak perlu jalanin file migrasi ini lagi).
-- ============================================================

-- Kolom penanda admin. Defaultnya false buat semua user - harus
-- diaktifin manual lewat SQL Editor buat akun tertentu (lihat catatan
-- di bawah file ini).
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- ============================================================
-- FUNGSI: is_admin
-- Dipakai di dalam RLS policy buat ngecek "apakah user ini admin".
-- Sengaja dibikin fungsi terpisah (security definer) supaya query di
-- dalamnya BYPASS RLS - kalau ditulis langsung di policy tabel
-- profiles, bisa infinite recursion (policy nyari data ke tabel yang
-- lagi dijaga policy itu sendiri).
-- ============================================================
create function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select is_admin from public.profiles where id = uid),
    false
  );
$$;

grant execute on function public.is_admin(uuid) to authenticated;

-- ---------- profiles: admin bisa lihat semua ----------
create policy "Admin bisa lihat semua profil"
  on public.profiles for select
  using (public.is_admin(auth.uid()));

-- ---------- pages: admin bisa lihat & ubah status semua halaman ----------
create policy "Admin bisa lihat semua halaman"
  on public.pages for select
  using (public.is_admin(auth.uid()));

create policy "Admin bisa update status halaman (takedown/pulihkan)"
  on public.pages for update
  using (public.is_admin(auth.uid()));

-- ---------- takedowns: sekarang ada akses (sebelumnya tertutup total) ----------
-- Pemilik halaman boleh baca alasan takedown punya halamannya sendiri
-- (buat ditampilin sebagai notifikasi di dashboard-nya).
create policy "Pemilik bisa lihat takedown halaman miliknya"
  on public.takedowns for select
  using (
    exists (
      select 1 from public.pages
      where pages.id = takedowns.page_id
        and pages.user_id = auth.uid()
    )
  );

-- Admin boleh baca semua, bikin baru (pas nurunin halaman), dan update
-- (nandain notified_user setelah pemilik lihat notifnya).
create policy "Admin bisa lihat semua takedown"
  on public.takedowns for select
  using (public.is_admin(auth.uid()));

create policy "Admin bisa bikin takedown baru"
  on public.takedowns for insert
  with check (public.is_admin(auth.uid()));

create policy "Admin bisa update takedown"
  on public.takedowns for update
  using (public.is_admin(auth.uid()));

-- ============================================================
-- CATATAN: cara jadiin akun kamu admin
-- Jalankan ini di SQL Editor (ganti email sesuai akun kamu):
--
--   update public.profiles set is_admin = true
--   where email = 'email-akun-andi@gmail.com';
--
-- ============================================================
