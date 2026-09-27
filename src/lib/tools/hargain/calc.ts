// Hargain: menentukan harga langganan dari tiga sisi (biaya, nilai buat
// pelanggan, kompetitor), lalu titik impas di harga yang dipilih.

export interface InputHarga {
  biayaVariabel: number; // biaya per pelanggan per bulan (server, komisi, dll)
  biayaTetap: number; // per bulan
  targetMargin: number; // % margin kotor yang diinginkan
  nilaiPelanggan: number; // uang/waktu yang dihemat pelanggan per bulan (Rp)
  kompetitorMin: number;
  kompetitorMax: number;
  harga: number; // harga yang dipilih
}

export interface HasilHarga {
  hargaMinimal: number | null; // supaya margin tercapai
  nilaiBawah: number | null; // 10% dari nilai untuk pelanggan
  nilaiAtas: number | null; // 30% dari nilai
  margin: number | null; // margin kotor di harga dipilih (%)
  kontribusi: number; // harga - biaya variabel
  titikImpas: number | null; // jumlah pelanggan supaya biaya tetap tertutup
  posisi: "rugi" | "murah" | "wajar" | "mahal" | null;
}

export function hitungHarga(i: InputHarga): HasilHarga {
  const m = Math.min(95, Math.max(0, i.targetMargin || 0)) / 100;
  const hargaMinimal = i.biayaVariabel > 0 ? i.biayaVariabel / (1 - m) : null;
  const nilaiBawah = i.nilaiPelanggan > 0 ? i.nilaiPelanggan * 0.1 : null;
  const nilaiAtas = i.nilaiPelanggan > 0 ? i.nilaiPelanggan * 0.3 : null;
  const kontribusi = (i.harga || 0) - (i.biayaVariabel || 0);
  const margin = i.harga > 0 ? (kontribusi / i.harga) * 100 : null;
  const titikImpas = kontribusi > 0 ? Math.ceil((i.biayaTetap || 0) / kontribusi) : null;
  let posisi: HasilHarga["posisi"] = null;
  if (i.harga > 0) {
    if (kontribusi <= 0) posisi = "rugi";
    else if (i.kompetitorMin > 0 && i.harga < i.kompetitorMin) posisi = "murah";
    else if (i.kompetitorMax > 0 && i.harga > i.kompetitorMax) posisi = "mahal";
    else posisi = "wajar";
  }
  return { hargaMinimal, nilaiBawah, nilaiAtas, margin, kontribusi, titikImpas, posisi };
}
