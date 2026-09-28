-- ============================================================
-- Migration 012: penghitung kunjungan tools
--
-- Menambah tabel tool_views (berapa kali tiap tool dibuka per hari,
-- dari semua pengunjung) dan fungsi track_tool_view yang hanya bisa
-- dipanggil server. Fungsi admin_stats() diperbarui supaya tab
-- Dashboard di admin panel ikut menampilkan angka kunjungan.
--
-- Yang disimpan cuma angka per tool per hari: tanpa akun, IP, cookie,
-- atau data pribadi. Tidak mengubah tabel lain. Boleh dijalankan ulang
-- (angka kunjungan yang sudah terkumpul akan ter-reset).
-- Jalankan di Supabase: SQL Editor > New query > tempel > Run.
-- ============================================================

drop function if exists public.track_tool_view(text) cascade;
drop table if exists public.tool_views cascade;
drop function if exists public.admin_stats() cascade;

-- Berapa kali tiap tool dibuka per hari (tanggal WIB), dari SEMUA
-- pengunjung (termasuk yang tidak login). Yang disimpan cuma angka per
-- tool per hari: tanpa akun, IP, cookie, atau data pribadi apa pun.
create table public.tool_views (
  tool text not null check (tool ~ '^[a-z][a-z0-9]{2,23}$'),
  day date not null,
  count integer not null default 0 check (count >= 0),
  primary key (tool, day)
);

-- RLS aktif tanpa aturan: tidak bisa dibaca atau diubah dari browser sama
-- sekali. Angkanya dibaca admin lewat admin_stats().
alter table public.tool_views enable row level security;

-- Tambah 1 kunjungan hari ini. Dibatasi 1 juta per tool per hari supaya
-- tidak bisa dibanjiri tanpa batas.
create function public.track_tool_view(p_tool text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_tool is null or p_tool !~ '^[a-z][a-z0-9]{2,23}$' then
    return;
  end if;
  insert into public.tool_views (tool, day, count)
    values (p_tool, (now() at time zone 'Asia/Jakarta')::date, 1)
    on conflict (tool, day)
    do update set count = public.tool_views.count + 1
    where public.tool_views.count < 1000000;
end;
$$;

-- Hanya server (service_role) yang boleh menambah hitungan.
revoke all on public.tool_views from anon, authenticated;
revoke execute on function public.track_tool_view(text) from public, anon, authenticated;
grant execute on function public.track_tool_view(text) to service_role;

-- ============================================================
-- DASHBOARD ADMIN (tab Dashboard di admin.html, lewat /api/admin/stats)
-- ============================================================
-- Ringkasan angka bisnis untuk tab Dashboard di admin panel.
-- Hanya admin (profiles.is_admin) yang bisa memanggil; selain itu ditolak.
-- Isinya cuma angka hitungan, tanpa email atau data pribadi user.
-- Status akses mengikuti aturan has_pro_access:
--   pro   = pro_expires_at masih di masa depan (sudah bayar)
--   trial = trial_ends_at masih di masa depan, tapi belum Pro
--   free  = keduanya sudah lewat / kosong
-- Tanggal harian & bulanan dihitung dalam waktu WIB (Asia/Jakarta).
create function public.admin_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  sekarang timestamptz := now();
  zona constant text := 'Asia/Jakarta';
  hari_ini date := (now() at time zone 'Asia/Jakarta')::date;
  hasil jsonb;
begin
  if not public.is_admin() then
    raise exception 'Hanya admin.' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'generated_at', sekarang,
    'users', (
      select jsonb_build_object(
        'total', count(*),
        'new_today', count(*) filter (where (created_at at time zone zona)::date = hari_ini),
        'new_7d', count(*) filter (where created_at > sekarang - interval '7 days'),
        'new_30d', count(*) filter (where created_at > sekarang - interval '30 days'),
        'pro', count(*) filter (where pro_expires_at > sekarang),
        'trial', count(*) filter (where trial_ends_at > sekarang and not coalesce(pro_expires_at > sekarang, false)),
        'free', count(*) filter (where not coalesce(pro_expires_at > sekarang, false) and not coalesce(trial_ends_at > sekarang, false)),
        'trial_ending_7d', count(*) filter (where trial_ends_at > sekarang and trial_ends_at <= sekarang + interval '7 days' and not coalesce(pro_expires_at > sekarang, false)),
        'pro_ending_7d', count(*) filter (where pro_expires_at > sekarang and pro_expires_at <= sekarang + interval '7 days'),
        'ever_paid', (select count(distinct s.user_id) from public.subscriptions s where s.status = 'paid')
      )
      from public.profiles
    ),
    'signups_daily', (
      select coalesce(jsonb_agg(jsonb_build_object('day', h.hari, 'n', coalesce(c.n, 0)) order by h.hari), '[]'::jsonb)
      from (select (hari_ini - i) as hari from generate_series(0, 29) as i) h
      left join (
        select (created_at at time zone zona)::date as hari, count(*) as n
        from public.profiles
        where created_at > sekarang - interval '31 days'
        group by 1
      ) c on c.hari = h.hari
    ),
    'revenue', (
      select jsonb_build_object(
        'total', coalesce(sum(amount), 0),
        'this_month', coalesce(sum(amount) filter (where date_trunc('month', paid_at at time zone zona) = date_trunc('month', sekarang at time zone zona)), 0),
        'last_30d', coalesce(sum(amount) filter (where paid_at > sekarang - interval '30 days'), 0),
        'paid_count', count(*),
        'paid_30d', count(*) filter (where paid_at > sekarang - interval '30 days')
      )
      from public.subscriptions
      where status = 'paid'
    ),
    'revenue_monthly', (
      select coalesce(jsonb_agg(jsonb_build_object('month', to_char(b.bulan, 'YYYY-MM'), 'amount', coalesce(r.jumlah, 0), 'count', coalesce(r.n, 0)) order by b.bulan), '[]'::jsonb)
      from (
        select (date_trunc('month', sekarang at time zone zona) - make_interval(months => i))::date as bulan
        from generate_series(0, 5) as i
      ) b
      left join (
        select date_trunc('month', paid_at at time zone zona)::date as bulan, sum(amount) as jumlah, count(*) as n
        from public.subscriptions
        where status = 'paid'
        group by 1
      ) r on r.bulan = b.bulan
    ),
    'pending_invoices', (
      select count(*) from public.subscriptions where status = 'pending' and created_at > sekarang - interval '2 days'
    ),
    'tools', (
      select coalesce(jsonb_agg(jsonb_build_object('tool', t.tool, 'users', t.users, 'active_30d', t.aktif) order by t.users desc, t.tool), '[]'::jsonb)
      from (
        select split_part(key, '-', 1) as tool,
               count(distinct user_id) as users,
               count(distinct user_id) filter (where updated_at > sekarang - interval '30 days') as aktif
        from public.tool_data
        group by 1
      ) t
    ),
    'tool_views', (
      select jsonb_build_object(
        'total_30d', coalesce((select sum(count) from public.tool_views where day > hari_ini - 30), 0),
        'daily', (
          select coalesce(jsonb_agg(jsonb_build_object('day', h.hari, 'n', coalesce(v.n, 0)) order by h.hari), '[]'::jsonb)
          from (select (hari_ini - i) as hari from generate_series(0, 29) as i) h
          left join (
            select day, sum(count) as n from public.tool_views where day > hari_ini - 30 group by day
          ) v on v.day = h.hari
        ),
        'tools', (
          select coalesce(jsonb_agg(jsonb_build_object('tool', x.tool, 'today', x.today, 'd7', x.d7, 'd30', x.d30) order by x.d30 desc, x.tool), '[]'::jsonb)
          from (
            select tool,
                   coalesce(sum(count) filter (where day = hari_ini), 0) as today,
                   coalesce(sum(count) filter (where day > hari_ini - 7), 0) as d7,
                   sum(count) as d30
            from public.tool_views
            where day > hari_ini - 30
            group by tool
          ) x
        )
      )
    ),
    'pajangin', (
      select jsonb_build_object(
        'pages', count(*),
        'active', count(*) filter (where status = 'active'),
        'taken_down', count(*) filter (where status = 'taken_down'),
        'sellers', count(distinct user_id),
        'clicks', coalesce(sum(click_count), 0),
        'new_30d', count(*) filter (where created_at > sekarang - interval '30 days')
      )
      from public.pages
    )
  ) into hasil;

  return hasil;
end;
$$;

revoke execute on function public.admin_stats() from public, anon, authenticated;
grant execute on function public.admin_stats() to authenticated;
