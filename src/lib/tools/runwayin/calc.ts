// Runwayin: berapa bulan uang startup cukup (runway), dengan simulasi
// bulan per bulan. Pemasukan dan pengeluaran bisa tumbuh tiap bulan.

export interface Biaya {
  nama: string;
  jumlah: number;
}

export interface Skenario {
  aktif: boolean;
  tambahanBiaya: number; // per bulan, misal gaji 2 orang baru
  mulaiBulan: number; // bulan ke- (1 = bulan depan)
  suntikanDana: number; // pendanaan masuk sekali
  bulanDana: number;
}

export interface InputRunway {
  kas: number;
  pemasukan: number; // per bulan sekarang
  tumbuhPemasukan: number; // % per bulan
  biaya: Biaya[];
  tumbuhBiaya: number; // % per bulan
  skenario: Skenario;
}

export interface HasilRunway {
  biayaAwal: number;
  burnAwal: number; // biaya - pemasukan bulan ini (positif = bakar uang)
  kasPerBulan: number[]; // index 0 = sekarang, 1 = akhir bulan ke-1, dst
  runwayBulan: number | null; // null = tidak habis dalam batas simulasi
  bulanHabis: number | null; // bulan ke- saat kas jadi minus
  bulanUntung: number | null; // bulan pertama pemasukan >= pengeluaran
  defaultAlive: boolean; // uang tidak habis dalam batas simulasi
}

export const BATAS_BULAN = 60;

export function hitungRunway(inp: InputRunway, pakaiSkenario: boolean): HasilRunway {
  const biayaAwal = inp.biaya.reduce((a, b) => a + (Number(b.jumlah) || 0), 0);
  const gp = (inp.tumbuhPemasukan || 0) / 100;
  const gb = (inp.tumbuhBiaya || 0) / 100;
  const sk = inp.skenario;
  let kas = inp.kas || 0;
  const kasPerBulan = [kas];
  let runwayBulan: number | null = null;
  let bulanHabis: number | null = null;
  let bulanUntung: number | null = null;

  for (let m = 1; m <= BATAS_BULAN; m++) {
    const masuk = (inp.pemasukan || 0) * Math.pow(1 + gp, m - 1);
    let keluar = biayaAwal * Math.pow(1 + gb, m - 1);
    if (pakaiSkenario && sk.aktif && m >= Math.max(1, sk.mulaiBulan || 1)) keluar += sk.tambahanBiaya || 0;
    const dana = pakaiSkenario && sk.aktif && m === Math.max(1, sk.bulanDana || 1) ? sk.suntikanDana || 0 : 0;
    const bersih = masuk - keluar;
    if (bulanUntung === null && bersih >= 0 && keluar > 0) bulanUntung = m;
    const sebelum = kas;
    kas = kas + bersih + dana;
    kasPerBulan.push(kas);
    if (bulanHabis === null && kas < 0) {
      bulanHabis = m;
      // bagian bulan terakhir yang masih tertutup kas (tanpa suntikan dana)
      const bakar = -(bersih + dana);
      const sisa = bakar > 0 ? Math.max(0, Math.min(1, sebelum / bakar)) : 0;
      runwayBulan = m - 1 + sisa;
      break;
    }
  }
  return {
    biayaAwal,
    burnAwal: biayaAwal - (inp.pemasukan || 0),
    kasPerBulan,
    runwayBulan,
    bulanHabis,
    bulanUntung,
    // Uang tidak habis selama simulasi (sudah untung, atau kas cukup lama)
    defaultAlive: bulanHabis === null,
  };
}
