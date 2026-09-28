-- ============================================================
-- Migration 011: jatah harian Asisten AI Founderku
--
-- Menambah tabel ai_usage (cuma jumlah pemakaian per akun per hari,
-- TANPA isi percakapan) dan dua fungsi yang hanya bisa dipanggil server:
-- ai_take_quota (ambil 1 jatah) dan ai_refund_quota (kembalikan 1 jatah
-- kalau AI gagal menjawab).
--
-- Tidak mengubah tabel lain. Boleh dijalankan ulang (data jatah hari
-- itu akan ter-reset, tidak masalah).
-- Jalankan di Supabase: SQL Editor > New query > tempel > Run.
-- ============================================================
begin;

drop function if exists public.ai_take_quota(uuid, integer) cascade;
drop function if exists public.ai_refund_quota(uuid) cascade;
drop table if exists public.ai_usage cascade;

-- Jatah Asisten AI Founderku (Gemini) per akun per hari (tanggal WIB).
-- Yang disimpan cuma JUMLAH pemakaian, bukan isi percakapan.
create table public.ai_usage (
  user_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  count integer not null default 0 check (count >= 0),
  primary key (user_id, day)
);

alter table public.ai_usage enable row level security;

-- User cuma bisa melihat pemakaian miliknya sendiri (untuk tampilan
-- "sisa jatah"). Menambah/mengurangi hanya lewat fungsi server di bawah.
create policy "User lihat jatah AI sendiri"
  on public.ai_usage for select using (auth.uid() = user_id);

-- Ambil 1 jatah hari ini. Kembalikan sisa jatah setelah diambil, atau -1
-- kalau jatah hari ini sudah habis. Satu perintah (atomik), jadi banyak
-- permintaan bersamaan tidak bisa melewati batas.
create function public.ai_take_quota(uid uuid, batas integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  hari date := (now() at time zone 'Asia/Jakarta')::date;
  jumlah integer;
begin
  if batas is null or batas < 1 then
    return -1;
  end if;
  insert into public.ai_usage (user_id, day, count)
    values (uid, hari, 1)
    on conflict (user_id, day)
    do update set count = public.ai_usage.count + 1
    where public.ai_usage.count < batas
    returning count into jumlah;
  if jumlah is null then
    return -1;
  end if;
  return batas - jumlah;
end;
$$;

-- Kembalikan 1 jatah kalau AI gagal menjawab (misal layanan Gemini penuh),
-- supaya user tidak rugi jatah.
create function public.ai_refund_quota(uid uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.ai_usage
    set count = count - 1
    where user_id = uid
      and day = (now() at time zone 'Asia/Jakarta')::date
      and count > 0;
$$;

revoke all on public.ai_usage from anon, authenticated;
grant select on public.ai_usage to authenticated;
revoke execute on function public.ai_take_quota(uuid, integer) from public, anon, authenticated;
revoke execute on function public.ai_refund_quota(uuid) from public, anon, authenticated;
grant execute on function public.ai_take_quota(uuid, integer) to service_role;
grant execute on function public.ai_refund_quota(uuid) to service_role;

commit;
