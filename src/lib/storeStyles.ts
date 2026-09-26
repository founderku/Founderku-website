import type { StoreStyleId } from "./types";

export interface StylePreset {
  id: StoreStyleId;
  label: string;
  blurb: string;
  cocokUntuk: string;
  // Kelas Tailwind per elemen. Ditulis lengkap (bukan digabung string
  // dinamis) supaya kedeteksi sama Tailwind JIT scanner.
  card: string;
  photoWrap: string;
  eyebrow: string;
  name: string;
  tagline: string;
  priceOld: string;
  priceNew: string;
  divider: string;
  highlightCheck: string;
  cta: string;
  watermark: string;
  swatch: string; // buat preview kecil di halaman pilih style
}

export const STORE_STYLES: Record<StoreStyleId, StylePreset> = {
  klasik: {
    id: "klasik",
    label: "Klasik",
    blurb: "Gaya asli Pajangin - amber & coral, hangat dan ramah.",
    cocokUntuk: "Cocok buat hampir semua jenis produk",
    card: "bg-white rounded-[28px]",
    photoWrap: "rounded-t-[28px]",
    eyebrow: "hidden",
    name: "font-manrope font-extrabold text-xl tracking-tight text-ink",
    tagline: "text-sm text-text-soft",
    priceOld: "text-sm text-text-faint line-through",
    priceNew: "font-manrope font-extrabold text-xl text-coral",
    divider: "border-border",
    highlightCheck: "text-indigo",
    cta: "glass-amber text-ink font-manrope font-extrabold rounded-2xl",
    watermark: "bg-ink/50 text-white",
    swatch: "bg-gradient-to-br from-amber to-coral",
  },
  hangat: {
    id: "hangat",
    label: "Hangat",
    blurb: "Nuansa cafe/resto - krem hangat, editorial, akrab.",
    cocokUntuk: "Cocok buat makanan, minuman, kuliner rumahan",
    card: "bg-[#F5EEE3] rounded-2xl",
    photoWrap: "rounded-t-2xl",
    eyebrow:
      "font-manrope font-bold text-[10px] uppercase tracking-[0.15em] text-[#8B5A2B]",
    name: "font-manrope font-bold text-xl tracking-tight text-[#3E2A1E]",
    tagline: "text-sm text-[#6B5744]",
    priceOld: "text-sm text-[#A6947F] line-through",
    priceNew: "font-manrope font-extrabold text-xl text-[#8B5A2B]",
    divider: "border-[#E4D8C6]",
    highlightCheck: "text-[#8B5A2B]",
    cta: "bg-[#3E2A1E] text-white font-manrope font-bold rounded-lg",
    watermark: "bg-[#3E2A1E]/60 text-white",
    swatch: "bg-gradient-to-br from-[#F5EEE3] to-[#8B5A2B]",
  },
  minimalis: {
    id: "minimalis",
    label: "Minimalis",
    blurb: "Bersih dan tenang - sage green, banyak white space.",
    cocokUntuk: "Cocok buat skincare, produk perawatan, homeware",
    card: "bg-white shadow-[0_2px_16px_rgba(92,122,92,0.08)] rounded-xl",
    photoWrap: "rounded-t-xl",
    eyebrow:
      "font-manrope font-bold text-[10px] uppercase tracking-[0.15em] text-[#5C7A5C]",
    name: "font-manrope font-semibold text-lg tracking-tight text-ink",
    tagline: "text-sm text-text-soft",
    priceOld: "text-sm text-text-faint line-through",
    priceNew: "font-manrope font-bold text-lg text-ink",
    divider: "border-[#E4E8E1]",
    highlightCheck: "text-[#5C7A5C]",
    cta: "bg-[#5C7A5C] text-white font-manrope font-semibold rounded-md",
    watermark: "bg-[#5C7A5C]/70 text-white",
    swatch: "bg-gradient-to-br from-[#EFEDE3] to-[#5C7A5C]",
  },
  elegan: {
    id: "elegan",
    label: "Elegan",
    blurb: "Lembut dan feminin - pastel mauve, tombol pil.",
    cocokUntuk: "Cocok buat fashion, hijab, aksesoris, kosmetik",
    card: "bg-[#FBF3F1] rounded-[28px]",
    photoWrap: "rounded-t-[28px]",
    eyebrow:
      "font-manrope font-semibold text-[10px] uppercase tracking-[0.2em] text-[#9C6B7A]",
    name: "font-manrope font-semibold text-xl tracking-tight text-[#5C3A45]",
    tagline: "text-sm text-[#8A6670]",
    priceOld: "text-sm text-[#C9AAB2] line-through",
    priceNew: "font-manrope font-bold text-xl text-[#9C6B7A]",
    divider: "border-[#EAD7DC]",
    highlightCheck: "text-[#9C6B7A]",
    cta: "bg-[#9C6B7A] text-white font-manrope font-semibold rounded-full",
    watermark: "bg-[#5C3A45]/55 text-white",
    swatch: "bg-gradient-to-br from-[#FBF3F1] to-[#9C6B7A]",
  },
  bold: {
    id: "bold",
    label: "Bold",
    blurb: "Kontras tinggi hitam-putih - berani, editorial, fashion.",
    cocokUntuk: "Cocok buat streetwear, sneakers, produk statement",
    card: "bg-black rounded-none",
    photoWrap: "rounded-none",
    eyebrow:
      "font-manrope font-extrabold text-[10px] uppercase tracking-[0.2em] text-white/60",
    name: "font-manrope font-extrabold text-xl uppercase tracking-tight text-white",
    tagline: "text-sm text-white/60",
    priceOld: "text-sm text-white/40 line-through",
    priceNew: "font-manrope font-extrabold text-xl text-white",
    divider: "border-white/15",
    highlightCheck: "text-white",
    cta: "bg-white text-black font-manrope font-extrabold uppercase tracking-wide rounded-none",
    watermark: "bg-white/15 text-white",
    swatch: "bg-gradient-to-br from-black to-neutral-600",
  },
};

export const STORE_STYLE_LIST = Object.values(STORE_STYLES);
