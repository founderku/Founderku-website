-- ============================================================
-- Migration 009: tools baru bisa simpan ke akun tanpa ubah database
--
-- Sebelumnya tabel tool_data cuma menerima kunci 5 tools lama
-- (notain, pajakin, kontrakin, jalanin, sehatin). Sekarang kunci cukup
-- berformat "<idtool>-<nama>", dan sebagai gantinya tiap akun dibatasi
-- maksimal 100 simpanan dan total 5 MB.
--
-- Aman dijalankan di database yang sedang dipakai: data lama tidak
-- diubah, dan boleh dijalankan ulang.
-- Jalankan di Supabase: SQL Editor > New query > tempel > Run.
-- ============================================================
begin;

alter table public.tool_data drop constraint if exists tool_data_key_check;
alter table public.tool_data add constraint tool_data_key_check
  check (key ~ '^[a-z][a-z0-9]{2,23}-[a-z0-9-]{1,40}$');

drop trigger if exists tool_data_limit on public.tool_data;
drop function if exists public.tool_data_limit() cascade;

-- Batas per akun: maksimal 100 kunci dan total 5 MB data tools.
-- Dikunci per akun (advisory lock) supaya dua simpanan bersamaan tidak
-- bisa sama-sama lolos melewati batas.
create function public.tool_data_limit()
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
  if jumlah >= 100 then
    raise exception 'Batas data tools tercapai (maksimal 100 simpanan per akun)'
      using errcode = 'check_violation';
  end if;
  if ukuran + octet_length(new.value::text) > 5000000 then
    raise exception 'Batas ukuran data tools tercapai (maksimal 5 MB per akun)'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger tool_data_limit
  before insert or update on public.tool_data
  for each row execute function public.tool_data_limit();

revoke execute on function public.tool_data_limit() from public, anon, authenticated;

commit;

-- Cek cepat sesudah Run (harus keluar 1 baris "tool_data_limit"):
--   select tgname from pg_trigger where tgname = 'tool_data_limit';
