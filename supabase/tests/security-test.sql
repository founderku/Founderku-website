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
do $$ begin
  insert into public.tool_data (user_id, key, value) values (auth.uid(), 'rahasia-lain', '{}');
  raise notice 'T42 kunci di luar 5 tools ditolak: GAGAL';
exception when check_violation then raise notice 'T42 kunci di luar 5 tools ditolak: LULUS'; end $$;
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
