// IPK-in: hitung IPS per semester, IPK kumulatif, simulasi target IPK,
// dan predikat kelulusan. Bobot nilai berbeda antar kampus, jadi ada dua
// pilihan skala umum; user tetap disarankan mengecek pedoman akademiknya.

export type Skala = "standar" | "plusminus";

export const SKALA: Record<Skala, { label: string; nilai: { huruf: string; bobot: number }[] }> = {
  standar: {
    label: "A, AB, B, BC, C, D, E",
    nilai: [
      { huruf: "A", bobot: 4 },
      { huruf: "AB", bobot: 3.5 },
      { huruf: "B", bobot: 3 },
      { huruf: "BC", bobot: 2.5 },
      { huruf: "C", bobot: 2 },
      { huruf: "D", bobot: 1 },
      { huruf: "E", bobot: 0 },
    ],
  },
  plusminus: {
    label: "A, A-, B+, B, B-, C+, C, D, E",
    nilai: [
      { huruf: "A", bobot: 4 },
      { huruf: "A-", bobot: 3.7 },
      { huruf: "B+", bobot: 3.3 },
      { huruf: "B", bobot: 3 },
      { huruf: "B-", bobot: 2.7 },
      { huruf: "C+", bobot: 2.3 },
      { huruf: "C", bobot: 2 },
      { huruf: "D", bobot: 1 },
      { huruf: "E", bobot: 0 },
    ],
  },
};

export interface Matkul {
  nama: string;
  sks: number;
  nilai: string; // huruf, "" = belum ada nilai
}

export interface Semester {
  nama: string;
  matkul: Matkul[];
}

export function bobot(skala: Skala, huruf: string): number | null {
  const n = SKALA[skala].nilai.find((x) => x.huruf === huruf);
  return n ? n.bobot : null;
}

// IP dibulatkan 2 angka di belakang koma, seperti di transkrip
export const bulat2 = (n: number) => Math.round(n * 100 + 1e-9) / 100;

export function hitungSemester(sem: Semester, skala: Skala) {
  let sks = 0;
  let mutu = 0;
  for (const m of sem.matkul) {
    const b = bobot(skala, m.nilai);
    if (b === null || !(m.sks > 0)) continue;
    sks += m.sks;
    mutu += m.sks * b;
  }
  return { sks, mutu, ips: sks > 0 ? mutu / sks : null };
}

export function hitungIPK(semesters: Semester[], skala: Skala) {
  let sks = 0;
  let mutu = 0;
  const per = semesters.map((s) => {
    const h = hitungSemester(s, skala);
    sks += h.sks;
    mutu += h.mutu;
    return { ...h, ipk: sks > 0 ? mutu / sks : null };
  });
  return { sks, mutu, ipk: sks > 0 ? mutu / sks : null, per };
}

// Berapa rata-rata bobot yang dibutuhkan di sisa SKS supaya IPK akhir
// mencapai target.
export function simulasiTarget(sksNow: number, mutuNow: number, target: number, sksSisa: number) {
  if (!(target > 0) || !(sksSisa > 0)) return null;
  const butuh = (target * (sksNow + sksSisa) - mutuNow) / sksSisa;
  const status: "aman" | "bisa" | "berat" | "mustahil" = butuh <= 0 ? "aman" : butuh > 4 ? "mustahil" : butuh > 3.5 ? "berat" : "bisa";
  // IPK tertinggi yang masih mungkin kalau semua sisa SKS dapat 4
  const maksimal = (mutuNow + 4 * sksSisa) / (sksNow + sksSisa);
  return { butuh: Math.max(0, butuh), status, maksimal };
}

// Predikat kelulusan program sarjana/diploma yang umum dipakai
// (pernah diatur dalam Permendikbud No. 3/2020): memuaskan 2,76 sampai 3,00; sangat
// memuaskan 3,01 sampai 3,50; dengan pujian di atas 3,50. Kampus bisa
// punya syarat tambahan (misalnya masa studi).
export function predikat(ipk: number | null) {
  if (ipk === null) return null;
  const v = bulat2(ipk);
  if (v > 3.5) return { label: "Dengan pujian (cumlaude)", tone: "good" as const };
  if (v > 3.0) return { label: "Sangat memuaskan", tone: "good" as const };
  if (v >= 2.76) return { label: "Memuaskan", tone: "warn" as const };
  return { label: "Belum masuk predikat", tone: "bad" as const };
}
