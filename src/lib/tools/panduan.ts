// Teks panduan di bawah tiap tool: apa ini, cara pakai, rumus, dan FAQ.
// Dirender di server (bukan di dalam tool), jadi terbaca mesin pencari
// walau tool-nya sendiri baru tampil setelah JavaScript jalan.
// Artikel terkait diambil otomatis dari blog.json (post dengan "tool" sama).

export interface PanduanTool {
  judul: string;
  intro: string[];
  langkah: string[];
  rumus?: { judul: string; baris: string[]; catatan?: string };
  faq: { q: string; a: string }[];
}

export const PANDUAN: Record<string, PanduanTool> = {
  ipkin: {
    judul: "Kalkulator IPK dan IPS online",
    intro: [
      "IPK-in menghitung IPS (Indeks Prestasi Semester) tiap semester dan IPK (Indeks Prestasi Kumulatif) dari semua semester, lengkap dengan grafik perkembangannya.",
      "Ada juga simulasi target: kamu bisa tahu berapa rata-rata nilai yang dibutuhkan di sisa SKS supaya lulus dengan IPK yang kamu inginkan.",
    ],
    langkah: [
      "Pilih skala nilai yang dipakai kampusmu (A, AB, B, BC atau A, A-, B+, B).",
      "Isi mata kuliah per semester: nama, jumlah SKS, dan nilai hurufnya.",
      "Lihat IPS tiap semester, IPK kumulatif, dan predikat kelulusan di panel hasil.",
      "Isi target IPK dan total SKS lulus untuk melihat rata-rata nilai yang kamu butuhkan.",
    ],
    rumus: {
      judul: "Rumus IPS dan IPK",
      baris: [
        "IPS = Jumlah (SKS × bobot nilai) ÷ Jumlah SKS semester itu",
        "IPK = Total (SKS × bobot nilai) semua semester ÷ Total SKS semua semester",
        "Rata-rata yang dibutuhkan = (Target IPK × Total SKS - Angka mutu sekarang) ÷ Sisa SKS",
      ],
      catatan: "IPK dihitung dari total angka mutu dan total SKS, bukan dari rata-rata IPS tiap semester.",
    },
    faq: [
      {
        q: "Berapa IPK untuk cumlaude?",
        a: "Batas yang banyak dipakai kampus: di atas 3,50 untuk predikat dengan pujian (cumlaude), 3,01 sampai 3,50 sangat memuaskan, dan 2,76 sampai 3,00 memuaskan. Banyak kampus menambah syarat lain, misalnya lulus tepat waktu, jadi cek pedoman akademik kampusmu.",
      },
      {
        q: "Kenapa IPK saya beda dengan rata-rata IPS?",
        a: "Karena tiap semester punya jumlah SKS berbeda. Semester dengan SKS lebih banyak berpengaruh lebih besar, jadi IPK harus dihitung dari total angka mutu dibagi total SKS.",
      },
      {
        q: "Mata kuliah yang nilainya belum keluar dihitung tidak?",
        a: "Tidak. Pilih nilai \"Belum ada\" dan mata kuliah itu tidak ikut dihitung sampai nilainya kamu isi. Nilai E tetap dihitung dengan bobot 0.",
      },
      {
        q: "Apakah data nilai saya dikirim ke server?",
        a: "Tidak, kecuali kamu login dengan akun trial atau Pro yang memang menyimpan data ke akunmu. Tanpa login, data hanya tersimpan di browser perangkatmu.",
      },
    ],
  },

  proposalin: {
    judul: "Template proposal PKM-K, P2MW, dan business plan",
    intro: [
      "Proposalin membantu menyusun proposal usaha mahasiswa: PKM Kewirausahaan (PKM-K), P2MW, lomba business plan, atau proposal umum. Tiap bagian punya pertanyaan panduan dan saran panjang tulisan.",
      "RAB (rencana anggaran biaya) terhitung otomatis per kategori beserta persentasenya, jadwal kegiatan bisa diisi per bulan, dan hasilnya bisa dicetak jadi PDF.",
    ],
    langkah: [
      "Pilih jenis proposal, lalu isi identitas: judul, tim, kampus, dan dosen pendamping.",
      "Tulis tiap bagian dengan bantuan pertanyaan panduan. Penghitung kata menunjukkan panjang yang disarankan.",
      "Isi RAB (uraian, volume, satuan, harga satuan) dan centang bulan untuk tiap kegiatan.",
      "Buka Pratinjau dokumen, lalu Cetak / PDF untuk draf yang rapi.",
    ],
    rumus: {
      judul: "Cara hitung RAB",
      baris: [
        "Jumlah per baris = Volume × Harga satuan",
        "Persentase kategori = Jumlah kategori ÷ Total anggaran × 100%",
      ],
      catatan: "Batas dana dan batas persentase tiap kategori ditetapkan pedoman resmi yang terbit tiap tahun, jadi selalu cocokkan dengan pedoman terbaru.",
    },
    faq: [
      {
        q: "Apakah format ini sama dengan pedoman resmi PKM?",
        a: "Proposalin memakai struktur yang umum dipakai. Format halaman, huruf, dan sampul resmi bisa berubah tiap tahun, jadi pakai Proposalin untuk menyusun isi, lalu salin ke template resmi dari penyelenggara sebelum mengirim.",
      },
      {
        q: "Apa beda PKM-K dan P2MW?",
        a: "PKM-K umumnya untuk ide usaha yang baru akan dijalankan, sedangkan P2MW umumnya untuk usaha mahasiswa yang sudah berjalan dan ingin dikembangkan. Cek syarat lengkapnya di pedoman tahun berjalan.",
      },
      {
        q: "Bagaimana menyusun RAB yang wajar?",
        a: "Tulis rinci (uraian, volume, satuan, harga), pakai harga pasar yang bisa dicek, kelompokkan per kategori, dan pastikan persentase tiap kategori tidak melewati batas di pedoman.",
      },
      {
        q: "Bisa dikerjakan bareng tim?",
        a: "Data tersimpan di browser perangkatmu, atau di akunmu kalau login dengan trial atau Pro. Untuk kerja tim, cetak PDF-nya lalu bagikan ke anggota untuk dikoreksi.",
      },
    ],
  },

  kanvasin: {
    judul: "Template Business Model Canvas dan Lean Canvas",
    intro: [
      "Kanvasin membantu memetakan model bisnis dalam satu halaman dengan Lean Canvas atau Business Model Canvas. Tiap blok punya pertanyaan panduan dan contoh isian.",
      "Ada saran otomatis kalau isian kanvasmu belum nyambung, dan hasilnya bisa dicetak satu halaman A4 lanskap untuk tugas kuliah, PKM, atau lomba.",
    ],
    langkah: [
      "Pilih Lean Canvas (untuk ide baru) atau Business Model Canvas (untuk usaha yang sudah berjalan).",
      "Isi tiap blok, satu poin per baris. Pertanyaan panduan dan contoh ada di tiap blok.",
      "Perhatikan saran di panel samping, misalnya segmen pelanggan yang terlalu banyak.",
      "Cek pratinjau kanvas, lalu Cetak / PDF.",
    ],
    faq: [
      {
        q: "Apa beda Lean Canvas dan Business Model Canvas?",
        a: "Keduanya punya 9 blok. Lean Canvas fokus pada masalah, solusi, dan metrik yang perlu dibuktikan, cocok untuk ide baru. Business Model Canvas lebih lengkap menggambarkan operasional (mitra, sumber daya, hubungan pelanggan), cocok untuk usaha yang sudah berjalan.",
      },
      {
        q: "Blok mana yang diisi duluan?",
        a: "Mulai dari segmen pelanggan, lalu masalah atau proposisi nilai. Setelah itu solusi, saluran, pendapatan, dan biaya.",
      },
      {
        q: "Boleh ada blok yang kosong?",
        a: "Boleh, terutama Keunggulan Tak Tertandingi di Lean Canvas. Lebih baik jujur kosong daripada diisi hal yang belum benar.",
      },
    ],
  },

  pajakin: {
    judul: "Kalkulator PPh Final UMKM 0,5%",
    intro: [
      "Pajakin menghitung simulasi PPh Final UMKM dengan tarif 0,5% dari omzet untuk bulan ini, dengan memperhitungkan jatah omzet Rp500 juta pertama per tahun yang tidak kena pajak.",
      "Cocok untuk pelaku UMKM yang ingin tahu perkiraan pajak bulanan sebelum menyetor. Hasilnya simulasi, bukan pengganti konsultasi pajak resmi.",
    ],
    langkah: [
      "Isi omzet kumulatif tahun ini sebelum bulan ini.",
      "Isi omzet bulan ini.",
      "Lihat bagian omzet yang masih bebas pajak, bagian yang kena 0,5%, dan perkiraan pajaknya.",
    ],
    rumus: {
      judul: "Cara hitung",
      baris: [
        "Sisa jatah bebas pajak = Rp500 juta - Omzet tahun ini sebelum bulan ini (minimal 0)",
        "Bagian kena pajak = Omzet bulan ini - Sisa jatah bebas pajak (minimal 0)",
        "PPh Final = Bagian kena pajak × 0,5%",
      ],
      catatan: "Skema ini dibatasi omzet setahun sampai Rp4,8 miliar. Kondisi tiap usaha bisa berbeda, jadi konsultasikan dengan konsultan pajak atau kantor pajak kalau ragu.",
    },
    faq: [
      {
        q: "Omzet di bawah Rp500 juta setahun kena pajak tidak?",
        a: "Untuk wajib pajak orang pribadi, bagian omzet sampai Rp500 juta pertama dalam setahun tidak dikenai PPh Final 0,5%. Pajak baru dihitung dari omzet setelah melewati angka itu.",
      },
      {
        q: "0,5% itu dari omzet atau dari untung?",
        a: "Dari omzet (peredaran bruto), bukan dari untung. Jadi walaupun usaha sedang rugi, PPh Final tetap dihitung dari omzetnya.",
      },
      {
        q: "Kalau omzet lewat Rp4,8 miliar setahun bagaimana?",
        a: "Usaha tidak bisa lagi memakai skema PPh Final UMKM dan beralih ke ketentuan umum. Pajakin akan memberi peringatan kalau omzet kumulatifmu melewati batas ini.",
      },
    ],
  },

  notain: {
    judul: "Bikin invoice online gratis",
    intro: [
      "Notain membantu UMKM membuat invoice yang rapi untuk pelanggan: info usaha, info pembeli, daftar barang atau jasa, diskon, pajak, dan catatan pembayaran.",
      "Total terhitung otomatis dan invoice bisa langsung dicetak atau disimpan jadi PDF untuk dikirim lewat WhatsApp atau email.",
    ],
    langkah: [
      "Isi info usaha kamu: nama, alamat, dan kontak.",
      "Isi nomor invoice, tanggal, dan info pembeli.",
      "Tambahkan barang atau jasa beserta jumlah dan harganya. Tambahkan diskon atau pajak (misalnya PPN) kalau perlu.",
      "Tulis info pembayaran, misalnya nomor rekening dan batas waktu, lalu cetak atau simpan sebagai PDF.",
    ],
    rumus: {
      judul: "Cara hitung total",
      baris: [
        "Subtotal = Jumlah (kuantitas × harga) semua barang",
        "Pajak = (Subtotal - Diskon) × Persen pajak",
        "Total = Subtotal - Diskon + Pajak",
      ],
    },
    faq: [
      {
        q: "Apa beda invoice dan kwitansi?",
        a: "Invoice adalah tagihan yang dikirim sebelum dibayar, berisi rincian barang dan cara pembayaran. Kwitansi adalah bukti bahwa pembayaran sudah diterima.",
      },
      {
        q: "Apa saja yang wajib ada di invoice?",
        a: "Minimal nama usaha dan kontak, nomor dan tanggal invoice, nama pembeli, rincian barang atau jasa, total yang harus dibayar, dan cara pembayaran.",
      },
      {
        q: "Invoice saya disimpan di mana?",
        a: "Di browser perangkatmu. Kalau login dengan akun trial atau Pro, data juga tersimpan di akun dan bisa dibuka dari perangkat lain.",
      },
    ],
  },

  hargain: {
    judul: "Kalkulator harga jual dan paket harga",
    intro: [
      "Hargain membantu menentukan harga langganan per bulan dari tiga sisi: biaya (supaya tetap untung), nilai yang didapat pelanggan, dan harga kompetitor.",
      "Hasilnya kisaran harga yang masuk akal, margin kotor di harga pilihanmu, jumlah pelanggan untuk balik modal, dan pratinjau tabel paket harga.",
    ],
    langkah: [
      "Isi biaya per pelanggan per bulan, target margin kotor, dan biaya tetap per bulan.",
      "Isi perkiraan nilai yang didapat pelanggan tiap bulan berkat produkmu.",
      "Isi harga kompetitor termurah dan termahal.",
      "Masukkan harga pilihanmu, lalu susun tiga paket harga dan lihat pratinjaunya.",
    ],
    rumus: {
      judul: "Rumus yang dipakai",
      baris: [
        "Harga minimal = Biaya per pelanggan ÷ (1 - Target margin)",
        "Margin kotor = (Harga - Biaya per pelanggan) ÷ Harga",
        "Balik modal = Biaya tetap ÷ (Harga - Biaya per pelanggan), dibulatkan ke atas",
      ],
    },
    faq: [
      {
        q: "Berapa margin kotor yang sehat?",
        a: "Tergantung jenis usaha. Untuk software atau langganan digital, margin kotor di atas 60% umumnya dianggap sehat. Usaha barang fisik biasanya lebih rendah.",
      },
      {
        q: "Kenapa perlu tiga paket harga?",
        a: "Tiga pilihan memudahkan pelanggan membandingkan. Paket tengah biasanya paling banyak dipilih, jadi taruh penawaran utamamu di sana.",
      },
      {
        q: "Harga saya lebih mahal dari kompetitor, salah tidak?",
        a: "Tidak selalu. Harga lebih mahal bisa masuk akal kalau nilai yang didapat pelanggan jelas lebih besar. Pastikan kamu bisa menjelaskan bedanya.",
      },
    ],
  },

  runwayin: {
    judul: "Kalkulator runway dan burn rate startup",
    intro: [
      "Runwayin menghitung berapa bulan lagi kas startup kamu cukup, kapan kas habis, dan bagaimana pengaruhnya kalau pemasukan atau pengeluaran tumbuh tiap bulan.",
      "Kamu juga bisa mensimulasikan skenario, misalnya merekrut orang baru atau mendapat pendanaan, dan membandingkannya di grafik.",
    ],
    langkah: [
      "Isi kas di bank sekarang dan pemasukan per bulan beserta pertumbuhannya.",
      "Isi pos pengeluaran per bulan dan pertumbuhannya.",
      "Lihat runway, bulan kas habis, dan grafik kas per bulan.",
      "Tambahkan skenario untuk melihat dampaknya ke runway.",
    ],
    rumus: {
      judul: "Rumus dasar",
      baris: [
        "Net burn = Total pengeluaran per bulan - Pemasukan per bulan",
        "Runway (bulan) = Kas di bank ÷ Net burn",
      ],
      catatan: "Runwayin menghitung bulan per bulan, jadi pertumbuhan pemasukan dan pengeluaran ikut diperhitungkan.",
    },
    faq: [
      {
        q: "Berapa runway yang aman?",
        a: "Patokan yang sering dipakai: di atas 12 bulan aman untuk fokus membangun produk, 9 sampai 12 bulan saat yang baik untuk mulai galang dana, dan di bawah 6 bulan sudah berbahaya.",
      },
      {
        q: "Apa beda gross burn dan net burn?",
        a: "Gross burn adalah total pengeluaran per bulan. Net burn adalah pengeluaran dikurangi pemasukan, dan inilah yang benar-benar mengurangi kas.",
      },
      {
        q: "Bagaimana memperpanjang runway?",
        a: "Tambah pemasukan atau tekan pengeluaran: tunda rekrutmen yang belum mendesak, hentikan biaya yang tidak menambah pendapatan, dan tawarkan paket tahunan dibayar di depan.",
      },
    ],
  },

  pitchin: {
    judul: "Template pitch deck startup 10 slide",
    intro: [
      "Pitchin membantu menyusun pitch deck 10 slide dengan panduan di tiap slide: masalah, solusi, kenapa sekarang, ukuran pasar, produk, model bisnis, traksi, kompetitor, tim, dan pendanaan.",
      "Isi poin-poinnya, lihat pratinjaunya, lalu cetak jadi PDF satu slide per halaman yang siap dikirim ke investor.",
    ],
    langkah: [
      "Isi sampul: nama startup, tagline satu kalimat, dan kontak.",
      "Isi poin tiap slide dengan bantuan tips dan contoh. Maksimal 3 sampai 5 poin per slide.",
      "Buka tab Pratinjau untuk melihat hasilnya.",
      "Tekan Cetak / PDF dan pilih orientasi lanskap.",
    ],
    faq: [
      {
        q: "Berapa jumlah slide pitch deck yang ideal?",
        a: "Sekitar 10 slide sudah cukup untuk sebagian besar pertemuan pertama dengan investor. Detail tambahan bisa disimpan di lampiran.",
      },
      {
        q: "Slide mana yang paling penting?",
        a: "Masalah, traksi, dan tim biasanya paling diperhatikan. Tunjukkan masalah yang nyata, bukti orang mau memakai produkmu, dan kenapa tim kamu yang tepat.",
      },
      {
        q: "Bisa diedit lagi setelah dicetak?",
        a: "Bisa. Isian tersimpan di browser (atau di akunmu kalau login dengan trial atau Pro), jadi kamu bisa kembali, mengubah, dan mencetak ulang kapan saja.",
      },
    ],
  },
};
