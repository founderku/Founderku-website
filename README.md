# Founderku (founderku.com)

Satu aplikasi buat semua: situs Founderku, akun terpusat, langganan
Founderku Pro (dengan trial), dan tools (mulai dari Pajangin).

- Situs lama (beranda, tools, katalog, store, blog, admin) tetap berupa
  file HTML di folder `public/`, dan tetap diedit lewat `admin.html`.
- Bagian yang butuh login dan pembayaran dibuat dengan Next.js di
  folder `src/`, pakai Supabase (akun + database) dan Xendit (bayar).

## Peta alamat

| Alamat | Isi |
|---|---|
| `/` , `/tools.html`, `/katalog.html`, `/store.html`, `/blog.html` | Situs statis (file di `public/`) |
| `/admin.html` | Admin konten: produk, studi kasus, blog, testimoni, partner, tools, **katalog**, **harga** |
| `/masuk`, `/daftar` | Login dan daftar akun Founderku (email atau Google) |
| `/akun` | Status paket (trial / Pro / Free), daftar tools, riwayat bayar, hapus akun |
| `/harga` | Harga Founderku Pro + tombol bayar (Xendit) |
| `/pajangin` | Landing page Pajangin |
| `/pajangin/dashboard/...` | Dashboard Pajangin (butuh login) |
| `/pajangin/moderasi` | Moderasi halaman Pajangin (khusus admin) |
| `/l/[slug]`, `/toko/[slug]` | Halaman jualan publik Pajangin |

Alamat lama (`/login`, `/register`, `/dashboard`, `/beranda`) otomatis
dialihkan ke alamat baru.

## Aturan paket

- Akun baru otomatis dapat **trial Founderku Pro** sekali seumur akun
  (lama trial diatur di admin panel, tab "harga", default 7 hari). Trial
  mulai saat pertama kali masuk setelah daftar.
- Bayar lewat invoice Xendit per periode (bulanan, tahunan, dst). Tidak
  ada tagihan otomatis.
- Kalau bayar saat trial/Pro masih aktif, masa aktif baru ditambahkan
  setelah tanggal habis yang lama (sisa hari tidak hangus).
- Setelah trial/Pro habis: akun jadi Free. Di Pajangin, Free = 2 halaman
  (dengan watermark). Halaman di atas 2 jadi "terkunci" (tidak tayang),
  bukan dihapus, dan tayang lagi begitu upgrade.
- Harga dan lama trial dibaca server dari `public/data/pricing.json`.
  File ini diubah lewat admin panel. Setelah disimpan, harga baru aktif
  sekitar 1-2 menit kemudian (Vercel deploy ulang).

## Langkah deploy (dikerjakan sekali)

> PENTING: jangan merge branch ini ke `main` sebelum langkah 1 sampai 4
> siap. Selama founderku.com masih dilayani GitHub Pages, merge ke `main`
> bikin situs yang sekarang tampil kosong, karena file HTML-nya sudah
> pindah ke folder `public/`.

1. **Supabase** (project yang sama dengan Pajangin lama)
   - SQL Editor: copy-paste seluruh isi `supabase/schema.sql`, klik Run.
     File ini menghapus tabel lama Pajangin (aman, belum ada pengguna)
     lalu bikin struktur baru.
   - Authentication > URL Configuration:
     - Site URL: `https://founderku.com`
     - Redirect URLs: tambah `https://founderku.com/auth/callback`
       (dan `http://localhost:3000/auth/callback` kalau mau tes lokal)
   - Setelah akun kamu sendiri daftar/login sekali, jadikan admin lewat
     SQL Editor:
     `update public.profiles set is_admin = true where email = 'email-kamu';`
2. **Vercel**
   - Project baru, sambungkan ke repo `founderku/Founderku-website`
     (bukan repo Tokify lagi).
   - Environment Variables (salin dari project Pajangin lama):
     `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
     `SUPABASE_SERVICE_ROLE_KEY`, `XENDIT_SECRET_KEY`,
     `XENDIT_CALLBACK_TOKEN`.
   - Domains: tambah `founderku.com` dan `www.founderku.com`. Vercel akan
     kasih nilai DNS yang harus dipasang.
3. **Xendit**: Settings > Webhooks, ganti URL "Invoice paid" jadi
   `https://founderku.com/api/webhooks/xendit`.
4. **Google OAuth** (Google Cloud Console): tidak perlu diubah, karena
   Google login lewat Supabase. Cukup pastikan langkah 1 (Redirect URLs)
   sudah benar.
5. **Merge ke `main`**, tunggu Vercel selesai deploy.
6. **DNS di Hostinger**: ganti record `founderku.com` dari GitHub Pages
   ke nilai yang diberikan Vercel. Setelah jalan, matikan GitHub Pages
   di Settings repo dan hapus file `CNAME`.
7. **pajangin.founderku.com**: di Vercel project Pajangin lama, ganti
   jadi redirect ke `https://founderku.com/pajangin` (atau hapus
   project-nya kalau tidak dibutuhkan lagi).

## Pengecekan sebelum push (buat developer)

```
npm ci
npx tsc --noEmit
npm run lint
npm run build
```

Tes keamanan database: lihat `supabase/tests/README.md`.

## Yang belum dikerjakan (fase berikutnya)

- Memindahkan 5 tools lain (Notain, Pajakin, Kontrakin, Jalanin,
  Sehatin) ke dalam aplikasi ini (`/tools/...`) dan menguncinya dengan
  Founderku Pro. Sekarang mereka masih di subdomain lama dan gratis.
- Halaman Privasi dan Syarat masih ditulis untuk Pajangin, perlu
  diperluas jadi Founderku secara umum.
- Halaman aplikasi (akun, harga, dashboard) baru bahasa Indonesia.
- Email pengingat sebelum trial/langganan habis.
