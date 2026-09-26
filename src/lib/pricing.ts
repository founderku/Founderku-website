// Harga Founderku Pro dibaca dari public/data/pricing.json, file yang
// diubah lewat admin panel (tab "harga"). Tiap kali file itu disimpan,
// Vercel deploy ulang, jadi angka di sini selalu ikut yang terbaru.
//
// Server SELALU ambil nominal dari sini (bukan dari browser), jadi
// pembeli gak bisa ngakalin harga waktu bikin tagihan.
import pricingData from "../../public/data/pricing.json";

export type Lang = "id" | "en" | "tr";
export type LocalizedText = Record<Lang, string>;

export interface PriceOption {
  id: string;
  label: LocalizedText;
  amount: number;
  days: number;
  note?: LocalizedText;
}

export interface PricingConfig {
  planName: string;
  trialDays: number;
  description: LocalizedText;
  features: LocalizedText[];
  prices: PriceOption[];
}

export const PRICING = pricingData as PricingConfig;

export function getPriceOption(id: string): PriceOption | undefined {
  return PRICING.prices.find(
    (p) => p.id === id && Number.isFinite(p.amount) && p.amount > 0 && p.days > 0
  );
}

export function formatRupiah(amount: number): string {
  return "Rp " + amount.toLocaleString("id-ID");
}

// "/bulan", "/tahun", atau "/30 hari" buat periode lain
export function periodSuffix(days: number): string {
  if (days === 30 || days === 31) return "/bulan";
  if (days === 365 || days === 366) return "/tahun";
  return `/${days} hari`;
}
