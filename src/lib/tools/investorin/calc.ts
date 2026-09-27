// Investorin: pelacak galang dana (daftar investor per tahap).

export const TAHAP = [
  { id: "target", label: "Target" },
  { id: "dihubungi", label: "Dihubungi" },
  { id: "meeting", label: "Meeting" },
  { id: "dd", label: "Due diligence" },
  { id: "termsheet", label: "Term sheet" },
  { id: "deal", label: "Deal" },
  { id: "tidak", label: "Tidak lanjut" },
] as const;

export type TahapId = (typeof TAHAP)[number]["id"];

export interface Investor {
  nama: string;
  firma: string;
  jenis: string; // Angel, VC, CVC, Lainnya
  tahap: TahapId;
  tiket: number; // perkiraan nilai investasi
  kontakTerakhir: string; // YYYY-MM-DD
  langkah: string;
  catatan: string;
}

export const BATAS_HARI = 14;

export function selisihHari(dari: string, ke: Date): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dari)) return null;
  const [y, m, d] = dari.split("-").map(Number);
  const a = Date.UTC(y, m - 1, d);
  const b = Date.UTC(ke.getFullYear(), ke.getMonth(), ke.getDate());
  return Math.round((b - a) / 86400000);
}

export function ringkasInvestor(list: Investor[], target: number, hariIni: Date) {
  const perTahap = Object.fromEntries(TAHAP.map((t) => [t.id, 0])) as Record<TahapId, number>;
  list.forEach((x) => (perTahap[x.tahap] = (perTahap[x.tahap] ?? 0) + 1));
  const komit = list.filter((x) => x.tahap === "deal").reduce((a, x) => a + (x.tiket || 0), 0);
  const prosesAktif = list.filter((x) => ["meeting", "dd", "termsheet"].includes(x.tahap));
  const potensi = prosesAktif.reduce((a, x) => a + (x.tiket || 0), 0);
  const perluDihubungi = list
    .map((x, i) => ({ i, hari: selisihHari(x.kontakTerakhir, hariIni) }))
    .filter(({ i, hari }) => !["deal", "tidak", "target"].includes(list[i].tahap) && hari !== null && hari >= BATAS_HARI)
    .map(({ i, hari }) => ({ i, hari: hari as number }));
  return { perTahap, komit, potensi, pctTarget: target > 0 ? (komit / target) * 100 : null, perluDihubungi };
}
