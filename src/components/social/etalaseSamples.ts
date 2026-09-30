// Contoh isi Etalase untuk mengisi tampilan saat penjual sungguhan masih
// sedikit. Semua ini ilustrasi (nama dan kota karangan), selalu diberi
// label "Contoh" di layar, tanpa tombol WhatsApp dan tanpa link ke
// halaman penjual, supaya tidak ada pembeli yang tertipu.

type L = { id: string; en: string; tr: string };

export type EtalaseSample = {
  key: string;
  kind: "produk" | "jasa" | "lainnya";
  name: L;
  tagline: L;
  price: number | null;
  unit: L;
  seller: string;
  city: string;
  hue: [string, string];
};

export const ETALASE_SAMPLES: EtalaseSample[] = [
  {
    key: "cv",
    kind: "jasa",
    name: { id: "CV lolos sistem ATS", en: "ATS-friendly CV", tr: "ATS uyumlu CV" },
    tagline: {
      id: "Rombak CV biar lolos saringan otomatis HRD, selesai 1 hari.",
      en: "A CV rewrite that passes automatic HR screening, done in 1 day.",
      tr: "Otomatik İK elemesinden geçen CV, 1 günde hazır.",
    },
    price: 75000,
    unit: { id: "/ CV", en: "/ CV", tr: "/ CV" },
    seller: "Nadia",
    city: "Bandung",
    hue: ["#8A85B8", "#E85F3D"],
  },
  {
    key: "karikatur",
    kind: "jasa",
    name: { id: "Karikatur dari foto", en: "Caricature from a photo", tr: "Fotoğraftan karikatür" },
    tagline: {
      id: "Kado ulang tahun unik, digital atau dicetak bingkai.",
      en: "A unique birthday gift, digital or framed print.",
      tr: "Benzersiz doğum günü hediyesi, dijital ya da çerçeveli baskı.",
    },
    price: 120000,
    unit: { id: "/ wajah", en: "/ face", tr: "/ yüz" },
    seller: "Bima",
    city: "Yogyakarta",
    hue: ["#F2A93E", "#E85F3D"],
  },
  {
    key: "voiceover",
    kind: "jasa",
    name: { id: "Voice over iklan bahasa Jawa", en: "Javanese ad voice-over", tr: "Cava dilinde reklam seslendirmesi" },
    tagline: {
      id: "Suara hangat buat iklan UMKM, revisi 2 kali.",
      en: "A warm voice for small business ads, 2 revisions.",
      tr: "Küçük işletme reklamları için sıcak bir ses, 2 revizyon.",
    },
    price: 150000,
    unit: { id: "/ 30 detik", en: "/ 30 seconds", tr: "/ 30 saniye" },
    seller: "Sekar",
    city: "Solo",
    hue: ["#1A1730", "#8A85B8"],
  },
  {
    key: "python",
    kind: "jasa",
    name: { id: "Les coding Python untuk pelajar", en: "Python coding lessons for students", tr: "Öğrenciler için Python dersi" },
    tagline: {
      id: "Belajar dari nol sampai bikin game sederhana, online.",
      en: "From zero to a simple game, online.",
      tr: "Sıfırdan basit bir oyun yapmaya kadar, çevrimiçi.",
    },
    price: 60000,
    unit: { id: "/ jam", en: "/ hour", tr: "/ saat" },
    seller: "Raka",
    city: "Surabaya",
    hue: ["#3B82F6", "#8A85B8"],
  },
  {
    key: "jastip",
    kind: "jasa",
    name: { id: "Jastip pasar pagi", en: "Morning market shopping service", tr: "Sabah pazarı alışveriş hizmeti" },
    tagline: {
      id: "Sayur, ikan, bumbu segar diantar sebelum jam 9.",
      en: "Fresh veggies, fish, and spices delivered before 9 am.",
      tr: "Taze sebze, balık ve baharat saat 9'dan önce teslim.",
    },
    price: 15000,
    unit: { id: "/ titipan", en: "/ order", tr: "/ sipariş" },
    seller: "Bu Wati",
    city: "Malang",
    hue: ["#25D366", "#1f8a4c"],
  },
  {
    key: "rakitpc",
    kind: "jasa",
    name: { id: "Rakit PC gaming di rumahmu", en: "Gaming PC build at your home", tr: "Evinde oyun bilgisayarı toplama" },
    tagline: {
      id: "Rakit, pasang Windows dan driver, cek suhu sampai aman.",
      en: "Build, install Windows and drivers, check temperatures.",
      tr: "Toplama, Windows ve sürücü kurulumu, sıcaklık kontrolü.",
    },
    price: 200000,
    unit: { id: "/ unit", en: "/ unit", tr: "/ adet" },
    seller: "Dimas",
    city: "Jakarta",
    hue: ["#E85F3D", "#1A1730"],
  },
  {
    key: "terjemah",
    kind: "jasa",
    name: { id: "Terjemahan Turki ke Indonesia", en: "Turkish to Indonesian translation", tr: "Türkçeden Endonezceye çeviri" },
    tagline: {
      id: "Dokumen kuliah, surat, dan caption, rapi dan cepat.",
      en: "Study documents, letters, and captions, neat and fast.",
      tr: "Okul belgeleri, mektuplar ve açıklamalar, düzgün ve hızlı.",
    },
    price: 90000,
    unit: { id: "/ halaman", en: "/ page", tr: "/ sayfa" },
    seller: "Aisyah",
    city: "Istanbul",
    hue: ["#E30A17", "#F2A93E"],
  },
  {
    key: "dekor",
    kind: "lainnya",
    name: { id: "Dekor lamaran intimate", en: "Intimate engagement decor", tr: "Samimi nişan dekorasyonu" },
    tagline: {
      id: "Backdrop bunga kering dan lampu, muat untuk ruang tamu.",
      en: "Dried flower backdrop and lights that fit a living room.",
      tr: "Kuru çiçek fonu ve ışıklar, oturma odasına sığar.",
    },
    price: null,
    unit: { id: "", en: "", tr: "" },
    seller: "Laras",
    city: "Semarang",
    hue: ["#F2A93E", "#8A85B8"],
  },
];
