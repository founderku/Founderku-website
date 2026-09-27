// Valuasiin: perkiraan valuasi pre-money startup tahap awal dengan tiga
// metode umum. Hasilnya kisaran untuk bahan negosiasi, bukan angka pasti.

export const BERKUS = [
  "Ide yang kuat (nilai dasar)",
  "Prototipe / teknologi",
  "Kualitas tim",
  "Hubungan strategis / kemitraan",
  "Peluncuran produk / penjualan awal",
];

export const SCORECARD = [
  { nama: "Kekuatan tim", bobot: 30 },
  { nama: "Ukuran peluang pasar", bobot: 25 },
  { nama: "Produk / teknologi", bobot: 15 },
  { nama: "Lingkungan kompetisi", bobot: 10 },
  { nama: "Pemasaran dan saluran penjualan", bobot: 10 },
  { nama: "Kebutuhan dana tambahan", bobot: 5 },
  { nama: "Faktor lain", bobot: 5 },
];

export interface InputValuasi {
  berkusMaks: number; // nilai maksimal per faktor
  berkus: number[]; // 0-100 (% dari maksimal)
  dasarScorecard: number; // rata-rata valuasi pre-money startup sejenis
  scorecard: number[]; // 50-150 (% dibanding rata-rata)
  pendapatanTahunan: number;
  kelipatan: number;
}

export function nilaiBerkus(i: InputValuasi): number | null {
  const isi = i.berkus.some((x) => x > 0);
  if (!isi || !(i.berkusMaks > 0)) return null;
  return i.berkus.reduce((a, x) => a + (i.berkusMaks * Math.max(0, Math.min(100, x || 0))) / 100, 0);
}

export function nilaiScorecard(i: InputValuasi): number | null {
  if (!(i.dasarScorecard > 0)) return null;
  const faktor = SCORECARD.reduce((a, f, k) => a + (f.bobot / 100) * ((i.scorecard[k] || 100) / 100), 0);
  return i.dasarScorecard * faktor;
}

export function nilaiKelipatan(i: InputValuasi): number | null {
  if (!(i.pendapatanTahunan > 0) || !(i.kelipatan > 0)) return null;
  return i.pendapatanTahunan * i.kelipatan;
}

export function ringkasValuasi(i: InputValuasi) {
  const hasil = [
    { id: "berkus", nama: "Berkus", nilai: nilaiBerkus(i) },
    { id: "scorecard", nama: "Scorecard", nilai: nilaiScorecard(i) },
    { id: "kelipatan", nama: "Kelipatan pendapatan", nilai: nilaiKelipatan(i) },
  ];
  const ada = hasil.map((h) => h.nilai).filter((x): x is number => x !== null);
  return {
    hasil,
    min: ada.length ? Math.min(...ada) : null,
    maks: ada.length ? Math.max(...ada) : null,
    rata: ada.length ? ada.reduce((a, b) => a + b, 0) / ada.length : null,
  };
}
