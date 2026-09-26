// Logika susun pasal-pasal perjanjian. Dipisah dari UI biar gampang dites -
// terutama bagian penomoran otomatis yang harus geser kalau ada pasal opsional
// yang dikosongin.

export interface PihakInfo {
  nama: string;
  alamat: string;
  jabatan: string; // opsional, misal "Pemilik" atau kosong buat perorangan
  nomorIdentitas: string; // KTP/NPWP, opsional
}

export interface PasalTambahan {
  id: string;
  judul: string;
  isi: string;
}

export interface DraftKontrak {
  judul: string;
  nomor: string;
  tanggal: string;
  kota: string;
  pihakPertama: PihakInfo;
  pihakKedua: PihakInfo;
  ruangLingkup: string;
  kewajibanPihakPertama: string;
  kewajibanPihakKedua: string;
  jangkaWaktuMulai: string;
  jangkaWaktuSelesai: string;
  pasalTambahan: PasalTambahan[];
}

export interface Pasal {
  nomor: number;
  judul: string;
  isi: string;
}

export function susunTeksJangkaWaktu(draft: Pick<DraftKontrak, 'jangkaWaktuMulai' | 'jangkaWaktuSelesai'>): string {
  const mulai = draft.jangkaWaktuMulai.trim();
  const selesai = draft.jangkaWaktuSelesai.trim();
  if (mulai && selesai) {
    return `Perjanjian ini berlaku mulai tanggal ${mulai} sampai dengan ${selesai}.`;
  }
  if (mulai) {
    return `Perjanjian ini berlaku mulai tanggal ${mulai} sampai kedua belah pihak sepakat mengakhiri kerjasama ini.`;
  }
  return 'Jangka waktu perjanjian ini belum ditentukan oleh kedua belah pihak.';
}

export function teksPenyelesaianSengketa(kota: string): string {
  const kotaTerpakai = kota.trim() || '[kota belum diisi]';
  return `Segala perselisihan yang timbul dari perjanjian ini akan diselesaikan terlebih dahulu secara musyawarah untuk mencapai mufakat. Apabila musyawarah tidak mencapai kesepakatan, kedua belah pihak sepakat menyelesaikannya melalui Pengadilan Negeri ${kotaTerpakai}.`;
}

/**
 * Susun daftar pasal sesuai isi draft. Pasal opsional (Pembagian Hasil,
 * Ketentuan Lain-lain) cuma muncul kalau isinya diisi, dan nomor pasal
 * setelahnya otomatis geser.
 */
export function susunPasal(draft: DraftKontrak): Pasal[] {
  const daftar: Array<{ judul: string; isi: string }> = [];

  daftar.push({
    judul: 'Ruang Lingkup Kerjasama',
    isi: draft.ruangLingkup.trim() || '-',
  });
  daftar.push({
    judul: 'Hak dan Kewajiban Pihak Pertama',
    isi: draft.kewajibanPihakPertama.trim() || '-',
  });
  daftar.push({
    judul: 'Hak dan Kewajiban Pihak Kedua',
    isi: draft.kewajibanPihakKedua.trim() || '-',
  });
  daftar.push({
    judul: 'Jangka Waktu',
    isi: susunTeksJangkaWaktu(draft),
  });

  for (const p of draft.pasalTambahan) {
    if (!p.isi.trim()) continue; // pasal tanpa isi dilewatin, judul doang gak cukup
    daftar.push({
      judul: p.judul.trim() || 'Ketentuan Tambahan',
      isi: p.isi.trim(),
    });
  }

  daftar.push({
    judul: 'Penyelesaian Perselisihan',
    isi: teksPenyelesaianSengketa(draft.kota),
  });

  return daftar.map((p, i) => ({ ...p, nomor: i + 1 }));
}

export function buatId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
