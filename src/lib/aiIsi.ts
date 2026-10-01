import "server-only";

// "Isi draf dengan AI" (fitur Founderku Pro) untuk beberapa tools.
// Tiap tool punya bentuk JSON yang boleh diisi AI. Jawaban AI selalu
// diperiksa ulang di sini (tipe, panjang, jumlah) sebelum dikirim ke
// browser, jadi tool tidak pernah menerima isian aneh.

// Bentuk isian: "s:<maks>" teks, "n:<min>:<maks>" angka bulat,
// "b" ya/tidak, [bentuk, maksItem] daftar, atau objek berisi bentuk.
type Bentuk = string | [Bentuk, number] | { [k: string]: Bentuk };

type Spek = {
  judul: string;
  arahan: string;
  bentuk: (konteks: Record<string, unknown>) => { [k: string]: Bentuk };
  // Penjelasan tiap kolom untuk AI (dikirim sebagai contoh struktur)
  contoh: (konteks: Record<string, unknown>) => unknown;
};

const POIN = "pakai baris baru untuk tiap poin, maksimal 3 poin";

const LEAN_VALIDASI = ["masalah", "segmen", "nilai", "solusi", "saluran", "pendapatan", "biaya", "metrik", "keunggulan"];
const PITCH = ["masalah", "solusi", "waktu", "pasar", "produk", "model", "traksi", "kompetitor", "tim", "dana"];
const BMC = ["mitra", "aktivitas", "sumberdaya", "nilai", "hubungan", "saluran", "segmen", "biaya", "pendapatan"];
const LEAN = ["masalah", "solusi", "metrik", "nilai", "keunggulan", "saluran", "segmen", "biaya", "pendapatan"];
const PERSONA = ["nama", "peran", "umur", "lokasi", "penghasilan", "kutipan", "tujuan", "masalah", "kebiasaan", "saluran", "keberatan", "pemicu"];

const obj = (keys: string[], b: Bentuk) => Object.fromEntries(keys.map((k) => [k, b]));

export const SPEK_AI: Record<string, Spek> = {
  validasiin: {
    judul: "Validasiin (Lean Canvas untuk validasi ide)",
    arahan: `Isi nama ide, satu kalimat ide, dan 9 kotak Lean Canvas (${POIN}).`,
    bentuk: () => ({ nama: "s:60", kalimat: "s:200", canvas: obj(LEAN_VALIDASI, "s:400") }),
    contoh: () => ({
      nama: "nama produk/usaha",
      kalimat: "satu kalimat: apa, untuk siapa, manfaat utama",
      canvas: Object.fromEntries(LEAN_VALIDASI.map((k) => [k, `isi kotak ${k}`])),
    }),
  },
  personain: {
    judul: "Personain (persona pelanggan ideal)",
    arahan: `Buat 1 persona pelanggan yang realistis di Indonesia. Kolom tujuan, masalah, kebiasaan, saluran, keberatan, pemicu: ${POIN}.`,
    bentuk: () => ({ persona: obj(PERSONA, "s:300") }),
    contoh: () => ({
      persona: {
        nama: "nama panggilan, misal Bu Sari",
        peran: "pekerjaan/peran",
        umur: "misal 32 tahun",
        lokasi: "kota",
        penghasilan: "kisaran penghasilan atau omzet",
        kutipan: "satu kalimat yang mungkin dia ucapkan",
        tujuan: "...",
        masalah: "...",
        kebiasaan: "...",
        saluran: "...",
        keberatan: "...",
        pemicu: "...",
      },
    }),
  },
  kompetitorin: {
    judul: "Kompetitorin (analisis kompetitor dan peta posisi)",
    arahan:
      "Isi 5 kriteria pembanding yang penting bagi pelanggan, 3 pesaing atau alternatif yang umum di Indonesia (boleh kategori umum seperti 'buku tulis' kalau tidak yakin nama mereknya), perkiraan posisi di sumbu harga (x: 1 murah sampai 10 mahal) dan kelengkapan (y: 1 sederhana sampai 10 lengkap), serta apakah tiap produk punya kriteria itu. Jangan mengarang harga pasti; tulis kisaran atau kosongkan.",
    bentuk: () => ({
      kriteria: ["s:60", 5],
      kita: { nama: "s:60", harga: "s:40", x: "n:1:10", y: "n:1:10", punya: ["b", 5] },
      pesaing: [{ nama: "s:60", harga: "s:40", x: "n:1:10", y: "n:1:10", punya: ["b", 5] }, 3],
    }),
    contoh: () => ({
      kriteria: ["kriteria 1", "...", "kriteria 5"],
      kita: { nama: "produk kita", harga: "kisaran", x: 4, y: 6, punya: [true, false, true, true, false] },
      pesaing: [{ nama: "pesaing", harga: "kisaran", x: 7, y: 8, punya: [true, true, false, false, true] }],
    }),
  },
  pitchin: {
    judul: "Pitchin (pitch deck 10 slide untuk investor)",
    arahan: `Isi nama, tagline singkat, dan isi 10 slide (${POIN} per slide). Untuk traksi, tim, dan dana: tulis apa yang perlu diisi user kalau datanya tidak disebut, jangan mengarang angka.`,
    bentuk: () => ({ nama: "s:60", tagline: "s:120", isi: obj(PITCH, "s:500") }),
    contoh: () => ({
      nama: "nama startup",
      tagline: "satu kalimat",
      isi: Object.fromEntries(PITCH.map((k) => [k, `isi slide ${k}`])),
    }),
  },
  kanvasin: {
    judul: "Kanvasin (Business Model Canvas / Lean Canvas)",
    arahan: `Isi nama usaha dan semua kotak kanvas (${POIN}).`,
    bentuk: (k) => ({ nama: "s:60", kotak: obj(k.model === "bmc" ? BMC : LEAN, "s:400") }),
    contoh: (k) => ({
      nama: "nama usaha",
      kotak: Object.fromEntries((k.model === "bmc" ? BMC : LEAN).map((x) => [x, `isi kotak ${x}`])),
    }),
  },
};

export const IDE_MAKS = 600;

export function instruksiIsi(spek: Spek, konteks: Record<string, unknown>): string {
  return [
    `Kamu membantu UMKM dan founder di Indonesia mengisi draf tool ${spek.judul} di Founderku.`,
    spek.arahan,
    "Tulis dalam Bahasa Indonesia yang singkat, konkret, dan mudah dipahami. Sesuaikan dengan ide dari user.",
    "Jangan mengarang data statistik, nama orang sungguhan, atau angka pasti yang tidak disebut user.",
    "Jangan pernah memakai tanda pisah panjang (em dash atau en dash).",
    "Balas HANYA dengan satu objek JSON valid (tanpa penjelasan, tanpa ```), dengan struktur persis seperti contoh ini:",
    JSON.stringify(spek.contoh(konteks)),
  ].join("\n");
}

// Periksa & rapikan jawaban AI sesuai bentuk. Kolom yang salah dibuang.
function rapikan(nilai: unknown, b: Bentuk): unknown {
  if (typeof b === "string") {
    if (b.startsWith("s:")) {
      if (typeof nilai !== "string") return undefined;
      const t = nilai.replace(/\s*[—–]\s*/g, " - ").replace(/\r/g, "").trim();
      return t ? t.slice(0, Number(b.slice(2))) : undefined;
    }
    if (b.startsWith("n:")) {
      const [, min, maks] = b.split(":").map(Number);
      const n = typeof nilai === "number" ? nilai : Number(nilai);
      return Number.isFinite(n) ? Math.min(maks, Math.max(min, Math.round(n))) : undefined;
    }
    if (b === "b") return typeof nilai === "boolean" ? nilai : undefined;
    return undefined;
  }
  if (Array.isArray(b)) {
    if (!Array.isArray(nilai)) return undefined;
    return nilai
      .slice(0, b[1])
      .map((x) => rapikan(x, b[0]))
      .filter((x) => x !== undefined);
  }
  if (!nilai || typeof nilai !== "object" || Array.isArray(nilai)) return undefined;
  const hasil: Record<string, unknown> = {};
  for (const [k, sub] of Object.entries(b)) {
    const v = rapikan((nilai as Record<string, unknown>)[k], sub);
    if (v !== undefined) hasil[k] = v;
  }
  return hasil;
}

export function bacaJawaban(teks: string, spek: Spek, konteks: Record<string, unknown>): Record<string, unknown> | null {
  const awal = teks.indexOf("{");
  const akhir = teks.lastIndexOf("}");
  if (awal < 0 || akhir <= awal) return null;
  try {
    const hasil = rapikan(JSON.parse(teks.slice(awal, akhir + 1)), spek.bentuk(konteks));
    return hasil && typeof hasil === "object" && Object.keys(hasil).length ? (hasil as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
