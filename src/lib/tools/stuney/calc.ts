// Stuney: pencatat keuangan pelajar (uang saku, dompet, target tabungan).
// Awalnya proyek intern Founterns 2026 (Adinda Enklly Tri Fauziah),
// dipindahkan ke Founderku Tools. Semua fungsi di sini murni (tanpa React)
// supaya bisa dites dengan angka contoh.

export type Jenis = "keluar" | "masuk" | "pindah";
export type Peruntukan = "kebutuhan" | "keinginan" | "tabungan" | "campur";

export interface Transaksi {
  id: string;
  jenis: Jenis;
  jumlah: number;
  kategori: string; // untuk "pindah" berisi "pindah"
  dompet: string; // dompet asal (keluar/pindah) atau tujuan (masuk)
  keDompet?: string; // hanya untuk "pindah"
  tanggal: string; // YYYY-MM-DD, tanggal lokal
  catatan: string;
  dibuat: number; // waktu dicatat (ms), untuk urutan transaksi di tanggal yang sama
}

export interface Dompet {
  id: string;
  nama: string;
  peruntukan: Peruntukan;
}

export interface Target {
  id: string;
  nama: string;
  target: number;
  terkumpul: number;
  tenggat: string; // YYYY-MM-DD, boleh kosong
}

export interface DataStuney {
  nama: string;
  transaksi: Transaksi[];
  dompet: Dompet[];
  target: Target[];
  anggaran: number; // batas pengeluaran per bulan
  contoh: boolean; // true = masih data contoh
}

export interface Kategori {
  id: string;
  nama: string;
  ikon: string;
}

export const KATEGORI_KELUAR: Kategori[] = [
  { id: "makanan", nama: "Makanan", ikon: "🍜" },
  { id: "transportasi", nama: "Transportasi", ikon: "🚌" },
  { id: "pribadi", nama: "Self Care", ikon: "🧴" },
  { id: "hiburan", nama: "Hiburan", ikon: "🎬" },
  { id: "belanja", nama: "Belanja", ikon: "🛍️" },
  { id: "kesehatan", nama: "Kesehatan", ikon: "💊" },
  { id: "pendidikan", nama: "Pendidikan", ikon: "📚" },
  { id: "lainnya", nama: "Lainnya", ikon: "📦" },
];

export const KATEGORI_MASUK: Kategori[] = [
  { id: "uangsaku", nama: "Uang Saku", ikon: "💵" },
  { id: "freelance", nama: "Freelance", ikon: "💼" },
  { id: "beasiswa", nama: "Beasiswa", ikon: "🎓" },
  { id: "hadiah", nama: "Hadiah", ikon: "🎁" },
  { id: "lainnya", nama: "Lainnya", ikon: "📦" },
];

export const PINDAH: Kategori = { id: "pindah", nama: "Pindah dana", ikon: "🔁" };

export const PERUNTUKAN: { v: Peruntukan; label: string; ket: string }[] = [
  { v: "kebutuhan", label: "Kebutuhan", ket: "Makan, transport, kebutuhan kuliah" },
  { v: "keinginan", label: "Keinginan", ket: "Jajan, hiburan, belanja" },
  { v: "tabungan", label: "Tabungan", ket: "Tidak dipakai untuk belanja harian" },
  { v: "campur", label: "Campur", ket: "Belum dipisah" },
];

// Pilihan nama dompet siap pakai (tidak terhubung ke aplikasi aslinya)
export const DOMPET_SIAP = [
  "Tunai",
  "Rekening Bank",
  "GoPay",
  "OVO",
  "ShopeePay",
  "DANA",
  "LinkAja",
  "BCA",
  "BRI",
  "BNI",
  "Mandiri",
  "Jago",
  "SeaBank",
  "blu",
];

export const DOMPET_AWAL: Dompet[] = [
  { id: "tunai", nama: "Tunai", peruntukan: "kebutuhan" },
  { id: "bank", nama: "Rekening Bank", peruntukan: "tabungan" },
  { id: "gopay", nama: "GoPay", peruntukan: "keinginan" },
];

export function kosong(): DataStuney {
  return { nama: "", transaksi: [], dompet: DOMPET_AWAL.map((d) => ({ ...d })), target: [], anggaran: 0, contoh: false };
}

export function cariKategori(jenis: Jenis, id: string): Kategori {
  if (jenis === "pindah") return PINDAH;
  const daftar = jenis === "keluar" ? KATEGORI_KELUAR : KATEGORI_MASUK;
  return daftar.find((k) => k.id === id) ?? daftar[daftar.length - 1];
}

export function buatId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Tanggal LOKAL (bukan UTC). Versi lama memakai toISOString(), sehingga
// transaksi yang dicatat sebelum jam 07.00 WIB tercatat di hari kemarin.
export function hariIni(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const h = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${h}`;
}

export function geserHari(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return hariIni(new Date(y, m - 1, d + n));
}

export const bulanDari = (iso: string) => iso.slice(0, 7);

export function bulanSebelum(bulan: string): string {
  const [y, m] = bulan.split("-").map(Number);
  return hariIni(new Date(y, m - 2, 1)).slice(0, 7);
}

// Terbaru di atas: tanggal paling baru dulu, lalu yang terakhir dicatat
export function urutTerbaru(daftar: Transaksi[]): Transaksi[] {
  return daftar.slice().sort((a, b) => (a.tanggal === b.tanggal ? b.dibuat - a.dibuat : a.tanggal < b.tanggal ? 1 : -1));
}

export function totalSemua(data: DataStuney) {
  let masuk = 0;
  let keluar = 0;
  for (const t of data.transaksi) {
    if (t.jenis === "masuk") masuk += t.jumlah;
    else if (t.jenis === "keluar") keluar += t.jumlah;
  }
  return { masuk, keluar, kas: masuk - keluar };
}

export function totalBulan(data: DataStuney, bulan: string) {
  let masuk = 0;
  let keluar = 0;
  for (const t of data.transaksi) {
    if (bulanDari(t.tanggal) !== bulan) continue;
    if (t.jenis === "masuk") masuk += t.jumlah;
    else if (t.jenis === "keluar") keluar += t.jumlah;
  }
  return { masuk, keluar };
}

// Saldo tiap dompet. Transaksi yang dompetnya sudah dihapus masuk ke
// baris "Tanpa dompet" supaya Total di Kas tetap sama dengan jumlah semua dompet.
export const TANPA_DOMPET = "_lain";

export function saldoDompet(data: DataStuney): Record<string, number> {
  const ada = new Set(data.dompet.map((d) => d.id));
  const kunci = (id: string | undefined) => (id && ada.has(id) ? id : TANPA_DOMPET);
  const saldo: Record<string, number> = {};
  for (const d of data.dompet) saldo[d.id] = 0;
  const tambah = (id: string, n: number) => {
    saldo[id] = (saldo[id] ?? 0) + n;
  };
  for (const t of data.transaksi) {
    if (t.jenis === "masuk") tambah(kunci(t.dompet), t.jumlah);
    else if (t.jenis === "keluar") tambah(kunci(t.dompet), -t.jumlah);
    else {
      tambah(kunci(t.dompet), -t.jumlah);
      tambah(kunci(t.keDompet), t.jumlah);
    }
  }
  if (saldo[TANPA_DOMPET] === 0) delete saldo[TANPA_DOMPET];
  return saldo;
}

export function saldoPeruntukan(data: DataStuney): Record<Peruntukan, number> {
  const s = saldoDompet(data);
  const hasil: Record<Peruntukan, number> = { kebutuhan: 0, keinginan: 0, tabungan: 0, campur: 0 };
  for (const [id, n] of Object.entries(s)) {
    const d = data.dompet.find((x) => x.id === id);
    hasil[d ? d.peruntukan : "campur"] += n;
  }
  return hasil;
}

export function anggaranBulan(data: DataStuney, bulan: string) {
  const terpakai = totalBulan(data, bulan).keluar;
  const batas = data.anggaran;
  const persen = batas > 0 ? (terpakai / batas) * 100 : 0;
  return { terpakai, batas, sisa: Math.max(0, batas - terpakai), persen };
}

// Streak: berapa hari berturut-turut ada catatan, dihitung sampai hari ini
// (atau sampai kemarin kalau hari ini belum mencatat).
export function streak(data: DataStuney, hari: string = hariIni()) {
  const ada = new Set(data.transaksi.map((t) => t.tanggal));
  let mulai = hari;
  if (!ada.has(mulai)) mulai = geserHari(hari, -1);
  let jumlah = 0;
  let c = mulai;
  while (ada.has(c)) {
    jumlah++;
    c = geserHari(c, -1);
  }
  const tujuh = Array.from({ length: 7 }, (_, i) => {
    const tgl = geserHari(hari, i - 6);
    return { tanggal: tgl, isi: ada.has(tgl) };
  });
  return { jumlah, tujuh };
}

export interface Lencana {
  id: string;
  ikon: string;
  judul: string;
  ket: string;
  dapat: boolean;
}

export function lencana(data: DataStuney, hari: string = hariIni()): Lencana[] {
  const s = streak(data, hari);
  const bulan = bulanDari(hari);
  const ag = anggaranBulan(data, bulan);
  const pakaiDompet = new Set(data.transaksi.map((t) => t.dompet)).size >= 2;
  return [
    { id: "first-step", ikon: "🌱", judul: "First Step", ket: "Mencatat transaksi pertama", dapat: data.transaksi.length >= 1 },
    { id: "smart-saver", ikon: "🐷", judul: "Smart Saver", ket: "Mulai mengisi target tabungan", dapat: data.target.some((t) => t.terkumpul > 0) },
    { id: "pisah-dompet", ikon: "👛", judul: "Pisah Dompet", ket: "Mencatat dari 2 dompet atau lebih", dapat: pakaiDompet },
    { id: "streak-30", ikon: "🔥", judul: "Konsisten 30 Hari", ket: "Mencatat 30 hari berturut-turut", dapat: s.jumlah >= 30 },
    { id: "budget-master", ikon: "🎯", judul: "Budget Master", ket: "Pengeluaran bulan ini masih sesuai anggaran", dapat: ag.batas > 0 && ag.terpakai > 0 && ag.terpakai <= ag.batas },
    { id: "financial-planner", ikon: "🏆", judul: "Financial Planner", ket: "Mencapai satu target tabungan", dapat: data.target.some((t) => t.target > 0 && t.terkumpul >= t.target) },
  ];
}

export const LEVEL = [
  { nama: "Beginner", ket: "Baru mulai mencatat dan mengenali pola pengeluaran.", min: 0 },
  { nama: "Smart Student", ket: "Konsisten mencatat dan sudah punya target tabungan.", min: 2 },
  { nama: "Financial Master", ket: "Berhasil mengelola anggaran dan mencapai target.", min: 4 },
];

export function level(data: DataStuney, hari: string = hariIni()) {
  const dapat = lencana(data, hari).filter((l) => l.dapat).length;
  let idx = 0;
  LEVEL.forEach((l, i) => {
    if (dapat >= l.min) idx = i;
  });
  const berikut = LEVEL[idx + 1];
  const progres = berikut ? Math.min(1, (dapat - LEVEL[idx].min) / (berikut.min - LEVEL[idx].min)) : 1;
  return { idx, ...LEVEL[idx], dapat, berikut, progres };
}

// Laporan pengeluaran per kategori untuk periode mingguan (7 hari terakhir)
// atau bulanan (bulan berjalan), dibanding periode sebelumnya.
export type Periode = "mingguan" | "bulanan";

export function rentang(periode: Periode, hari: string = hariIni()) {
  if (periode === "mingguan") {
    return { mulai: geserHari(hari, -6), akhir: hari, mulaiLalu: geserHari(hari, -13), akhirLalu: geserHari(hari, -7) };
  }
  const bulan = bulanDari(hari);
  const lalu = bulanSebelum(bulan);
  return { mulai: `${bulan}-01`, akhir: `${bulan}-31`, mulaiLalu: `${lalu}-01`, akhirLalu: `${lalu}-31` };
}

export function laporan(data: DataStuney, periode: Periode, hari: string = hariIni()) {
  const r = rentang(periode, hari);
  const dalam = (t: string, a: string, b: string) => t >= a && t <= b;
  const perKategori: Record<string, number> = {};
  const perDompet: Record<string, number> = {};
  let keluar = 0;
  let masuk = 0;
  let keluarLalu = 0;
  for (const t of data.transaksi) {
    if (t.jenis === "pindah") continue;
    if (dalam(t.tanggal, r.mulai, r.akhir)) {
      if (t.jenis === "masuk") masuk += t.jumlah;
      else {
        keluar += t.jumlah;
        const k = cariKategori("keluar", t.kategori).id;
        perKategori[k] = (perKategori[k] ?? 0) + t.jumlah;
        perDompet[t.dompet] = (perDompet[t.dompet] ?? 0) + t.jumlah;
      }
    } else if (t.jenis === "keluar" && dalam(t.tanggal, r.mulaiLalu, r.akhirLalu)) {
      keluarLalu += t.jumlah;
    }
  }
  const kategori = Object.entries(perKategori)
    .map(([id, jumlah]) => ({ kat: cariKategori("keluar", id), jumlah, persen: keluar > 0 ? (jumlah / keluar) * 100 : 0 }))
    .sort((a, b) => b.jumlah - a.jumlah);
  const perubahan = keluarLalu > 0 ? ((keluar - keluarLalu) / keluarLalu) * 100 : null;
  return { ...r, masuk, keluar, selisih: masuk - keluar, keluarLalu, perubahan, kategori, perDompet };
}

export function tambahTransaksi(data: DataStuney, t: Omit<Transaksi, "id" | "dibuat">, sekarang: number = Date.now()): DataStuney {
  return { ...data, contoh: false, transaksi: [...data.transaksi, { ...t, id: buatId(), dibuat: sekarang }] };
}

// Data dari Stuney versi lama (stuney.founderku.com, disimpan di browser)
interface TransaksiLama {
  type?: string;
  amount?: number;
  catId?: string;
  date?: string;
  note?: string;
}
interface DataLama {
  seeded?: boolean;
  transactions?: TransaksiLama[];
  goals?: { name?: string; target?: number; current?: number; deadline?: string }[];
  budget?: { monthly?: number };
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const angka = (n: unknown) => (typeof n === "number" && isFinite(n) && n > 0 ? Math.round(n) : 0);

export function dariVersiLama(lama: DataLama, nama: string, sekarang: number = Date.now()): DataStuney {
  const d = kosong();
  d.nama = (nama || "").slice(0, 30);
  d.anggaran = angka(lama.budget?.monthly);
  (lama.transactions ?? []).forEach((t, i) => {
    const jumlah = angka(t.amount);
    if (!jumlah || !t.date || !ISO.test(t.date)) return;
    const jenis: Jenis = t.type === "income" ? "masuk" : "keluar";
    d.transaksi.push({
      id: buatId() + i,
      jenis,
      jumlah,
      kategori: cariKategori(jenis, String(t.catId ?? "")).id,
      dompet: "tunai",
      tanggal: t.date,
      catatan: String(t.note ?? "").slice(0, 80),
      dibuat: sekarang - 100000 + i, // urutan asli tetap terjaga
    });
  });
  for (const g of lama.goals ?? []) {
    if (!g.name || !angka(g.target)) continue;
    d.target.push({ id: buatId(), nama: g.name.slice(0, 40), target: angka(g.target), terkumpul: angka(g.current), tenggat: g.deadline && ISO.test(g.deadline) ? g.deadline : "" });
  }
  return d;
}

// Data contoh (tombol "Isi contoh"), tanggal relatif terhadap hari ini
export function contoh(hari: string = hariIni(), sekarang: number = Date.now()): DataStuney {
  const d = kosong();
  d.nama = "Adinda";
  d.anggaran = 1_500_000;
  d.contoh = true;
  d.dompet = [
    { id: "tunai", nama: "Tunai", peruntukan: "kebutuhan" },
    { id: "bank", nama: "Rekening Bank", peruntukan: "tabungan" },
    { id: "gopay", nama: "GoPay", peruntukan: "kebutuhan" },
    { id: "shopeepay", nama: "ShopeePay", peruntukan: "keinginan" },
  ];
  const baris: [number, Jenis, number, string, string, string, string?][] = [
    [6, "masuk", 750_000, "uangsaku", "bank", "Uang saku mingguan"],
    [6, "pindah", 300_000, "pindah", "bank", "Isi GoPay", "gopay"],
    [6, "pindah", 150_000, "pindah", "bank", "Jatah jajan minggu ini", "shopeepay"],
    [6, "keluar", 28_000, "makanan", "tunai", "Makan siang kantin"],
    [5, "keluar", 15_000, "transportasi", "gopay", "Ojek online ke kampus"],
    [5, "keluar", 65_000, "pendidikan", "tunai", "Alat tulis"],
    [4, "keluar", 32_000, "hiburan", "shopeepay", "Nonton bareng teman"],
    [4, "keluar", 22_000, "makanan", "gopay", "Kopi & snack"],
    [3, "masuk", 300_000, "freelance", "bank", "Desain poster event"],
    [3, "keluar", 18_000, "transportasi", "tunai", "Angkot"],
    [2, "keluar", 45_000, "pribadi", "shopeepay", "Skincare"],
    [2, "keluar", 30_000, "makanan", "tunai", "Makan malam"],
    [1, "keluar", 12_000, "transportasi", "gopay", "Ojek online"],
    [1, "keluar", 20_000, "kesehatan", "tunai", "Vitamin"],
    [0, "keluar", 25_000, "makanan", "gopay", "Sarapan & kopi"],
    [0, "keluar", 16_000, "transportasi", "gopay", "Ojek online ke kampus"],
  ];
  // Uang tunai awal supaya saldo tunai tidak minus
  d.transaksi.push({ id: "c-awal", jenis: "masuk", jumlah: 200_000, kategori: "uangsaku", dompet: "tunai", tanggal: geserHari(hari, -7), catatan: "Sisa uang minggu lalu", dibuat: sekarang - 999_999 });
  baris.forEach(([mundur, jenis, jumlah, kategori, dompet, catatan, ke], i) => {
    d.transaksi.push({ id: `c${i}`, jenis, jumlah, kategori, dompet, keDompet: ke, tanggal: geserHari(hari, -mundur), catatan, dibuat: sekarang - 100_000 + i * 10 });
  });
  d.target = [
    { id: "t1", nama: "Laptop Baru", target: 10_000_000, terkumpul: 4_000_000, tenggat: geserHari(hari, 84) },
    { id: "t2", nama: "Dana Study Tour", target: 1_500_000, terkumpul: 950_000, tenggat: geserHari(hari, 39) },
  ];
  return d;
}
