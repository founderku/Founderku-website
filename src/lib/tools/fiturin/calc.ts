// Fiturin: prioritas fitur MVP dengan skor RICE.
// RICE = Reach x Impact x Confidence / Effort

export interface Fitur {
  nama: string;
  reach: number; // pengguna terdampak per bulan
  impact: number; // 0.25, 0.5, 1, 2, 3
  confidence: number; // % 50, 80, 100
  effort: number; // orang-minggu
  wajib: boolean; // tanpa ini produk tidak bisa dipakai
}

export const IMPACT = [
  { v: 3, label: "Sangat besar" },
  { v: 2, label: "Besar" },
  { v: 1, label: "Sedang" },
  { v: 0.5, label: "Kecil" },
  { v: 0.25, label: "Sangat kecil" },
];

export const CONFIDENCE = [
  { v: 100, label: "Yakin, ada data" },
  { v: 80, label: "Cukup yakin" },
  { v: 50, label: "Masih tebakan" },
];

export function skorRice(f: Fitur): number {
  if (!(f.effort > 0)) return 0;
  return (Math.max(0, f.reach || 0) * (f.impact || 0) * ((f.confidence || 0) / 100)) / f.effort;
}

export interface Peringkat {
  index: number;
  skor: number;
  masuk: boolean; // masuk MVP dalam kapasitas tim
  kumulatif: number; // total effort sampai fitur ini (kalau masuk)
}

// Fitur wajib masuk duluan, lalu urut skor tertinggi, selama kapasitas cukup.
export function susunMvp(list: Fitur[], kapasitas: number): Peringkat[] {
  const urut = list
    .map((f, index) => ({ index, skor: skorRice(f), wajib: !!f.wajib, effort: Math.max(0, f.effort || 0) }))
    .sort((a, b) => Number(b.wajib) - Number(a.wajib) || b.skor - a.skor);
  let pakai = 0;
  return urut.map((u) => {
    const muat = kapasitas > 0 && pakai + u.effort <= kapasitas + 1e-9;
    if (muat) pakai += u.effort;
    return { index: u.index, skor: u.skor, masuk: muat, kumulatif: pakai };
  });
}
