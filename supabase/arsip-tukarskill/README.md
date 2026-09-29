# Arsip TukarSkill ke Social Space

Hosting TukarSkill (Hostinger) akan habis. Social Space di Founderku
menggantikan TukarSkill. Folder ini berisi alat untuk memindahkan profil
pengguna lama supaya mereka bisa melanjutkan di Founderku.

## Cara kerja pindahan (opt-in, atas persetujuan pengguna)

1. Profil lama diekspor ke tabel `ss_legacy` di Supabase. Tabel ini tidak
   bisa dibaca dari browser sama sekali.
2. Pengguna lama daftar atau masuk ke Founderku dengan email yang sama.
3. Di halaman `/social-space` muncul kartu "Profil TukarSkill lamamu
   ditemukan". Kalau dia klik "Pindahkan profil", nama, bio, kota, skill,
   dan tautannya disalin ke profil Social Space (fungsi `ss_claim_legacy`).
4. Kata sandi lama TIDAK dipindahkan. Akun Founderku memakai login
   Founderku sendiri.

Yang tidak dipindahkan: kata sandi, nomor HP, saldo/poin, chat lama,
postingan barter lama, file unggahan. File unggahan cukup diarsipkan
(langkah B di bawah).

## Langkah di server TukarSkill (lewat SSH)

Masuk SSH seperti biasa, lalu:

```
cd ~/domains/tukarskill.com/talenthra
```

### A. Ekspor profil pengguna

1. Buat file skrip: salin isi `export-ss-legacy.php` ke server dengan
   nama yang sama di folder di atas (lewat File Manager Hostinger:
   New File, tempel isinya, Save).
2. Jalankan:

   ```
   php export-ss-legacy.php > ~/ss_legacy_import.sql
   ```

   Muncul tulisan `Selesai: N profil diekspor.`
3. Hapus skripnya dari server: `rm export-ss-legacy.php`
4. Unduh `ss_legacy_import.sql` dari File Manager (folder paling atas /
   home). File ini berisi email pengguna: simpan pribadi, jangan dikirim
   ke chat mana pun.

### B. Arsipkan file unggahan (foto profil, CV, lampiran chat)

```
tar czf ~/tukarskill-files.tar.gz storage/app/public
ls -lh ~/tukarskill-files.tar.gz
```

Unduh `tukarskill-files.tar.gz` lewat File Manager dan simpan bersama
backup database `.sql` yang sudah diunduh sebelumnya.

## Langkah di Supabase

1. Pastikan migration 013 (`supabase/migration-013-social-space.sql`)
   sudah dijalankan.
2. SQL Editor > New query > tempel isi `ss_legacy_import.sql` > Run.
   Aman dijalankan ulang (email yang sudah ada dilewati).
3. Cek: `select count(*) from public.ss_legacy;` harus sama dengan angka
   N dari langkah A.
