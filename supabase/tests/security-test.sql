-- Cara jalanin: lihat supabase/tests/README.md
-- Tes keamanan & logika skema Founderku. Tiap tes cetak LULUS/GAGAL.
\set ON_ERROR_STOP 0
\pset tuples_only on
insert into auth.users values ('11111111-1111-1111-1111-111111111111','andi@x.com'),
                              ('22222222-2222-2222-2222-222222222222','umkm@x.com'),
                              ('33333333-3333-3333-3333-333333333333','lain@x.com');
select 'T0 profil otomatis dibuat: ' || case when count(*) >= 3 then 'LULUS' else 'GAGAL' end from public.profiles;
select 'T0b akun lama ikut dibuatkan profil: ' || case when not exists(select 1 from auth.users where email='lama@x.com') then 'DILEWATI (tidak ada akun lama)' when exists(select 1 from public.profiles where email='lama@x.com') then 'LULUS' else 'GAGAL' end;
update public.profiles set is_admin = true where email='andi@x.com';

-- ===== sebagai user umkm (bukan admin) =====
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

do $$ begin
  begin update public.profiles set pro_expires_at = now() + interval '10 years' where id = auth.uid();
    raise notice 'T1 user set dirinya Pro: GAGAL (berhasil nembus)';
  exception when insufficient_privilege then raise notice 'T1 user set dirinya Pro: LULUS (ditolak)'; end;
  begin update public.profiles set is_admin = true where id = auth.uid();
    raise notice 'T2 user set dirinya admin: GAGAL (berhasil nembus)';
  exception when insufficient_privilege then raise notice 'T2 user set dirinya admin: LULUS (ditolak)'; end;
  begin update public.profiles set trial_ends_at = now() + interval '10 years' where id = auth.uid();
    raise notice 'T3 user perpanjang trial sendiri: GAGAL';
  exception when insufficient_privilege then raise notice 'T3 user perpanjang trial sendiri: LULUS (ditolak)'; end;
  begin perform public.start_trial(auth.uid(), 9999);
    raise notice 'T4 user panggil start_trial: GAGAL';
  exception when insufficient_privilege then raise notice 'T4 user panggil start_trial: LULUS (ditolak)'; end;
  begin perform public.activate_subscription('x', 1);
    raise notice 'T5 user panggil activate_subscription: GAGAL';
  exception when insufficient_privilege then raise notice 'T5 user panggil activate_subscription: LULUS (ditolak)'; end;
  begin insert into public.subscriptions (user_id, xendit_invoice_id, price_id, amount, days, status)
    values (auth.uid(), 'palsu', 'monthly', 0, 3650, 'paid');
    raise notice 'T6 user bikin langganan palsu: GAGAL';
  exception when insufficient_privilege then raise notice 'T6 user bikin langganan palsu: LULUS (ditolak)'; end;
end $$;

-- boleh: ubah alamat toko sendiri
update public.profiles set store_slug = 'tokoumkm', store_style = 'bold' where id = auth.uid();
select 'T7 user ubah store_slug/style sendiri: ' || case when store_slug='tokoumkm' and store_style='bold' then 'LULUS' else 'GAGAL' end from public.profiles where id = auth.uid();

-- batas 2 halaman untuk akun Free (belum trial)
insert into public.pages (user_id, slug, product_name, whatsapp_number) values (auth.uid(), 'produk-1', 'P1', '628');
insert into public.pages (user_id, slug, product_name, whatsapp_number) values (auth.uid(), 'produk-2', 'P2', '628');
do $$ begin
  insert into public.pages (user_id, slug, product_name, whatsapp_number) values (auth.uid(), 'produk-3', 'P3', '628');
  raise notice 'T8 Free bikin halaman ke-3: GAGAL (lolos)';
exception when raise_exception then raise notice 'T8 Free bikin halaman ke-3: LULUS (ditolak: %)', sqlerrm; end $$;

do $$ begin
  insert into public.pages (user_id, slug, product_name, whatsapp_number) values ('33333333-3333-3333-3333-333333333333', 'punya-orang', 'X', '628');
  raise notice 'T9 bikin halaman atas nama orang lain: GAGAL';
exception when insufficient_privilege then raise notice 'T9 bikin halaman atas nama orang lain: LULUS (ditolak)'; end $$;

do $$ begin
  update public.pages set click_count = 99999 where slug = 'produk-1';
  raise notice 'T10 user palsuin jumlah klik: GAGAL';
exception when insufficient_privilege then raise notice 'T10 user palsuin jumlah klik: LULUS (ditolak)'; end $$;

update public.pages set product_name = 'P1 baru' where slug = 'produk-1';
select 'T11 user edit isi halaman sendiri: ' || case when product_name='P1 baru' then 'LULUS' else 'GAGAL' end from public.pages where slug='produk-1';

do $$ begin
  perform public.admin_set_page_status((select id from public.pages where slug='produk-1'), 'taken_down', 'coba');
  raise notice 'T12 non-admin takedown: GAGAL';
exception when insufficient_privilege then raise notice 'T12 non-admin takedown: LULUS (ditolak)'; end $$;

-- ===== sebagai admin =====
reset role;
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select public.admin_set_page_status((select id from public.pages where slug='produk-1'), 'taken_down', 'melanggar aturan');
select 'T13 admin takedown: ' || case when status='taken_down' then 'LULUS' else 'GAGAL' end from public.pages where slug='produk-1';
select 'T13b catatan takedown tersimpan: ' || case when count(*)=1 then 'LULUS' else 'GAGAL' end from public.takedowns;

-- ===== pemilik coba pulihkan halaman yang di-takedown =====
reset role;
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
do $$ begin
  update public.pages set status = 'active' where slug = 'produk-1';
  raise notice 'T14 pemilik pulihkan sendiri halaman takedown: GAGAL';
exception when insufficient_privilege then raise notice 'T14 pemilik pulihkan sendiri halaman takedown: LULUS (ditolak)'; end $$;
select 'T14b pemilik bisa lihat alasan takedown: ' || case when count(*)=1 then 'LULUS' else 'GAGAL' end from public.takedowns;

-- halaman takedown gak dihitung, jadi slot kebuka lagi
insert into public.pages (user_id, slug, product_name, whatsapp_number) values (auth.uid(), 'produk-3', 'P3', '628');
select 'T15 halaman takedown tidak makan kuota: ' || case when count(*)=1 then 'LULUS' else 'GAGAL' end from public.pages where slug='produk-3';

-- ===== pengunjung anonim =====
reset role;
set role anon;
set request.jwt.claim.sub = '';
select 'T16 anonim lihat halaman aktif saja: ' || case when count(*)=2 then 'LULUS' else 'GAGAL ('||count(*)||')' end from public.pages;
select 'T17 anonim gak bisa baca email: ' || case when count(*)=0 then 'LULUS' else 'GAGAL' end from public.profiles;
select 'T18 data toko publik tanpa email, has_pro=false: ' || case when has_pro = false then 'LULUS' else 'GAGAL' end from public.get_store_profile_by_slug('tokoumkm');
do $$ begin
  perform public.increment_page_click('produk-2', 'palsu-1');
  raise notice 'T19a pengunjung panggil penghitung klik langsung: GAGAL';
exception when insufficient_privilege then raise notice 'T19a pengunjung panggil penghitung klik langsung: LULUS (ditolak)'; end $$;
select 'T19c anonim cek admin = false: ' || case when public.is_admin() = false then 'LULUS' else 'GAGAL' end;
reset role;
set role service_role;
select public.increment_page_click('produk-2', 'abc');
select public.increment_page_click('produk-2', 'abc');
reset role;
select 'T19 klik dobel dalam 60 detik dihitung 1x: ' || case when click_count=1 then 'LULUS' else 'GAGAL ('||click_count||')' end from public.pages where slug='produk-2';

-- ===== trial (server / service_role) =====
set role service_role;
select public.start_trial('22222222-2222-2222-2222-222222222222', 7);
select 'T20 trial 7 hari aktif: ' || case when trial_ends_at between now() + interval '6 days 23 hours' and now() + interval '7 days 1 minute' then 'LULUS' else 'GAGAL' end from public.profiles where email='umkm@x.com';
select public.start_trial('22222222-2222-2222-2222-222222222222', 30);
select 'T21 trial gak bisa diulang/diperpanjang: ' || case when trial_ends_at < now() + interval '8 days' then 'LULUS' else 'GAGAL' end from public.profiles where email='umkm@x.com';
reset role;
select 'T22 has_pro_access saat trial: ' || case when public.has_pro_access('22222222-2222-2222-2222-222222222222') then 'LULUS' else 'GAGAL' end;
select 'T22b watermark hilang saat trial: ' || case when has_pro then 'LULUS' else 'GAGAL' end from public.get_store_profile_by_slug('tokoumkm');

set role authenticated;
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
insert into public.pages (user_id, slug, product_name, whatsapp_number) values (auth.uid(), 'produk-4', 'P4', '628');
select 'T23 saat trial bisa lebih dari 2 halaman: ' || case when count(*)=1 then 'LULUS' else 'GAGAL' end from public.pages where slug='produk-4';
reset role;

-- trial habis -> balik Free
update public.profiles set trial_ends_at = now() - interval '1 minute' where email='umkm@x.com';
select 'T24 trial habis, akses Pro hilang: ' || case when not public.has_pro_access('22222222-2222-2222-2222-222222222222') then 'LULUS' else 'GAGAL' end;

-- ===== pembayaran (webhook, service_role) =====
set role service_role;
insert into public.subscriptions (user_id, xendit_invoice_id, price_id, amount, days) values ('22222222-2222-2222-2222-222222222222', 'inv-1', 'monthly', 39000, 30);
insert into public.subscriptions (user_id, xendit_invoice_id, price_id, amount, days) values ('22222222-2222-2222-2222-222222222222', 'inv-2', 'monthly', 39000, 30);
insert into public.subscriptions (user_id, xendit_invoice_id, price_id, amount, days) values ('22222222-2222-2222-2222-222222222222', 'inv-3', 'yearly', 299000, 365);
select 'T25 nominal beda ditolak: ' || case when public.activate_subscription('inv-3', 1000) = 'amount_mismatch' then 'LULUS' else 'GAGAL' end;
select 'T26 bayar lunas aktif: ' || case when public.activate_subscription('inv-1', 39000) = 'activated' then 'LULUS' else 'GAGAL' end;
select 'T27 webhook dobel tidak dihitung 2x: ' || case when public.activate_subscription('inv-1', 39000) = 'already_paid' then 'LULUS' else 'GAGAL' end;
select 'T28 masa aktif 30 hari: ' || case when pro_expires_at between now() + interval '29 days 23 hours' and now() + interval '30 days 1 minute' then 'LULUS' else 'GAGAL' end from public.profiles where email='umkm@x.com';
select public.activate_subscription('inv-2', 39000);
select 'T29 perpanjang lebih awal, sisa hari gak hangus (60 hari): ' || case when pro_expires_at between now() + interval '59 days 23 hours' and now() + interval '60 days 1 minute' then 'LULUS' else 'GAGAL' end from public.profiles where email='umkm@x.com';
-- bayar saat trial masih jalan: masa bayar mulai setelah trial habis
update public.profiles set trial_ends_at = now() + interval '5 days' where email='lain@x.com';
insert into public.subscriptions (user_id, xendit_invoice_id, price_id, amount, days) values ('33333333-3333-3333-3333-333333333333', 'inv-4', 'monthly', 39000, 30);
select public.activate_subscription('inv-4', 39000);
select 'T29b bayar saat trial, sisa trial gak hangus (35 hari): ' || case when pro_expires_at between now() + interval '34 days 23 hours' and now() + interval '35 days 1 minute' then 'LULUS' else 'GAGAL' end from public.profiles where email='lain@x.com';
select 'T30 invoice tidak dikenal: ' || case when public.activate_subscription('ngawur', 1) = 'not_found' then 'LULUS' else 'GAGAL' end;
reset role;
select 'T31 user lain gak lihat langganan orang: ' || 'cek bawah';
set role authenticated;
set request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
select 'T31 hasil: ' || case when count(*)=0 then 'LULUS' else 'GAGAL' end from public.subscriptions where user_id = '22222222-2222-2222-2222-222222222222';
select 'T31b user tetap lihat langganan sendiri: ' || case when count(*)=1 then 'LULUS' else 'GAGAL' end from public.subscriptions;
reset role;

-- ===================== tool_data (simpan ke akun) =====================
reset role;
update public.profiles set trial_ends_at = null, pro_expires_at = null where email = 'lain@x.com';
update public.profiles set trial_ends_at = now() + interval '3 days' where email = 'andi@x.com';
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
insert into public.tool_data (user_id, key, value) values (auth.uid(), 'notain-draft-v1', '{"a":1}');
select 'T40 Pro/trial bisa simpan data tools: ' || case when count(*)=1 then 'LULUS' else 'GAGAL' end from public.tool_data where key='notain-draft-v1';
update public.tool_data set value = '{"a":2}' where key = 'notain-draft-v1';
select 'T41 Pro/trial bisa ubah data tools: ' || case when value->>'a'='2' then 'LULUS' else 'GAGAL' end from public.tool_data where key='notain-draft-v1';
insert into public.tool_data (user_id, key, value) values (auth.uid(), 'notain-draft-v1', '{"a":5}')
  on conflict (user_id, key) do update set user_id = excluded.user_id, key = excluded.key, value = excluded.value;
select 'T41b upsert (cara simpan dari browser) jalan: ' || case when value->>'a'='5' then 'LULUS' else 'GAGAL' end from public.tool_data where key='notain-draft-v1';
update public.tool_data set value = '{"a":2}' where key = 'notain-draft-v1';
do $$ begin
  update public.tool_data set user_id = '33333333-3333-3333-3333-333333333333' where key = 'notain-draft-v1';
  raise notice 'T41c pindahkan data ke akun orang lain: GAGAL';
exception when insufficient_privilege then raise notice 'T41c pindahkan data ke akun orang lain: LULUS (ditolak)'; end $$;
do $$ begin
  update public.tool_data set updated_at = now() - interval '1 year' where key = 'notain-draft-v1';
  raise notice 'T41d user ubah waktu simpan sendiri: GAGAL';
exception when insufficient_privilege then raise notice 'T41d user ubah waktu simpan sendiri: LULUS (ditolak)'; end $$;
do $$ declare k text; lolos int := 0; begin
  foreach k in array array['Rahasia-lain', 'ab-x', '../etc-passwd', 'notain', 'notain-', 'notain-Draft', 'fk theme-x', 'x' || repeat('a', 30) || '-v1'] loop
    begin
      insert into public.tool_data (user_id, key, value) values (auth.uid(), k, '{}');
      lolos := lolos + 1;
    exception when check_violation then null; end;
  end loop;
  raise notice 'T42 kunci berformat aneh ditolak: %', case when lolos = 0 then 'LULUS' else 'GAGAL (' || lolos || ' lolos)' end;
end $$;
insert into public.tool_data (user_id, key, value) values (auth.uid(), 'runwayin-draft-v1', '{"kas":1}');
select 'T42b tool baru bisa simpan tanpa ubah database: ' || case when count(*)=1 then 'LULUS' else 'GAGAL' end from public.tool_data where key='runwayin-draft-v1';
delete from public.tool_data where key = 'runwayin-draft-v1';
-- batas 100 simpanan per akun (sekarang sudah ada 1: notain-draft-v1)
insert into public.tool_data (user_id, key, value) select auth.uid(), 'runwayin-t' || g, '{}' from generate_series(1, 99) g;
do $$ begin
  insert into public.tool_data (user_id, key, value) values (auth.uid(), 'runwayin-t100', '{}');
  raise notice 'T42c simpanan ke-101 ditolak: GAGAL';
exception when check_violation then raise notice 'T42c simpanan ke-101 ditolak: LULUS'; end $$;
update public.tool_data set value = '{"b":1}' where key = 'runwayin-t5';
select 'T42d saat penuh, simpanan lama tetap bisa diubah: ' || case when value->>'b'='1' then 'LULUS' else 'GAGAL' end from public.tool_data where key='runwayin-t5';
insert into public.tool_data (user_id, key, value) values (auth.uid(), 'runwayin-t5', '{"b":2}')
  on conflict (user_id, key) do update set user_id = excluded.user_id, key = excluded.key, value = excluded.value;
select 'T42e saat penuh, upsert simpanan lama tetap jalan: ' || case when value->>'b'='2' then 'LULUS' else 'GAGAL' end from public.tool_data where key='runwayin-t5';
delete from public.tool_data where key like 'runwayin-t%';
-- batas total 5 MB per akun
do $$ declare i int := 0; begin
  loop
    i := i + 1;
    insert into public.tool_data (user_id, key, value) values (auth.uid(), 'runwayin-b' || i, to_jsonb(repeat('x', 190000)));
    exit when i > 40;
  end loop;
  raise notice 'T42f total lebih dari 5 MB ditolak: GAGAL';
exception when check_violation then
  raise notice 'T42f total lebih dari 5 MB ditolak: %', case when i between 25 and 28 then 'LULUS' else 'GAGAL (berhenti di ' || i || ')' end;
end $$;
select 'T42g total data akun tetap di bawah 5 MB: ' || case when sum(octet_length(value::text)) <= 5000000 then 'LULUS' else 'GAGAL' end from public.tool_data;
delete from public.tool_data where key like 'runwayin-b%';
do $$ begin
  insert into public.tool_data (user_id, key, value) values (auth.uid(), 'notain-besar', to_jsonb(repeat('x', 210000)));
  raise notice 'T43 data terlalu besar ditolak: GAGAL';
exception when check_violation then raise notice 'T43 data terlalu besar ditolak: LULUS'; end $$;
do $$ begin
  insert into public.tool_data (user_id, key, value) values ('33333333-3333-3333-3333-333333333333', 'notain-draft-v1', '{}');
  raise notice 'T44 simpan atas nama orang lain: GAGAL';
exception when insufficient_privilege then raise notice 'T44 simpan atas nama orang lain: LULUS (ditolak)'; end $$;
-- user Free
reset role;
set role authenticated;
set request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
do $$ begin
  insert into public.tool_data (user_id, key, value) values (auth.uid(), 'jalanin-progress-v1', '[]');
  raise notice 'T45 akun Free tidak bisa simpan ke akun: GAGAL';
exception when insufficient_privilege then raise notice 'T45 akun Free tidak bisa simpan ke akun: LULUS (ditolak)'; end $$;
select 'T46 user lain tidak bisa baca data tools orang: ' || case when count(*)=0 then 'LULUS' else 'GAGAL' end from public.tool_data;
-- Pro habis: data lama tetap bisa dibaca & dihapus, tapi tidak bisa diubah
reset role;
update public.profiles set trial_ends_at = now() - interval '1 minute', pro_expires_at = null where email = 'andi@x.com';
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select 'T47 Pro habis: data lama tetap bisa dibaca: ' || case when count(*)=1 then 'LULUS' else 'GAGAL' end from public.tool_data;
update public.tool_data set value = '{"a":3}' where key = 'notain-draft-v1';
select 'T48 Pro habis: tidak bisa ubah data: ' || case when value->>'a'='2' then 'LULUS' else 'GAGAL' end from public.tool_data where key='notain-draft-v1';
delete from public.tool_data where key = 'notain-draft-v1';
select 'T49 Pro habis: tetap bisa hapus data sendiri: ' || case when count(*)=0 then 'LULUS' else 'GAGAL' end from public.tool_data;
reset role;

-- ===== Dashboard admin (admin_stats) =====
reset role;
set role anon;
do $$ begin
  perform public.admin_stats();
  raise notice 'T50 pengunjung (anon) buka dashboard admin: GAGAL (lolos)';
exception when insufficient_privilege then raise notice 'T50 pengunjung (anon) buka dashboard admin: LULUS (ditolak)'; end $$;
reset role;
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
do $$ begin
  perform public.admin_stats();
  raise notice 'T51 user biasa buka dashboard admin: GAGAL (lolos)';
exception when insufficient_privilege then raise notice 'T51 user biasa buka dashboard admin: LULUS (ditolak)'; end $$;
reset role;
-- data pembanding yang pasti: satu Pro, satu trial, satu pembayaran lunas
update public.profiles set pro_expires_at = now() + interval '3 days', trial_ends_at = null where email = 'lain@x.com';
update public.profiles set trial_ends_at = now() + interval '5 days', pro_expires_at = null where email = 'umkm@x.com';
insert into public.subscriptions (user_id, xendit_invoice_id, price_id, amount, days, status, paid_at)
  values ('33333333-3333-3333-3333-333333333333', 'tes-dashboard-1', 'monthly', 49000, 30, 'paid', now());
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select 'T52 admin bisa buka dashboard: ' || case when public.admin_stats() ? 'users' then 'LULUS' else 'GAGAL' end;
reset role;
-- hitung ulang sebagai superuser lalu bandingkan dengan hasil fungsi (dipanggil sebagai admin)
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
create temp table hasil_admin as select public.admin_stats() as j;
reset role;
select 'T53 total akun cocok: ' || case when (j->'users'->>'total')::int = (select count(*) from public.profiles) then 'LULUS' else 'GAGAL' end from hasil_admin;
select 'T54 pro + trial + free = total: ' || case when (j->'users'->>'pro')::int + (j->'users'->>'trial')::int + (j->'users'->>'free')::int = (j->'users'->>'total')::int then 'LULUS' else 'GAGAL' end from hasil_admin;
select 'T55 status sama dengan has_pro_access: ' || case when (j->'users'->>'pro')::int + (j->'users'->>'trial')::int = (select count(*) from public.profiles p where public.has_pro_access(p.id)) then 'LULUS' else 'GAGAL' end from hasil_admin;
select 'T56 Pro habis <= 7 hari terhitung (lain@x.com): ' || case when (j->'users'->>'pro_ending_7d')::int >= 1 and (j->'users'->>'trial_ending_7d')::int >= 1 then 'LULUS' else 'GAGAL' end from hasil_admin;
select 'T57 pemasukan total = jumlah pembayaran lunas: ' || case when (j->'revenue'->>'total')::numeric = (select sum(amount) from public.subscriptions where status='paid') then 'LULUS' else 'GAGAL' end from hasil_admin;
select 'T58 pemasukan bulan ini memuat pembayaran hari ini: ' || case when (j->'revenue'->>'this_month')::numeric >= 49000 then 'LULUS' else 'GAGAL' end from hasil_admin;
select 'T59 grafik 30 hari & 6 bulan: ' || case when jsonb_array_length(j->'signups_daily') = 30 and jsonb_array_length(j->'revenue_monthly') = 6 then 'LULUS' else 'GAGAL' end from hasil_admin;
select 'T60 pendaftar harian = total pendaftar 30 hari: ' || case when (select sum((x->>'n')::int) from jsonb_array_elements(j->'signups_daily') x) = (select count(*) from public.profiles where (created_at at time zone 'Asia/Jakarta')::date > (now() at time zone 'Asia/Jakarta')::date - 30) then 'LULUS' else 'GAGAL' end from hasil_admin;
select 'T61 pemakaian tools per tool cocok: ' || case when jsonb_array_length(j->'tools') = (select count(distinct split_part(key,'-',1)) from public.tool_data) then 'LULUS' else 'GAGAL' end from hasil_admin;
select 'T62 Pajangin: jumlah halaman cocok: ' || case when (j->'pajangin'->>'pages')::int = (select count(*) from public.pages) then 'LULUS' else 'GAGAL' end from hasil_admin;
select 'T63 tidak ada email/data pribadi di hasil: ' || case when j::text not like '%@%' then 'LULUS' else 'GAGAL' end from hasil_admin;

-- ===== Asisten AI: jatah harian (ai_usage) =====
reset role;
select 'T64 ambil jatah pertama (batas 3): sisa 2: ' || case when public.ai_take_quota('22222222-2222-2222-2222-222222222222', 3) = 2 then 'LULUS' else 'GAGAL' end;
select 'T65 ambil jatah kedua & ketiga: sisa 0: ' || case when public.ai_take_quota('22222222-2222-2222-2222-222222222222', 3) = 1 and public.ai_take_quota('22222222-2222-2222-2222-222222222222', 3) = 0 then 'LULUS' else 'GAGAL' end;
select 'T66 jatah habis ditolak (-1), hitungan tidak naik: ' || case when public.ai_take_quota('22222222-2222-2222-2222-222222222222', 3) = -1 and (select count from public.ai_usage where user_id='22222222-2222-2222-2222-222222222222') = 3 then 'LULUS' else 'GAGAL' end;
select public.ai_refund_quota('22222222-2222-2222-2222-222222222222');
select 'T67 jatah dikembalikan saat AI gagal: ' || case when (select count from public.ai_usage where user_id='22222222-2222-2222-2222-222222222222') = 2 then 'LULUS' else 'GAGAL' end;
select 'T68 akun Pro dengan batas lebih besar tetap jalan: ' || case when public.ai_take_quota('11111111-1111-1111-1111-111111111111', 30) = 29 then 'LULUS' else 'GAGAL' end;
select 'T69 jatah dihitung per tanggal WIB: ' || case when (select day from public.ai_usage where user_id='22222222-2222-2222-2222-222222222222') = (now() at time zone 'Asia/Jakarta')::date then 'LULUS' else 'GAGAL' end;
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
do $$ begin
  perform public.ai_take_quota(auth.uid(), 999);
  raise notice 'T70 user panggil ai_take_quota sendiri: GAGAL (lolos)';
exception when insufficient_privilege then raise notice 'T70 user panggil ai_take_quota sendiri: LULUS (ditolak)'; end $$;
do $$ begin
  perform public.ai_refund_quota(auth.uid());
  raise notice 'T71 user panggil ai_refund_quota sendiri: GAGAL (lolos)';
exception when insufficient_privilege then raise notice 'T71 user panggil ai_refund_quota sendiri: LULUS (ditolak)'; end $$;
do $$ begin
  update public.ai_usage set count = 0 where user_id = auth.uid();
  raise notice 'T72 user reset jatah sendiri: GAGAL (lolos)';
exception when insufficient_privilege then raise notice 'T72 user reset jatah sendiri: LULUS (ditolak)'; end $$;
do $$ begin
  insert into public.ai_usage (user_id, day, count) values (auth.uid(), current_date + 1, 0);
  raise notice 'T73 user tambah baris jatah: GAGAL (lolos)';
exception when insufficient_privilege then raise notice 'T73 user tambah baris jatah: LULUS (ditolak)'; end $$;
select 'T74 user lihat jatah sendiri saja: ' || case when count(*) = 1 and bool_and(user_id = auth.uid()) then 'LULUS' else 'GAGAL' end from public.ai_usage;
reset role;
set role anon;
do $$ declare n int; begin
  select count(*) into n from public.ai_usage;
  if n = 0 then raise notice 'T75 pengunjung tidak bisa lihat jatah siapa pun: LULUS (kosong)';
  else raise notice 'T75 pengunjung tidak bisa lihat jatah siapa pun: GAGAL (% baris)', n; end if;
exception when insufficient_privilege then raise notice 'T75 pengunjung tidak bisa lihat jatah siapa pun: LULUS (ditolak)'; end $$;
reset role;

-- ===== Penghitung kunjungan tools (tool_views) =====
reset role;
select public.track_tool_view('ipkin'); select public.track_tool_view('ipkin'); select public.track_tool_view('ipkin');
select public.track_tool_view('kanvasin');
select public.track_tool_view('IPK-in!'); select public.track_tool_view(''); select public.track_tool_view(null);
select 'T76 kunjungan dihitung per tool per hari (ipkin 3): ' || case when (select count from public.tool_views where tool = 'ipkin' and day = (now() at time zone 'Asia/Jakarta')::date) = 3 then 'LULUS' else 'GAGAL' end;
select 'T77 nama tool tidak sah diabaikan: ' || case when (select count(*) from public.tool_views) = 2 then 'LULUS' else 'GAGAL' end;
set role anon;
do $$ begin
  perform public.track_tool_view('ipkin');
  raise notice 'T78 pengunjung panggil track_tool_view langsung: GAGAL (lolos)';
exception when insufficient_privilege then raise notice 'T78 pengunjung panggil track_tool_view langsung: LULUS (ditolak)'; end $$;
do $$ declare n int; begin
  select count(*) into n from public.tool_views;
  if n = 0 then raise notice 'T79 pengunjung baca angka kunjungan: LULUS (kosong)';
  else raise notice 'T79 pengunjung baca angka kunjungan: GAGAL (% baris)', n; end if;
exception when insufficient_privilege then raise notice 'T79 pengunjung baca angka kunjungan: LULUS (ditolak)'; end $$;
reset role;
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
do $$ begin
  perform public.track_tool_view('ipkin');
  raise notice 'T80 user panggil track_tool_view langsung: GAGAL (lolos)';
exception when insufficient_privilege then raise notice 'T80 user panggil track_tool_view langsung: LULUS (ditolak)'; end $$;
do $$ begin
  update public.tool_views set count = 999999;
  raise notice 'T81 user ubah angka kunjungan: GAGAL (lolos)';
exception when insufficient_privilege then raise notice 'T81 user ubah angka kunjungan: LULUS (ditolak)'; end $$;
do $$ begin
  insert into public.tool_views (tool, day, count) values ('palsu', current_date, 500);
  raise notice 'T82 user tambah baris kunjungan: GAGAL (lolos)';
exception when insufficient_privilege then raise notice 'T82 user tambah baris kunjungan: LULUS (ditolak)'; end $$;
reset role;
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
create temp table hasil_admin2 as select public.admin_stats() as j;
reset role;
select 'T83 dashboard: total kunjungan 30 hari = 4: ' || case when (j->'tool_views'->>'total_30d')::int = 4 then 'LULUS' else 'GAGAL' end from hasil_admin2;
select 'T84 dashboard: grafik 30 hari, jumlah harian = total: ' || case when jsonb_array_length(j->'tool_views'->'daily') = 30 and (select sum((x->>'n')::int) from jsonb_array_elements(j->'tool_views'->'daily') x) = 4 then 'LULUS' else 'GAGAL' end from hasil_admin2;
select 'T85 dashboard: ipkin teratas, hari ini 3, 7 hari 3: ' || case when j->'tool_views'->'tools'->0->>'tool' = 'ipkin' and (j->'tool_views'->'tools'->0->>'today')::int = 3 and (j->'tool_views'->'tools'->0->>'d7')::int = 3 then 'LULUS' else 'GAGAL' end from hasil_admin2;
select 'T86 dashboard lama tetap lengkap: ' || case when j ? 'users' and j ? 'revenue' and j ? 'tools' and j ? 'pajangin' and j ? 'signups_daily' then 'LULUS' else 'GAGAL' end from hasil_admin2;
reset role;

-- ===== Social Space (migration 013) =====
insert into auth.users values ('44444444-4444-4444-4444-444444444444','baru@x.com');
insert into public.ss_legacy (email, full_name, headline, city, skills_offer, skills_want, website, instagram)
  values ('baru@x.com', 'Budi Lama', 'Desainer', 'Bandung', array['Desain', ' desain ', 'x', 'Figma'], array['Excel'], 'javascript:alert(1)', 'https://instagram.com/budi'),
         ('tidakada@x.com', 'Orang Lain', '', '', '{}', '{}', '', '');

set role authenticated;
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
insert into public.ss_profiles (user_id, handle, name, skills_offer, skills_want)
  values (auth.uid(), 'umkm-jaya', 'UMKM Jaya', array['Excel'], array['Desain']);
select 'T87 buat profil Social Space sendiri: ' || case when count(*) = 1 then 'LULUS' else 'GAGAL' end from public.ss_profiles where handle = 'umkm-jaya';
do $$ begin
  insert into public.ss_profiles (user_id, handle, name) values ('33333333-3333-3333-3333-333333333333', 'palsu', 'Palsu');
  raise notice 'T88 buat profil atas nama orang lain: GAGAL (lolos)';
exception when insufficient_privilege then raise notice 'T88 buat profil atas nama orang lain: LULUS (ditolak)'; end $$;
do $$ begin
  update public.ss_profiles set hidden = false, from_tukarskill = true where user_id = auth.uid();
  raise notice 'T89 ubah kolom sistem (hidden/from_tukarskill): GAGAL (lolos)';
exception when insufficient_privilege then raise notice 'T89 ubah kolom sistem (hidden/from_tukarskill): LULUS (ditolak)'; end $$;
do $$ begin
  update public.ss_profiles set website = 'javascript:alert(1)' where user_id = auth.uid();
  raise notice 'T90 link javascript: di profil: GAGAL (lolos)';
exception when check_violation then raise notice 'T90 link javascript: di profil: LULUS (ditolak)'; end $$;
insert into public.ss_posts (user_id, offer, want, description)
  select auth.uid(), array['Excel'], array['Desain'], 'Tawaran nomor ' || g from generate_series(1, 10) g;
select 'T91 buat tawaran sendiri: ' || case when count(*) = 10 then 'LULUS' else 'GAGAL' end from public.ss_posts where user_id = auth.uid();
do $$ begin
  insert into public.ss_posts (user_id, offer, want, description) values (auth.uid(), array['Excel'], array['Desain'], 'Tawaran ke sebelas');
  raise notice 'T92 tawaran terbuka ke-11: GAGAL (lolos)';
exception when raise_exception then raise notice 'T92 tawaran terbuka ke-11: LULUS (ditolak)'; end $$;
do $$ begin
  perform public.ss_request_create((select id from public.ss_posts where description = 'Tawaran nomor 1'), 'halo');
  raise notice 'T93 ajak tukar tawaran sendiri: GAGAL (lolos)';
exception when raise_exception then raise notice 'T93 ajak tukar tawaran sendiri: LULUS (ditolak)'; end $$;

reset role;
set role authenticated;
set request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
insert into public.ss_profiles (user_id, handle, name, skills_offer, skills_want)
  values (auth.uid(), 'lain-saja', 'Lain Saja', array['Desain'], array['Excel']);
update public.ss_profiles set name = 'Dibajak' where handle = 'umkm-jaya';
update public.ss_posts set description = 'Dibajak orang lain' where description = 'Tawaran nomor 1';
delete from public.ss_posts where description = 'Tawaran nomor 2';
reset role;
select 'T94 ubah profil orang lain: ' || case when name = 'UMKM Jaya' then 'LULUS (tidak berubah)' else 'GAGAL' end from public.ss_profiles where handle = 'umkm-jaya';
select 'T95 ubah/hapus tawaran orang lain: ' || case when exists (select 1 from public.ss_posts where description = 'Tawaran nomor 1') and exists (select 1 from public.ss_posts where description = 'Tawaran nomor 2') then 'LULUS (tidak berubah)' else 'GAGAL' end;
set role authenticated;
set request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
create temp table ss_req as select public.ss_request_create((select id from public.ss_posts where description = 'Tawaran nomor 1'), 'Mau tukar?') as id;
select 'T96 ajukan permintaan tukar: ' || case when status = 'pending' and owner_id = '22222222-2222-2222-2222-222222222222' then 'LULUS' else 'GAGAL' end from public.ss_requests where id = (select id from ss_req);
do $$ begin
  perform public.ss_request_create((select id from public.ss_posts where description = 'Tawaran nomor 1'), 'lagi');
  raise notice 'T97 permintaan dobel ke tawaran sama: GAGAL (lolos)';
exception when raise_exception then raise notice 'T97 permintaan dobel ke tawaran sama: LULUS (ditolak)'; end $$;
do $$ begin
  insert into public.ss_messages (request_id, sender_id, body) values ((select id from ss_req), auth.uid(), 'halo');
  raise notice 'T98 chat sebelum permintaan diterima: GAGAL (lolos)';
exception when insufficient_privilege then raise notice 'T98 chat sebelum permintaan diterima: LULUS (ditolak)'; end $$;
do $$ begin
  perform public.ss_request_act((select id from ss_req), 'accept');
  raise notice 'T99 peminta menerima permintaannya sendiri: GAGAL (lolos)';
exception when raise_exception then raise notice 'T99 peminta menerima permintaannya sendiri: LULUS (ditolak)'; end $$;
do $$ begin
  insert into public.ss_requests (post_id, requester_id, owner_id, message, status)
    values ((select id from public.ss_posts where description = 'Tawaran nomor 3'), auth.uid(), '22222222-2222-2222-2222-222222222222', 'x', 'accepted');
  raise notice 'T100 buat permintaan langsung (lewati fungsi): GAGAL (lolos)';
exception when insufficient_privilege then raise notice 'T100 buat permintaan langsung (lewati fungsi): LULUS (ditolak)'; end $$;
do $$ begin
  update public.ss_requests set status = 'accepted' where id = (select id from ss_req);
  raise notice 'T100b ubah status permintaan langsung: GAGAL (lolos)';
exception when insufficient_privilege then raise notice 'T100b ubah status permintaan langsung: LULUS (ditolak)'; end $$;

reset role;
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select 'T101 pemilik terima permintaan: ' || case when public.ss_request_act((select id from ss_req), 'accept') = 'accepted' then 'LULUS' else 'GAGAL' end;
insert into public.ss_messages (request_id, sender_id, body) values ((select id from ss_req), auth.uid(), 'Boleh, kapan?');

reset role;
set role authenticated;
set request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
insert into public.ss_messages (request_id, sender_id, body) values ((select id from ss_req), auth.uid(), 'Sabtu ya');
select 'T102 dua pihak bisa chat setelah diterima: ' || case when count(*) = 2 then 'LULUS' else 'GAGAL' end from public.ss_messages where request_id = (select id from ss_req);
do $$ begin
  insert into public.ss_messages (request_id, sender_id, body) values ((select id from ss_req), '22222222-2222-2222-2222-222222222222', 'pesan palsu');
  raise notice 'T103 kirim chat atas nama orang lain: GAGAL (lolos)';
exception when insufficient_privilege then raise notice 'T103 kirim chat atas nama orang lain: LULUS (ditolak)'; end $$;
do $$ begin
  insert into public.ss_reviews (request_id, reviewer_id, reviewee_id, rating) values ((select id from ss_req), auth.uid(), '22222222-2222-2222-2222-222222222222', 5);
  raise notice 'T104 ulasan sebelum selesai: GAGAL (lolos)';
exception when insufficient_privilege then raise notice 'T104 ulasan sebelum selesai: LULUS (ditolak)'; end $$;
select 'T105 tandai selesai: ' || case when public.ss_request_act((select id from ss_req), 'complete') = 'completed' then 'LULUS' else 'GAGAL' end;
insert into public.ss_reviews (request_id, reviewer_id, reviewee_id, rating, comment) values ((select id from ss_req), auth.uid(), '22222222-2222-2222-2222-222222222222', 5, 'Mantap');
select 'T106 ulasan setelah selesai: ' || case when count(*) = 1 then 'LULUS' else 'GAGAL' end from public.ss_reviews where request_id = (select id from ss_req);
do $$ begin
  insert into public.ss_reviews (request_id, reviewer_id, reviewee_id, rating) values ((select id from ss_req), auth.uid(), '22222222-2222-2222-2222-222222222222', 1);
  raise notice 'T107 ulasan dobel: GAGAL (lolos)';
exception when unique_violation then raise notice 'T107 ulasan dobel: LULUS (ditolak)'; end $$;
do $$ begin
  insert into public.ss_reviews (request_id, reviewer_id, reviewee_id, rating) values ((select id from ss_req), '22222222-2222-2222-2222-222222222222', auth.uid(), 5);
  raise notice 'T108 ulasan atas nama orang lain (puji diri sendiri): GAGAL (lolos)';
exception when insufficient_privilege then raise notice 'T108 ulasan atas nama orang lain (puji diri sendiri): LULUS (ditolak)'; end $$;
do $$ begin
  for i in 1..20 loop
    insert into public.ss_messages (request_id, sender_id, body) values ((select id from ss_req), auth.uid(), 'spam ' || i);
  end loop;
  raise notice 'T109 batas kirim chat per menit: GAGAL (lolos)';
exception when raise_exception then raise notice 'T109 batas kirim chat per menit: LULUS (ditolak)'; end $$;
do $$ begin
  for i in 1..11 loop
    insert into public.ss_reports (reporter_id, target_type, target_id, reason)
      values (auth.uid(), 'post', (select id::text from public.ss_posts where description = 'Tawaran nomor 3'), 'spam');
  end loop;
  raise notice 'T110 batas 10 laporan per hari: GAGAL (lolos)';
exception when raise_exception then raise notice 'T110 batas 10 laporan per hari: LULUS (ditolak)'; end $$;
insert into public.ss_reports (reporter_id, target_type, target_id, reason)
  values (auth.uid(), 'post', (select id::text from public.ss_posts where description = 'Tawaran nomor 3'), 'spam');
select 'T111 user biasa baca laporan: ' || case when count(*) = 0 then 'LULUS (kosong)' else 'GAGAL' end from public.ss_reports;
do $$ begin
  perform public.ss_admin_overview();
  raise notice 'T112 user biasa buka ringkasan moderasi: GAGAL (lolos)';
exception when insufficient_privilege then raise notice 'T112 user biasa buka ringkasan moderasi: LULUS (ditolak)'; end $$;
do $$ begin
  perform public.ss_admin_moderate((select id from public.ss_reports limit 1), 'hide');
  raise notice 'T113 user biasa sembunyikan tawaran: GAGAL (lolos)';
exception when insufficient_privilege then raise notice 'T113 user biasa sembunyikan tawaran: LULUS (ditolak)'; end $$;
select 'T114 profil lama milik orang lain tidak terlihat: ' || case when count(*) = 0 then 'LULUS' else 'GAGAL' end from public.ss_legacy_preview();

-- ===== orang ketiga (admin, bukan pihak) =====
reset role;
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select 'T115 orang lain baca chat pasangan: ' || case when count(*) = 0 then 'LULUS (kosong)' else 'GAGAL' end from public.ss_messages;
do $$ begin
  perform public.ss_request_act((select id from public.ss_requests limit 1), 'cancel');
  raise notice 'T116 orang lain ubah permintaan: GAGAL (lolos)';
exception when raise_exception then raise notice 'T116 orang lain ubah permintaan: LULUS (ditolak)'; end $$;
select 'T117 admin buka ringkasan moderasi: ' || case when (j->>'profiles')::int = 2 and (j->>'reports_open')::int = 1 and (j->>'completed')::int = 1 then 'LULUS' else 'GAGAL (' || j::text || ')' end from (select public.ss_admin_overview() as j) x;
select public.ss_admin_moderate((select id from public.ss_reports limit 1), 'hide');
reset role;
select 'T118 admin sembunyikan tawaran yang dilaporkan: ' || case when hidden then 'LULUS' else 'GAGAL' end from public.ss_posts where description = 'Tawaran nomor 3';

-- ===== pengunjung tanpa login =====
set request.jwt.claim.sub = '';
set role anon;
select 'T119 pengunjung lihat profil publik: ' || case when count(*) = 2 then 'LULUS' else 'GAGAL' end from public.ss_profiles;
select 'T120 tawaran disembunyikan tidak terlihat: ' || case when count(*) = 0 then 'LULUS' else 'GAGAL' end from public.ss_posts where description = 'Tawaran nomor 3';
do $$ declare n int; begin
  select count(*) into n from public.ss_requests;
  raise notice 'T121 pengunjung baca permintaan: GAGAL (% baris)', n;
exception when insufficient_privilege then raise notice 'T121 pengunjung baca permintaan: LULUS (ditolak)'; end $$;
do $$ declare n int; begin
  select count(*) into n from public.ss_legacy;
  raise notice 'T122 pengunjung baca arsip TukarSkill: GAGAL (% baris)', n;
exception when insufficient_privilege then raise notice 'T122 pengunjung baca arsip TukarSkill: LULUS (ditolak)'; end $$;

-- ===== pengguna TukarSkill lama mengklaim profilnya =====
reset role;
set role authenticated;
set request.jwt.claim.sub = '44444444-4444-4444-4444-444444444444';
do $$ declare n int; begin
  select count(*) into n from public.ss_legacy;
  raise notice 'T123 user baca arsip TukarSkill langsung: GAGAL (% baris)', n;
exception when insufficient_privilege then raise notice 'T123 user baca arsip TukarSkill langsung: LULUS (ditolak)'; end $$;
select 'T124 pratinjau profil lama sendiri: ' || case when count(*) = 1 and min(full_name) = 'Budi Lama' then 'LULUS' else 'GAGAL' end from public.ss_legacy_preview();
select public.ss_claim_legacy('budi-lama');
select 'T125 klaim profil lama (skill dirapikan, link jahat dibuang): ' || case when from_tukarskill and name = 'Budi Lama' and skills_offer = array['Desain', 'Figma'] and website = '' and instagram = 'https://instagram.com/budi' then 'LULUS' else 'GAGAL' end from public.ss_profiles where handle = 'budi-lama';
do $$ begin
  perform public.ss_claim_legacy('budi-dua');
  raise notice 'T126 klaim dua kali: GAGAL (lolos)';
exception when raise_exception then raise notice 'T126 klaim dua kali: LULUS (ditolak)'; end $$;
reset role;
select 'T127 arsip tercatat sudah diklaim: ' || case when claimed_by = '44444444-4444-4444-4444-444444444444' and claimed_at is not null then 'LULUS' else 'GAGAL' end from public.ss_legacy where email = 'baru@x.com';
select 'T128 arsip orang lain tetap belum diklaim: ' || case when claimed_by is null then 'LULUS' else 'GAGAL' end from public.ss_legacy where email = 'tidakada@x.com';
reset role;

-- ===== Social Space: pasangan tukar tetap saling lihat walau profil tidak publik =====
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
update public.ss_profiles set is_public = false where user_id = auth.uid();
reset role;
set role authenticated;
set request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
select 'T129 pasangan tukar lihat profil tidak publik: ' || case when count(*) = 1 then 'LULUS' else 'GAGAL' end from public.ss_profiles where handle = 'umkm-jaya';
reset role;
set role authenticated;
set request.jwt.claim.sub = '44444444-4444-4444-4444-444444444444';
select 'T130 orang lain tidak lihat profil tidak publik: ' || case when count(*) = 0 then 'LULUS' else 'GAGAL' end from public.ss_profiles where handle = 'umkm-jaya';
select 'T131 orang lain tidak lihat tawaran dari profil tidak publik: ' || case when count(*) = 0 then 'LULUS' else 'GAGAL' end from public.ss_posts where user_id = '22222222-2222-2222-2222-222222222222';
reset role;

-- ===== Social Space tahap 2 (migration 014): tawaran lama, Etalase, Info =====
insert into auth.users values ('55555555-5555-5555-5555-555555555555','dewi@x.com'),
                              ('66666666-6666-6666-6666-666666666666','penjual@x.com');
insert into public.ss_legacy (email, full_name, city, skills_offer, skills_want) values ('dewi@x.com', 'Dewi Lama', 'Yogyakarta', array['Fotografi'], array['Pemasaran']);
insert into public.ss_legacy_posts (legacy_email, owner_name, owner_city, offer, want, description) values
  ('dewi@x.com', 'Dewi Lama', 'Yogyakarta', array['Fotografi'], array['Pemasaran'], 'Foto produk UMKM, tukar dengan ajari pemasaran'),
  ('dewi@x.com', 'Dewi Lama', 'Yogyakarta', array['Edit foto'], array['Excel'], 'Edit foto untuk katalog, tukar dengan Excel'),
  ('tidakada@x.com', 'Orang Lain', '', array['Menulis'], array['Desain'], 'Tawaran lama orang yang belum pindah');
insert into public.ss_legacy_posts (legacy_email, owner_name, offer, want, description, hidden) values
  ('dewi@x.com', 'Dewi Lama', array['Rahasia'], array['Rahasia'], 'Tawaran yang disembunyikan admin', true);

set request.jwt.claim.sub = '';
set role anon;
select 'T132 pengunjung lihat tawaran TukarSkill lama (bukan yang disembunyikan): ' || case when count(*) = 3 then 'LULUS' else 'GAGAL (' || count(*) || ')' end from public.ss_legacy_posts;
do $$ declare e text; begin
  select legacy_email into e from public.ss_legacy_posts limit 1;
  raise notice 'T133 pengunjung baca email pemilik tawaran lama: GAGAL (lolos)';
exception when insufficient_privilege then raise notice 'T133 pengunjung baca email pemilik tawaran lama: LULUS (ditolak)'; end $$;
reset role;

set role authenticated;
set request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
select 'T134 ajak tukar ke tawaran lama (disimpan): ' || case when public.ss_legacy_interest_create((select id from public.ss_legacy_posts where description like 'Foto produk%'), 'Halo Dewi, mau tukar?') is not null then 'LULUS' else 'GAGAL' end;
do $$ begin
  perform public.ss_legacy_interest_create((select id from public.ss_legacy_posts where description like 'Foto produk%'), 'lagi');
  raise notice 'T135 ajakan dobel ke tawaran lama: GAGAL (lolos)';
exception when raise_exception then raise notice 'T135 ajakan dobel ke tawaran lama: LULUS (ditolak)'; end $$;
do $$ begin
  perform public.ss_legacy_interest_create((select id from public.ss_legacy_posts where description like 'Tawaran yang disembunyikan%'), 'x');
  raise notice 'T136 ajak tukar ke tawaran lama yang disembunyikan: GAGAL (lolos)';
exception when raise_exception then raise notice 'T136 ajak tukar ke tawaran lama yang disembunyikan: LULUS (ditolak)'; end $$;
do $$ begin
  insert into public.ss_legacy_interest (legacy_post_id, requester_id, message)
    values ((select id from public.ss_legacy_posts where description like 'Edit foto%'), auth.uid(), 'langsung');
  raise notice 'T137 simpan ajakan langsung (lewati fungsi): GAGAL (lolos)';
exception when insufficient_privilege then raise notice 'T137 simpan ajakan langsung (lewati fungsi): LULUS (ditolak)'; end $$;
select 'T138 pengirim lihat ajakannya sendiri: ' || case when count(*) = 1 then 'LULUS' else 'GAGAL' end from public.ss_legacy_interest;
reset role;
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select 'T139 orang lain tidak lihat ajakan orang lain: ' || case when count(*) = 0 then 'LULUS' else 'GAGAL' end from public.ss_legacy_interest;
reset role;

set role authenticated;
set request.jwt.claim.sub = '55555555-5555-5555-5555-555555555555';
do $$ begin
  perform public.ss_legacy_interest_create((select id from public.ss_legacy_posts where description like 'Edit foto%'), 'x');
  raise notice 'T140 pemilik lama ajak tukar tawarannya sendiri: GAGAL (lolos)';
exception when raise_exception then raise notice 'T140 pemilik lama ajak tukar tawarannya sendiri: LULUS (ditolak)'; end $$;
select public.ss_claim_legacy('dewi-baru');
select 'T141 klaim memindahkan tawaran lama (2, bukan yang disembunyikan): ' || case when count(*) = 2 and bool_and(status = 'open') then 'LULUS' else 'GAGAL (' || count(*) || ')' end from public.ss_posts where user_id = auth.uid();
select 'T142 ajakan yang menunggu masuk ke Permintaan pemilik: ' || case when count(*) = 1 and min(message) = 'Halo Dewi, mau tukar?' and bool_and(status = 'pending') then 'LULUS' else 'GAGAL' end from public.ss_requests where owner_id = auth.uid();
reset role;
set request.jwt.claim.sub = '';
set role anon;
select 'T143 tawaran lama yang sudah pindah tidak tampil dobel: ' || case when count(*) = 1 then 'LULUS' else 'GAGAL (' || count(*) || ')' end from public.ss_legacy_posts;
reset role;
select 'T144 ajakan yang sudah dipindah dibersihkan: ' || case when count(*) = 0 then 'LULUS' else 'GAGAL' end from public.ss_legacy_interest;

-- Etalase
set role authenticated;
set request.jwt.claim.sub = '66666666-6666-6666-6666-666666666666';
insert into public.pages (user_id, slug, product_name, whatsapp_number, kind, price_unit, promo_price, show_in_social)
  values (auth.uid(), 'jasa-desain', 'Jasa Desain Logo', '628', 'jasa', '/proyek', 150000, true),
         (auth.uid(), 'kelas-canva', 'Kelas Canva', '628', 'lainnya', '', null, true);
update public.pages set show_in_social = false where slug = 'kelas-canva';
do $$ begin
  update public.pages set social_hidden = false where slug = 'jasa-desain';
  raise notice 'T145 penjual ubah kolom sistem social_hidden: GAGAL (lolos)';
exception when insufficient_privilege then raise notice 'T145 penjual ubah kolom sistem social_hidden: LULUS (ditolak)'; end $$;
reset role;
set role authenticated;
set request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
update public.pages set show_in_social = true where slug = 'kelas-canva';
reset role;
select 'T146 orang lain ubah tombol Etalase halaman orang: ' || case when not show_in_social then 'LULUS (tidak berubah)' else 'GAGAL' end from public.pages where slug = 'kelas-canva';
set request.jwt.claim.sub = '';
set role anon;
select 'T147 Etalase hanya halaman yang diaktifkan (jasa, harga, satuan): ' || case when count(*) = 1 and min(kind) = 'jasa' and min(price_unit) = '/proyek' and min(product_name) = 'Jasa Desain Logo' then 'LULUS' else 'GAGAL (' || count(*) || ')' end from public.ss_etalase();
select 'T148 Etalase tidak membocorkan email atau WhatsApp: ' || case when not exists (select 1 from public.ss_etalase() e where e::text like '%@%' or e::text like '%628%') then 'LULUS' else 'GAGAL' end;
reset role;
set role authenticated;
set request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
insert into public.ss_reports (reporter_id, target_type, target_id, reason)
  values (auth.uid(), 'page', (select id::text from public.pages where slug = 'jasa-desain'), 'penipuan');
reset role;
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select public.ss_admin_moderate((select id from public.ss_reports where target_type = 'page'), 'hide');
reset role;
set role anon;
select 'T149 halaman yang dilaporkan hilang dari Etalase (halaman Pajangin tetap aktif): ' || case when (select count(*) from public.ss_etalase()) = 0 and (select status from public.pages where slug = 'jasa-desain') = 'active' then 'LULUS' else 'GAGAL' end;
reset role;

-- Info Beasiswa, Magang & Lowongan
set role authenticated;
set request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
do $$ begin
  insert into public.ss_info (author_id, category, title, description, deadline)
    values (auth.uid(), 'beasiswa', 'Beasiswa palsu', 'Tanpa izin admin sama sekali', current_date + 10);
  raise notice 'T150 pasang info tanpa izin: GAGAL (lolos)';
exception when insufficient_privilege then raise notice 'T150 pasang info tanpa izin: LULUS (ditolak)'; end $$;
do $$ begin
  perform public.ss_admin_set_info_access('lain-saja', true);
  raise notice 'T151 user biasa beri izin info ke dirinya: GAGAL (lolos)';
exception when insufficient_privilege then raise notice 'T151 user biasa beri izin info ke dirinya: LULUS (ditolak)'; end $$;
do $$ begin
  update public.ss_profiles set can_post_info = true where user_id = auth.uid();
  raise notice 'T152 user ubah kolom izin info sendiri: GAGAL (lolos)';
exception when insufficient_privilege then raise notice 'T152 user ubah kolom izin info sendiri: LULUS (ditolak)'; end $$;
reset role;
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select 'T153 admin beri izin info: ' || case when public.ss_admin_set_info_access('lain-saja', true) then 'LULUS' else 'GAGAL' end;
reset role;
set role authenticated;
set request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
insert into public.ss_info (author_id, category, title, organizer, description, link, deadline)
  values (auth.uid(), 'beasiswa', 'Beasiswa Turkiye Burslari', 'Pemerintah Turki', 'Beasiswa penuh S1 sampai S3 di Turki', 'https://turkiyeburslari.gov.tr', current_date + 30),
         (auth.uid(), 'lowongan', 'Lowongan yang sudah lewat', '', 'Contoh info yang tenggatnya sudah lewat', '', current_date - 1);
select 'T154 akun berizin pasang info: ' || case when count(*) = 2 then 'LULUS' else 'GAGAL' end from public.ss_info where author_id = auth.uid();
do $$ begin
  insert into public.ss_info (author_id, category, title, description, link, deadline)
    values (auth.uid(), 'magang', 'Magang link jahat', 'Link javascript harus ditolak', 'javascript:alert(1)', current_date + 5);
  raise notice 'T155 info dengan link javascript: GAGAL (lolos)';
exception when check_violation then raise notice 'T155 info dengan link javascript: LULUS (ditolak)'; end $$;
reset role;
set request.jwt.claim.sub = '';
set role anon;
select 'T156 info lewat tenggat otomatis tersembunyi: ' || case when count(*) = 1 and min(title) = 'Beasiswa Turkiye Burslari' then 'LULUS' else 'GAGAL (' || count(*) || ')' end from public.ss_info;
do $$ begin
  insert into public.ss_info (author_id, category, title, description, deadline)
    values ('33333333-3333-3333-3333-333333333333', 'beasiswa', 'Info dari pengunjung', 'Pengunjung tanpa login', current_date + 3);
  raise notice 'T157 pengunjung pasang info: GAGAL (lolos)';
exception when insufficient_privilege then raise notice 'T157 pengunjung pasang info: LULUS (ditolak)'; end $$;
reset role;
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
update public.ss_info set title = 'Dibajak orang lain' where title = 'Beasiswa Turkiye Burslari';
delete from public.ss_info where title = 'Beasiswa Turkiye Burslari';
reset role;
select 'T158 orang lain ubah/hapus info: ' || case when exists (select 1 from public.ss_info where title = 'Beasiswa Turkiye Burslari') then 'LULUS (tidak berubah)' else 'GAGAL' end;
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select 'T159 ringkasan moderasi berisi data tahap 2: ' || case when j ? 'etalase' and j ? 'info_active' and j ? 'legacy_posts_waiting' and (j->'info_authors') ? 'lain-saja' then 'LULUS' else 'GAGAL (' || j::text || ')' end from (select public.ss_admin_overview() as j) x;
reset role;
