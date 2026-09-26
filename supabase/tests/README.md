# Tes keamanan database

`security-test.sql` mengetes aturan akses di `supabase/schema.sql`:
user tidak bisa menjadikan dirinya Pro/admin, batas 2 halaman akun Free,
trial sekali seumur akun, pembayaran dobel tidak dihitung dua kali,
dan lain-lain. Setiap baris hasil berisi LULUS, GAGAL, atau DILEWATI.

JANGAN dijalankan di project Supabase asli (tes ini bikin data palsu).
Jalankan di Postgres lokal:

```
createdb founderku_test
psql -d founderku_test -f supabase/tests/supabase-mock.sql   # tiruan Supabase
psql -d founderku_test -f supabase/schema.sql
psql -d founderku_test -f supabase/tests/security-test.sql
```

`supabase-mock.sql` cuma tiruan minimal (peran anon/authenticated/
service_role dan fungsi auth.uid()) supaya skema bisa dites tanpa
Supabase beneran.
