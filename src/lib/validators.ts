import { SLUG_BLOCKLIST } from "./constants";

// Ubah teks bebas (nama produk) jadi slug URL-safe.
// Contoh: "Kopi Susu Gula Aren!!" -> "kopi-susu-gula-aren"
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
}

// Slug cuma boleh huruf kecil, angka, dan tanda hubung.
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function isValidSlugFormat(slug: string): boolean {
  return SLUG_PATTERN.test(slug) && slug.length >= 3 && slug.length <= 40;
}

export function isSlugBlocked(slug: string): boolean {
  return SLUG_BLOCKLIST.includes(slug.toLowerCase());
}

// Saran alternatif kalau slug bentrok, misal "cireng-enak" -> "cireng-enak-2"
export function suggestSlugAlternative(slug: string, attempt: number): string {
  return `${slug}-${attempt + 1}`;
}

// Validasi nomor WhatsApp Indonesia: dimulai 08 atau +62/62,
// panjang wajar, cuma angka.
const WA_PATTERN = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;

export function isValidWhatsAppNumber(number: string): boolean {
  const cleaned = number.replace(/[\s-]/g, "");
  return WA_PATTERN.test(cleaned);
}

// Ubah ke format internasional (62...) buat dipakai di link wa.me
export function toWhatsAppLink(number: string, message: string): string {
  const cleaned = number.replace(/[\s-]/g, "");
  const international = cleaned.startsWith("0")
    ? "62" + cleaned.slice(1)
    : cleaned.startsWith("+")
    ? cleaned.slice(1)
    : cleaned;
  return `https://wa.me/${international}?text=${encodeURIComponent(message)}`;
}

// Tujuan redirect setelah login (?next=...). Cuma boleh alamat di
// founderku.com sendiri (diawali "/" tapi bukan "//" atau "/\"),
// biar link login gak bisa disalahgunakan buat ngelempar orang ke
// situs penipuan.
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return "/akun";
  }
  return next;
}
