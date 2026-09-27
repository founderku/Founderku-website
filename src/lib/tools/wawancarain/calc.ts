// Wawancarain: rangkuman hasil wawancara calon pelanggan.

export type Bayar = "" | "ya" | "mungkin" | "tidak";

export interface Responden {
  nama: string;
  tanggal: string; // YYYY-MM-DD
  segmen: string;
  sakit: number; // 0 = belum dinilai, 1-5 seberapa menyakitkan masalahnya
  sudahCari: boolean; // sudah mencoba solusi lain / keluar uang
  bayar: Bayar;
  kutipan: string;
  catatan: string;
}

export interface Rangkuman {
  jumlah: number;
  rataSakit: number | null;
  pctSudahCari: number | null;
  pctMauBayar: number | null; // "ya" saja
  pctMungkin: number | null;
  status: "kurang" | "belum" | "kuat" | "lemah";
}

export const TARGET_WAWANCARA = 10;

export function rangkum(list: Responden[]): Rangkuman {
  const n = list.length;
  const dinilai = list.filter((r) => r.sakit >= 1 && r.sakit <= 5);
  const rataSakit = dinilai.length ? dinilai.reduce((a, r) => a + r.sakit, 0) / dinilai.length : null;
  const pctSudahCari = n ? (list.filter((r) => r.sudahCari).length / n) * 100 : null;
  const pctMauBayar = n ? (list.filter((r) => r.bayar === "ya").length / n) * 100 : null;
  const pctMungkin = n ? (list.filter((r) => r.bayar === "mungkin").length / n) * 100 : null;
  let status: Rangkuman["status"] = "kurang";
  if (n >= TARGET_WAWANCARA && rataSakit !== null && pctMauBayar !== null) {
    if (rataSakit >= 3.5 && pctMauBayar >= 30) status = "kuat";
    else if (rataSakit < 2.5 && pctMauBayar < 10) status = "lemah";
    else status = "belum";
  }
  return { jumlah: n, rataSakit, pctSudahCari, pctMauBayar, pctMungkin, status };
}
