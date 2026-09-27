// Validasiin: skor kesiapan ide dari 10 pernyataan (skala 1-5) di 5 area.

export interface Area {
  id: string;
  nama: string;
  pertanyaan: [string, string];
  saran: string;
}

export const AREAS: Area[] = [
  {
    id: "masalah",
    nama: "Masalah",
    pertanyaan: [
      "Masalah yang saya selesaikan sering terjadi dan cukup menyakitkan buat pelanggan.",
      "Calon pelanggan sudah berusaha mencari solusi (atau keluar uang) untuk masalah ini.",
    ],
    saran: "Gali lagi masalahnya: ngobrol dengan calon pelanggan dan tanyakan kapan terakhir mereka mengalaminya, dan apa yang sudah mereka coba.",
  },
  {
    id: "pelanggan",
    nama: "Pelanggan",
    pertanyaan: [
      "Saya bisa menyebut siapa pelanggan pertama saya secara spesifik.",
      "Saya sudah ngobrol langsung dengan minimal 10 calon pelanggan.",
    ],
    saran: "Persempit target: pilih satu kelompok pelanggan yang paling butuh, lalu wawancarai 10 orang sebelum membangun apa pun.",
  },
  {
    id: "solusi",
    nama: "Solusi",
    pertanyaan: [
      "Solusi saya jelas lebih baik, lebih cepat, atau lebih murah dari cara yang dipakai sekarang.",
      "Versi paling sederhana (MVP) bisa dibuat dalam 1 sampai 3 bulan.",
    ],
    saran: "Pangkas solusi ke satu fitur inti yang paling menyelesaikan masalah, lalu uji dengan prototipe sederhana.",
  },
  {
    id: "pasar",
    nama: "Pasar",
    pertanyaan: [
      "Pasarnya cukup besar dan sedang tumbuh.",
      "Saya tahu cara menjangkau pelanggan dengan biaya yang masuk akal.",
    ],
    saran: "Hitung ukuran pasar dari bawah (jumlah calon pelanggan dikali harga) dan uji satu saluran pemasaran dengan biaya kecil.",
  },
  {
    id: "bisnis",
    nama: "Bisnis & Tim",
    pertanyaan: [
      "Sudah ada yang mau bayar, pre-order, atau berkomitmen memakai.",
      "Tim saya punya keahlian yang dibutuhkan untuk membangun dan menjual ini.",
    ],
    saran: "Coba jual sebelum jadi: tawarkan pre-order atau pilot berbayar, dan lengkapi keahlian tim yang masih kurang.",
  },
];

export interface HasilSkor {
  terisi: number; // jumlah pernyataan yang sudah diberi nilai
  skor: number | null; // 0-100
  perArea: { id: string; nama: string; skor: number | null }[];
  terlemah: Area | null;
}

// skor: record id-area -> [nilai1, nilai2] (0 = belum diisi)
export function hitungSkor(nilai: Record<string, number[]>): HasilSkor {
  let total = 0;
  let terisi = 0;
  const perArea = AREAS.map((a) => {
    const v = (nilai[a.id] || []).filter((n) => n >= 1 && n <= 5);
    terisi += v.length;
    total += v.reduce((x, y) => x + y, 0);
    return { id: a.id, nama: a.nama, skor: v.length ? ((v.reduce((x, y) => x + y, 0) / v.length - 1) / 4) * 100 : null };
  });
  const skor = terisi ? ((total / terisi - 1) / 4) * 100 : null;
  const dinilai = perArea.filter((p) => p.skor !== null) as { id: string; nama: string; skor: number }[];
  const lemah = dinilai.length ? dinilai.reduce((a, b) => (b.skor < a.skor ? b : a)) : null;
  return { terisi, skor, perArea, terlemah: lemah ? AREAS.find((a) => a.id === lemah.id) ?? null : null };
}
