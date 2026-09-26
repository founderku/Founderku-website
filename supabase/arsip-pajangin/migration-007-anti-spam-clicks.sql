-- ============================================================
-- MIGRATION 007: Anti-spam buat penghitung klik halaman publik
-- Jalankan ini di Supabase SQL Editor.
-- ============================================================

-- Catatan tiap "kunjungan yang dihitung" - dipakai buat nyegah 1
-- pengunjung yang sama nge-spam klik ke halaman yang sama berkali-kali
-- dalam waktu singkat (misal lewat script otomatis). visitor_hash
-- BUKAN data pribadi asli - cuma hash pendek dari alamat IP, gak bisa
-- dibalikin jadi IP aslinya, cuma dipakai buat "apakah ini pengunjung
-- yang sama dengan barusan".
create table public.page_click_log (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  visitor_hash text not null,
  clicked_at timestamptz not null default now()
);

create index page_click_log_lookup_idx
  on public.page_click_log (page_id, visitor_hash, clicked_at);

alter table public.page_click_log enable row level security;
-- Sengaja tidak ada policy sama sekali - tabel ini cuma diakses lewat
-- fungsi increment_page_click di bawah (security definer, bypass RLS),
-- gak pernah diakses langsung dari client.

-- Ganti fungsi lama: sekarang butuh parameter visitor_hash tambahan,
-- dan cuma nambah counter kalau pengunjung ini belum "ngeklik" halaman
-- yang sama dalam 60 detik terakhir.
drop function if exists public.increment_page_click(text);

create function public.increment_page_click(page_slug text, visitor_hash text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_page_id uuid;
begin
  select id into target_page_id from public.pages
  where slug = page_slug and status = 'active';

  if target_page_id is null then
    return;
  end if;

  if exists (
    select 1 from public.page_click_log
    where page_id = target_page_id
      and page_click_log.visitor_hash = increment_page_click.visitor_hash
      and clicked_at > now() - interval '60 seconds'
  ) then
    return;
  end if;

  insert into public.page_click_log (page_id, visitor_hash)
  values (target_page_id, increment_page_click.visitor_hash);

  update public.pages
  set click_count = click_count + 1
  where id = target_page_id;
end;
$$;

grant execute on function public.increment_page_click(text, text) to anon, authenticated;
