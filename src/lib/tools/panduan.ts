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
  jalanin: {
    judul: "Checklist langkah membangun usaha dari nol",
    intro: [
      "Jalanin adalah checklist langkah demi langkah untuk membangun usaha, dibagi ke 7 tahap: Validasi Ide, Legalitas & Administrasi, Branding & Identitas, Persiapan Operasional, Jualan Pertama, Pajak & Kerjasama, dan Scale Up.",
      "Centang langkah yang sudah selesai dan lihat progresmu, supaya kamu tahu apa yang perlu dikerjakan berikutnya tanpa bingung mulai dari mana.",
    ],
    langkah: [
      "Mulai dari tahap Validasi Ide, walaupun kamu merasa idenya sudah bagus.",
      "Baca tiap langkah, kerjakan, lalu centang kalau sudah selesai.",
      "Pantau progres tiap tahap, lalu lanjut ke tahap berikutnya.",
    ],
    faq: [
      {
        q: "Harus urut dari tahap pertama?",
        a: "Disarankan urut, karena tiap tahap jadi dasar tahap berikutnya. Tapi kalau usahamu sudah berjalan, kamu boleh langsung ke tahap yang belum selesai.",
      },
      {
        q: "Apakah semua usaha perlu izin dulu sebelum jualan?",
        a: "Kebutuhan izin berbeda per jenis usaha. Untuk usaha mikro, NIB lewat OSS adalah langkah awal yang umum. Produk makanan olahan rumahan biasanya juga butuh izin PIRT. Cek syaratnya sesuai jenis usahamu.",
      },
      {
        q: "Progres saya tersimpan di mana?",
        a: "Di browser perangkatmu. Kalau login dengan akun trial atau Pro, progres juga tersimpan di akun.",
      },
    ],
  },

  kontrakin: {
    judul: "Bikin surat perjanjian kerja sama sederhana",
    intro: [
      "Kontrakin membantu membuat surat perjanjian kerja sama sederhana antara dua pihak: info umum, data para pihak, ruang lingkup dan kewajiban, jangka waktu, serta pasal tambahan.",
      "Pratinjau dokumen langsung tersusun rapi dan bisa dicetak atau disimpan jadi PDF untuk ditandatangani.",
    ],
    langkah: [
      "Isi info umum perjanjian, misalnya judul dan tanggal.",
      "Isi data pihak pertama dan pihak kedua.",
      "Tulis ruang lingkup kerja sama dan kewajiban masing-masing pihak.",
      "Tentukan jangka waktu, tambahkan pasal lain kalau perlu, lalu cetak atau simpan sebagai PDF.",
    ],
    faq: [
      {
        q: "Apakah perjanjian ini sah secara hukum?",
        a: "Perjanjian umumnya sah kalau memenuhi syarat Pasal 1320 KUHPerdata: kedua pihak sepakat, cakap hukum, ada hal yang diperjanjikan dengan jelas, dan isinya tidak melanggar hukum. Untuk nilai besar atau kerja sama yang rumit, konsultasikan dengan ahli hukum.",
      },
      {
        q: "Perlu meterai tidak?",
        a: "Meterai bukan syarat sahnya perjanjian. Meterai berfungsi sebagai bea atas dokumen, dan dokumen yang akan dipakai sebagai alat bukti biasanya perlu meterai Rp10.000.",
      },
      {
        q: "Apakah Kontrakin pengganti pengacara?",
        a: "Bukan. Kontrakin membantu menyusun perjanjian sederhana supaya kesepakatan tertulis dengan jelas. Untuk urusan hukum yang penting, tetap minta pendapat ahli.",
      },
    ],
  },

  sehatin: {
    judul: "Cek kesehatan usaha UMKM",
    intro: [
      "Sehatin mengecek kesehatan usahamu lewat pertanyaan singkat di 5 aspek: Keuangan, Legalitas & Pajak, Pemasaran & Branding, Operasional, serta Tim & Pengelolaan.",
      "Hasilnya skor 0 sampai 100 per aspek dalam grafik radar, jadi kamu langsung tahu bagian mana yang paling perlu dibenahi dulu.",
    ],
    langkah: [
      "Jawab tiap pernyataan sesuai kondisi usahamu sekarang, dengan jujur.",
      "Lihat skor total dan skor tiap aspek di grafik radar.",
      "Mulai perbaikan dari aspek dengan skor paling rendah, ikuti rekomendasinya.",
    ],
    rumus: {
      judul: "Cara hitung skor",
      baris: [
        "Tiap jawaban bernilai 0 sampai 3",
        "Skor aspek = Total nilai jawaban ÷ Nilai maksimal aspek × 100",
        "Skor total = Rata-rata skor 5 aspek",
      ],
      catatan: "Label hasil: sampai 40 perlu perhatian serius, 41 sampai 65 masih rintisan, 66 sampai 85 cukup sehat, di atas 85 mantap.",
    },
    faq: [
      {
        q: "Berapa lama mengisinya?",
        a: "Sekitar 5 menit. Pertanyaannya singkat dan tidak perlu menyiapkan dokumen.",
      },
      {
        q: "Skor saya rendah, harus bagaimana?",
        a: "Wajar untuk usaha yang baru mulai. Fokus ke satu aspek dengan skor terendah dulu dan ikuti rekomendasinya, lalu cek ulang beberapa bulan kemudian.",
      },
      {
        q: "Seberapa sering sebaiknya dicek?",
        a: "Setiap 3 sampai 6 bulan cukup untuk melihat perkembangan usahamu.",
      },
    ],
  },

  validasiin: {
    judul: "Cek kesiapan ide startup",
    intro: [
      "Validasiin mengukur seberapa siap ide startupmu lewat 10 pernyataan di 5 area: Masalah, Pelanggan, Solusi, Pasar, serta Bisnis & Tim. Tiap pernyataan dinilai 1 sampai 5.",
      "Hasilnya skor kesiapan 0 sampai 100, skor per area, area terlemah, dan saran langkah berikutnya.",
    ],
    langkah: [
      "Beri nilai 1 sampai 5 untuk tiap pernyataan, sejujur mungkin.",
      "Lihat skor total dan skor tiap area.",
      "Perhatikan area terlemah dan saran yang muncul, lalu kerjakan itu dulu.",
    ],
    rumus: {
      judul: "Cara hitung skor",
      baris: ["Skor = (Rata-rata nilai - 1) ÷ 4 × 100"],
      catatan: "Nilai rata-rata 1 berarti skor 0, dan nilai rata-rata 5 berarti skor 100.",
    },
    faq: [
      {
        q: "Skor berapa yang dianggap siap?",
        a: "Tidak ada angka ajaib. Yang lebih penting adalah area terlemahmu. Satu area yang sangat lemah, misalnya belum pernah ngobrol dengan calon pelanggan, bisa menggagalkan ide yang lain-lainnya kuat.",
      },
      {
        q: "Bagaimana cara menaikkan skor?",
        a: "Paling cepat lewat bukti nyata: wawancarai minimal 10 calon pelanggan, cari tahu apa yang sudah mereka coba, dan uji apakah mereka mau membayar.",
      },
      {
        q: "Apa beda Validasiin dan Wawancarain?",
        a: "Validasiin menilai kesiapan idemu secara keseluruhan. Wawancarain membantu mengumpulkan bukti dari wawancara calon pelanggan, yang biasanya jadi cara terbaik menaikkan skor Validasiin.",
      },
    ],
  },

  unitin: {
    judul: "Kalkulator CAC, LTV, dan payback period",
    intro: [
      "Unitin menghitung unit ekonomi startup: berapa biaya mendapatkan satu pelanggan (CAC), berapa nilai satu pelanggan selama dia jadi pelanggan (LTV), dan berapa bulan biaya akuisisi itu kembali (payback).",
      "Bisa dipakai untuk model langganan maupun pembelian berulang, lengkap dengan penilaian apakah rasio LTV banding CAC-mu sehat.",
    ],
    langkah: [
      "Pilih model: langganan atau pembelian berulang.",
      "Isi harga, frekuensi beli (untuk pembelian berulang), dan margin kotor.",
      "Isi biaya marketing dan sales sebulan, serta jumlah pelanggan baru di bulan itu.",
      "Isi churn per bulan (langganan) atau lama pelanggan bertahan (pembelian berulang), lalu lihat hasilnya.",
    ],
    rumus: {
      judul: "Rumus yang dipakai",
      baris: [
        "CAC = (Biaya marketing + Biaya sales) ÷ Pelanggan baru",
        "Kontribusi per bulan = Pendapatan per pelanggan per bulan × Margin kotor",
        "Umur pelanggan (bulan) = 100 ÷ Churn % per bulan",
        "LTV = Kontribusi per bulan × Umur pelanggan",
        "Payback (bulan) = CAC ÷ Kontribusi per bulan",
      ],
      catatan: "Umur pelanggan dibatasi 60 bulan (5 tahun) supaya churn yang sangat kecil tidak membuat LTV tidak masuk akal.",
    },
    faq: [
      {
        q: "Berapa rasio LTV:CAC yang sehat?",
        a: "Patokan yang sering dipakai adalah minimal 3:1, artinya nilai satu pelanggan minimal tiga kali biaya mendapatkannya. Unitin juga menampilkan CAC maksimal supaya rasio itu tercapai.",
      },
      {
        q: "Kenapa LTV dihitung dari margin, bukan dari harga?",
        a: "Karena yang benar-benar menutup biaya akuisisi adalah untung kotor dari pelanggan, bukan seluruh uang yang dia bayar.",
      },
      {
        q: "Berapa lama payback yang baik?",
        a: "Makin cepat makin baik. Banyak startup menargetkan di bawah 12 bulan, supaya kas tidak terlalu lama tertahan untuk mendapatkan pelanggan baru.",
      },
    ],
  },

  sahamin: {
    judul: "Simulasi cap table dan dilusi saham",
    intro: [
      "Sahamin mensimulasikan kepemilikan saham (cap table) startup: dari porsi para pendiri, jatah saham karyawan (ESOP), sampai beberapa putaran pendanaan.",
      "Kamu bisa melihat bagaimana persentase kepemilikan tiap pihak berubah (terdilusi) setelah tiap putaran masuk.",
    ],
    langkah: [
      "Isi nama dan porsi tiap pendiri.",
      "Tentukan persentase ESOP kalau ada.",
      "Tambahkan putaran pendanaan: nilai pre-money dan jumlah investasi.",
      "Lihat tabel kepemilikan dan dilusi di tiap tahap.",
    ],
    rumus: {
      judul: "Rumus tiap putaran",
      baris: [
        "Harga per saham = Valuasi pre-money ÷ Jumlah saham sebelum putaran",
        "Saham investor = Investasi ÷ Harga per saham",
        "Valuasi post-money = Pre-money + Investasi",
        "Kepemilikan investor = Investasi ÷ Post-money",
      ],
      catatan: "Sahamin menghitung putaran dengan harga saham (priced round). SAFE dan convertible note belum dihitung.",
    },
    faq: [
      {
        q: "Apa itu dilusi?",
        a: "Dilusi adalah turunnya persentase kepemilikan karena ada saham baru yang diterbitkan, misalnya untuk investor. Jumlah sahammu tetap, tapi porsinya dari total jadi lebih kecil.",
      },
      {
        q: "Apa beda pre-money dan post-money?",
        a: "Pre-money adalah valuasi startup sebelum uang investor masuk. Post-money adalah pre-money ditambah jumlah investasi.",
      },
      {
        q: "Berapa ESOP yang umum?",
        a: "Banyak startup tahap awal menyisihkan sekitar 10% sampai 15% untuk ESOP, tergantung rencana rekrutmen. Ini hanya kisaran umum, bukan aturan.",
      },
    ],
  },

  wawancarain: {
    judul: "Panduan wawancara calon pelanggan",
    intro: [
      "Wawancarain membantu memvalidasi masalah lewat wawancara calon pelanggan: daftar pertanyaan yang tidak menggiring, catatan tiap responden, dan rangkuman otomatis.",
      "Rangkuman menunjukkan rata-rata seberapa sakit masalahnya, berapa persen yang sudah mencari solusi, dan berapa persen yang mau membayar.",
    ],
    langkah: [
      "Tulis hipotesis masalah dan siapa target respondenmu.",
      "Pakai daftar pertanyaan yang disediakan, atau sesuaikan.",
      "Catat tiap responden: seberapa sakit masalahnya (1 sampai 5), sudah cari solusi atau belum, dan mau bayar atau tidak.",
      "Lihat rangkuman setelah minimal 10 wawancara.",
    ],
    rumus: {
      judul: "Cara membaca hasil",
      baris: [
        "Sinyal kuat: rata-rata sakit minimal 3,5 dan minimal 30% mau bayar",
        "Sinyal lemah: rata-rata sakit di bawah 2,5 dan kurang dari 10% mau bayar",
      ],
      catatan: "Kesimpulan baru muncul setelah minimal 10 responden, supaya tidak terburu-buru dari sedikit data.",
    },
    faq: [
      {
        q: "Kenapa minimal 10 orang?",
        a: "Dengan 10 wawancara, pola biasanya mulai terlihat. Kurang dari itu, hasilnya mudah terpengaruh satu atau dua orang saja.",
      },
      {
        q: "Pertanyaan seperti apa yang sebaiknya dihindari?",
        a: "Pertanyaan yang menggiring, misalnya \"Kamu mau pakai aplikasi ini?\". Lebih baik tanya pengalaman nyata: \"Kapan terakhir kamu mengalami masalah ini, dan apa yang kamu lakukan?\"",
      },
      {
        q: "Boleh langsung jualan saat wawancara?",
        a: "Sebaiknya jangan. Fokus mendengarkan masalah mereka dulu. Menawarkan produk terlalu cepat membuat jawaban responden jadi kurang jujur.",
      },
    ],
  },

  pasarin: {
    judul: "Kalkulator TAM, SAM, dan SOM",
    intro: [
      "Pasarin menghitung ukuran pasar dari bawah (bottom-up): TAM, SAM, dan SOM, dari jumlah calon pelanggan dan nilai per pelanggan per tahun.",
      "Hasilnya bisa langsung dipakai di pitch deck atau proposal, lengkap dengan peringatan kalau target pangsa pasarmu terlalu optimis.",
    ],
    langkah: [
      "Isi jumlah semua calon pelanggan dan nilai per pelanggan per tahun.",
      "Isi persentase yang bisa dijangkau produk dan saluranmu (SAM).",
      "Isi persentase yang realistis direbut, beserta dalam berapa tahun (SOM).",
    ],
    rumus: {
      judul: "Rumus bottom-up",
      baris: [
        "TAM = Jumlah calon pelanggan × Nilai per pelanggan per tahun",
        "SAM = TAM × Persen yang bisa dijangkau",
        "SOM = SAM × Persen yang realistis direbut",
      ],
      catatan: "Pasarin memberi peringatan kalau SOM lebih dari sekitar 3,3% dari SAM per tahun, karena angka setinggi itu jarang tercapai startup baru.",
    },
    faq: [
      {
        q: "Kenapa bottom-up lebih dipercaya investor?",
        a: "Karena dihitung dari jumlah pelanggan dan harga yang nyata, bukan dari persentase kecil pasar yang sangat besar. Angkanya lebih mudah dicek dan dipertanggungjawabkan.",
      },
      {
        q: "Dari mana data jumlah calon pelanggan?",
        a: "Dari sumber resmi seperti BPS, laporan asosiasi industri, atau data kementerian. Selalu tulis sumbernya di pitch deck.",
      },
      {
        q: "SOM saya kecil, apakah buruk?",
        a: "Tidak. SOM yang realistis justru lebih dipercaya. Yang penting TAM dan SAM menunjukkan ruang tumbuh yang cukup besar.",
      },
    ],
  },

  fiturin: {
    judul: "Prioritas fitur MVP dengan skor RICE",
    intro: [
      "Fiturin membantu memilih fitur yang masuk MVP dengan skor RICE: Reach, Impact, Confidence, dan Effort.",
      "Fitur wajib masuk duluan, lalu fitur lain diurutkan dari skor tertinggi selama kapasitas tim masih cukup.",
    ],
    langkah: [
      "Tulis daftar fitur, lalu tandai fitur yang wajib ada supaya produk bisa dipakai.",
      "Isi Reach, Impact, Confidence, dan Effort untuk tiap fitur.",
      "Isi kapasitas tim, misalnya dalam minggu kerja.",
      "Lihat urutan prioritas dan fitur mana yang masuk MVP.",
    ],
    rumus: {
      judul: "Rumus RICE",
      baris: ["Skor RICE = Reach × Impact × Confidence ÷ Effort"],
      catatan: "Impact: 3 sangat besar, 2 besar, 1 sedang, 0,5 kecil, 0,25 sangat kecil. Confidence: 100% ada data, 80% cukup yakin, 50% masih tebakan.",
    },
    faq: [
      {
        q: "Reach diisi apa?",
        a: "Perkiraan jumlah pengguna yang merasakan fitur itu dalam periode tertentu, misalnya per bulan. Pakai periode yang sama untuk semua fitur.",
      },
      {
        q: "Effort pakai satuan apa?",
        a: "Bebas, asal sama untuk semua fitur. Yang umum dipakai adalah minggu kerja satu orang.",
      },
      {
        q: "Kenapa ada fitur wajib?",
        a: "Beberapa fitur harus ada supaya produk bisa dipakai sama sekali, misalnya login atau pembayaran, walau skor RICE-nya tidak tinggi.",
      },
    ],
  },

  proyeksiin: {
    judul: "Proyeksi keuangan startup 3 tahun",
    intro: [
      "Proyeksiin membuat proyeksi keuangan 36 bulan untuk model langganan: jumlah pelanggan, pendapatan, laba kotor, biaya marketing, biaya tetap, dan laba per bulan.",
      "Hasilnya menunjukkan kapan startup mulai untung dan berapa dana yang dibutuhkan untuk bertahan sampai titik itu.",
    ],
    langkah: [
      "Isi pelanggan awal, pelanggan baru per bulan, dan pertumbuhannya.",
      "Isi churn, harga per bulan, kenaikan harga per tahun, dan margin kotor.",
      "Isi CAC (biaya marketing per pelanggan baru) dan biaya tetap per bulan.",
      "Lihat grafik, ringkasan per tahun, bulan mulai untung, dan kebutuhan dana.",
    ],
    rumus: {
      judul: "Cara hitung per bulan",
      baris: [
        "Pelanggan = Pelanggan bulan lalu × (1 - Churn) + Pelanggan baru",
        "Pendapatan = Pelanggan × Harga",
        "Laba = Laba kotor - (Pelanggan baru × CAC) - Biaya tetap",
      ],
      catatan: "Kebutuhan dana diambil dari titik rugi kumulatif paling dalam selama 36 bulan.",
    },
    faq: [
      {
        q: "Seberapa akurat proyeksi ini?",
        a: "Proyeksi adalah perkiraan berdasarkan asumsimu. Yang penting asumsinya masuk akal dan bisa kamu jelaskan, misalnya dari data penjualan awal.",
      },
      {
        q: "Kenapa perlu memasukkan churn?",
        a: "Karena sebagian pelanggan berhenti tiap bulan. Tanpa churn, jumlah pelanggan dan pendapatan akan terlihat jauh lebih besar dari kenyataan.",
      },
      {
        q: "Apakah cocok untuk usaha non-langganan?",
        a: "Model ini dibuat untuk langganan. Untuk pembelian berulang, kamu bisa mendekatinya dengan menganggap pembelian rata-rata per bulan sebagai harga langganan.",
      },
    ],
  },

  investorin: {
    judul: "Pelacak galang dana dan daftar investor",
    intro: [
      "Investorin membantu mengelola proses galang dana: daftar investor, tahapannya (Target, Dihubungi, Meeting, Due diligence, Term sheet, Deal, atau Tidak lanjut), nilai tiket, dan kontak terakhir.",
      "Kamu bisa melihat dana yang sudah komit, potensi dari proses yang aktif, dan investor yang sudah lama tidak dihubungi.",
    ],
    langkah: [
      "Isi target dana putaran ini.",
      "Tambahkan investor beserta tahap, perkiraan tiket, dan tanggal kontak terakhir.",
      "Perbarui tahap setiap ada perkembangan.",
      "Perhatikan pengingat untuk investor yang belum dihubungi lagi.",
    ],
    rumus: {
      judul: "Cara membaca angka",
      baris: [
        "Komit = Total tiket investor di tahap Deal",
        "Potensi = Total tiket investor di tahap Meeting, Due diligence, dan Term sheet",
      ],
      catatan: "Investor yang sedang diproses dan tidak dihubungi 14 hari atau lebih akan ditandai supaya tidak terlupa.",
    },
    faq: [
      {
        q: "Berapa investor yang sebaiknya dihubungi?",
        a: "Galang dana adalah permainan angka. Banyak founder menghubungi puluhan investor untuk mendapat beberapa yang komit, jadi siapkan daftar yang cukup panjang.",
      },
      {
        q: "Kenapa perlu mencatat kontak terakhir?",
        a: "Supaya tidak ada investor yang terlupa. Tindak lanjut yang rutin dan rapi juga menunjukkan kamu serius.",
      },
      {
        q: "Apakah data investor saya aman?",
        a: "Data tersimpan di browser perangkatmu, atau di akunmu kalau login dengan trial atau Pro. Data di akun hanya bisa dibaca oleh akunmu sendiri.",
      },
    ],
  },

  laporin: {
    judul: "Template laporan bulanan untuk investor",
    intro: [
      "Laporin menyusun laporan bulanan untuk investor (investor update) dalam bentuk email yang siap dikirim: ringkasan, metrik utama dibanding bulan lalu, kas dan runway, capaian, tantangan, rencana, dan bantuan yang dibutuhkan.",
      "Bagian yang kosong tidak ikut ditampilkan, jadi emailnya tetap rapi.",
    ],
    langkah: [
      "Isi nama startup, bulan laporan, dan ringkasan singkat.",
      "Isi metrik utama bulan ini dan bulan lalu.",
      "Isi kas sekarang dan burn rate per bulan.",
      "Tulis capaian, tantangan, rencana, dan bantuan yang dibutuhkan, lalu salin teks emailnya.",
    ],
    rumus: {
      judul: "Angka yang dihitung otomatis",
      baris: [
        "Perubahan = (Bulan ini - Bulan lalu) ÷ Bulan lalu × 100%",
        "Runway (bulan) = Kas ÷ Burn rate per bulan",
      ],
    },
    faq: [
      {
        q: "Kenapa perlu kirim laporan bulanan?",
        a: "Investor yang rutin mendapat kabar lebih percaya dan lebih mudah membantu, misalnya memperkenalkan ke calon pelanggan atau investor berikutnya.",
      },
      {
        q: "Perlu ceritakan tantangan juga?",
        a: "Ya. Laporan yang jujur soal tantangan justru membangun kepercayaan, dan investor jadi tahu di mana mereka bisa membantu.",
      },
      {
        q: "Metrik apa yang sebaiknya dilaporkan?",
        a: "Pilih 3 sampai 5 metrik terpenting, misalnya pendapatan, jumlah pelanggan aktif, dan pertumbuhan. Pakai metrik yang sama tiap bulan supaya mudah dibandingkan.",
      },
    ],
  },

  bagiin: {
    judul: "Pembagian saham pendiri dan jadwal vesting",
    intro: [
      "Bagiin membantu membagi saham antar pendiri berdasarkan kontribusi berbobot, misalnya komitmen waktu, keahlian inti, modal, jaringan, dan risiko yang diambil.",
      "Ada juga jadwal vesting, yaitu saham yang cair bertahap, supaya pembagian tetap adil kalau ada pendiri yang keluar lebih awal.",
    ],
    langkah: [
      "Sesuaikan faktor kontribusi dan bobotnya kalau perlu.",
      "Beri nilai 0 sampai 10 untuk tiap pendiri di tiap faktor.",
      "Atur masa vesting, cliff, dan tanggal mulai.",
      "Lihat persentase saham dan jadwal saham yang cair per pendiri.",
    ],
    rumus: {
      judul: "Cara hitung",
      baris: [
        "Poin pendiri = Jumlah (Bobot faktor × Nilai pendiri)",
        "Saham pendiri = Poin pendiri ÷ Total poin semua pendiri × 100%",
      ],
      catatan: "Bawaannya vesting 48 bulan dengan cliff 12 bulan: sebelum 12 bulan belum ada yang cair, lalu bertambah tiap bulan sampai 100% di bulan ke-48.",
    },
    faq: [
      {
        q: "Apakah saham harus dibagi rata?",
        a: "Tidak harus. Bagi rata memang mudah, tapi bisa terasa tidak adil kalau kontribusi tiap pendiri jauh berbeda. Bagiin membantu membuat diskusinya lebih objektif.",
      },
      {
        q: "Apa itu cliff?",
        a: "Masa awal sebelum saham mulai cair. Kalau pendiri keluar sebelum cliff selesai, dia belum mendapat saham dari jatahnya.",
      },
      {
        q: "Apakah hasil ini langsung berlaku secara hukum?",
        a: "Belum. Hasil Bagiin adalah bahan diskusi antar pendiri. Kesepakatannya perlu dituangkan dalam perjanjian pendiri dan dokumen perusahaan yang sah.",
      },
    ],
  },

  kompetitorin: {
    judul: "Analisis kompetitor dan peta posisi",
    intro: [
      "Kompetitorin membantu membandingkan produkmu dengan pesaing lewat tabel fitur dan peta posisi dua sumbu.",
      "Tool ini otomatis menunjukkan pembeda (hal yang kamu punya tapi jarang dimiliki pesaing) dan celah (hal yang dimiliki mayoritas pesaing tapi belum kamu punya).",
    ],
    langkah: [
      "Tulis kriteria pembanding yang penting bagi pelanggan, satu per baris.",
      "Tentukan dua sumbu peta posisi, misalnya harga murah sampai mahal dan sederhana sampai lengkap.",
      "Isi data produkmu dan tiap pesaing: harga, kriteria yang dimiliki, dan posisinya di peta.",
      "Lihat tabel perbandingan, peta posisi, pembeda, dan celah.",
    ],
    rumus: {
      judul: "Cara menentukan",
      baris: [
        "Pembeda = Kriteria yang kamu punya dan dimiliki paling banyak setengah pesaing",
        "Celah = Kriteria yang dimiliki lebih dari setengah pesaing tapi belum kamu punya",
      ],
    },
    faq: [
      {
        q: "Berapa pesaing yang perlu dianalisis?",
        a: "Tiga sampai lima pesaing utama biasanya cukup. Masukkan juga alternatif tidak langsung, misalnya cara manual yang dipakai pelanggan sekarang.",
      },
      {
        q: "Bagaimana memilih sumbu peta posisi?",
        a: "Pilih dua hal yang paling dipertimbangkan pelanggan saat memilih, dan yang membuat pesaing tersebar di peta.",
      },
      {
        q: "Saya punya celah, harus langsung ditutup?",
        a: "Tidak selalu. Tanya dulu ke pelanggan apakah celah itu penting buat mereka. Kadang lebih baik memperkuat pembeda daripada meniru pesaing.",
      },
    ],
  },

  personain: {
    judul: "Template persona pelanggan ideal",
    intro: [
      "Personain membantu membuat kartu persona pelanggan ideal: siapa dia, latar belakangnya, kutipan khasnya, dan isi kepalanya, misalnya tujuan dan masalah yang dia hadapi.",
      "Kartu persona membantu tim sepakat tentang untuk siapa produk dibuat, dan bisa dicetak untuk ditempel atau dibagikan.",
    ],
    langkah: [
      "Isi identitas persona: nama, peran atau pekerjaan, umur, lokasi, dan skala penghasilan atau usahanya.",
      "Tulis kutipan khas yang menggambarkan dia.",
      "Isi bagian isi kepala, satu poin per baris.",
      "Tambah persona lain kalau pelangganmu lebih dari satu tipe.",
    ],
    faq: [
      {
        q: "Persona itu dari imajinasi atau data?",
        a: "Sebaiknya dari data: hasil wawancara, obrolan dengan pelanggan, atau data penjualan. Persona dari imajinasi saja sering meleset.",
      },
      {
        q: "Berapa persona yang ideal?",
        a: "Mulai dari 1 sampai 2 persona utama. Terlalu banyak persona membuat tim kehilangan fokus.",
      },
      {
        q: "Kenapa perlu kutipan khas?",
        a: "Kutipan membuat persona terasa seperti orang sungguhan, jadi tim lebih mudah membayangkan kebutuhannya saat mengambil keputusan.",
      },
    ],
  },

  targetin: {
    judul: "Template OKR dengan progres otomatis",
    intro: [
      "Targetin membantu menyusun OKR (Objective and Key Results) untuk tim, dengan progres yang dihitung otomatis dari angka awal, target, dan angka sekarang.",
      "Bisa untuk target naik, misalnya jumlah pengguna, maupun target turun, misalnya churn dari 8% ke 4%.",
    ],
    langkah: [
      "Tulis objective: tujuan kualitatif yang ingin dicapai periode ini.",
      "Tambahkan 2 sampai 4 key result yang terukur, dengan angka awal dan target.",
      "Perbarui angka sekarang secara rutin, misalnya tiap minggu.",
      "Lihat progres tiap key result dan tiap objective.",
    ],
    rumus: {
      judul: "Cara hitung progres",
      baris: [
        "Progres KR = (Sekarang - Awal) ÷ (Target - Awal) × 100%, dibatasi 0% sampai 100%",
        "Progres objective = Rata-rata progres key result-nya",
      ],
      catatan: "Progres 70% ke atas dianggap sesuai jalur, 40% sampai 69% perlu dorongan, dan di bawah 40% tertinggal.",
    },
    faq: [
      {
        q: "Apa beda objective dan key result?",
        a: "Objective adalah tujuan yang ingin dicapai, ditulis dengan kalimat. Key result adalah angka yang membuktikan tujuan itu tercapai.",
      },
      {
        q: "Berapa banyak OKR per periode?",
        a: "Sedikit lebih baik. Banyak tim memakai 1 sampai 3 objective, masing-masing dengan 2 sampai 4 key result.",
      },
      {
        q: "Kalau progres 70%, apakah gagal?",
        a: "Tidak. OKR sering sengaja dibuat ambisius, jadi 70% sudah dianggap hasil yang baik.",
      },
    ],
  },

  valuasiin: {
    judul: "Kalkulator valuasi startup tahap awal",
    intro: [
      "Valuasiin memperkirakan valuasi pre-money startup tahap awal dengan tiga metode umum: Berkus, Scorecard, dan kelipatan pendapatan.",
      "Hasilnya kisaran nilai dari ketiga metode, sebagai bahan negosiasi dengan investor, bukan angka pasti.",
    ],
    langkah: [
      "Berkus: tentukan nilai maksimal per faktor, lalu nilai kekuatan 5 faktor dalam persen.",
      "Scorecard: isi rata-rata valuasi startup sejenis, lalu bandingkan startupmu di tiap faktor.",
      "Kelipatan: isi pendapatan tahunan dan kelipatan yang umum di industrimu.",
      "Lihat kisaran valuasi dari metode yang sudah diisi.",
    ],
    rumus: {
      judul: "Rumus tiap metode",
      baris: [
        "Berkus = Jumlah (Nilai maksimal per faktor × Kekuatan faktor %)",
        "Scorecard = Rata-rata valuasi sejenis × Jumlah (Bobot faktor × Perbandingan %)",
        "Kelipatan = Pendapatan tahunan × Kelipatan",
      ],
      catatan: "Bobot Scorecard: tim 30%, peluang pasar 25%, produk 15%, kompetisi 10%, pemasaran 10%, kebutuhan dana tambahan 5%, faktor lain 5%.",
    },
    faq: [
      {
        q: "Metode mana yang paling tepat?",
        a: "Berkus dan Scorecard cocok untuk startup yang belum atau baru mulai punya pendapatan. Kelipatan pendapatan lebih cocok kalau pendapatanmu sudah stabil.",
      },
      {
        q: "Kenapa hasilnya berupa kisaran?",
        a: "Valuasi tahap awal sangat bergantung pada negosiasi dan kondisi pasar. Kisaran dari beberapa metode membantumu punya dasar yang masuk akal saat bernegosiasi.",
      },
      {
        q: "Apa beda pre-money dan post-money?",
        a: "Pre-money adalah valuasi sebelum investasi masuk. Post-money adalah pre-money ditambah jumlah investasi.",
      },
    ],
  },

  stuney: {
    judul: "Aplikasi catat uang saku dan tabungan",
    intro: [
      "Stuney membantu mahasiswa dan pelajar mencatat uang saku, pemasukan, dan pengeluaran, sekaligus memisahkan uang per dompet seperti tunai, e-wallet, dan rekening bank.",
      "Ada anggaran bulanan, target tabungan, laporan pengeluaran, serta streak dan lencana supaya kamu rajin mencatat.",
    ],
    langkah: [
      "Catat tiap transaksi: pengeluaran, pemasukan, atau pindah dana antar dompet.",
      "Atur anggaran bulanan supaya tahu sisa uang yang boleh dipakai.",
      "Buat target tabungan dengan jumlah dan tenggatnya.",
      "Cek laporan untuk melihat ke mana saja uangmu pergi.",
    ],
    faq: [
      {
        q: "Apakah Stuney terhubung ke rekening bank atau e-wallet?",
        a: "Tidak. Semua transaksi dicatat manual oleh kamu, jadi Stuney tidak meminta akses ke rekening atau aplikasi keuanganmu.",
      },
      {
        q: "Apa itu pindah dana?",
        a: "Pencatatan saat uang berpindah antar dompetmu sendiri, misalnya tarik tunai dari bank atau top up e-wallet. Totalnya tidak berubah, hanya tempatnya.",
      },
      {
        q: "Data saya tersimpan di mana?",
        a: "Di browser perangkatmu. Kalau login dengan akun trial atau Pro, data juga tersimpan di akun dan bisa dibuka dari perangkat lain.",
      },
    ],
  },
};
