// Bagiin: pembagian saham antar pendiri berdasarkan kontribusi berbobot,
// plus jadwal vesting (saham "cair" bertahap).

export interface Faktor {
  nama: string;
  bobot: number; // tingkat kepentingan, 0-100
}

export interface Pendiri {
  nama: string;
  nilai: number[]; // skor 0-10 per faktor (urutan sama dengan faktor)
}

export const FAKTOR_AWAL: Faktor[] = [
  { nama: "Ide dan inisiatif awal", bobot: 10 },
  { nama: "Komitmen waktu (penuh waktu)", bobot: 25 },
  { nama: "Keahlian inti untuk produk", bobot: 25 },
  { nama: "Modal uang yang disetor", bobot: 15 },
  { nama: "Jaringan dan pelanggan", bobot: 10 },
  { nama: "Risiko yang diambil (gaji dikorbankan)", bobot: 15 },
];

// Persentase saham tiap pendiri (total 100). Kalau belum ada skor, dibagi rata.
export function bagiSaham(faktor: Faktor[], pendiri: Pendiri[]): number[] {
  const poin = pendiri.map((p) => faktor.reduce((a, f, i) => a + Math.max(0, f.bobot || 0) * Math.max(0, Math.min(10, p.nilai[i] || 0)), 0));
  const total = poin.reduce((a, b) => a + b, 0);
  if (total <= 0) return pendiri.map(() => (pendiri.length ? 100 / pendiri.length : 0));
  return poin.map((x) => (x / total) * 100);
}

// Persen dari jatah seorang pendiri yang sudah "cair" setelah n bulan.
// Sebelum cliff: 0. Tepat di cliff: langsung cair sebanding lamanya cliff.
// Sesudahnya bertambah tiap bulan sampai 100% di akhir masa vesting.
export function persenCair(bulan: number, total: number, cliff: number): number {
  if (!(total > 0)) return 100;
  if (bulan < cliff) return 0;
  return Math.min(100, (Math.floor(bulan) / total) * 100);
}

export function bulanBerjalan(mulai: string, hariIni: Date): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(mulai);
  if (!m) return null;
  let bln = (hariIni.getFullYear() - Number(m[1])) * 12 + (hariIni.getMonth() + 1 - Number(m[2]));
  if (hariIni.getDate() < Number(m[3])) bln -= 1;
  return Math.max(0, bln);
}
