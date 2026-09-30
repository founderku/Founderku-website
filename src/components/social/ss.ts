"use client";

// Bahan bersama halaman Social Space: tipe data, teks 3 bahasa, dan
// pembantu kecil. Bahasa ikut pilihan di navigasi (event "fk:lang"),
// sama seperti halaman /harga.

import { useEffect, useState } from "react";
import type { Lang } from "@/lib/pricing";

export type SsProfile = {
  user_id: string;
  handle: string;
  name: string;
  headline: string;
  bio: string;
  city: string;
  skills_offer: string[];
  skills_want: string[];
  website: string;
  instagram: string;
  linkedin: string;
  experience: string;
  portfolio: SsPortfolioItem[];
  is_public: boolean;
  from_tukarskill: boolean;
  hidden: boolean;
  created_at: string;
};

export type SsPortfolioItem = { title: string; url?: string; note?: string };

export type SsProfileLite = Pick<SsProfile, "user_id" | "handle" | "name" | "headline" | "city">;

export type SsPost = {
  id: string;
  user_id: string;
  offer: string[];
  want: string[];
  format: "online" | "offline" | "hybrid";
  duration: string;
  description: string;
  status: "open" | "closed";
  hidden: boolean;
  created_at: string;
  ss_profiles?: SsProfileLite | null;
};

export type SsRequestStatus = "pending" | "accepted" | "declined" | "cancelled" | "completed";

export type SsRequest = {
  id: string;
  post_id: string;
  requester_id: string;
  owner_id: string;
  message: string;
  status: SsRequestStatus;
  requester_read_at: string | null;
  owner_read_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SsMessage = { id: number; request_id: string; sender_id: string; body: string; created_at: string };

export type SsReview = {
  id: string;
  request_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  created_at: string;
};

export type SsLegacyPost = {
  id: string;
  owner_name: string;
  owner_city: string;
  offer: string[];
  want: string[];
  format: "online" | "offline" | "hybrid";
  duration: string;
  description: string;
  posted_at: string | null;
};

export type SsEtalaseItem = {
  id: string;
  slug: string;
  product_name: string;
  tagline: string;
  kind: "produk" | "jasa" | "lainnya";
  original_price: number | null;
  promo_price: number | null;
  price_unit: string;
  image_url: string | null;
  created_at: string;
  seller_name: string | null;
  seller_handle: string | null;
  seller_city: string | null;
  has_pro: boolean;
  rating: number | null;
  reviews: number;
};

export type SsInfo = {
  id: string;
  author_id: string;
  category: "beasiswa" | "magang" | "lowongan";
  title: string;
  organizer: string;
  description: string;
  link: string;
  location: string;
  deadline: string;
  hidden: boolean;
  created_at: string;
};

// Harga untuk kartu: "Tanya harga" kalau kosong, plus satuan (/jam dst)
export function priceLabel(price: number | null, unit: string, ask: string) {
  if (price === null || price === undefined || Number.isNaN(Number(price))) return ask;
  return "Rp " + Number(price).toLocaleString("id-ID") + (unit ? " " + unit : "");
}

export function todayJakarta() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

export const SS_LIMITS = { skills: 10, postSkills: 5, bio: 1000, headline: 120, desc: 1000, msg: 2000, reqMsg: 500, review: 500, report: 500, experience: 1500, portfolio: 8, pfTitle: 80, pfNote: 200 };

const LOCALE: Record<Lang, string> = { id: "id-ID", en: "en-US", tr: "tr-TR" };

function readLang(): Lang {
  let l: string | null = null;
  try {
    l = localStorage.getItem("fk-lang");
  } catch {}
  if (l !== "en" && l !== "tr" && l !== "id") l = document.documentElement.getAttribute("lang");
  return l === "en" || l === "tr" ? l : "id";
}

export function useLang(): Lang {
  const [lang, setLang] = useState<Lang>("id");
  useEffect(() => {
    // Baca bahasa yang dipilih pengunjung setelah halaman tampil di browser
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLang(readLang());
    const onLang = () => setLang(readLang());
    window.addEventListener("fk:lang", onLang);
    return () => window.removeEventListener("fk:lang", onLang);
  }, []);
  return lang;
}

export function fill(s: string, vars: Record<string, string | number>) {
  return Object.keys(vars).reduce((acc, k) => acc.split(`{${k}}`).join(String(vars[k])), s);
}

export function fmtDate(iso: string, lang: Lang, withTime = false) {
  return new Date(iso).toLocaleString(LOCALE[lang], {
    day: "numeric",
    month: "short",
    year: withTime ? undefined : "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "Asia/Jakarta",
  });
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "")).toUpperCase();
}

// Nama handle yang disarankan dari nama/email: huruf kecil, angka, tanda hubung
export function suggestHandle(src: string) {
  const h = src
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24)
    .replace(/-+$/g, "");
  return h.length >= 3 ? h : (h + "-founder").replace(/^-/, "").slice(0, 24);
}

export const HANDLE_RE = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

// Link profil harus https:// supaya aman ditampilkan (bukan javascript: dll)
export function normalizeLink(v: string) {
  const s = v.trim();
  if (!s) return "";
  if (/^http:\/\//i.test(s)) return "https://" + s.slice(7);
  if (!/^https:\/\//i.test(s)) return "https://" + s.replace(/^\/+/, "");
  return s;
}
export const LINK_RE = /^https:\/\/[^\s"<>]+$/;

export function sameSkill(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

// Skor kecocokan: tawaran ini memberi skill yang aku cari, dan butuh
// skill yang aku punya
export function matchScore(post: Pick<SsPost, "offer" | "want">, me: Pick<SsProfile, "skills_offer" | "skills_want"> | null) {
  if (!me) return { gives: [] as string[], takes: [] as string[] };
  const gives = post.offer.filter((o) => me.skills_want.some((w) => sameSkill(o, w)));
  const takes = post.want.filter((w) => me.skills_offer.some((o) => sameSkill(o, w)));
  return { gives, takes };
}

// Pesan error dari database dibuat ramah
export function niceError(msg: string | undefined, t: SsText) {
  const m = msg ?? "";
  if (/ss_profiles_handle_key|duplicate key.*handle/i.test(m)) return t.errHandleTaken;
  if (/handle/i.test(m) && /check/i.test(m)) return t.errHandle;
  if (/row-level security|permission denied/i.test(m)) return t.errDenied;
  if (/Failed to fetch|NetworkError/i.test(m)) return t.errNet;
  // Pesan dari fungsi database sudah berbahasa Indonesia dan jelas
  if (/^[A-Z][^\n]{3,120}\.$/.test(m) && !/violates|constraint|relation|column/i.test(m)) return m;
  return t.errGeneric;
}

const id = {
  brand: "Social Space",
  eyebrow: "Social Space Founderku",
  heroH: "Tukar skill bareng founder lain.",
  heroSub: "Kamu jago desain, dia jago jualan? Tukeran skill tanpa bayar. Pasang tawaran, ajak tukar, ngobrol, lalu saling kasih ulasan.",
  tabFeed: "Jelajah",
  tabInbox: "Permintaan",
  tabProfile: "Profil saya",
  tabMod: "Moderasi",
  tabSwap: "Tukar Skill",
  tabEtalase: "Etalase",
  tabInfo: "Info",
  bnSwap: "Tukar",
  bnInbox: "Pesan",
  bnProfile: "Profil",
  bnLogin: "Masuk",
  // Tawaran TukarSkill lama
  fromTsWaiting: "Dari TukarSkill",
  legacyPosted: "Diposting di TukarSkill {date}",
  legacyNote: "Pemiliknya belum pindah ke Founderku. Ajakanmu disimpan dan otomatis sampai saat dia bergabung.",
  legacySent: "Ajakan tersimpan. Akan masuk ke pemiliknya saat dia pindah ke Founderku.",
  waitingOwner: "Menunggu pemilik bergabung",
  // Etalase
  landingH: "Dari skill jadi penghasilan.",
  landingSub: "Pajang produk dan jasamu, temukan info beasiswa dan lowongan, dan tukar skill bareng founder lain. Gratis dengan satu akun Founderku.",
  etH: "Etalase.",
  etSub: "Produk dan jasa dari sesama pengguna Founderku. Klik untuk lihat detail dan hubungi penjualnya langsung.",
  etSearch: "Cari produk atau jasa",
  etAll: "Semua",
  kind: { produk: "Produk", jasa: "Jasa", lainnya: "Lainnya" } as Record<string, string>,
  askPrice: "Tanya harga",
  seller: "Penjual",
  sellerPajangin: "Penjual Pajangin",
  proBadge: "Pro",
  view: "Lihat",
  etEmpty: "Belum ada yang tampil di Etalase.",
  etNone: "Tidak ada yang cocok dengan pencarianmu.",
  etDisclaimer: "Transaksi dilakukan langsung dengan penjual. Founderku tidak memproses pembayaran. Hati-hati dan jangan transfer sebelum yakin.",
  etJoin: "Punya produk atau jasa? Buat halaman di Pajangin, lalu aktifkan \"Tampilkan di Social Space\".",
  etJoinCta: "Buka Pajangin",
  sellH: "Mau jual jasa atau produk di sini?",
  sell1: "Bikin halaman di Pajangin, pilih jenis Jasa atau Produk.",
  sell2: "Nyalakan \"Tampilkan di Social Space\" di halaman itu.",
  sell3: "Lengkapi profil penjual (pengalaman, portofolio) biar pembeli percaya.",
  sellCta: "Mulai jual, gratis",
  sellProfile: "Atur profil penjual",
  soldBy: "Dijual oleh",
  etSampleH: "Contoh yang bisa kamu pajang",
  etSampleNote: "Kartu berlabel Contoh adalah ilustrasi, bukan penjual sungguhan. Pajang produk atau jasamu supaya tampil di sini.",
  sampleBadge: "Contoh",
  sampleCta: "Pajang yang seperti ini",
  mySpace: "Etalase saya",
  // Info
  infoH: "Info Beasiswa, Magang & Lowongan.",
  infoSub: "Peluang pilihan yang dikurasi tim Founderku dan kontributor terpercaya. Info yang sudah lewat tenggat otomatis tersembunyi.",
  infoCat: { beasiswa: "Beasiswa & Pertukaran Pelajar", magang: "Magang & Volunteer", lowongan: "Lowongan Kerja" } as Record<string, string>,
  infoDeadline: "Tenggat {date}",
  infoDaysLeft: "{n} hari lagi",
  infoToday: "Hari terakhir",
  infoOpen: "Buka info",
  infoEmpty: "Belum ada info aktif di kategori ini.",
  infoNew: "Pasang info",
  infoFormH: "Pasang info baru",
  iCategory: "Kategori",
  iTitle: "Judul",
  iOrganizer: "Penyelenggara",
  iLocation: "Lokasi (opsional)",
  iLink: "Tautan pendaftaran (https://)",
  iDeadline: "Tenggat",
  iDesc: "Keterangan",
  iMine: "Info yang kamu pasang",
  iExpired: "Lewat tenggat",
  iDelete: "Hapus",
  iDeleteConfirm: "Hapus info ini?",
  errTitle: "Judul minimal 5 huruf.",
  errDeadline: "Isi tanggal tenggat.",
  // Moderasi tambahan
  mEtalase: "Tampil di Etalase",
  mInfo: "Info aktif",
  mLegacyPosts: "Tawaran lama menunggu",
  mInfoAccess: "Izin pasang info",
  mInfoAccessSub: "Masukkan nama profil (handle) pengguna Social Space.",
  mGrant: "Beri izin",
  mRevoke: "Cabut",
  mAuthors: "Punya izin: {list}",
  login: "Masuk",
  loginCta: "Masuk untuk ikut tukar skill",
  loginSub: "Gratis, cukup pakai akun Founderku.",
  signup: "Daftar gratis",
  makeProfile: "Buat profil Social Space",
  makeProfileSub: "Isi skill yang kamu punya dan yang kamu cari, biar orang yang cocok bisa menemukanmu.",
  legacyH: "Profil TukarSkill lamamu ditemukan",
  legacySub: "Akun TukarSkill dengan email yang sama pernah dibuat atas nama {name}. Pindahkan nama, bio, kota, dan skill-nya ke Social Space?",
  legacyHandle: "Pilih nama profil (alamat halamanmu)",
  legacyGo: "Pindahkan profil",
  legacyDone: "Profil TukarSkill lamamu sudah dipindahkan.",
  newPost: "Pasang tawaran",
  search: "Cari skill, misalnya desain atau Excel",
  allFormats: "Semua format",
  online: "Online",
  offline: "Tatap muka",
  hybrid: "Campuran",
  onlyMatch: "Hanya yang cocok denganku",
  offers: "Bisa bantu",
  wants: "Butuh bantuan",
  forYou: "Cocok untukmu",
  noPosts: "Belum ada tawaran yang cocok dengan pencarianmu.",
  noPostsAll: "Belum ada tawaran. Jadilah yang pertama memasang tawaran!",
  loading: "Memuat...",
  askSwap: "Ajak tukar",
  askMsg: "Pesan singkat (kenalan dan jelaskan yang kamu tawarkan)",
  askMsgPh: "Halo! Aku bisa bantu {give}, dan lagi butuh bantuan {want}. Mau tukar?",
  send: "Kirim",
  cancel: "Batal",
  sent: "Permintaan terkirim. Pantau di menu Permintaan.",
  yours: "Tawaranmu",
  edit: "Ubah",
  viewProfile: "Lihat profil",
  report: "Laporkan",
  reportH: "Laporkan",
  reportReason: "Alasan",
  reasons: { spam: "Spam", penipuan: "Penipuan", kasar: "Kasar atau melecehkan", tidak_pantas: "Konten tidak pantas", lainnya: "Lainnya" } as Record<string, string>,
  reportDetails: "Keterangan (opsional)",
  reportSent: "Terima kasih, laporanmu sudah kami terima.",
  // Profil
  profileH: "Profil Social Space",
  profileSub: "Profil ini terlihat oleh sesama founder. Email dan data akunmu tidak ditampilkan.",
  fName: "Nama tampilan",
  fHandle: "Nama profil",
  fHandleHint: "Alamat profilmu: founderku.com/social-space/u/{handle}. Huruf kecil, angka, dan tanda hubung, 3 sampai 30 karakter.",
  fHeadline: "Judul singkat",
  fHeadlinePh: "Misalnya: Desainer grafis, pemilik kedai kopi",
  fCity: "Kota",
  fBio: "Tentang kamu",
  fOffer: "Skill yang bisa kamu bagikan",
  fWant: "Skill yang kamu cari",
  fSkillPh: "Ketik skill lalu tekan Enter",
  fSkillHint: "Maksimal {n} skill.",
  fLinks: "Tautan (opsional)",
  fExp: "Pengalaman",
  fExpPh: "Contoh: 3 tahun jadi desainer lepas, sudah pegang 40+ brand UMKM, lulusan DKV.",
  fPortfolio: "Portofolio",
  fPortfolioHint: "Maksimal {n} karya. Isi judul, lalu tautan ke hasil kerjamu (Google Drive, Behance, Instagram, dan lain-lain).",
  fPfTitle: "Judul karya",
  fPfUrl: "Tautan https://... (opsional)",
  fPfNote: "Catatan singkat (opsional)",
  fPfAdd: "+ Tambah karya",
  fPfRemove: "Hapus karya",
  errPortfolio: "Setiap karya butuh judul minimal 2 huruf, dan tautannya harus diawali https://.",
  sellerH: "Profil penjual",
  sellerSub: "Nama, pengalaman, dan portofolio ini tampil di Etalase dan halaman Pajangin-mu supaya pembeli percaya.",
  expH: "Pengalaman",
  pfH: "Portofolio",
  shopH: "Jasa & produk",
  myShopH: "Jualanmu di Etalase",
  myShopNone: "Belum ada halaman Pajangin yang tampil di Etalase. Buat halaman, lalu nyalakan \"Tampilkan di Social Space\".",
  myShopHidden: "Belum tampil",
  myShopNew: "Pajang jasa atau produk",
  myShopManage: "Kelola di Pajangin",
  fPublic: "Tampilkan profilku di halaman Jelajah",
  fPublicHint: "Kalau dimatikan, profil dan tawaranmu hanya terlihat oleh pasangan tukarmu.",
  save: "Simpan",
  saving: "Menyimpan...",
  saved: "Tersimpan.",
  deleteProfile: "Hapus profil Social Space",
  deleteConfirm: "Hapus profil Social Space? Semua tawaran, permintaan, chat, dan ulasanmu di Social Space ikut terhapus. Akun Founderku kamu tetap ada.",
  deleted: "Profil Social Space sudah dihapus.",
  fromTs: "Dari TukarSkill",
  memberSince: "Bergabung {date}",
  links: "Tautan",
  about: "Tentang",
  openPosts: "Tawaran terbuka",
  noOpenPosts: "Belum ada tawaran terbuka.",
  reviews: "Ulasan",
  noReviews: "Belum ada ulasan.",
  swaps: "{n} ulasan",
  notFound: "Profil tidak ditemukan atau tidak publik.",
  back: "Kembali",
  // Tawaran
  postNewH: "Pasang tawaran tukar skill",
  postEditH: "Ubah tawaran",
  postSub: "Tulis skill yang kamu tawarkan dan yang kamu butuhkan sebagai gantinya.",
  pOffer: "Aku bisa bantu",
  pWant: "Sebagai gantinya aku butuh",
  pFormat: "Format",
  pDuration: "Perkiraan waktu (opsional)",
  pDurationPh: "Misalnya: 2 x 1 jam",
  pDesc: "Penjelasan",
  pDescPh: "Ceritakan detailnya: apa yang bisa kamu kerjakan, hasil yang diharapkan, dan jadwal yang cocok.",
  pStatus: "Status",
  pOpen: "Terbuka",
  pClosed: "Ditutup",
  publish: "Pasang tawaran",
  deletePost: "Hapus tawaran",
  deletePostConfirm: "Hapus tawaran ini? Permintaan tukar yang terkait ikut terhapus.",
  needProfile: "Buat profil Social Space dulu sebelum memasang tawaran.",
  hiddenByAdmin: "Tawaran ini disembunyikan admin karena laporan.",
  // Permintaan
  inboxH: "Permintaan tukar",
  inboxSub: "Permintaan yang kamu kirim dan yang masuk ke tawaranmu.",
  incoming: "Masuk",
  outgoing: "Terkirim",
  noRequests: "Belum ada permintaan.",
  st: { pending: "Menunggu", accepted: "Diterima", declined: "Ditolak", cancelled: "Dibatalkan", completed: "Selesai" } as Record<SsRequestStatus, string>,
  accept: "Terima",
  decline: "Tolak",
  cancelReq: "Batalkan",
  openChat: "Buka chat",
  newBadge: "Baru",
  forPost: "Untuk tawaran: {offer} ⇄ {want}",
  someone: "Founder",
  // Chat
  chatWith: "Chat dengan {name}",
  chatEmpty: "Belum ada pesan. Sapa duluan dan atur jadwal tukar skill kalian.",
  chatPh: "Tulis pesan...",
  chatLocked: "Chat terbuka setelah permintaan diterima.",
  chatClosed: "Permintaan ini sudah {status}.",
  markDone: "Tandai tukar skill selesai",
  markDoneConfirm: "Tandai tukar skill ini selesai? Setelah itu kalian bisa saling memberi ulasan.",
  reviewH: "Beri ulasan untuk {name}",
  reviewPh: "Bagaimana pengalaman tukar skill-nya? (opsional)",
  reviewSend: "Kirim ulasan",
  reviewDone: "Terima kasih, ulasanmu sudah tersimpan.",
  safety: "Jaga keamanan: jangan kirim kata sandi, kode OTP, atau uang. Laporkan kalau ada yang mencurigakan.",
  // Moderasi
  modH: "Moderasi Social Space",
  modSub: "Ringkasan dan laporan dari pengguna.",
  mProfiles: "Profil",
  mPosts: "Tawaran terbuka",
  mRequests: "Permintaan",
  mCompleted: "Tukar selesai",
  mLegacy: "Arsip TukarSkill diklaim",
  mReports: "Laporan terbuka",
  noReports: "Tidak ada laporan terbuka.",
  hide: "Sembunyikan",
  dismiss: "Abaikan",
  target: { profile: "Profil", post: "Tawaran", message: "Pesan", legacy_post: "Tawaran lama", page: "Etalase", info: "Info" } as Record<string, string>,
  // Error
  errHandle: "Nama profil hanya boleh huruf kecil, angka, dan tanda hubung (3 sampai 30 karakter).",
  errHandleTaken: "Nama profil itu sudah dipakai. Coba yang lain.",
  errName: "Nama minimal 2 huruf.",
  errLink: "Tautan harus alamat web yang benar (diawali https://).",
  errSkills: "Isi minimal 1 skill di tiap bagian.",
  errDesc: "Penjelasan minimal 10 huruf.",
  errDenied: "Kamu tidak punya izin untuk tindakan ini.",
  errNet: "Gagal terhubung. Periksa internetmu lalu coba lagi.",
  errGeneric: "Terjadi kesalahan. Coba lagi.",
};

export type SsText = typeof id;

const en: SsText = {
  brand: "Social Space",
  eyebrow: "Founderku Social Space",
  heroH: "Swap skills with other founders.",
  heroSub: "Great at design while someone else is great at selling? Swap skills without paying. Post an offer, ask to swap, chat, then review each other.",
  tabFeed: "Explore",
  tabInbox: "Requests",
  tabProfile: "My profile",
  tabMod: "Moderation",
  tabSwap: "Skill Swap",
  tabEtalase: "Showcase",
  tabInfo: "Info",
  bnSwap: "Swap",
  bnInbox: "Messages",
  bnProfile: "Profile",
  bnLogin: "Log in",
  fromTsWaiting: "From TukarSkill",
  legacyPosted: "Posted on TukarSkill {date}",
  legacyNote: "The owner has not moved to Founderku yet. Your request is saved and delivered automatically when they join.",
  legacySent: "Request saved. It will reach the owner when they move to Founderku.",
  waitingOwner: "Waiting for the owner to join",
  landingH: "From skills to income.",
  landingSub: "Showcase your products and services, find scholarships and jobs, and swap skills with other founders. Free with one Founderku account.",
  etH: "Showcase.",
  etSub: "Products and services from fellow Founderku users. Click to see details and contact the seller directly.",
  etSearch: "Search products or services",
  etAll: "All",
  kind: { produk: "Product", jasa: "Service", lainnya: "Other" },
  askPrice: "Ask for price",
  seller: "Seller",
  sellerPajangin: "Pajangin seller",
  proBadge: "Pro",
  view: "View",
  etEmpty: "Nothing in the Showcase yet.",
  etNone: "Nothing matches your search.",
  etDisclaimer: "Transactions happen directly with the seller. Founderku does not process payments. Be careful and do not transfer money until you are sure.",
  etJoin: "Have a product or service? Create a page on Pajangin, then turn on \"Show in Social Space\".",
  etJoinCta: "Open Pajangin",
  sellH: "Want to sell a service or product here?",
  sell1: "Create a page in Pajangin and pick Service or Product.",
  sell2: "Turn on \"Show in Social Space\" on that page.",
  sell3: "Complete your seller profile (experience, portfolio) so buyers trust you.",
  sellCta: "Start selling, free",
  sellProfile: "Set up seller profile",
  soldBy: "Sold by",
  etSampleH: "Examples of what you can show",
  etSampleNote: "Cards labeled Example are illustrations, not real sellers. Show your product or service so it appears here.",
  sampleBadge: "Example",
  sampleCta: "Show something like this",
  mySpace: "My showcase",
  infoH: "Scholarships, Internships & Jobs.",
  infoSub: "Selected opportunities curated by the Founderku team and trusted contributors. Expired listings are hidden automatically.",
  infoCat: { beasiswa: "Scholarships & Exchange", magang: "Internships & Volunteering", lowongan: "Jobs" },
  infoDeadline: "Deadline {date}",
  infoDaysLeft: "{n} days left",
  infoToday: "Last day",
  infoOpen: "Open listing",
  infoEmpty: "No active listings in this category yet.",
  infoNew: "Post info",
  infoFormH: "Post new info",
  iCategory: "Category",
  iTitle: "Title",
  iOrganizer: "Organizer",
  iLocation: "Location (optional)",
  iLink: "Application link (https://)",
  iDeadline: "Deadline",
  iDesc: "Details",
  iMine: "Listings you posted",
  iExpired: "Expired",
  iDelete: "Delete",
  iDeleteConfirm: "Delete this listing?",
  errTitle: "Title must be at least 5 characters.",
  errDeadline: "Fill in the deadline.",
  mEtalase: "In the Showcase",
  mInfo: "Active info",
  mLegacyPosts: "Old offers waiting",
  mInfoAccess: "Info posting access",
  mInfoAccessSub: "Enter the Social Space profile name (handle).",
  mGrant: "Grant",
  mRevoke: "Revoke",
  mAuthors: "Has access: {list}",
  login: "Log in",
  loginCta: "Log in to start swapping skills",
  loginSub: "Free, just use your Founderku account.",
  signup: "Sign up free",
  makeProfile: "Create your Social Space profile",
  makeProfileSub: "Add the skills you have and the ones you are looking for, so the right people can find you.",
  legacyH: "We found your old TukarSkill profile",
  legacySub: "A TukarSkill account with the same email was created under the name {name}. Move its name, bio, city, and skills to Social Space?",
  legacyHandle: "Choose a profile name (your page address)",
  legacyGo: "Move my profile",
  legacyDone: "Your old TukarSkill profile has been moved.",
  newPost: "Post an offer",
  search: "Search a skill, for example design or Excel",
  allFormats: "All formats",
  online: "Online",
  offline: "In person",
  hybrid: "Hybrid",
  onlyMatch: "Only matches for me",
  offers: "Can help with",
  wants: "Needs help with",
  forYou: "A match for you",
  noPosts: "No offers match your search yet.",
  noPostsAll: "No offers yet. Be the first to post one!",
  loading: "Loading...",
  askSwap: "Ask to swap",
  askMsg: "Short message (introduce yourself and what you offer)",
  askMsgPh: "Hi! I can help with {give}, and I need help with {want}. Want to swap?",
  send: "Send",
  cancel: "Cancel",
  sent: "Request sent. Follow it in Requests.",
  yours: "Your offer",
  edit: "Edit",
  viewProfile: "View profile",
  report: "Report",
  reportH: "Report",
  reportReason: "Reason",
  reasons: { spam: "Spam", penipuan: "Scam", kasar: "Abusive or harassing", tidak_pantas: "Inappropriate content", lainnya: "Other" },
  reportDetails: "Details (optional)",
  reportSent: "Thank you, we have received your report.",
  profileH: "Social Space profile",
  profileSub: "Other founders can see this profile. Your email and account data are not shown.",
  fName: "Display name",
  fHandle: "Profile name",
  fHandleHint: "Your profile address: founderku.com/social-space/u/{handle}. Lowercase letters, numbers, and hyphens, 3 to 30 characters.",
  fHeadline: "Short headline",
  fHeadlinePh: "For example: Graphic designer, coffee shop owner",
  fCity: "City",
  fBio: "About you",
  fOffer: "Skills you can share",
  fWant: "Skills you are looking for",
  fSkillPh: "Type a skill and press Enter",
  fSkillHint: "Up to {n} skills.",
  fLinks: "Links (optional)",
  fExp: "Experience",
  fExpPh: "E.g. 3 years as a freelance designer, 40+ small business brands, visual design graduate.",
  fPortfolio: "Portfolio",
  fPortfolioHint: "Up to {n} works. Add a title and a link to your work (Google Drive, Behance, Instagram, and so on).",
  fPfTitle: "Work title",
  fPfUrl: "Link https://... (optional)",
  fPfNote: "Short note (optional)",
  fPfAdd: "+ Add work",
  fPfRemove: "Remove work",
  errPortfolio: "Every work needs a title of at least 2 characters, and links must start with https://.",
  sellerH: "Seller profile",
  sellerSub: "Your name, experience, and portfolio appear in the Showcase and on your Pajangin pages so buyers can trust you.",
  expH: "Experience",
  pfH: "Portfolio",
  shopH: "Services & products",
  myShopH: "Your listings in the Showcase",
  myShopNone: "None of your Pajangin pages are in the Showcase yet. Create a page, then turn on \"Show in Social Space\".",
  myShopHidden: "Not shown yet",
  myShopNew: "List a service or product",
  myShopManage: "Manage in Pajangin",
  fPublic: "Show my profile on the Explore page",
  fPublicHint: "If turned off, your profile and offers are only visible to your swap partners.",
  save: "Save",
  saving: "Saving...",
  saved: "Saved.",
  deleteProfile: "Delete Social Space profile",
  deleteConfirm: "Delete your Social Space profile? All your offers, requests, chats, and reviews in Social Space will be deleted too. Your Founderku account stays.",
  deleted: "Your Social Space profile has been deleted.",
  fromTs: "From TukarSkill",
  memberSince: "Joined {date}",
  links: "Links",
  about: "About",
  openPosts: "Open offers",
  noOpenPosts: "No open offers yet.",
  reviews: "Reviews",
  noReviews: "No reviews yet.",
  swaps: "{n} reviews",
  notFound: "Profile not found or not public.",
  back: "Back",
  postNewH: "Post a skill swap offer",
  postEditH: "Edit offer",
  postSub: "Write the skills you offer and the ones you need in return.",
  pOffer: "I can help with",
  pWant: "In return I need",
  pFormat: "Format",
  pDuration: "Estimated time (optional)",
  pDurationPh: "For example: 2 x 1 hour",
  pDesc: "Description",
  pDescPh: "Share the details: what you can do, the expected result, and a schedule that works for you.",
  pStatus: "Status",
  pOpen: "Open",
  pClosed: "Closed",
  publish: "Post offer",
  deletePost: "Delete offer",
  deletePostConfirm: "Delete this offer? Related swap requests will be deleted too.",
  needProfile: "Create your Social Space profile before posting an offer.",
  hiddenByAdmin: "This offer was hidden by an admin after a report.",
  inboxH: "Swap requests",
  inboxSub: "Requests you sent and requests for your offers.",
  incoming: "Incoming",
  outgoing: "Sent",
  noRequests: "No requests yet.",
  st: { pending: "Waiting", accepted: "Accepted", declined: "Declined", cancelled: "Cancelled", completed: "Completed" },
  accept: "Accept",
  decline: "Decline",
  cancelReq: "Cancel",
  openChat: "Open chat",
  newBadge: "New",
  forPost: "For offer: {offer} ⇄ {want}",
  someone: "Founder",
  chatWith: "Chat with {name}",
  chatEmpty: "No messages yet. Say hi and set a schedule for your skill swap.",
  chatPh: "Write a message...",
  chatLocked: "Chat opens once the request is accepted.",
  chatClosed: "This request is {status}.",
  markDone: "Mark the swap as completed",
  markDoneConfirm: "Mark this skill swap as completed? After that you can review each other.",
  reviewH: "Review {name}",
  reviewPh: "How was the skill swap? (optional)",
  reviewSend: "Send review",
  reviewDone: "Thank you, your review has been saved.",
  safety: "Stay safe: never send passwords, OTP codes, or money. Report anything suspicious.",
  modH: "Social Space moderation",
  modSub: "Overview and user reports.",
  mProfiles: "Profiles",
  mPosts: "Open offers",
  mRequests: "Requests",
  mCompleted: "Completed swaps",
  mLegacy: "TukarSkill archive claimed",
  mReports: "Open reports",
  noReports: "No open reports.",
  hide: "Hide",
  dismiss: "Dismiss",
  target: { profile: "Profile", post: "Offer", message: "Message", legacy_post: "Old offer", page: "Showcase", info: "Info" },
  errHandle: "Profile names may only use lowercase letters, numbers, and hyphens (3 to 30 characters).",
  errHandleTaken: "That profile name is taken. Try another one.",
  errName: "Name must be at least 2 letters.",
  errLink: "Links must be a valid web address (starting with https://).",
  errSkills: "Add at least 1 skill in each section.",
  errDesc: "Description must be at least 10 characters.",
  errDenied: "You are not allowed to do this.",
  errNet: "Could not connect. Check your internet and try again.",
  errGeneric: "Something went wrong. Please try again.",
};

const tr: SsText = {
  brand: "Sosyal Alan",
  eyebrow: "Founderku Sosyal Alan",
  heroH: "Diğer girişimcilerle beceri takası yap.",
  heroSub: "Sen tasarımda, o satışta mı iyi? Para ödemeden beceri takası yapın. Teklif yayınla, takas iste, sohbet et, sonra birbirinizi değerlendirin.",
  tabFeed: "Keşfet",
  tabInbox: "İstekler",
  tabProfile: "Profilim",
  tabMod: "Moderasyon",
  tabSwap: "Beceri Takası",
  tabEtalase: "Vitrin",
  tabInfo: "Fırsatlar",
  bnSwap: "Takas",
  bnInbox: "Mesajlar",
  bnProfile: "Profil",
  bnLogin: "Giriş",
  fromTsWaiting: "TukarSkill'den",
  legacyPosted: "TukarSkill'de paylaşıldı {date}",
  legacyNote: "Sahibi henüz Founderku'ya geçmedi. İsteğin kaydedilir ve katıldığında otomatik olarak iletilir.",
  legacySent: "İstek kaydedildi. Sahibi Founderku'ya geçtiğinde ona ulaşacak.",
  waitingOwner: "Sahibinin katılması bekleniyor",
  landingH: "Beceriden gelire.",
  landingSub: "Ürün ve hizmetlerini sergile, burs ve iş fırsatlarını keşfet, diğer girişimcilerle beceri takası yap. Tek bir Founderku hesabıyla ücretsiz.",
  etH: "Vitrin.",
  etSub: "Founderku kullanıcılarının ürün ve hizmetleri. Ayrıntılar için tıkla ve satıcıyla doğrudan iletişime geç.",
  etSearch: "Ürün veya hizmet ara",
  etAll: "Tümü",
  kind: { produk: "Ürün", jasa: "Hizmet", lainnya: "Diğer" },
  askPrice: "Fiyat sor",
  seller: "Satıcı",
  sellerPajangin: "Pajangin satıcısı",
  proBadge: "Pro",
  view: "Gör",
  etEmpty: "Vitrinde henüz bir şey yok.",
  etNone: "Aramana uyan bir şey yok.",
  etDisclaimer: "İşlemler doğrudan satıcıyla yapılır. Founderku ödeme işlemez. Dikkatli ol ve emin olmadan para gönderme.",
  etJoin: "Ürünün veya hizmetin mi var? Pajangin'de sayfa oluştur ve \"Sosyal Alan'da göster\" seçeneğini aç.",
  etJoinCta: "Pajangin'i aç",
  sellH: "Burada hizmet ya da ürün mü satmak istiyorsun?",
  sell1: "Pajangin'de bir sayfa oluştur, Hizmet ya da Ürün seç.",
  sell2: "O sayfada \"Sosyal Alan'da göster\" seçeneğini aç.",
  sell3: "Alıcılar güvensin diye satıcı profilini (deneyim, portfolyo) tamamla.",
  sellCta: "Satmaya başla, ücretsiz",
  sellProfile: "Satıcı profilini ayarla",
  soldBy: "Satıcı",
  etSampleH: "Sergileyebileceğin örnekler",
  etSampleNote: "Örnek etiketli kartlar gerçek satıcı değil, sadece örnektir. Ürününü ya da hizmetini sergile ki burada görünsün.",
  sampleBadge: "Örnek",
  sampleCta: "Böyle bir şey sergile",
  mySpace: "Vitrinim",
  infoH: "Burs, Staj ve İş İlanları.",
  infoSub: "Founderku ekibi ve güvenilir katkıcılar tarafından seçilen fırsatlar. Süresi geçen ilanlar otomatik gizlenir.",
  infoCat: { beasiswa: "Burs ve Değişim", magang: "Staj ve Gönüllülük", lowongan: "İş İlanları" },
  infoDeadline: "Son tarih {date}",
  infoDaysLeft: "{n} gün kaldı",
  infoToday: "Son gün",
  infoOpen: "İlanı aç",
  infoEmpty: "Bu kategoride henüz aktif ilan yok.",
  infoNew: "İlan ekle",
  infoFormH: "Yeni ilan ekle",
  iCategory: "Kategori",
  iTitle: "Başlık",
  iOrganizer: "Düzenleyen",
  iLocation: "Konum (isteğe bağlı)",
  iLink: "Başvuru bağlantısı (https://)",
  iDeadline: "Son tarih",
  iDesc: "Ayrıntılar",
  iMine: "Eklediğin ilanlar",
  iExpired: "Süresi geçti",
  iDelete: "Sil",
  iDeleteConfirm: "Bu ilan silinsin mi?",
  errTitle: "Başlık en az 5 karakter olmalı.",
  errDeadline: "Son tarihi gir.",
  mEtalase: "Vitrinde",
  mInfo: "Aktif ilan",
  mLegacyPosts: "Bekleyen eski teklifler",
  mInfoAccess: "İlan ekleme izni",
  mInfoAccessSub: "Sosyal Alan profil adını (handle) gir.",
  mGrant: "İzin ver",
  mRevoke: "Geri al",
  mAuthors: "İzni olanlar: {list}",
  login: "Giriş yap",
  loginCta: "Beceri takasına katılmak için giriş yap",
  loginSub: "Ücretsiz, Founderku hesabın yeterli.",
  signup: "Ücretsiz kaydol",
  makeProfile: "Sosyal Alan profilini oluştur",
  makeProfileSub: "Sahip olduğun ve aradığın becerileri ekle, doğru kişiler seni bulabilsin.",
  legacyH: "Eski TukarSkill profilini bulduk",
  legacySub: "Aynı e-posta ile {name} adına bir TukarSkill hesabı açılmış. Adını, biyografisini, şehrini ve becerilerini Sosyal Alan'a taşıyalım mı?",
  legacyHandle: "Bir profil adı seç (sayfa adresin)",
  legacyGo: "Profilimi taşı",
  legacyDone: "Eski TukarSkill profilin taşındı.",
  newPost: "Teklif yayınla",
  search: "Beceri ara, örneğin tasarım veya Excel",
  allFormats: "Tüm formatlar",
  online: "Online",
  offline: "Yüz yüze",
  hybrid: "Karma",
  onlyMatch: "Sadece bana uyanlar",
  offers: "Yardım edebilir",
  wants: "Yardım arıyor",
  forYou: "Sana uygun",
  noPosts: "Aramana uyan teklif henüz yok.",
  noPostsAll: "Henüz teklif yok. İlk teklifi sen yayınla!",
  loading: "Yükleniyor...",
  askSwap: "Takas iste",
  askMsg: "Kısa mesaj (kendini ve sunduğun beceriyi tanıt)",
  askMsgPh: "Merhaba! {give} konusunda yardım edebilirim, {want} konusunda yardıma ihtiyacım var. Takas yapalım mı?",
  send: "Gönder",
  cancel: "Vazgeç",
  sent: "İstek gönderildi. İstekler menüsünden takip et.",
  yours: "Senin teklifin",
  edit: "Düzenle",
  viewProfile: "Profili gör",
  report: "Bildir",
  reportH: "Bildir",
  reportReason: "Neden",
  reasons: { spam: "Spam", penipuan: "Dolandırıcılık", kasar: "Kaba veya taciz edici", tidak_pantas: "Uygunsuz içerik", lainnya: "Diğer" },
  reportDetails: "Açıklama (isteğe bağlı)",
  reportSent: "Teşekkürler, bildirimini aldık.",
  profileH: "Sosyal Alan profili",
  profileSub: "Bu profili diğer girişimciler görebilir. E-postan ve hesap bilgilerin gösterilmez.",
  fName: "Görünen ad",
  fHandle: "Profil adı",
  fHandleHint: "Profil adresin: founderku.com/social-space/u/{handle}. Küçük harf, rakam ve tire, 3 ila 30 karakter.",
  fHeadline: "Kısa başlık",
  fHeadlinePh: "Örneğin: Grafik tasarımcı, kafe sahibi",
  fCity: "Şehir",
  fBio: "Hakkında",
  fOffer: "Paylaşabileceğin beceriler",
  fWant: "Aradığın beceriler",
  fSkillPh: "Beceriyi yaz ve Enter'a bas",
  fSkillHint: "En fazla {n} beceri.",
  fLinks: "Bağlantılar (isteğe bağlı)",
  fExp: "Deneyim",
  fExpPh: "Örn. 3 yıl serbest tasarımcı, 40+ küçük işletme markası, görsel tasarım mezunu.",
  fPortfolio: "Portfolyo",
  fPortfolioHint: "En fazla {n} çalışma. Başlık ve çalışmanın bağlantısını ekle (Google Drive, Behance, Instagram vb.).",
  fPfTitle: "Çalışma başlığı",
  fPfUrl: "Bağlantı https://... (isteğe bağlı)",
  fPfNote: "Kısa not (isteğe bağlı)",
  fPfAdd: "+ Çalışma ekle",
  fPfRemove: "Çalışmayı kaldır",
  errPortfolio: "Her çalışmanın en az 2 harflik bir başlığı olmalı ve bağlantılar https:// ile başlamalı.",
  sellerH: "Satıcı profili",
  sellerSub: "Adın, deneyimin ve portfolyon alıcılar güvensin diye Vitrin'de ve Pajangin sayfalarında görünür.",
  expH: "Deneyim",
  pfH: "Portfolyo",
  shopH: "Hizmetler ve ürünler",
  myShopH: "Vitrindeki ilanların",
  myShopNone: "Henüz Vitrin'de Pajangin sayfan yok. Bir sayfa oluştur, sonra \"Sosyal Alan'da göster\" seçeneğini aç.",
  myShopHidden: "Henüz görünmüyor",
  myShopNew: "Hizmet ya da ürün ekle",
  myShopManage: "Pajangin'de yönet",
  fPublic: "Profilimi Keşfet sayfasında göster",
  fPublicHint: "Kapatırsan profilin ve tekliflerin yalnızca takas partnerlerine görünür.",
  save: "Kaydet",
  saving: "Kaydediliyor...",
  saved: "Kaydedildi.",
  deleteProfile: "Sosyal Alan profilini sil",
  deleteConfirm: "Sosyal Alan profilin silinsin mi? Sosyal Alan'daki tüm tekliflerin, isteklerin, sohbetlerin ve değerlendirmelerin de silinir. Founderku hesabın kalır.",
  deleted: "Sosyal Alan profilin silindi.",
  fromTs: "TukarSkill'den",
  memberSince: "Katılım {date}",
  links: "Bağlantılar",
  about: "Hakkında",
  openPosts: "Açık teklifler",
  noOpenPosts: "Henüz açık teklif yok.",
  reviews: "Değerlendirmeler",
  noReviews: "Henüz değerlendirme yok.",
  swaps: "{n} değerlendirme",
  notFound: "Profil bulunamadı veya herkese açık değil.",
  back: "Geri",
  postNewH: "Beceri takası teklifi yayınla",
  postEditH: "Teklifi düzenle",
  postSub: "Sunduğun becerileri ve karşılığında ihtiyaç duyduklarını yaz.",
  pOffer: "Yardım edebileceğim konu",
  pWant: "Karşılığında ihtiyacım olan",
  pFormat: "Format",
  pDuration: "Tahmini süre (isteğe bağlı)",
  pDurationPh: "Örneğin: 2 x 1 saat",
  pDesc: "Açıklama",
  pDescPh: "Detayları anlat: ne yapabileceğini, beklenen sonucu ve uygun zamanları.",
  pStatus: "Durum",
  pOpen: "Açık",
  pClosed: "Kapalı",
  publish: "Teklifi yayınla",
  deletePost: "Teklifi sil",
  deletePostConfirm: "Bu teklif silinsin mi? İlgili takas istekleri de silinir.",
  needProfile: "Teklif yayınlamadan önce Sosyal Alan profilini oluştur.",
  hiddenByAdmin: "Bu teklif bir bildirim sonrası yönetici tarafından gizlendi.",
  inboxH: "Takas istekleri",
  inboxSub: "Gönderdiğin istekler ve tekliflerine gelen istekler.",
  incoming: "Gelen",
  outgoing: "Gönderilen",
  noRequests: "Henüz istek yok.",
  st: { pending: "Bekliyor", accepted: "Kabul edildi", declined: "Reddedildi", cancelled: "İptal edildi", completed: "Tamamlandı" },
  accept: "Kabul et",
  decline: "Reddet",
  cancelReq: "İptal et",
  openChat: "Sohbeti aç",
  newBadge: "Yeni",
  forPost: "Teklif: {offer} ⇄ {want}",
  someone: "Girişimci",
  chatWith: "{name} ile sohbet",
  chatEmpty: "Henüz mesaj yok. Selam ver ve takas zamanınızı ayarlayın.",
  chatPh: "Mesaj yaz...",
  chatLocked: "Sohbet, istek kabul edildikten sonra açılır.",
  chatClosed: "Bu istek {status}.",
  markDone: "Takası tamamlandı olarak işaretle",
  markDoneConfirm: "Bu beceri takası tamamlandı olarak işaretlensin mi? Sonra birbirinizi değerlendirebilirsiniz.",
  reviewH: "{name} için değerlendirme yap",
  reviewPh: "Takas deneyimi nasıldı? (isteğe bağlı)",
  reviewSend: "Değerlendirmeyi gönder",
  reviewDone: "Teşekkürler, değerlendirmen kaydedildi.",
  safety: "Güvende kal: şifre, OTP kodu veya para gönderme. Şüpheli bir şey olursa bildir.",
  modH: "Sosyal Alan moderasyonu",
  modSub: "Özet ve kullanıcı bildirimleri.",
  mProfiles: "Profiller",
  mPosts: "Açık teklifler",
  mRequests: "İstekler",
  mCompleted: "Tamamlanan takaslar",
  mLegacy: "Taşınan TukarSkill arşivi",
  mReports: "Açık bildirimler",
  noReports: "Açık bildirim yok.",
  hide: "Gizle",
  dismiss: "Yoksay",
  target: { profile: "Profil", post: "Teklif", message: "Mesaj", legacy_post: "Eski teklif", page: "Vitrin", info: "İlan" },
  errHandle: "Profil adı yalnızca küçük harf, rakam ve tire içerebilir (3 ila 30 karakter).",
  errHandleTaken: "Bu profil adı alınmış. Başka bir tane dene.",
  errName: "Ad en az 2 harf olmalı.",
  errLink: "Bağlantı geçerli bir web adresi olmalı (https:// ile başlamalı).",
  errSkills: "Her bölüme en az 1 beceri ekle.",
  errDesc: "Açıklama en az 10 karakter olmalı.",
  errDenied: "Bu işlem için iznin yok.",
  errNet: "Bağlanılamadı. İnternetini kontrol edip tekrar dene.",
  errGeneric: "Bir hata oluştu. Tekrar dene.",
};

export const SS_T: Record<Lang, SsText> = { id, en, tr };

export function useT() {
  const lang = useLang();
  return { lang, t: SS_T[lang] };
}
