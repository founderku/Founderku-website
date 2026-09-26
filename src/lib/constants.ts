// Kata-kata yang tidak boleh dipakai sebagai slug halaman.
// Daftar ini harus SAMA dengan isi tabel slug_blocklist di Supabase
// (lihat supabase/schema.sql). Dicek dua kali: di form (cepat, tanpa
// perlu tunggu server) dan di database (final, tidak bisa dilewati).
export const SLUG_BLOCKLIST = [
  "admin", "api", "dashboard", "login", "register",
  "founderku", "www", "app", "assets", "static",
  "settings", "billing", "support", "help", "terms",
  "privacy", "l", "pajangin", "pro", "free", "webhook",
  "masuk", "daftar", "akun", "harga", "katalog", "tools",
  "toko", "moderasi", "privasi", "syarat", "founterns",
  "notain", "pajakin", "kontrakin", "jalanin", "sehatin",
];

// maxPages Free harus sama dengan angka 2 di fungsi enforce_page_limit
// (supabase/schema.sql). "pro" berlaku juga selama masa trial.
export const TIER_LIMITS = {
  free: {
    maxPages: 2,
    watermark: true,
  },
  pro: {
    maxPages: Infinity,
    watermark: false,
  },
} as const;

export const MAX_PHOTO_SIZE_MB = 2;
export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png"];
