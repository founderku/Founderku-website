// Unitin: unit ekonomi startup. Berapa biaya dapat 1 pelanggan (CAC),
// berapa nilai 1 pelanggan selama jadi pelanggan (LTV), dan berapa bulan
// biaya akuisisi itu balik (payback).

export type Mode = "langganan" | "transaksi";

export interface InputUnit {
  mode: Mode;
  harga: number; // langganan: per bulan; transaksi: nilai rata-rata sekali beli
  frekuensi: number; // transaksi: berapa kali beli per bulan
  margin: number; // % margin kotor
  churn: number; // langganan: % pelanggan berhenti per bulan
  lamaBulan: number; // transaksi: rata-rata berapa bulan pelanggan bertahan
  biayaMarketing: number; // per bulan
  biayaSales: number; // per bulan
  pelangganBaru: number; // per bulan
}

export interface HasilUnit {
  arpu: number; // pendapatan per pelanggan per bulan
  kontribusi: number; // laba kotor per pelanggan per bulan
  cac: number | null;
  umurBulan: number | null;
  ltv: number | null;
  rasio: number | null;
  payback: number | null;
  cacMaksSehat: number | null; // CAC maksimal supaya LTV:CAC = 3
}

// Umur pelanggan dibatasi 5 tahun supaya churn yang sangat kecil tidak
// membuat LTV tak terhingga.
export const UMUR_MAKS = 60;

export function hitungUnit(i: InputUnit): HasilUnit {
  const arpu = i.mode === "langganan" ? i.harga || 0 : (i.harga || 0) * (i.frekuensi || 0);
  const kontribusi = arpu * ((i.margin || 0) / 100);
  const biaya = (i.biayaMarketing || 0) + (i.biayaSales || 0);
  const cac = i.pelangganBaru > 0 ? biaya / i.pelangganBaru : null;
  let umurBulan: number | null;
  if (i.mode === "langganan") umurBulan = i.churn > 0 ? Math.min(UMUR_MAKS, 100 / i.churn) : null;
  else umurBulan = i.lamaBulan > 0 ? Math.min(UMUR_MAKS, i.lamaBulan) : null;
  const ltv = umurBulan !== null ? kontribusi * umurBulan : null;
  const rasio = ltv !== null && cac !== null && cac > 0 ? ltv / cac : null;
  const payback = cac !== null && kontribusi > 0 ? cac / kontribusi : null;
  const cacMaksSehat = ltv !== null ? ltv / 3 : null;
  return { arpu, kontribusi, cac, umurBulan, ltv, rasio, payback, cacMaksSehat };
}
