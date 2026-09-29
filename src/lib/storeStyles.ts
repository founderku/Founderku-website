import type { StoreStyleId } from "./types";

// Satu-satunya definisi style toko Pajangin. Tampilan warnanya ada di
// src/components/etalase/etalase.module.css (dipilih lewat data-pj),
// dan dipakai persis sama di: halaman produk (/l), halaman toko (/toko),
// preview di editor, dan halaman pilih style. Jadi yang dilihat penjual
// saat memilih = yang dilihat pembeli.

// Susunan bagian atas halaman produk:
// card    = judul di pita warna, foto dalam kartu mengambang
// cover   = foto penuh jadi latar, judul besar di atas foto
// split   = foto dan info berdampingan (di layar lebar)
// arch    = foto berbingkai lengkung ala butik
// sticker = foto berbingkai tebal, harga seperti stiker miring
export type HeroKind = "card" | "cover" | "split" | "arch" | "sticker";

export interface StylePreset {
  id: StoreStyleId;
  label: string;
  blurb: string;
  cocokUntuk: string;
  hero: HeroKind;
  // Tanda di depan setiap keunggulan produk
  mark: "check" | "number" | "spark" | "arrow" | "leaf";
  // 3 warna utama buat contoh warna di halaman pilih style
  swatch: [string, string, string];
  isNew?: boolean;
}

export const STORE_STYLES: Record<StoreStyleId, StylePreset> = {
  klasik: {
    id: "klasik",
    label: "Klasik",
    blurb: "Ciri khas Pajangin: pita gelap, kartu mengambang, tombol amber.",
    cocokUntuk: "Aman untuk hampir semua jenis jualan",
    hero: "card",
    mark: "check",
    swatch: ["#14131f", "#f2a623", "#e15c3e"],
  },
  hangat: {
    id: "hangat",
    label: "Hangat",
    blurb: "Foto penuh layar, huruf serif, nuansa kafe yang akrab.",
    cocokUntuk: "Makanan, minuman, kuliner rumahan",
    hero: "cover",
    mark: "number",
    swatch: ["#f5eee3", "#8b5a2b", "#3e2a1e"],
  },
  minimalis: {
    id: "minimalis",
    label: "Minimalis",
    blurb: "Bersih dan lapang, hijau sage, foto dan info berdampingan.",
    cocokUntuk: "Skincare, homeware, produk perawatan",
    hero: "split",
    mark: "check",
    swatch: ["#ffffff", "#5c7a5c", "#1f291f"],
  },
  elegan: {
    id: "elegan",
    label: "Elegan",
    blurb: "Bingkai foto lengkung ala butik, serif miring, warna mauve.",
    cocokUntuk: "Fashion, hijab, aksesoris, kosmetik",
    hero: "arch",
    mark: "spark",
    swatch: ["#fbf3f1", "#9c6b7a", "#5c3a45"],
  },
  bold: {
    id: "bold",
    label: "Bold",
    blurb: "Hitam putih kontras, huruf raksasa, pita berjalan.",
    cocokUntuk: "Streetwear, sneakers, produk statement",
    hero: "cover",
    mark: "arrow",
    swatch: ["#000000", "#ffffff", "#d7ff3a"],
  },
  ceria: {
    id: "ceria",
    label: "Ceria",
    blurb: "Kuning cerah, garis tebal, harga seperti stiker. Susah dilewatkan.",
    cocokUntuk: "Jajanan, snack, mainan, produk anak muda",
    hero: "sticker",
    mark: "spark",
    swatch: ["#ffe45c", "#ff5c8a", "#111111"],
    isNew: true,
  },
  neon: {
    id: "neon",
    label: "Neon",
    blurb: "Gelap dengan cahaya ungu biru, kesan modern dan digital.",
    cocokUntuk: "Jasa digital, kursus, gadget, gaming",
    hero: "card",
    mark: "arrow",
    swatch: ["#0b0b1e", "#8b5cf6", "#22d3ee"],
    isNew: true,
  },
  segar: {
    id: "segar",
    label: "Segar",
    blurb: "Hijau mint dan lime, bentuk membulat, terasa sehat dan ringan.",
    cocokUntuk: "Makanan sehat, tanaman, laundry, jasa rumah",
    hero: "split",
    mark: "leaf",
    swatch: ["#effbf3", "#16a34a", "#bef264"],
    isNew: true,
  },
};

export const STORE_STYLE_LIST = Object.values(STORE_STYLES);

export function styleOf(id: string | null | undefined): StylePreset {
  return STORE_STYLES[(id ?? "klasik") as StoreStyleId] ?? STORE_STYLES.klasik;
}

// "dapur-bu-sari" jadi "Dapur Bu Sari" buat judul halaman toko
export function storeTitle(slug: string | null | undefined): string {
  if (!slug) return "";
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
