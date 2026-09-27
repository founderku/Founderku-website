// Proyeksiin: proyeksi keuangan 36 bulan sederhana (model langganan).

export interface InputProyeksi {
  pelangganAwal: number;
  baruAwal: number; // pelanggan baru per bulan di bulan 1
  tumbuhBaru: number; // % kenaikan pelanggan baru per bulan
  churn: number; // % pelanggan berhenti per bulan
  harga: number; // per pelanggan per bulan
  naikHarga: number; // % kenaikan harga per tahun
  margin: number; // % margin kotor
  cac: number; // biaya marketing per pelanggan baru
  biayaTetap: number; // per bulan (gaji, sewa, dll)
  naikBiaya: number; // % kenaikan biaya tetap per tahun
}

export interface Bulan {
  bulan: number; // 1..36
  pelanggan: number;
  baru: number;
  pendapatan: number;
  labaKotor: number;
  marketing: number;
  biayaTetap: number;
  laba: number; // laba kotor - marketing - biaya tetap
}

export interface Tahunan {
  tahun: number;
  pendapatan: number;
  labaKotor: number;
  marketing: number;
  biayaTetap: number;
  laba: number;
  pelangganAkhir: number;
}

export const BULAN_PROYEKSI = 36;

export function proyeksi(i: InputProyeksi): { bulan: Bulan[]; tahunan: Tahunan[]; bulanUntung: number | null; kebutuhanDana: number } {
  const out: Bulan[] = [];
  let pel = Math.max(0, i.pelangganAwal || 0);
  const churn = Math.min(100, Math.max(0, i.churn || 0)) / 100;
  let kumulatif = 0;
  let terendah = 0;
  let bulanUntung: number | null = null;
  for (let m = 1; m <= BULAN_PROYEKSI; m++) {
    const th = Math.floor((m - 1) / 12);
    const baru = Math.max(0, i.baruAwal || 0) * Math.pow(1 + (i.tumbuhBaru || 0) / 100, m - 1);
    pel = pel * (1 - churn) + baru;
    const harga = (i.harga || 0) * Math.pow(1 + (i.naikHarga || 0) / 100, th);
    const pendapatan = pel * harga;
    const labaKotor = pendapatan * ((i.margin || 0) / 100);
    const marketing = baru * (i.cac || 0);
    const biayaTetap = (i.biayaTetap || 0) * Math.pow(1 + (i.naikBiaya || 0) / 100, th);
    const laba = labaKotor - marketing - biayaTetap;
    if (bulanUntung === null && laba >= 0 && pendapatan > 0) bulanUntung = m;
    kumulatif += laba;
    terendah = Math.min(terendah, kumulatif);
    out.push({ bulan: m, pelanggan: pel, baru, pendapatan, labaKotor, marketing, biayaTetap, laba });
  }
  const tahunan: Tahunan[] = [0, 1, 2].map((t) => {
    const b = out.slice(t * 12, t * 12 + 12);
    const jml = (k: keyof Bulan) => b.reduce((a, x) => a + x[k], 0);
    return {
      tahun: t + 1,
      pendapatan: jml("pendapatan"),
      labaKotor: jml("labaKotor"),
      marketing: jml("marketing"),
      biayaTetap: jml("biayaTetap"),
      laba: jml("laba"),
      pelangganAkhir: b[b.length - 1].pelanggan,
    };
  });
  // Dana minimal supaya kas tidak pernah minus selama 36 bulan
  return { bulan: out, tahunan, bulanUntung, kebutuhanDana: -terendah };
}
