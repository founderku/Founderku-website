-- ============================================================
-- Migration 019: kontak lewat email di halaman Pajangin
--
-- Penjual yang tidak mau nomor WhatsApp-nya tampil publik bisa memilih
-- email. Tiap halaman wajib punya salah satu: nomor WhatsApp ATAU email.
-- Halaman lama (semua sudah punya WhatsApp) tidak berubah.
-- Boleh dijalankan ulang.
-- Jalankan di Supabase: SQL Editor > New query > tempel > Run.
-- ============================================================

alter table public.pages add column if not exists contact_email text not null default '';

alter table public.pages drop constraint if exists pages_contact_email_ok;
alter table public.pages add constraint pages_contact_email_ok check (
  contact_email = ''
  or (char_length(contact_email) <= 120
      and contact_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$')
);

alter table public.pages drop constraint if exists pages_punya_kontak;
alter table public.pages add constraint pages_punya_kontak check (
  btrim(whatsapp_number) <> '' or contact_email <> ''
);

grant insert (contact_email) on public.pages to authenticated;
grant update (contact_email) on public.pages to authenticated;
