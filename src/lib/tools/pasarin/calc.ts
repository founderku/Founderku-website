// Pasarin: ukuran pasar dari bawah (bottom-up).
// TAM = semua calon pelanggan x nilai per pelanggan per tahun
// SAM = bagian yang bisa dijangkau produk dan saluranmu
// SOM = bagian yang realistis direbut dalam beberapa tahun

export interface InputPasar {
  namaPasar: string;
  pelanggan: number; // jumlah calon pelanggan total
  nilaiTahun: number; // nilai per pelanggan per tahun (Rp)
  pctSam: number; // % pelanggan yang bisa dijangkau
  pctSom: number; // % dari SAM yang realistis direbut
  tahun: number; // dalam berapa tahun
  alasanSam: string;
  alasanSom: string;
}

export interface HasilPasar {
  tam: number;
  sam: number;
  som: number;
  pelangganSam: number;
  pelangganSom: number;
  somPerTahunPelanggan: number;
  terlaluOptimis: boolean;
}

export function hitungPasar(i: InputPasar): HasilPasar {
  const pel = Math.max(0, i.pelanggan || 0);
  const nilai = Math.max(0, i.nilaiTahun || 0);
  const pSam = Math.min(100, Math.max(0, i.pctSam || 0)) / 100;
  const pSom = Math.min(100, Math.max(0, i.pctSom || 0)) / 100;
  const pelangganSam = pel * pSam;
  const pelangganSom = pelangganSam * pSom;
  const tahun = Math.max(1, i.tahun || 1);
  return {
    tam: pel * nilai,
    sam: pelangganSam * nilai,
    som: pelangganSom * nilai,
    pelangganSam,
    pelangganSom,
    somPerTahunPelanggan: pelangganSom / tahun,
    // Startup tahap awal jarang merebut lebih dari 10% pasar terjangkau dalam 3 tahun
    terlaluOptimis: pSom * 100 > (10 * tahun) / 3,
  };
}
