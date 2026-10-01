-- ============================================================
-- Migration 017: kuota simpanan tools dinaikkan
--
-- Tools sekarang bisa punya banyak proyek (fitur Founderku Pro), jadi
-- batas simpanan per akun dinaikkan dari 100 kunci / 5 MB menjadi
-- 300 kunci / 10 MB. Aturan lain tidak berubah: menyimpan ke akun tetap
-- hanya untuk trial/Pro (policy tool_data).
-- Data yang sudah ada tidak berubah. Boleh dijalankan ulang.
-- Jalankan di Supabase: SQL Editor > New query > tempel > Run.
-- ============================================================

create or replace function public.tool_data_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  jumlah integer;
  ukuran bigint;
begin
  perform pg_advisory_xact_lock(hashtextextended('tool_data:' || new.user_id::text, 0));
  select count(*), coalesce(sum(octet_length(value::text)), 0)
    into jumlah, ukuran
    from public.tool_data
    where user_id = new.user_id
      and not (tg_op = 'UPDATE' and user_id = old.user_id and key = old.key)
      and key <> new.key;
  if jumlah >= 300 then
    raise exception 'Batas data tools tercapai (maksimal 300 simpanan per akun)'
      using errcode = 'check_violation';
  end if;
  if ukuran + octet_length(new.value::text) > 10000000 then
    raise exception 'Batas ukuran data tools tercapai (maksimal 10 MB per akun)'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;
