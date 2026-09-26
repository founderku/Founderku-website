// Data tahapan perjalanan bisnis dan logika hitung progress.
// Konten tahapan ditulis manual berdasarkan langkah umum yang biasanya dilalui
// UMKM di Indonesia, termasuk tip yang ngarahin ke tool Founderku lain yang relevan.

export interface RoadmapItem {
  id: string;
  teks: string;
  hint?: string;
}

export interface RoadmapTahap {
  id: string;
  nomor: number;
  judul: string;
  deskripsi: string;
  items: RoadmapItem[];
}

export const TAHAPAN: RoadmapTahap[] = [
  {
    id: 'validasi',
    nomor: 1,
    judul: 'Validasi Ide',
    deskripsi: 'Pastikan idenya beneran dibutuhkan orang sebelum modal keluar banyak.',
    items: [
      { id: 'validasi-1', teks: 'Riset kompetitor: cari tau siapa aja yang udah jualan produk/jasa serupa' },
      { id: 'validasi-2', teks: 'Wawancara minimal 5 calon pelanggan buat validasi masalah yang mau kamu selesaikan' },
      { id: 'validasi-3', teks: 'Tentuin target pasar spesifik: siapa yang bakal beli, dan kenapa mereka butuh ini' },
      { id: 'validasi-4', teks: 'Hitung perkiraan modal awal yang dibutuhkan buat mulai' },
    ],
  },
  {
    id: 'legalitas',
    nomor: 2,
    judul: 'Legalitas & Administrasi',
    deskripsi: 'Biar usahanya resmi dan gak was-was di kemudian hari.',
    items: [
      { id: 'legalitas-1', teks: 'Tentuin bentuk usaha: perorangan, CV, atau PT' },
      { id: 'legalitas-2', teks: 'Daftar NIB (Nomor Induk Berusaha) lewat OSS (oss.go.id)' },
      { id: 'legalitas-3', teks: 'Daftar NPWP usaha' },
      { id: 'legalitas-4', teks: 'Cek izin khusus yang mungkin diperlukan (PIRT buat makanan, izin edar BPOM, sertifikasi halal, dll)' },
    ],
  },
  {
    id: 'branding',
    nomor: 3,
    judul: 'Branding & Identitas',
    deskripsi: 'Biar usahamu gampang diinget dan keliatan kredibel.',
    items: [
      { id: 'branding-1', teks: 'Tentuin nama usaha yang gampang diinget dan belum dipakai orang lain' },
      { id: 'branding-2', teks: 'Bikin logo dan identitas visual dasar (warna, font)' },
      { id: 'branding-3', teks: 'Siapin akun media sosial usaha (Instagram, WhatsApp Business, dll)' },
      { id: 'branding-4', teks: 'Tentuin cerita/positioning usaha: kenapa orang harus pilih kamu' },
    ],
  },
  {
    id: 'operasional',
    nomor: 4,
    judul: 'Persiapan Operasional',
    deskripsi: 'Siapin fondasi biar usahanya jalan lancar dan gak babak belur di awal.',
    items: [
      {
        id: 'operasional-1',
        teks: 'Hitung HPP dan tentuin harga jual yang masuk akal',
        hint: 'Bisa pakai Hargain buat bantu hitung ini',
      },
      { id: 'operasional-2', teks: 'Siapin sistem pencatatan keuangan sederhana (pemasukan, pengeluaran)' },
      { id: 'operasional-3', teks: 'Cari dan pastikan supplier/bahan baku' },
      { id: 'operasional-4', teks: 'Bikin SOP produksi dasar biar kualitas konsisten' },
    ],
  },
  {
    id: 'jualan',
    nomor: 5,
    judul: 'Jualan Pertama',
    deskripsi: 'Waktunya keluar dari mode persiapan dan mulai jualan beneran.',
    items: [
      {
        id: 'jualan-1',
        teks: 'Bikin katalog produk atau landing page buat jualan online',
        hint: 'Bisa pakai Pajangin buat bikin landing page dalam hitungan menit',
      },
      {
        id: 'jualan-2',
        teks: 'Siapin invoice/kwitansi yang rapi buat transaksi',
        hint: 'Bisa pakai Notain buat generate invoice otomatis',
      },
      { id: 'jualan-3', teks: 'Jualan ke circle terdekat dulu (keluarga, teman) buat dapetin feedback dan testimoni awal' },
      { id: 'jualan-4', teks: 'Kumpulin testimoni dan perbaiki produk/layanan dari feedback pelanggan pertama' },
    ],
  },
  {
    id: 'pajak-kerjasama',
    nomor: 6,
    judul: 'Pajak & Kerjasama',
    deskripsi: 'Bereskan kewajiban dan hubungan kerjasama biar aman jangka panjang.',
    items: [
      {
        id: 'pajak-1',
        teks: 'Pahami kewajiban pajak UMKM kamu (PPh Final 0,5%)',
        hint: 'Bisa pakai Pajakin buat simulasi hitungannya',
      },
      {
        id: 'pajak-2',
        teks: 'Kalau ada partner/kerjasama, bikin perjanjian tertulis, jangan cuma modal percaya',
        hint: 'Bisa pakai Kontrakin buat generate draft perjanjiannya',
      },
      { id: 'pajak-3', teks: 'Pisahin rekening pribadi dan rekening usaha' },
    ],
  },
  {
    id: 'scale-up',
    nomor: 7,
    judul: 'Scale Up',
    deskripsi: 'Usaha udah jalan, sekarang waktunya berkembang lebih besar.',
    items: [
      { id: 'scale-1', teks: 'Evaluasi margin dan harga jual secara berkala, jangan cuma sekali di awal' },
      { id: 'scale-2', teks: 'Coba ekspansi ke channel penjualan baru (marketplace, media sosial lain, dll)' },
      { id: 'scale-3', teks: 'Pertimbangkan rekrut karyawan pertama kalau volume kerjaan udah gak keurus sendiri' },
      { id: 'scale-4', teks: 'Bangun sistem/SOP yang bisa didelegasikan biar usaha gak bergantung 100% ke kamu' },
    ],
  },
];

export function hitungJumlahSelesai(tahap: RoadmapTahap, selesai: string[]): number {
  return tahap.items.filter((item) => selesai.includes(item.id)).length;
}

export function hitungProgressTahap(tahap: RoadmapTahap, selesai: string[]): number {
  if (tahap.items.length === 0) return 0;
  return Math.round((hitungJumlahSelesai(tahap, selesai) / tahap.items.length) * 100);
}

export function hitungTotalItem(tahapan: RoadmapTahap[]): number {
  return tahapan.reduce((total, t) => total + t.items.length, 0);
}

export function hitungTotalSelesai(tahapan: RoadmapTahap[], selesai: string[]): number {
  return tahapan.reduce((total, t) => total + hitungJumlahSelesai(t, selesai), 0);
}

export function hitungProgressTotal(tahapan: RoadmapTahap[], selesai: string[]): number {
  const total = hitungTotalItem(tahapan);
  if (total === 0) return 0;
  return Math.round((hitungTotalSelesai(tahapan, selesai) / total) * 100);
}

/** Cari tahap pertama yang belum 100% selesai, buat auto-expand di UI. */
export function cariTahapAktif(tahapan: RoadmapTahap[], selesai: string[]): string {
  const belumSelesai = tahapan.find((t) => hitungProgressTahap(t, selesai) < 100);
  return belumSelesai ? belumSelesai.id : tahapan[tahapan.length - 1]?.id ?? '';
}
