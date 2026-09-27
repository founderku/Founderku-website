// Kerangka pitch deck: sampul + 10 slide isi. Urutan mengikuti pola yang
// umum dipakai investor tahap awal.

export interface PanduanSlide {
  id: string;
  judul: string;
  tips: string;
  contoh: string;
}

export const SLIDES: PanduanSlide[] = [
  {
    id: "masalah",
    judul: "Masalah",
    tips: "Ceritakan masalah nyata yang dialami pelanggan. Pakai angka atau cerita singkat supaya terasa.",
    contoh: "70% warung kopi tidak tahu untung hariannya\nCatatan penjualan masih di buku tulis\nStok bahan sering habis saat ramai",
  },
  {
    id: "solusi",
    judul: "Solusi",
    tips: "Jelaskan bagaimana produkmu menyelesaikan masalah tadi, dalam bahasa pelanggan, bukan istilah teknis.",
    contoh: "Kasir di HP, tanpa alat tambahan\nLaporan untung otomatis tiap malam\nPengingat stok sebelum habis",
  },
  {
    id: "waktu",
    judul: "Kenapa sekarang",
    tips: "Apa yang berubah sehingga solusi ini baru mungkin atau baru dibutuhkan sekarang?",
    contoh: "Pembayaran QRIS sudah dipakai di mana-mana\nPemilik warung generasi baru terbiasa pakai aplikasi",
  },
  {
    id: "pasar",
    judul: "Ukuran pasar",
    tips: "Hitung dari bawah: jumlah calon pelanggan dikali harga per tahun. Pisahkan pasar total dan target realistis.",
    contoh: "Total: 3 juta warung makan & minum di Indonesia\nTarget 3 tahun: 30.000 warung x Rp 588 rb/tahun = Rp 17,6 M",
  },
  {
    id: "produk",
    judul: "Produk",
    tips: "Tunjukkan produknya: fitur inti, alur pemakaian, atau tangkapan layar. Satu slide, fokus yang paling kuat.",
    contoh: "Catat transaksi dalam 3 ketukan\nLaporan harian dikirim lewat WhatsApp\nBisa dipakai offline",
  },
  {
    id: "model",
    judul: "Model bisnis",
    tips: "Siapa yang bayar, berapa, dan seberapa sering. Kalau ada, sebut juga unit ekonominya (CAC, LTV).",
    contoh: "Langganan Rp 49.000/bulan per outlet\nMargin kotor 80%\nLTV : CAC = 4 : 1",
  },
  {
    id: "traksi",
    judul: "Traksi",
    tips: "Bukti bahwa orang mau: pengguna, pendapatan, pertumbuhan, pilot, atau surat minat. Angka terbaru di atas.",
    contoh: "420 warung aktif, tumbuh 18% per bulan\nPendapatan bulanan Rp 20 jt\n3 kerja sama pemasok",
  },
  {
    id: "kompetitor",
    judul: "Kompetitor & keunggulan",
    tips: "Siapa alternatifnya (termasuk cara manual) dan kenapa kamu lebih unggul. Jujur lebih dipercaya.",
    contoh: "Aplikasi kasir besar: mahal & rumit untuk warung kecil\nBuku tulis: gratis tapi tidak ada laporan\nKami: murah, simpel, laporan otomatis",
  },
  {
    id: "tim",
    judul: "Tim",
    tips: "Kenapa tim ini yang paling tepat. Sebut pengalaman yang relevan, bukan sekadar gelar.",
    contoh: "Rina (CEO): 5 tahun kelola kedai kopi\nDimas (CTO): eks engineer aplikasi pembayaran",
  },
  {
    id: "dana",
    judul: "Pendanaan",
    tips: "Berapa yang dicari, untuk apa saja, dan target yang akan dicapai dengan dana itu (misal dalam 18 bulan).",
    contoh: "Mencari Rp 3 M (pre-seed)\n50% produk, 35% pemasaran, 15% operasional\nTarget: 5.000 warung dalam 18 bulan",
  },
];
