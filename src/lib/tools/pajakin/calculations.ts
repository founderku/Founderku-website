// Logika hitung PPh Final UMKM sesuai PP 20/2026 (berlaku sejak 22 April 2026,
// menggantikan PP 55/2022). Aturan pokok yang dipakai di sini:
// - Tarif 0,5% dari omzet, khusus buat WP Orang Pribadi, PT Perorangan, dan koperasi
// - Omzet KUMULATIF sampai dengan Rp500 juta pertama dalam 1 tahun pajak TIDAK kena pajak
// - Batas maksimal buat pakai skema ini: omzet setahun Rp4,8 miliar
// Sumber: Pasal 60 ayat (2) PP 55/2022 (gak diubah PP 20/2026), Pasal 57 PP 20/2026.

export const BATAS_BEBAS_PAJAK = 500_000_000; // Rp500 juta, kumulatif per tahun pajak
export const BATAS_MAKSIMAL_OMZET = 4_800_000_000; // Rp4,8 miliar, batas skema PPh Final UMKM
export const TARIF_PAJAK = 0.005; // 0,5%

export interface HasilPajak {
  omzetSetelahBulanIni: number;
  sisaBebasPajakSebelumBulanIni: number; // sisa jatah bebas pajak sebelum bulan ini dihitung
  bagianBebasPajak: number; // bagian omzet bulan ini yang masih gratis pajak
  bagianKenaPajak: number; // bagian omzet bulan ini yang kena 0,5%
  pajakTerutang: number;
  sudahLewatBatasBebas: boolean; // apakah kumulatif tahun ini udah pernah lewat Rp500jt
  sudahLewatBatasMaksimal: boolean; // apakah kumulatif tahun ini udah lewat Rp4,8M (gak bisa pakai skema ini lagi)
  persenTerpakaiBatasBebas: number; // 0-100, seberapa banyak jatah Rp500jt yang udah kepakai
}

export function hitungPajakUMKM(
  omzetSebelumBulanIni: number,
  omzetBulanIni: number
): HasilPajak {
  const sebelum = Math.max(0, omzetSebelumBulanIni);
  const bulanIni = Math.max(0, omzetBulanIni);
  const omzetSetelahBulanIni = sebelum + bulanIni;

  const sisaBebasPajakSebelumBulanIni = Math.max(0, BATAS_BEBAS_PAJAK - sebelum);
  const bagianBebasPajak = Math.min(bulanIni, sisaBebasPajakSebelumBulanIni);
  const bagianKenaPajak = bulanIni - bagianBebasPajak;
  const pajakTerutang = bagianKenaPajak * TARIF_PAJAK;

  const sudahLewatBatasBebas = omzetSetelahBulanIni > BATAS_BEBAS_PAJAK;
  const sudahLewatBatasMaksimal = omzetSetelahBulanIni > BATAS_MAKSIMAL_OMZET;
  const persenTerpakaiBatasBebas = Math.min(
    100,
    (omzetSetelahBulanIni / BATAS_BEBAS_PAJAK) * 100
  );

  return {
    omzetSetelahBulanIni,
    sisaBebasPajakSebelumBulanIni,
    bagianBebasPajak,
    bagianKenaPajak,
    pajakTerutang,
    sudahLewatBatasBebas,
    sudahLewatBatasMaksimal,
    persenTerpakaiBatasBebas,
  };
}

export function formatRupiah(nilai: number): string {
  if (!isFinite(nilai)) return 'Rp 0';
  return 'Rp ' + Math.round(nilai).toLocaleString('id-ID');
}
