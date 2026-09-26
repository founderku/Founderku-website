@AGENTS.md

# Catatan proyek Founderku

- Pemilik: Andi (solo founder, bukan developer). Jelaskan istilah teknis
  dengan bahasa awam tapi akurat.
- JANGAN pernah pakai em dash atau en dash di teks mana pun (kode,
  komentar, UI, commit). Pakai tanda hubung biasa "-" atau susun ulang
  kalimat.
- Validasi dulu sebelum bilang selesai: `npx tsc --noEmit`, `npm run lint`,
  `npm run build`, dan tes SQL di `supabase/tests/` kalau skema berubah.
- Situs statis ada di `public/` dan diedit lewat `public/admin.html`
  (GitHub Contents API, semua path diawali `public/`).
- Harga: `public/data/pricing.json` adalah satu-satunya sumber harga.
  Jangan tulis nominal harga langsung di kode.
- Akses Pro = `trial_ends_at` atau `pro_expires_at` masih di masa depan
  (fungsi `has_pro_access` di database, `getAccessStatus` di
  `src/lib/access.ts`). Keduanya harus tetap sama aturannya.
- Kolom sensitif (trial, Pro, admin, status halaman) sengaja tidak bisa
  diubah dari browser. Perubahan lewat fungsi database atau server
  (service_role).
