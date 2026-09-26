// Data pertanyaan, logika skor, dan matematika radar chart.
// Dipisah dari UI biar gampang dites, terutama perhitungan sudut/koordinat
// radar chart yang gampang salah kalau ngoding langsung di komponen.

export interface Pertanyaan {
  id: string;
  teks: string;
}

export interface Dimensi {
  id: string;
  judul: string;
  deskripsi: string;
  pertanyaan: Pertanyaan[];
  rekomendasi: string; // saran kalau skor dimensi ini rendah
}

export const OPSI_JAWABAN = [
  { nilai: 0, label: 'Belum sama sekali' },
  { nilai: 1, label: 'Baru mulai' },
  { nilai: 2, label: 'Lumayan, belum konsisten' },
  { nilai: 3, label: 'Sudah mantap' },
];

export const SKOR_MAKS_PER_PERTANYAAN = 3;

export const DIMENSI: Dimensi[] = [
  {
    id: 'keuangan',
    judul: 'Keuangan',
    deskripsi: 'Seberapa jelas kamu ngerti kondisi duit usahamu.',
    pertanyaan: [
      { id: 'keu-1', teks: 'Aku tau persis berapa HPP (harga pokok produksi) dari tiap produk/jasa yang aku jual' },
      { id: 'keu-2', teks: 'Aku punya catatan keuangan yang rutin diisi (pemasukan dan pengeluaran)' },
      { id: 'keu-3', teks: 'Aku udah misahin rekening/uang pribadi dari uang usaha' },
      { id: 'keu-4', teks: 'Aku tau berapa untung bersih usaha aku tiap bulan' },
    ],
    rekomendasi: 'Coba pakai Hargain buat bantu hitung HPP dan harga jual yang masuk akal.',
  },
  {
    id: 'legalitas',
    judul: 'Legalitas & Pajak',
    deskripsi: 'Seberapa siap usahamu dari sisi resmi dan kewajiban negara.',
    pertanyaan: [
      { id: 'legal-1', teks: 'Usaha aku udah punya NIB (Nomor Induk Berusaha)' },
      { id: 'legal-2', teks: 'Aku paham kewajiban pajak UMKM aku dan tau cara ngitungnya' },
      { id: 'legal-3', teks: 'Tiap transaksi, aku kasih invoice/kwitansi yang rapi ke pelanggan' },
      { id: 'legal-4', teks: 'Kalau ada kerjasama sama pihak lain, selalu ada perjanjian tertulis, bukan modal percaya doang' },
    ],
    rekomendasi:
      'Coba pakai Jalanin buat checklist legalitas step-by-step, Pajakin buat simulasi pajak, Notain buat bikin invoice, dan Kontrakin buat draft perjanjian kerjasama.',
  },
  {
    id: 'pemasaran',
    judul: 'Pemasaran & Branding',
    deskripsi: 'Seberapa gampang calon pelanggan nemu dan percaya sama usahamu.',
    pertanyaan: [
      { id: 'pasar-1', teks: 'Usaha aku punya identitas brand yang jelas (nama, logo, warna khas)' },
      { id: 'pasar-2', teks: 'Aku aktif promosi di minimal satu channel (medsos, marketplace, dll)' },
      { id: 'pasar-3', teks: 'Aku punya katalog produk atau landing page yang bisa diliat calon pelanggan' },
      { id: 'pasar-4', teks: "Aku tau siapa target pasar aku secara spesifik, bukan 'semua orang'" },
    ],
    rekomendasi: 'Coba pakai Pajangin buat bikin landing page usaha kamu dalam hitungan menit.',
  },
  {
    id: 'operasional',
    judul: 'Operasional',
    deskripsi: 'Seberapa rapi proses di balik layar usahamu jalan.',
    pertanyaan: [
      { id: 'ops-1', teks: 'Aku punya SOP atau cara kerja standar biar kualitas produk/layanan konsisten' },
      { id: 'ops-2', teks: 'Supplier/bahan baku aku stabil dan jarang bermasalah' },
      { id: 'ops-3', teks: 'Aku punya sistem buat kelola stok/inventaris' },
      { id: 'ops-4', teks: 'Proses produksi/pelayanan aku bisa diulang orang lain tanpa masalah besar' },
    ],
    rekomendasi: 'Coba pakai Jalanin, bagian Persiapan Operasional, buat susun langkah-langkahnya.',
  },
  {
    id: 'tim',
    judul: 'Tim & Pengelolaan',
    deskripsi: 'Seberapa gak-bergantung usahamu sama kamu sendirian.',
    pertanyaan: [
      { id: 'tim-1', teks: 'Aku udah bisa delegasiin sebagian kerjaan ke orang lain' },
      { id: 'tim-2', teks: 'Kalau aku libur seminggu penuh, usaha tetap bisa jalan' },
      { id: 'tim-3', teks: 'Aku punya rencana buat berkembang lebih besar, bukan cuma jalan apa adanya' },
      { id: 'tim-4', teks: 'Aku evaluasi performa usaha secara berkala, bukan cuma pas lagi inget' },
    ],
    rekomendasi: 'Coba pakai Jalanin, bagian Scale Up, buat mulai mikirin sistem yang bisa didelegasikan.',
  },
];

export type Jawaban = Record<string, number>; // questionId -> nilai (0-3)

export function hitungSkorDimensi(dimensi: Dimensi, jawaban: Jawaban): number {
  const skorMaks = dimensi.pertanyaan.length * SKOR_MAKS_PER_PERTANYAAN;
  if (skorMaks === 0) return 0;
  const skorTotal = dimensi.pertanyaan.reduce((total, p) => total + (jawaban[p.id] ?? 0), 0);
  return Math.round((skorTotal / skorMaks) * 100);
}

export function hitungSkorTotal(dimensiList: Dimensi[], jawaban: Jawaban): number {
  if (dimensiList.length === 0) return 0;
  const totalSkorDimensi = dimensiList.reduce(
    (total, d) => total + hitungSkorDimensi(d, jawaban),
    0
  );
  return Math.round(totalSkorDimensi / dimensiList.length);
}

export function jumlahPertanyaanTerjawab(dimensiList: Dimensi[], jawaban: Jawaban): number {
  const semuaId = dimensiList.flatMap((d) => d.pertanyaan.map((p) => p.id));
  return semuaId.filter((id) => jawaban[id] !== undefined).length;
}

export function jumlahPertanyaanTotal(dimensiList: Dimensi[]): number {
  return dimensiList.reduce((total, d) => total + d.pertanyaan.length, 0);
}

export function labelSkor(skor: number): string {
  if (skor <= 40) return 'Perlu Perhatian Serius';
  if (skor <= 65) return 'Masih Rintisan';
  if (skor <= 85) return 'Cukup Sehat';
  return 'Mantap';
}

// --- Matematika radar chart ---

export interface TitikRadar {
  x: number;
  y: number;
}

/**
 * Hitung koordinat satu titik di radar chart.
 * Sumbu ke-0 selalu di posisi jam 12 (lurus ke atas), sisanya searah jarum jam.
 */
export function hitungTitikRadar(
  nilaiPersen: number,
  indeksSumbu: number,
  totalSumbu: number,
  cx: number,
  cy: number,
  radiusMaks: number
): TitikRadar {
  const sudut = (Math.PI * 2 * indeksSumbu) / totalSumbu - Math.PI / 2;
  const radius = (Math.max(0, Math.min(100, nilaiPersen)) / 100) * radiusMaks;
  return {
    x: cx + radius * Math.cos(sudut),
    y: cy + radius * Math.sin(sudut),
  };
}

export function buatPointsPolygon(
  nilaiPerSumbu: number[],
  cx: number,
  cy: number,
  radiusMaks: number
): string {
  return nilaiPerSumbu
    .map((nilai, i) => {
      const titik = hitungTitikRadar(nilai, i, nilaiPerSumbu.length, cx, cy, radiusMaks);
      return `${titik.x.toFixed(2)},${titik.y.toFixed(2)}`;
    })
    .join(' ');
}

/** Titik-titik grid cincin referensi (misal di level 25/50/75/100). */
export function buatPointsGrid(
  levelPersen: number,
  totalSumbu: number,
  cx: number,
  cy: number,
  radiusMaks: number
): string {
  const nilaiSama = new Array(totalSumbu).fill(levelPersen);
  return buatPointsPolygon(nilaiSama, cx, cy, radiusMaks);
}
