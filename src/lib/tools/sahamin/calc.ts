// Sahamin: simulasi kepemilikan saham (cap table) dari pendiri, jatah
// saham karyawan (ESOP), sampai beberapa putaran pendanaan (priced round).
// Belum menghitung SAFE / convertible note.

export interface Pendiri {
  nama: string;
  porsi: number; // % dari saham pendiri
}

export interface Putaran {
  nama: string;
  preMoney: number; // valuasi sebelum uang masuk
  investasi: number;
}

export interface InputSaham {
  pendiri: Pendiri[];
  esop: number; // % dari total saham setelah pool dibuat
  putaran: Putaran[];
}

export interface Pemegang {
  id: string;
  nama: string;
  jenis: "pendiri" | "esop" | "investor";
  saham: number;
}

export interface Tahap {
  nama: string;
  pemegang: Pemegang[];
  total: number;
  hargaPerSaham: number | null;
  postMoney: number | null;
}

export const SAHAM_AWAL = 10_000_000; // total saham pendiri (angka acuan)

export function hitungSaham(inp: InputSaham): Tahap[] {
  const totalPorsi = inp.pendiri.reduce((a, p) => a + Math.max(0, p.porsi || 0), 0);
  const pemegang: Pemegang[] = inp.pendiri.map((p, i) => ({
    id: "f" + i,
    nama: p.nama || `Pendiri ${i + 1}`,
    jenis: "pendiri",
    saham: totalPorsi > 0 ? (SAHAM_AWAL * Math.max(0, p.porsi || 0)) / totalPorsi : 0,
  }));
  const esop = Math.max(0, Math.min(50, inp.esop || 0)) / 100;
  const sahamPendiri = pemegang.reduce((a, p) => a + p.saham, 0);
  if (esop > 0) pemegang.push({ id: "esop", nama: "ESOP (karyawan)", jenis: "esop", saham: (sahamPendiri * esop) / (1 - esop) });

  const salin = () => pemegang.map((p) => ({ ...p }));
  const jumlah = () => pemegang.reduce((a, p) => a + p.saham, 0);
  const tahap: Tahap[] = [{ nama: "Awal", pemegang: salin(), total: jumlah(), hargaPerSaham: null, postMoney: null }];

  inp.putaran.forEach((r, i) => {
    const total = jumlah();
    if (!(r.preMoney > 0) || !(r.investasi > 0) || total <= 0) {
      tahap.push({ nama: r.nama || `Putaran ${i + 1}`, pemegang: salin(), total, hargaPerSaham: null, postMoney: null });
      return;
    }
    const harga = r.preMoney / total;
    pemegang.push({ id: "r" + i, nama: `Investor ${r.nama || "putaran " + (i + 1)}`, jenis: "investor", saham: r.investasi / harga });
    tahap.push({
      nama: r.nama || `Putaran ${i + 1}`,
      pemegang: salin(),
      total: jumlah(),
      hargaPerSaham: harga,
      postMoney: r.preMoney + r.investasi,
    });
  });
  return tahap;
}

export function persen(t: Tahap, id: string): number {
  const p = t.pemegang.find((x) => x.id === id);
  return p && t.total > 0 ? (p.saham / t.total) * 100 : 0;
}
