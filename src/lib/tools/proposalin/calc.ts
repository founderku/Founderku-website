// Proposalin: kerangka proposal usaha mahasiswa (PKM-K, P2MW, lomba
// business plan, atau umum), lengkap dengan RAB dan jadwal kegiatan.
// Kerangka di sini adalah struktur yang umum dipakai. Pedoman resmi bisa
// berubah tiap tahun, jadi user selalu diingatkan untuk mengecek pedoman
// terbaru dari penyelenggara.

export type Jenis = "pkmk" | "p2mw" | "lomba" | "umum";

export interface Bagian {
  id: string;
  judul: string;
  tanya: string;
  kata: number; // saran panjang (kata), bukan aturan resmi
}

export interface InfoJenis {
  label: string;
  catatan: string;
  bagian: Bagian[];
}

export const JENIS: Record<Jenis, InfoJenis> = {
  pkmk: {
    label: "PKM Kewirausahaan (PKM-K)",
    catatan:
      "Struktur umum proposal PKM-K. Batas halaman, format, dan batas persentase biaya ditentukan Pedoman PKM tahun berjalan dari Kemdiktisaintek, jadi cocokkan dulu sebelum mengunggah.",
    bagian: [
      { id: "latar", judul: "Pendahuluan: Latar Belakang", tanya: "Masalah atau peluang apa yang kamu lihat? Dukung dengan data singkat dan sumbernya.", kata: 300 },
      { id: "tujuan", judul: "Pendahuluan: Tujuan dan Manfaat", tanya: "Apa tujuan usaha ini dan manfaatnya bagi pelanggan, tim, dan masyarakat?", kata: 150 },
      { id: "gambaran", judul: "Gambaran Umum Usaha: Produk dan Pelanggan", tanya: "Produk atau jasa apa, keunggulannya, dan siapa pelanggannya?", kata: 300 },
      { id: "pasar", judul: "Gambaran Umum Usaha: Pasar dan Pesaing", tanya: "Seberapa besar pasar sasaran, siapa pesaingnya, dan kenapa pelanggan memilihmu?", kata: 250 },
      { id: "keuangan", judul: "Gambaran Umum Usaha: Proyeksi Keuangan", tanya: "Harga jual, biaya per unit, target penjualan, dan titik impas (BEP).", kata: 200 },
      { id: "metode", judul: "Metode Pelaksanaan", tanya: "Tahapan kerja dari persiapan, produksi, pemasaran, sampai evaluasi.", kata: 350 },
      { id: "pustaka", judul: "Daftar Pustaka", tanya: "Sumber data dan referensi yang kamu kutip, satu per baris.", kata: 0 },
    ],
  },
  p2mw: {
    label: "P2MW (Pembinaan Mahasiswa Wirausaha)",
    catatan:
      "Struktur umum proposal usaha P2MW. Format, kategori bidang usaha, dan batas dana mengikuti Panduan P2MW tahun berjalan, jadi cocokkan dulu dengan panduan dari kampus atau penyelenggara.",
    bagian: [
      { id: "ringkasan", judul: "Ringkasan Usaha", tanya: "Satu paragraf: usaha apa, untuk siapa, sudah sejauh mana, dan butuh dana untuk apa.", kata: 150 },
      { id: "latar", judul: "Latar Belakang", tanya: "Kenapa usaha ini perlu ada? Masalah atau peluang apa yang dijawab?", kata: 250 },
      { id: "profil", judul: "Profil Usaha dan Tim", tanya: "Nama usaha, sudah berjalan berapa lama, pencapaian sejauh ini, dan peran tiap anggota tim.", kata: 250 },
      { id: "produk", judul: "Produk atau Jasa", tanya: "Apa yang dijual, keunggulannya, dan bukti pelanggan suka (testimoni, penjualan).", kata: 250 },
      { id: "pasar", judul: "Analisis Pasar dan Pesaing", tanya: "Target pasar, ukuran pasar, pesaing, dan posisi usahamu.", kata: 250 },
      { id: "pemasaran", judul: "Strategi Pemasaran", tanya: "Harga, saluran jual, promosi, dan target penjualan.", kata: 250 },
      { id: "operasional", judul: "Rencana Operasional", tanya: "Proses produksi, pemasok, kapasitas, dan lokasi usaha.", kata: 200 },
      { id: "keuangan", judul: "Kondisi dan Rencana Keuangan", tanya: "Omzet dan laba sejauh ini, rencana penggunaan dana, dan proyeksi ke depan.", kata: 250 },
      { id: "pengembangan", judul: "Rencana Pengembangan", tanya: "Target usaha 1 tahun ke depan setelah mendapat pendanaan.", kata: 150 },
    ],
  },
  lomba: {
    label: "Lomba business plan",
    catatan:
      "Struktur business plan yang umum dipakai di lomba. Tiap lomba punya format dan kriteria penilaian sendiri, jadi cek guidebook lomba sebelum mengirim.",
    bagian: [
      { id: "ringkasan", judul: "Executive Summary", tanya: "Ringkasan seluruh rencana dalam satu halaman. Tulis paling akhir.", kata: 250 },
      { id: "masalah", judul: "Masalah dan Solusi", tanya: "Masalah nyata apa yang kamu selesaikan, dan bagaimana solusimu?", kata: 250 },
      { id: "produk", judul: "Produk dan Model Bisnis", tanya: "Apa yang dijual, cara menghasilkan uang, dan keunggulannya.", kata: 250 },
      { id: "pasar", judul: "Analisis Pasar", tanya: "Ukuran pasar (TAM, SAM, SOM), target pelanggan, dan tren.", kata: 250 },
      { id: "pesaing", judul: "Analisis Pesaing", tanya: "Siapa pesaing langsung dan tidak langsung, dan apa bedanya denganmu?", kata: 200 },
      { id: "pemasaran", judul: "Strategi Pemasaran", tanya: "Bagaimana mendapatkan pelanggan pertama dan menumbuhkannya?", kata: 250 },
      { id: "operasional", judul: "Rencana Operasional", tanya: "Proses kerja, pemasok, dan tahapan pelaksanaan.", kata: 200 },
      { id: "tim", judul: "Tim", tanya: "Siapa saja anggotanya dan kenapa tim ini tepat menjalankan usaha ini?", kata: 150 },
      { id: "keuangan", judul: "Rencana Keuangan", tanya: "Modal awal, proyeksi pendapatan dan biaya, serta titik impas.", kata: 250 },
      { id: "risiko", judul: "Analisis Risiko", tanya: "Risiko terbesar dan cara kamu mengantisipasinya.", kata: 150 },
    ],
  },
  umum: {
    label: "Proposal kegiatan atau usaha umum",
    catatan: "Struktur proposal umum, misalnya untuk sponsor, dana kampus, atau investor kecil. Sesuaikan dengan permintaan penerima proposal.",
    bagian: [
      { id: "latar", judul: "Latar Belakang", tanya: "Kenapa kegiatan atau usaha ini penting?", kata: 250 },
      { id: "tujuan", judul: "Tujuan", tanya: "Apa yang ingin dicapai? Tulis yang bisa diukur.", kata: 120 },
      { id: "sasaran", judul: "Sasaran", tanya: "Siapa yang dituju dan berapa banyak?", kata: 100 },
      { id: "rencana", judul: "Rencana Kegiatan", tanya: "Apa saja yang akan dilakukan, di mana, dan bagaimana caranya?", kata: 300 },
      { id: "luaran", judul: "Luaran yang Diharapkan", tanya: "Hasil nyata apa yang akan ada setelah kegiatan selesai?", kata: 120 },
      { id: "penutup", judul: "Penutup", tanya: "Ringkasan singkat dan ajakan untuk mendukung.", kata: 80 },
    ],
  },
};

export const KATEGORI_RAB = [
  "Bahan habis pakai",
  "Peralatan penunjang",
  "Sewa dan jasa",
  "Transportasi",
  "Promosi",
  "Lain-lain",
] as const;
export type KategoriRab = (typeof KATEGORI_RAB)[number];

export interface BarisRab {
  kategori: KategoriRab;
  uraian: string;
  volume: number;
  satuan: string;
  harga: number;
}

export interface Kegiatan {
  nama: string;
  bulan: boolean[]; // panjang = jumlah bulan
}

export function hitungKata(teks: string): number {
  const t = (teks || "").trim();
  return t ? t.split(/\s+/).length : 0;
}

export function subtotal(b: BarisRab): number {
  const v = Number.isFinite(b.volume) ? Math.max(0, b.volume) : 0;
  const h = Number.isFinite(b.harga) ? Math.max(0, b.harga) : 0;
  return v * h;
}

export function hitungRab(rab: BarisRab[]) {
  const total = rab.reduce((a, b) => a + subtotal(b), 0);
  const per = KATEGORI_RAB.map((k) => {
    const jumlah = rab.filter((b) => b.kategori === k).reduce((a, b) => a + subtotal(b), 0);
    return { kategori: k, jumlah, persen: total > 0 ? (jumlah / total) * 100 : 0 };
  }).filter((x) => x.jumlah > 0);
  return { total, per };
}

// Samakan panjang centang bulan saat jumlah bulan diubah
export function aturBulan(bulan: boolean[], n: number): boolean[] {
  return Array.from({ length: n }, (_, i) => !!bulan[i]);
}

export interface Isian {
  judul: string;
  tim: string;
  kampus: string;
  pembimbing: string;
  tahun: string;
  isi: Record<string, string>;
  rab: BarisRab[];
  bulanN: number;
  jadwal: Kegiatan[];
}

export const MIN_KATA = 20;

export function cekKelengkapan(jenis: Jenis, d: Isian) {
  const bagian = JENIS[jenis].bagian;
  const daftar = [
    { label: "Judul proposal", ok: d.judul.trim().length > 0 },
    { label: "Nama tim atau pengusul", ok: d.tim.trim().length > 0 },
    ...bagian.map((b) => ({
      label: b.judul,
      // Bagian dianggap sudah ada isinya kalau minimal 20 kata. Saran
      // panjang tiap bagian ditampilkan terpisah sebagai patokan.
      ok: b.kata > 0 ? hitungKata(d.isi[b.id] || "") >= MIN_KATA : (d.isi[b.id] || "").trim().length > 0,
    })),
    { label: "Rencana anggaran (RAB)", ok: d.rab.some((r) => subtotal(r) > 0) },
    { label: "Jadwal kegiatan", ok: d.jadwal.some((k) => k.nama.trim() && k.bulan.some(Boolean)) },
  ];
  const ok = daftar.filter((x) => x.ok).length;
  return { daftar, ok, total: daftar.length, persen: (ok / daftar.length) * 100 };
}
