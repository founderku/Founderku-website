// Kanvasin: Business Model Canvas dan Lean Canvas dalam satu halaman.
// Tiap blok berisi pertanyaan panduan dan contoh. Isi tiap blok ditulis
// satu poin per baris.

export type Model = "bmc" | "lean";

export interface Blok {
  id: string;
  judul: string;
  tanya: string;
  contoh: string;
  area: string; // nama grid-area di tampilan kanvas
}

// Business Model Canvas (Osterwalder): 9 blok
export const BLOK_BMC: Blok[] = [
  {
    id: "mitra",
    judul: "Mitra Utama",
    tanya: "Siapa pihak luar yang membantu usahamu berjalan? Pemasok, partner, platform.",
    contoh: "Petani kopi di Temanggung\nPlatform ojek online untuk antar",
    area: "a",
  },
  {
    id: "aktivitas",
    judul: "Aktivitas Utama",
    tanya: "Kegiatan terpenting yang harus kamu lakukan supaya nilai tawaranmu terwujud?",
    contoh: "Meracik dan menyangrai kopi\nPromosi di Instagram dan TikTok",
    area: "b",
  },
  {
    id: "sumberdaya",
    judul: "Sumber Daya Utama",
    tanya: "Aset terpenting yang kamu butuhkan: alat, orang, merek, data, modal?",
    contoh: "Mesin sangrai kecil\nBarista berpengalaman\nResep racikan sendiri",
    area: "c",
  },
  {
    id: "nilai",
    judul: "Proposisi Nilai",
    tanya: "Masalah apa yang kamu selesaikan, dan kenapa pelanggan memilihmu dibanding yang lain?",
    contoh: "Kopi susu enak harga mahasiswa (Rp 12 ribuan)\nBisa pesan antar ke kos dalam 20 menit",
    area: "d",
  },
  {
    id: "hubungan",
    judul: "Hubungan Pelanggan",
    tanya: "Bagaimana kamu menjaga pelanggan supaya kembali lagi?",
    contoh: "Kartu stempel: beli 9 gratis 1\nGrup WhatsApp pelanggan setia",
    area: "e",
  },
  {
    id: "saluran",
    judul: "Saluran",
    tanya: "Lewat mana pelanggan tahu, membeli, dan menerima produkmu?",
    contoh: "Booth di depan kampus\nGoFood dan GrabFood\nInstagram",
    area: "f",
  },
  {
    id: "segmen",
    judul: "Segmen Pelanggan",
    tanya: "Siapa pelanggan terpentingmu? Makin spesifik makin baik.",
    contoh: "Mahasiswa sekitar kampus\nKaryawan muda yang kerja dari kafe",
    area: "g",
  },
  {
    id: "biaya",
    judul: "Struktur Biaya",
    tanya: "Biaya terbesar apa saja untuk menjalankan model bisnis ini?",
    contoh: "Bahan baku (biji kopi, susu)\nSewa booth\nGaji barista",
    area: "h",
  },
  {
    id: "pendapatan",
    judul: "Arus Pendapatan",
    tanya: "Dari mana uang masuk, dan pelanggan bayar dengan cara apa?",
    contoh: "Penjualan per gelas\nPaket langganan mingguan untuk kantor",
    area: "i",
  },
];

// Lean Canvas (Ash Maurya): 9 blok, lebih cocok untuk ide yang baru mulai
export const BLOK_LEAN: Blok[] = [
  {
    id: "masalah",
    judul: "Masalah",
    tanya: "Tulis 1 sampai 3 masalah terbesar calon pelanggan. Bagaimana mereka mengatasinya sekarang?",
    contoh: "Mahasiswa susah cari kopi enak yang murah\nKedai kopi dekat kampus tutup jam 9 malam",
    area: "a",
  },
  {
    id: "solusi",
    judul: "Solusi",
    tanya: "Fitur atau cara paling sederhana untuk menyelesaikan tiap masalah di atas.",
    contoh: "Kopi susu racikan sendiri harga Rp 12 ribuan\nBuka sampai jam 12 malam saat musim ujian",
    area: "b",
  },
  {
    id: "metrik",
    judul: "Metrik Utama",
    tanya: "Angka apa yang menunjukkan usahamu berjalan baik?",
    contoh: "Gelas terjual per hari\nPersentase pelanggan yang beli lagi dalam seminggu",
    area: "c",
  },
  {
    id: "nilai",
    judul: "Nilai Unik",
    tanya: "Satu kalimat jelas kenapa usahamu berbeda dan layak dicoba.",
    contoh: "Kopi susu enak harga mahasiswa, buka sampai tengah malam.",
    area: "d",
  },
  {
    id: "keunggulan",
    judul: "Keunggulan Tak Tertandingi",
    tanya: "Apa yang tidak mudah ditiru atau dibeli pesaing? Boleh dikosongkan kalau belum ada.",
    contoh: "Lokasi booth di jalur utama kampus\nKomunitas pelanggan yang sudah kenal kami",
    area: "e",
  },
  {
    id: "saluran",
    judul: "Saluran",
    tanya: "Bagaimana kamu menjangkau pelanggan pertama?",
    contoh: "Titip promo di grup angkatan\nBooth saat acara kampus",
    area: "f",
  },
  {
    id: "segmen",
    judul: "Segmen Pelanggan",
    tanya: "Siapa target pelanggan, dan siapa pengguna pertama (early adopter) yang paling butuh?",
    contoh: "Mahasiswa sekitar kampus\nEarly adopter: anak kos yang sering begadang",
    area: "g",
  },
  {
    id: "biaya",
    judul: "Struktur Biaya",
    tanya: "Biaya tetap dan biaya per penjualan yang perlu kamu tanggung.",
    contoh: "Sewa booth Rp 800 ribu/bulan\nBahan baku sekitar Rp 5 ribu per gelas",
    area: "h",
  },
  {
    id: "pendapatan",
    judul: "Arus Pendapatan",
    tanya: "Model harga, perkiraan harga, dan dari mana untung didapat.",
    contoh: "Rp 12.000 per gelas, untung kotor sekitar Rp 7.000\nPaket 10 gelas Rp 110.000",
    area: "i",
  },
];

export const BLOK: Record<Model, Blok[]> = { bmc: BLOK_BMC, lean: BLOK_LEAN };

export const NAMA_MODEL: Record<Model, string> = { bmc: "Business Model Canvas", lean: "Lean Canvas" };

// Satu poin per baris, tanda "-" atau "•" di depan dibuang
export function butir(teks: string): string[] {
  return (teks || "")
    .split("\n")
    .map((x) => x.replace(/^\s*[-*•]\s*/, "").trim())
    .filter(Boolean);
}

export function kelengkapan(model: Model, isi: Record<string, string>) {
  const blok = BLOK[model];
  const terisi = blok.filter((b) => butir(isi[b.id] || "").length > 0).length;
  return { terisi, total: blok.length, persen: (terisi / blok.length) * 100 };
}

export interface Saran {
  tone: "good" | "warn";
  teks: string;
}

// Saran sederhana supaya kanvas saling nyambung. Bukan penilaian mutlak.
export function saran(model: Model, isi: Record<string, string>): Saran[] {
  const n = (id: string) => butir(isi[id] || "").length;
  const hasil: Saran[] = [];
  const { terisi, total } = kelengkapan(model, isi);
  if (terisi === 0) return hasil;

  if (n("segmen") > 3) hasil.push({ tone: "warn", teks: "Segmen pelanggan lebih dari 3. Coba fokus ke 1 sampai 2 segmen yang paling butuh dulu." });
  if (n("nilai") === 0) hasil.push({ tone: "warn", teks: `Blok ${model === "bmc" ? "Proposisi Nilai" : "Nilai Unik"} masih kosong. Ini jantung kanvas, isi paling awal.` });
  if (n("pendapatan") > 0 && n("segmen") === 0) hasil.push({ tone: "warn", teks: "Sudah ada arus pendapatan tapi segmen pelanggan kosong. Siapa yang membayar?" });
  if (n("pendapatan") > 0 && n("biaya") === 0) hasil.push({ tone: "warn", teks: "Struktur biaya kosong. Hampir semua usaha punya biaya, tulis minimal yang terbesar." });

  if (model === "bmc") {
    if (n("aktivitas") > 0 && n("sumberdaya") === 0) hasil.push({ tone: "warn", teks: "Ada aktivitas utama, tapi sumber daya untuk menjalankannya belum ditulis." });
    if (n("saluran") === 0 && n("segmen") > 0) hasil.push({ tone: "warn", teks: "Segmen sudah ada, tapi saluran untuk menjangkaunya belum ditulis." });
  } else {
    if (n("masalah") > 3) hasil.push({ tone: "warn", teks: "Masalah lebih dari 3. Lean Canvas menyarankan fokus ke 3 masalah teratas." });
    if (n("masalah") > 0 && n("solusi") === 0) hasil.push({ tone: "warn", teks: "Masalah sudah ada, tapi solusinya belum ditulis." });
    if (n("solusi") > n("masalah") + 2) hasil.push({ tone: "warn", teks: "Solusi jauh lebih banyak dari masalah. Pastikan tiap solusi menjawab masalah yang ditulis." });
    const uvp = (isi.nilai || "").trim();
    if (uvp.length > 160) hasil.push({ tone: "warn", teks: "Nilai unik terlalu panjang. Usahakan satu kalimat pendek yang mudah diingat." });
    if (n("metrik") === 0 && terisi >= 5) hasil.push({ tone: "warn", teks: "Metrik utama kosong. Tanpa angka, sulit tahu usahamu berjalan atau tidak." });
  }

  if (terisi === total && hasil.length === 0) hasil.push({ tone: "good", teks: "Semua blok terisi dan saling nyambung. Saatnya uji ke calon pelanggan sungguhan." });
  return hasil;
}
